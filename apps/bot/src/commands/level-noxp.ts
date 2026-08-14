import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type TextChannel } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const levelNoXp: Command = {
  data: new SlashCommandBuilder()
    .setName("level-noxp")
    .setDescription("Manage channels excluded from earning message XP.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Exclude a channel from message XP")
        .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to exclude").setRequired(true).addChannelTypes(ChannelType.GuildText)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Re-enable message XP for a channel")
        .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to re-enable").setRequired(true).addChannelTypes(ChannelType.GuildText)),
    )
    .addSubcommand((sub) => sub.setName("list").setDescription("List all excluded channels")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const channel = interaction.options.getChannel("channel", true) as TextChannel;
      await prisma.noXpChannel.upsert({
        where: { guildId_channelId: { guildId: interaction.guildId, channelId: channel.id } },
        create: { guildId: interaction.guildId, channelId: channel.id },
        update: {},
      });
      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `${channel} no longer earns message XP.` })],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "remove") {
      const channel = interaction.options.getChannel("channel", true) as TextChannel;
      await prisma.noXpChannel
        .delete({ where: { guildId_channelId: { guildId: interaction.guildId, channelId: channel.id } } })
        .catch(() => null);
      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `${channel} earns message XP again.` })],
        ephemeral: true,
      });
      return;
    }

    const channels = await prisma.noXpChannel.findMany({ where: { guildId: interaction.guildId } });
    if (channels.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "primary", description: "No channels are excluded from XP." })],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", description: channels.map((c) => `<#${c.channelId}>`).join("\n") })],
      ephemeral: true,
    });
  },
};
