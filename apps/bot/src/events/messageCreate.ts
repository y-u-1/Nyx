import { type Message } from "discord.js";
import { prisma } from "@nyx/database";
import type { NyxClient } from "../client.js";
import { addXp, randomXp } from "../utils/leveling.js";
import { checkAutomod } from "../utils/automod.js";

export function registerMessageCreateEvent(client: NyxClient) {
  client.on("messageCreate", async (message: Message) => {
    if (message.author.bot || !message.guildId) return;

    try {
      const violated = await checkAutomod(message);
      if (violated) return; // 驕募渚縺ｨ縺励※蜑企勁繝ｻ蜃ｦ鄂ｰ縺励◆蝣ｴ蜷医√％縺ｮ繝｡繝・そ繝ｼ繧ｸ縺ｫ縺ｯXP繧剃ｻ倅ｸ弱＠縺ｪ縺・

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
