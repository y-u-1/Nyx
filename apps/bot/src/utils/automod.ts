import { PermissionFlagsBits, type Message } from "discord.js";
import { prisma } from "@nyx/database";
import { sendLog } from "./logging.js";

const INVITE_PATTERN = /(discord\.gg|discord(?:app)?\.com\/invite)\/[a-z0-9-]+/i;
const LINK_PATTERN = /https?:\/\/\S+/i;

// スパム(連投)検知用。メモリ上でユーザーごとの直近メッセージ時刻を保持する。
const messageTimestamps = new Map<string, number[]>(); // key: `${guildId}:${userId}`

type ViolationType = "banned_word" | "invite" | "link" | "mass_mention" | "spam";

function isBypassed(message: Message, bypassRoleId: string | null): boolean {
  const member = message.member;
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.ManageGuild)) return true;
  if (bypassRoleId && member.roles.cache.has(bypassRoleId)) return true;
  return false;
}

function detectViolation(message: Message, settings: { bannedWords: string[]; blockInvites: boolean; blockLinks: boolean; maxMentions: number }): ViolationType | null {
  const content = message.content.toLowerCase();

  for (const word of settings.bannedWords) {
    if (word && content.includes(word.toLowerCase())) return "banned_word";
  }

  if (settings.blockInvites && INVITE_PATTERN.test(message.content)) return "invite";
  if (settings.blockLinks && LINK_PATTERN.test(message.content)) return "link";

  if (settings.maxMentions > 0) {
    const mentionCount = message.mentions.users.size + message.mentions.roles.size + (message.mentions.everyone ? 1 : 0);
    if (mentionCount > settings.maxMentions) return "mass_mention";
  }

  return null;
}

function detectSpam(message: Message, threshold: number, windowSeconds: number): boolean {
  if (!message.guildId || threshold <= 0) return false;

  const key = `${message.guildId}:${message.author.id}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const timestamps = (messageTimestamps.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  messageTimestamps.set(key, timestamps);

  return timestamps.length >= threshold;
}

const VIOLATION_REASONS: Record<ViolationType, string> = {
  banned_word: "Used a banned word.",
  invite: "Posted a Discord invite link.",
  link: "Posted a link in a channel where links are not allowed.",
  mass_mention: "Sent an excessive number of mentions.",
  spam: "Sent messages too quickly (spam).",
};

/**
 * メッセージをAutoModルールに照らしてチェックし、違反があれば削除・タイムアウト・警告記録・ログ送信を行う。
 * @returns 何らかの違反として処理した場合 true(呼び出し元はこの後のXP付与などをスキップできる)
 */
export async function checkAutomod(message: Message): Promise<boolean> {
  if (!message.guildId || message.author.bot) return false;

  const settings = await prisma.autoModSettings.findUnique({ where: { guildId: message.guildId } });
  if (!settings) return false;

  if (isBypassed(message, settings.bypassRoleId)) return false;

  const violation = detectViolation(message, settings) ?? (detectSpam(message, settings.spamMessageThreshold, settings.spamWindowSeconds) ? "spam" : null);
  if (!violation) return false;

  await enforceViolation(message, violation, settings.timeoutSeconds);
  return true;
}

async function enforceViolation(message: Message, violation: ViolationType, timeoutSeconds: number) {
  const reason = VIOLATION_REASONS[violation];

  // スパムの場合はここ数秒分の連投もまとめて削除する
  try {
    if (violation === "spam" && message.channel.isTextBased() && "bulkDelete" in message.channel) {
      const recent = await message.channel.messages.fetch({ limit: 20 });
      const toDelete = recent.filter((m) => m.author.id === message.author.id && Date.now() - m.createdTimestamp < 10_000);
      await message.channel.bulkDelete(toDelete, true).catch(() => null);
    } else {
      await message.delete().catch(() => null);
    }
  } catch (error) {
    console.error("[Nyx.] Failed to delete message during automod enforcement", error);
  }

  try {
    if (timeoutSeconds > 0 && message.member?.moderatable) {
      await message.member.timeout(timeoutSeconds * 1000, reason);
    }
  } catch (error) {
    console.error("[Nyx.] Failed to timeout member during automod enforcement", error);
  }

  await prisma.warning.create({
    data: {
      guildId: message.guildId!,
      userId: message.author.id,
      moderatorId: message.client.user.id,
      reason: `[AutoMod] ${reason}`,
    },
  });

  await logAutomodAction(message, violation, reason);
}

async function logAutomodAction(message: Message, violation: ViolationType, reason: string) {
  if (!message.guildId) return;

  await sendLog(
    message.client,
    message.guildId,
    "spam",
    "AutoMod",
    `**User:** <@${message.author.id}>\n**Channel:** <#${message.channelId}>\n**Rule:** \`${violation}\`\n**Reason:** ${reason}`,
    "warning",
  );
}
