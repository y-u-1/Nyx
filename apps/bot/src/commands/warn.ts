import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { logModAction, notifyUser } from "../utils/moderation.js";

export const warn: Command = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName("user").setDescription("Member to warn").setRequired(true))
    .addStringOption((opt) => opt.setName("reason").setDescription("Reason for the warning").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const target = interaction.options.getUser("user", true) as User;
    const reason = interaction.options.getString("reason", true);

    await prisma.warning.create({
      data: { guildId: interaction.guildId, userId: target.id, moderatorId: interaction.user.id, reason },
    });

    await notifyUser(interaction.client, target, interaction.guild!.name, "warned", reason);
    await logModAction(interaction.client, interaction.guildId, "warn", interaction.user.id, target.id, reason);

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: `${target} has been warned.` })],
      ephemeral: true,
    });
  },
};
