import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type TextChannel } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const logsConfig: Command = {
  data: new SlashCommandBuilder()
    .setName("logs-config")
    .setDescription("Configure event log channels.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((opt) => opt.setName("member_log").setDescription("Channel for member join/leave/nickname/avatar logs").addChannelTypes(ChannelType.GuildText))
    .addChannelOption((opt) => opt.setName("message_log").setDescription("Channel for message edit/delete logs").addChannelTypes(ChannelType.GuildText))
    .addChannelOption((opt) => opt.setName("vc_log").setDescription("Channel for voice channel join/leave/move logs").addChannelTypes(ChannelType.GuildText))
    .addChannelOption((opt) => opt.setName("channel_log").setDescription("Channel for channel create/delete logs").addChannelTypes(ChannelType.GuildText))
    .addChannelOption((opt) => opt.setName("spam_log").setDescription("Channel for AutoMod violation logs").addChannelTypes(ChannelType.GuildText))
    .addChannelOption((opt) => opt.setName("moderation_log").setDescription("Channel for warn/kick/ban/timeout logs").addChannelTypes(ChannelType.GuildText))
    .addChannelOption((opt) => opt.setName("ticket_log").setDescription("Channel for ticket open/claim/close logs").addChannelTypes(ChannelType.GuildText))
    .addChannelOption((opt) => opt.setName("redeem_log").setDescription("Channel for redeem code creation/use logs").addChannelTypes(ChannelType.GuildText)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const memberLog = interaction.options.getChannel("member_log") as TextChannel | null;
    const messageLog = interaction.options.getChannel("message_log") as TextChannel | null;
    const vcLog = interaction.options.getChannel("vc_log") as TextChannel | null;
    const channelLog = interaction.options.getChannel("channel_log") as TextChannel | null;
    const spamLog = interaction.options.getChannel("spam_log") as TextChannel | null;
    const moderationLog = interaction.options.getChannel("moderation_log") as TextChannel | null;
    const ticketLog = interaction.options.getChannel("ticket_log") as TextChannel | null;
    const redeemLog = interaction.options.getChannel("redeem_log") as TextChannel | null;

    await prisma.logSettings.upsert({
      where: { guildId: interaction.guildId },
      create: {
        guildId: interaction.guildId,
        memberLogChannelId: memberLog?.id,
        messageLogChannelId: messageLog?.id,
        vcLogChannelId: vcLog?.id,
        channelLogChannelId: channelLog?.id,
        spamLogChannelId: spamLog?.id,
        moderationLogChannelId: moderationLog?.id,
        ticketLogChannelId: ticketLog?.id,
        redeemLogChannelId: redeemLog?.id,
      },
      update: {
        memberLogChannelId: memberLog ? memberLog.id : undefined,
        messageLogChannelId: messageLog ? messageLog.id : undefined,
        vcLogChannelId: vcLog ? vcLog.id : undefined,
        channelLogChannelId: channelLog ? channelLog.id : undefined,
        spamLogChannelId: spamLog ? spamLog.id : undefined,
        moderationLogChannelId: moderationLog ? moderationLog.id : undefined,
        ticketLogChannelId: ticketLog ? ticketLog.id : undefined,
        redeemLogChannelId: redeemLog ? redeemLog.id : undefined,
      },
    });

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: "Log channel settings updated." })],
      ephemeral: true,
    });
  },
};
