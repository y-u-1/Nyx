import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const automodWords: Command = {
  data: new SlashCommandBuilder()
    .setName("automod-words")
    .setDescription("Manage the AutoMod banned words list.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub.setName("add").setDescription("Add a banned word or phrase").addStringOption((opt) => opt.setName("word").setDescription("Word or phrase to ban").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove a banned word or phrase")
        .addStringOption((opt) => opt.setName("word").setDescription("Word or phrase to remove").setRequired(true)),
    )
    .addSubcommand((sub) => sub.setName("list").setDescription("List all banned words")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const subcommand = interaction.options.getSubcommand();
    const settings = await prisma.autoModSettings.findUnique({ where: { guildId: interaction.guildId } });
    const currentWords = settings?.bannedWords ?? [];

    if (subcommand === "add") {
      const word = interaction.options.getString("word", true).toLowerCase().trim();

      if (currentWords.includes(word)) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "warning", description: "That word is already banned." })],
          ephemeral: true,
        });
        return;
      }

      await prisma.autoModSettings.upsert({
        where: { guildId: interaction.guildId },
        create: { guildId: interaction.guildId, bannedWords: [word] },
        update: { bannedWords: [...currentWords, word] },
      });

      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `Added \`${word}\` to the banned words list.` })],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "remove") {
      const word = interaction.options.getString("word", true).toLowerCase().trim();

      await prisma.autoModSettings.update({
        where: { guildId: interaction.guildId },
        data: { bannedWords: currentWords.filter((w) => w !== word) },
      });

      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `Removed \`${word}\` from the banned words list.` })],
        ephemeral: true,
      });
      return;
    }

    // list
    if (currentWords.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "primary", description: "No banned words configured." })],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", description: currentWords.map((w) => `\`${w}\``).join(", ") })],
      ephemeral: true,
    });
  },
};
