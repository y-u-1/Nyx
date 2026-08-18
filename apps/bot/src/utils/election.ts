import { type Client } from "discord.js";
import { prisma } from "@nyx/database";
import { safeSetTimeout, type SafeTimer } from "./duration.js";
import { baseEmbed } from "./embeds.js";

/** 進行中の選挙のフェーズ移行タイマー。サーバー再起動時は resumeElectionTimers() で再登録する。 */
const activeTimers = new Map<string, SafeTimer>();

export class ElectionError extends Error {}

function clearElectionTimer(electionId: string) {
  const timer = activeTimers.get(electionId);
  if (timer) {
    timer.cancel();
    activeTimers.delete(electionId);
  }
}

export async function createElection(params: {
  guildId: string;
  channelId: string;
  title: string;
  roleId: string;
  registrationMs: number;
  votingMs: number;
  termDays: number | null;
  createdById: string;
}) {
  const now = Date.now();
  const registrationEndsAt = new Date(now + params.registrationMs);
  const votingEndsAt = new Date(registrationEndsAt.getTime() + params.votingMs);

  const election = await prisma.election.create({
    data: {
      guildId: params.guildId,
      channelId: params.channelId,
      title: params.title,
      roleId: params.roleId,
      registrationEndsAt,
      votingEndsAt,
      termDays: params.termDays,
      createdById: params.createdById,
    },
  });

  return election;
}

export async function getActiveElection(guildId: string) {
  return prisma.election.findFirst({
    where: { guildId, status: { in: ["registration", "voting"] } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getElection(electionId: string) {
  return prisma.election.findUnique({ where: { id: electionId } });
}

export async function registerCandidate(electionId: string, userId: string, manifesto: string | null) {
  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election || election.status !== "registration") throw new ElectionError("not_in_registration");

  return prisma.electionCandidate.upsert({
    where: { electionId_userId: { electionId, userId } },
    create: { electionId, userId, manifesto },
    update: { manifesto },
  });
}

export async function getCandidates(electionId: string) {
  return prisma.electionCandidate.findMany({ where: { electionId }, orderBy: { createdAt: "asc" } });
}

export async function castVote(electionId: string, voterId: string, candidateUserId: string) {
  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election || election.status !== "voting") throw new ElectionError("not_in_voting");

  const candidate = await prisma.electionCandidate.findUnique({ where: { electionId_userId: { electionId, userId: candidateUserId } } });
  if (!candidate) throw new ElectionError("not_a_candidate");

  return prisma.electionVote.upsert({
    where: { electionId_voterId: { electionId, voterId } },
    create: { electionId, voterId, candidateUserId },
    update: { candidateUserId },
  });
}

/** 現在の得票数を候補者ごとに集計する(得票数の降順)。 */
export async function tallyVotes(electionId: string) {
  const votes = await prisma.electionVote.groupBy({
    by: ["candidateUserId"],
    where: { electionId },
    _count: { candidateUserId: true },
  });

  const candidates = await getCandidates(electionId);

  const results = candidates.map((c) => ({
    userId: c.userId,
    manifesto: c.manifesto,
    votes: votes.find((v) => v.candidateUserId === c.userId)?._count.candidateUserId ?? 0,
  }));

  results.sort((a, b) => b.votes - a.votes);
  return results;
}

async function announce(client: Client, channelId: string, description: string, title: string) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (channel && !channel.isDMBased() && channel.isTextBased()) {
      await channel.send({ embeds: [baseEmbed({ tone: "primary", title, description })] });
    }
  } catch (error) {
    console.error("[Nyx.] Failed to announce election update", error);
  }
}

/** 登録フェーズ→投票フェーズへの移行。候補者がいなければ選挙は中止扱いにする。 */
async function transitionToVoting(client: Client, electionId: string) {
  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election || election.status !== "registration") return;

  const candidates = await getCandidates(electionId);

  if (candidates.length === 0) {
    await prisma.election.update({ where: { id: electionId }, data: { status: "cancelled" } });
    await announce(client, election.channelId, `**${election.title}** was cancelled — no candidates registered.`, "Election Cancelled");
    return;
  }

  await prisma.election.update({ where: { id: electionId }, data: { status: "voting" } });
  const candidateList = candidates.map((c) => `<@${c.userId}>`).join(", ");
  await announce(client, election.channelId, `**${election.title}** is now open for voting!\nCandidates: ${candidateList}\nVoting ends <t:${Math.floor(election.votingEndsAt.getTime() / 1000)}:R>.`, "Voting Started");

  scheduleTimer(client, electionId, election.votingEndsAt.getTime() - Date.now(), () => endElection(client, electionId));
}

/** 投票フェーズ終了。集計して当選者にロールを付与し、任期があれば失効タイマーを仕込む。 */
async function endElection(client: Client, electionId: string) {
  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election || election.status !== "voting") return;

  const results = await tallyVotes(electionId);
  const winner = results[0];

  if (!winner || winner.votes === 0) {
    await prisma.election.update({ where: { id: electionId }, data: { status: "ended" } });
    await announce(client, election.channelId, `**${election.title}** ended with no votes cast. No one was elected.`, "Election Ended");
    return;
  }

  const termEndsAt = election.termDays ? new Date(Date.now() + election.termDays * 24 * 60 * 60 * 1000) : null;

  await prisma.election.update({
    where: { id: electionId },
    data: { status: "ended", winnerUserId: winner.userId, termEndsAt },
  });

  try {
    const guild = await client.guilds.fetch(election.guildId);
    const member = await guild.members.fetch(winner.userId);
    await member.roles.add(election.roleId);
  } catch (error) {
    console.error("[Nyx.] Failed to assign election winner role", error);
  }

  const termLine = termEndsAt ? `\nTerm ends <t:${Math.floor(termEndsAt.getTime() / 1000)}:D>.` : "";
  await announce(client, election.channelId, `**${election.title}** results are in!\n🏆 Winner: <@${winner.userId}> (${winner.votes} votes)${termLine}`, "Election Results");

  if (termEndsAt) {
    scheduleTimer(client, `term:${electionId}`, termEndsAt.getTime() - Date.now(), () => expireTerm(client, electionId));
  }
}

/** 任期満了時にロールを剥奪する。 */
async function expireTerm(client: Client, electionId: string) {
  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election || !election.winnerUserId) return;

  try {
    const guild = await client.guilds.fetch(election.guildId);
    const member = await guild.members.fetch(election.winnerUserId);
    await member.roles.remove(election.roleId);
  } catch (error) {
    console.error("[Nyx.] Failed to remove expired election role", error);
  }

  await announce(client, election.channelId, `<@${election.winnerUserId}>'s term for **${election.title}** has ended. A new election can now be started.`, "Term Expired");
}

function scheduleTimer(client: Client, key: string, delay: number, callback: () => void) {
  clearElectionTimer(key);
  const timer = safeSetTimeout(callback, Math.max(0, delay));
  activeTimers.set(key, timer);
}

/** 選挙作成直後にフェーズ移行タイマーを仕込む。 */
export function scheduleElectionPhaseTimers(client: Client, election: { id: string; registrationEndsAt: Date; votingEndsAt: Date; status: string; termEndsAt: Date | null; winnerUserId: string | null }) {
  if (election.status === "registration") {
    scheduleTimer(client, election.id, election.registrationEndsAt.getTime() - Date.now(), () => transitionToVoting(client, election.id));
  } else if (election.status === "voting") {
    scheduleTimer(client, election.id, election.votingEndsAt.getTime() - Date.now(), () => endElection(client, election.id));
  } else if (election.status === "ended" && election.termEndsAt && election.winnerUserId) {
    scheduleTimer(client, `term:${election.id}`, election.termEndsAt.getTime() - Date.now(), () => expireTerm(client, election.id));
  }
}

/** Bot起動時に、進行中/任期中の選挙のタイマーを全て再登録する(再起動をまたぐため)。 */
export async function resumeElectionTimers(client: Client) {
  const active = await prisma.election.findMany({ where: { status: { in: ["registration", "voting"] } } });
  for (const election of active) scheduleElectionPhaseTimers(client, election);

  const termed = await prisma.election.findMany({ where: { status: "ended", termEndsAt: { not: null }, winnerUserId: { not: null } } });
  for (const election of termed) {
    if (election.termEndsAt && election.termEndsAt.getTime() > Date.now()) {
      scheduleElectionPhaseTimers(client, election);
    }
  }
}

export async function cancelElection(electionId: string) {
  clearElectionTimer(electionId);
  clearElectionTimer(`term:${electionId}`);
  return prisma.election.update({ where: { id: electionId }, data: { status: "cancelled" } });
}
