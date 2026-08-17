import { type Message } from "discord.js";
import { prisma } from "@nyx/database";
import type { NyxClient } from "../client.js";
import { addXp, randomXp } from "../utils/leveling.js";
import { checkAutomod } from "../utils/automod.js";
import { tryAutoGainAffinity } from "../utils/affinity.js";

// チャンネルごとの直近の発言者を覚えておくためのメモリキャッシュ(再起動でリセットされてよい)。
// 短時間のうちに別のユーザーが同じチャンネルで発言したら「会話が続いている」とみなし、親密度を少量加算する。
const lastSpeaker = new Map<string, { userId: string; timestamp: number }>();
const AFFINITY_CONVERSATION_WINDOW_MS = 5 * 60 * 1000;

export function registerMessageCreateEvent(client: NyxClient) {
  client.on("messageCreate", async (message: Message) => {
    if (message.author.bot || !message.guildId) return;

    try {
      const violated = await checkAutomod(message);
      if (violated) return; // 驕募渚縺ｨ縺励※蜑企勁繝ｻ蜃ｦ鄂ｰ縺励◆蝣ｴ蜷医√％縺ｮ繝｡繝・そ繝ｼ繧ｸ縺ｫ縺ｯXP繧剃ｻ倅ｸ弱＠縺ｪ縺・

      const previous = lastSpeaker.get(message.channelId);
      lastSpeaker.set(message.channelId, { userId: message.author.id, timestamp: Date.now() });

      if (previous && previous.userId !== message.author.id && Date.now() - previous.timestamp < AFFINITY_CONVERSATION_WINDOW_MS) {
        tryAutoGainAffinity(message.guildId, message.author.id, previous.userId).catch((error) => {
          console.error("[Nyx.] Failed to auto-gain affinity", error);
        });
      }

      const settings = await prisma.guildSettings.findUnique({ where: { guildId: message.guildId } });
      if (settings && !settings.levelingEnabled) return;

      const noXp = await prisma.noXpChannel.findUnique({
        where: { guildId_channelId: { guildId: message.guildId, channelId: message.channelId } },
      });
      if (noXp) return;

      const cooldownSeconds = settings?.xpCooldownSeconds ?? 60;

      if (cooldownSeconds > 0) {
        const existing = await prisma.userLevel.findUnique({
          where: { guildId_userId: { guildId: message.guildId, userId: message.author.id } },
          select: { lastMessageAt: true },
        });

        if (existing?.lastMessageAt) {
          const elapsedSeconds = (Date.now() - existing.lastMessageAt.getTime()) / 1000;
          if (elapsedSeconds < cooldownSeconds) return;
        }
      }

      const amount = randomXp(settings?.xpMin ?? 15, settings?.xpMax ?? 25);
      await addXp(client, message.guildId, message.author.id, amount, message.channelId);
    } catch (error) {
      console.error("[Nyx.] Failed to process message XP", error);
    }
  });
}
