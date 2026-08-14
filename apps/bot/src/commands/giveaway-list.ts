import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const giveawayList: Command = {
  data: new SlashCommandBuilder()
    .setName("giveaway-list")
    .setDescription("List active giveaways in this server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const active = await prisma.giveaway.findMany({
      where: { guildId: interaction.guildId, ended: false, cancelled: false },
      orderBy: { endsAt: "asc" },
    });

    if (active.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "primary", description: "There are no active giveaways right now." })],
        ephemeral: true,
      });
      return;
    }

    const lines = active.map((g) => {
      const unix = Math.floor(g.endsAt.getTime() / 1000);
      const link = `https://discord.com/channels/${g.guildId}/${g.channelId}/${g.messageId}`;
      return `**${g.prize}** 窶・ends <t:${unix}:R> 窶・[Jump](${link})\n\`ID: ${g.messageId}\``;
    });

    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", description: `**Active Giveaways**\n\n${lines.join("\n\n")}` })],
      ephemeral: true,
    });
  },
};
