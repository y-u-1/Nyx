import { AttachmentBuilder, MessageFlags, type Client } from "discord.js";
import { prisma } from "@nyx/database";
import { buildPanel } from "./embeds.js";
import { generateLevelUpImage } from "./rankcard.js";

/**
 * 邏ｯ險・P縺九ｉ繝ｬ繝吶Ν繧堤ｮ怜・縺吶ｋ縺溘ａ縺ｮ蠢・ｦ々P繧ｫ繝ｼ繝悶・
 * 繧医￥縺ゅｋ繝ｬ繝吶Μ繝ｳ繧ｰBot縺ｧ菴ｿ繧上ｌ繧倶ｺ梧ｬ｡髢｢謨ｰ逧・↑繧ｫ繝ｼ繝・繝ｬ繝吶Ν縺御ｸ翫′繧九⊇縺ｩ蠢・ｦ・㍼縺悟｢励∴繧・縲・
 * xpForLevel(n) = 縺昴・繝ｬ繝吶Ν縺ｫ蛻ｰ驕斐☆繧九・縺ｫ蠢・ｦ√↑縲後◎縺ｮ繝ｬ繝吶Ν蜊倅ｽ薙・縲更P驥・
 */
function xpForLevel(level: number): number {
  return 5 * level * level + 50 * level + 100;
}

/** 邏ｯ險・P縺九ｉ迴ｾ蝨ｨ縺ｮ繝ｬ繝吶Ν繝ｻ縺昴・繝ｬ繝吶Ν蜀・〒縺ｮ騾ｲ謐励・谺｡繝ｬ繝吶Ν縺ｾ縺ｧ縺ｮ蠢・ｦ々P繧堤ｮ怜・縺吶ｋ */
export function calculateLevel(totalXp: number) {
  let level = 0;
  let remaining = totalXp;

  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }

  return {
    level,
    currentLevelXp: remaining,
    xpForNextLevel: xpForLevel(level),
  };
}

/** 繝ｩ繝ｳ繝繝縺ｪXP驥上ｒ遽・峇蜀・°繧臥函謌舌☆繧・Arcane縺ｮ"Random"繝｢繝ｼ繝峨↓逶ｸ蠖・ */
export function randomXp(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface AddXpResult {
  leveledUp: boolean;
  newLevel: number;
}

/**
 * XP繧剃ｻ倅ｸ弱＠縲√Ξ繝吶Ν繧｢繝・・縺励※縺・ｌ縺ｰ繝ｭ繝ｼ繝ｫ繝ｪ繝ｯ繝ｼ繝峨・莉倅ｸ弱→騾夂衍繧定｡後≧縲・
 * 1蝗槭・XP莉倅ｸ弱〒隍・焚繝ｬ繝吶Ν蛻・ｸ翫′縺｣縺溷ｴ蜷医ｂ縺ｾ縺ｨ繧√※蜃ｦ逅・☆繧九・
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

  // 縺薙・繝ｬ繝吶Ν蛻ｰ驕斐〒譁ｰ縺溘↓莉倅ｸ弱☆縺ｹ縺阪Ο繝ｼ繝ｫ繝ｪ繝ｯ繝ｼ繝峨ｒ縺ｾ縺ｨ繧√※蜿門ｾ・鬟帙・邏壹＠縺溷ｴ蜷医ｂ蜈ｨ驛ｨ諡ｾ縺・
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
