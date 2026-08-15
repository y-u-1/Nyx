import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const config: Command = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Customize server-specific terms and settings used by Nyx.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName("currency")
        .setDescription('Set the economy currency name (default: "coins")')
        .addStringOption((opt) => opt.setName("name").setDescription("New currency name").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("term-set")
        .setDescription("Customize an arbitrary term used by Nyx. (e.g. rank_label)")
        .addStringOption((opt) => opt.setName("key").setDescription("Term key, e.g. rank_label").setRequired(true))
        .addStringOption((opt) => opt.setName("value").setDescription("Replacement text").setRequired(true)),
    )
    .addSubcommand((sub) => sub.setName("term-list").setDescription("List all customized terms"))
    .addSubcommand((sub) => sub.setName("view").setDescription("View current config values")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "currency") {
      const currencyName = interaction.options.getString("name", true);
      await prisma.guildSettings.upsert({
        where: { guildId: interaction.guildId },
        create: { guildId: interaction.guildId, currencyName },
        update: { currencyName },
      });
      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `Currency name set to **${currencyName}**.` })],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "term-set") {
      const key = interaction.options.getString("key", true);
      const value = interaction.options.getString("value", true);
      await prisma.guildTerm.upsert({
        where: { guildId_key: { guildId: interaction.guildId, key } },
        create: { guildId: interaction.guildId, key, value },
        update: { value },
      });
      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `Set \`${key}\` to **${value}**.` })],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "term-list") {
      const terms = await prisma.guildTerm.findMany({ where: { guildId: interaction.guildId } });
      if (terms.length === 0) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "primary", description: "No custom terms set yet. Known keys: `rank_label`." })],
          ephemeral: true,
        });
        return;
      }
      const lines = terms.map((t) => `\`${t.key}\` → **${t.value}**`);
      await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: lines.join("\n") })], ephemeral: true });
      return;
    }

    // view
    const settings = await prisma.guildSettings.findUnique({ where: { guildId: interaction.guildId } });
    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", description: `**Currency name:** ${settings?.currencyName ?? "coins"}` })],
      ephemeral: true,
    });
  },
};
