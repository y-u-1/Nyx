import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const partner: Command = {
  data: new SlashCommandBuilder()
    .setName("partner")
    .setDescription("Manage partner/affiliate servers.")
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add a partner (admin)")
        .addStringOption((opt) => opt.setName("name").setDescription("Partner name").setRequired(true))
        .addStringOption((opt) => opt.setName("invite").setDescription("Invite link"))
        .addStringOption((opt) => opt.setName("description").setDescription("Short description")),
    )
    .addSubcommand((sub) =>
      sub.setName("remove").setDescription("Remove a partner (admin)").addStringOption((opt) => opt.setName("name").setDescription("Partner name").setRequired(true)),
    )
    .addSubcommand((sub) => sub.setName("list").setDescription("List all partners")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add" || subcommand === "remove") {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: "You need the Manage Server permission to do that." })],
          ephemeral: true,
        });
        return;
      }
    }

    if (subcommand === "add") {
      const name = interaction.options.getString("name", true);
      const inviteUrl = interaction.options.getString("invite");
      const description = interaction.options.getString("description");

      await prisma.partner.upsert({
        where: { guildId_name: { guildId: interaction.guildId, name } },
        create: { guildId: interaction.guildId, name, inviteUrl, description },
        update: { inviteUrl, description },
      });

      await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Added partner **${name}**.` })], ephemeral: true });
      return;
    }

    if (subcommand === "remove") {
      const name = interaction.options.getString("name", true);
      await prisma.partner.delete({ where: { guildId_name: { guildId: interaction.guildId, name } } }).catch(() => null);
      await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Removed partner **${name}**.` })], ephemeral: true });
      return;
    }

    const partners = await prisma.partner.findMany({ where: { guildId: interaction.guildId } });
    if (partners.length === 0) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: "No partners added yet." })] });
      return;
    }

    const lines = partners.map((p) => `**${p.name}**${p.inviteUrl ? ` — [Join](${p.inviteUrl})` : ""}${p.description ? `\n${p.description}` : ""}`);
    await interaction.reply({ embeds: [baseEmbed({ tone: "primary", title: "Partners", description: lines.join("\n\n") })] });
  },
};
