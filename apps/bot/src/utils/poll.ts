import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, type Client } from "discord.js";
import { prisma } from "@nyx/database";

const activeTimers = new Map<string, NodeJS.Timeout>();

/** 投票パネルを組み立てる。開催中はボタン付き、終了後は集計結果表示。 */
export function buildPollContainer({
  question,
  options,
  closed,
  voteCounts,
  pollId,
}: {
  question: string;
  options: string[];
  closed: boolean;
  voteCounts: number[];
  pollId: string;
}) {
  const container = new ContainerBuilder().setAccentColor(0xefe8d8);
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${question}`));
  container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

  const totalVotes = voteCounts.reduce((a, b) => a + b, 0);
  const lines = options.map((opt, i) => {
    const count = voteCounts[i] ?? 0;
    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    return `\`${i + 1}\` ${opt} — **${count}** vote(s) (${pct}%)`;
  });
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n")));

  if (!closed) {
    container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    for (let i = 0; i < options.length; i += 5) {
      const chunk = options.slice(i, i + 5);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        chunk.map((opt, j) => new ButtonBuilder().setLabel(`${i + j + 1}`).setStyle(ButtonStyle.Secondary).setCustomId(`poll:vote:${pollId}:${i + j}`)),
      );
      container.addActionRowComponents(row);
    }
  }

  return container;
}

async function getVoteCounts(pollId: string, optionCount: number) {
  const votes = await prisma.pollVote.findMany({ where: { pollId } });
  const counts = new Array(optionCount).fill(0);
  for (const vote of votes) counts[vote.optionIndex] = (counts[vote.optionIndex] ?? 0) + 1;
  return counts;
}

export async function refreshPollMessage(client: Client, pollId: string) {
  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) return;

  const voteCounts = await getVoteCounts(poll.id, poll.options.length);

  try {
    const channel = await client.channels.fetch(poll.channelId);
    if (!channel || channel.isDMBased() || !channel.isTextBased()) return;
    const message = await channel.messages.fetch(poll.messageId);
    const container = buildPollContainer({ question: poll.question, options: poll.options, closed: poll.closed, voteCounts, pollId: poll.id });
    await message.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
  } catch (error) {
    console.error(`[Nyx.] Failed to refresh poll ${pollId}`, error);
  }
}

export async function closePoll(client: Client, pollId: string) {
  const timer = activeTimers.get(pollId);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(pollId);
  }

  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll || poll.closed) return;

  await prisma.poll.update({ where: { id: pollId }, data: { closed: true } });
  await refreshPollMessage(client, pollId);
}

export function schedulePollClose(client: Client, pollId: string, closesAt: Date) {
  const delay = Math.max(0, closesAt.getTime() - Date.now());
  const timer = setTimeout(() => closePoll(client, pollId), delay);
  activeTimers.set(pollId, timer);
}
