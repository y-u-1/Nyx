import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const config: Command = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Customize server-specific terms used by Nyx.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName("currency_name").setDescription('Name for the economy currency (default: "coins")')),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const currencyName = interaction.options.getString("currency_name");

    if (!currencyName) {
      const settings = await prisma.guildSettings.findUnique({ where: { guildId: interaction.guildId } });
      await interaction.reply({
        embeds: [baseEmbed({ tone: "primary", description: `**Currency name:** ${settings?.currencyName ?? "coins"}` })],
        ephemeral: true,
      });
      return;
    }

    await prisma.guildSettings.upsert({
      where: { guildId: interaction.guildId },
      create: { guildId: interaction.guildId, currencyName },
      update: { currencyName },
    });

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: `Currency name set to **${currencyName}**.` })],
      ephemeral: true,
    });
  },
};
