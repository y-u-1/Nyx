import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const modlog: Command = {
  data: new SlashCommandBuilder()
    .setName("modlog")
    .setDescription("View moderation case history.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((sub) =>
      sub.setName("user").setDescription("Show a member's moderation history").addUserOption((opt) => opt.setName("user").setDescription("Member to check").setRequired(true)),
    )
    .addSubcommand((sub) => sub.setName("recent").setDescription("Show the most recent cases in this server")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const subcommand = interaction.options.getSubcommand();

    const cases =
      subcommand === "user"
        ? await prisma.modCase.findMany({
            where: { guildId: interaction.guildId, userId: (interaction.options.getUser("user", true) as User).id },
            orderBy: { caseNumber: "desc" },
            take: 15,
          })
        : await prisma.modCase.findMany({ where: { guildId: interaction.guildId }, orderBy: { caseNumber: "desc" }, take: 15 });

    if (cases.length === 0) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: "No moderation cases found." })], ephemeral: true });
      return;
    }

    const lines = cases.map(
      (c) => `\`#${c.caseNumber}\` **${c.action}** — <@${c.userId}> — ${c.reason} — <@${c.moderatorId}> — <t:${Math.floor(c.createdAt.getTime() / 1000)}:R>`,
    );

    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", title: "Moderation Cases", description: lines.join("\n") })],
      ephemeral: true,
    });
  },
};
