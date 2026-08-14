import type { Client } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed, type EmbedTone } from "./embeds.js";

type LogCategory = "member" | "message" | "vc" | "channel" | "spam" | "moderation" | "ticket" | "redeem";

const CHANNEL_FIELD: Record<
  LogCategory,
  "memberLogChannelId" | "messageLogChannelId" | "vcLogChannelId" | "channelLogChannelId" | "spamLogChannelId" | "moderationLogChannelId" | "ticketLogChannelId" | "redeemLogChannelId"
> = {
  member: "memberLogChannelId",
  message: "messageLogChannelId",
  vc: "vcLogChannelId",
  channel: "channelLogChannelId",
  spam: "spamLogChannelId",
  moderation: "moderationLogChannelId",
  ticket: "ticketLogChannelId",
  redeem: "redeemLogChannelId",
};

/** 指定カテゴリのログチャンネルに埋め込みを送信する。未設定なら何もしない。 */
export async function sendLog(client: Client, guildId: string, category: LogCategory, title: string, description: string, tone: EmbedTone = "primary") {
  const settings = await prisma.logSettings.findUnique({ where: { guildId } });
  const channelId = settings?.[CHANNEL_FIELD[category]];
  if (!channelId) return;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || channel.isDMBased() || !channel.isTextBased()) return;

    await channel.send({ embeds: [baseEmbed({ tone, title, description })] });
  } catch (error) {
    console.error(`[Nyx.] Failed to send ${category} log`, error);
  }
}
