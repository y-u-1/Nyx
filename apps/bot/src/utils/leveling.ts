import { AttachmentBuilder, MessageFlags, type Client } from "discord.js";
import { prisma } from "@nyx/database";
import { buildPanel } from "./embeds.js";
import { generateLevelUpImage } from "./rankcard.js";

/**
 * 累計XPからレベルを算出するための必要XPカーブ。
 * よくあるレベリングBotで使われる二次関数的なカーブ(レベルが上がるほど必要量が増える)。
 * xpForLevel(n) = そのレベルに到達するのに必要な「そのレベル単体の」XP量
 */
function xpForLevel(level: number): number {
  return 5 * level * level + 50 * level + 100;
}

/** ループの安全弁。通常の経済/XPコマンドは上限付きだが、想定外に巨大なXPが渡された場合に
 * ループが極端に長時間回り続けるのを防ぐ(レベル10万は現実的にまず到達しない)。 */
const MAX_CALCULATED_LEVEL = 100_000;

/** 累計XPから現在のレベル・そのレベル内での進捗・次レベルまでの必要XPを算出する */
export function calculateLevel(totalXp: number) {
  let level = 0;
  let remaining = Number.isFinite(totalXp) ? Math.max(0, totalXp) : 0;

  while (remaining >= xpForLevel(level) && level < MAX_CALCULATED_LEVEL) {
    remaining -= xpForLevel(level);
    level++;
  }

  return {
    level,
    currentLevelXp: remaining,
    xpForNextLevel: xpForLevel(level),
  };
}

/** 指定レベルに到達するのに必要な累計XP(そのレベルの開始地点)を計算する。calculateLevelの逆関数。 */
export function xpForLevelStart(targetLevel: number): number {
  let total = 0;
  for (let level = 0; level < targetLevel; level++) {
    total += xpForLevel(level);
  }
  return total;
}

/** ランダムなXP量を範囲内から生成する(Arcaneの"Random"モードに相当) */
export function randomXp(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface AddXpResult {
  leveledUp: boolean;
  newLevel: number;
}

/**
 * XPを付与し、レベルアップしていればロールリワードの付与と通知を行う。
 * 1回のXP付与で複数レベル分上がった場合もまとめて処理する。
 */
export async function addXp(client: Client, guildId: string, userId: string, amount: number, notifyChannelId?: string): Promise<AddXpResult> {
  const before = await prisma.userLevel.upsert({
    where: { guildId_userId: { guildId, userId } },
    create: { guildId, userId, xp: amount, lastMessageAt: new Date() },
    update: { xp: { increment: amount }, lastMessageAt: new Date() },
  });

  const { level: newLevel } = calculateLevel(Number(before.xp));
  const leveledUp = newLevel > before.level;

  if (!leveledUp) {
    return { leveledUp: false, newLevel: before.level };
  }

  await prisma.userLevel.update({ where: { id: before.id }, data: { level: newLevel } });

  // このレベル到達で新たに付与すべきロールリワードをまとめて取得(飛び級した場合も全部拾う)
  const rewards = await prisma.levelRoleReward.findMany({
    where: { guildId, level: { gt: before.level, lte: newLevel } },
  });

  if (rewards.length > 0) {
    try {
      const guild = await client.guilds.fetch(guildId);
      const member = await guild.members.fetch(userId);
      for (const reward of rewards) {
        if (!member.roles.cache.has(reward.roleId)) {
          await member.roles.add(reward.roleId).catch((error) => {
            console.error(`[Nyx.] Failed to assign level role reward ${reward.roleId} to ${userId}`, error);
          });
        }
      }
    } catch (error) {
      console.error(`[Nyx.] Failed to process level role rewards for ${userId}`, error);
    }
  }

  await sendLevelUpAnnouncement(client, guildId, userId, before.level, newLevel, notifyChannelId);

  return { leveledUp: true, newLevel };
}

async function sendLevelUpAnnouncement(client: Client, guildId: string, userId: string, oldLevel: number, newLevel: number, fallbackChannelId?: string) {
  const settings = await prisma.guildSettings.findUnique({ where: { guildId } });
  const notify = settings?.levelUpNotify ?? "channel";
  if (notify === "off") return;

  const panel = buildPanel({
    tone: "success",
    title: "Level Up",
    intro: `<@${userId}> reached level **${newLevel}**.`,
  });

  const imageBuffer = await generateLevelUpImage(oldLevel, newLevel);
  const attachment = new AttachmentBuilder(imageBuffer, { name: "level-up.png" });

  try {
    if (notify === "dm") {
      const user = await client.users.fetch(userId);
      await user.send({ components: [panel], files: [attachment], flags: MessageFlags.IsComponentsV2 });
      return;
    }

    const channelId = settings?.levelUpChannelId ?? fallbackChannelId;
    if (!channelId) return;

    const channel = await client.channels.fetch(channelId);
    if (!channel || channel.isDMBased() || !channel.isTextBased()) return;

    await channel.send({ components: [panel], files: [attachment], flags: MessageFlags.IsComponentsV2 });
  } catch (error) {
    console.error(`[Nyx.] Failed to send level-up announcement for ${userId}`, error);
  }
}
