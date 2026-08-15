import { SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const vouch: Command = {
  data: new SlashCommandBuilder()
    .setName("vouch")
    .setDescription("Vouch for a member.")
    .addUserOption((opt) => opt.setName("user").setDescription("Member to vouch for").setRequired(true))
    .addStringOption((opt) => opt.setName("comment").setDescription("Optional comment")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const target = interaction.options.getUser("user", true) as User;
    const comment = interaction.options.getString("comment");

    if (target.id === interaction.user.id) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "You can't vouch for yourself." })], ephemeral: true });
      return;
    }

    await prisma.vouch.create({
      data: { guildId: interaction.guildId, fromUserId: interaction.user.id, toUserId: target.id, comment },
    });

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: `Vouched for ${target}.` })],
    });
  },
};
