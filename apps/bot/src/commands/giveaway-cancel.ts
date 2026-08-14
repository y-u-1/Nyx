import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { cancelGiveaway } from "../utils/giveaway.js";

export const giveawayCancel: Command = {
  data: new SlashCommandBuilder()
    .setName("giveaway-cancel")
    .setDescription("Cancel a giveaway without picking winners.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName("message_id").setDescription("Message ID of the giveaway panel").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const messageId = interaction.options.getString("message_id", true);
    const giveaway = await prisma.giveaway.findUnique({ where: { messageId } });

    if (!giveaway || giveaway.guildId !== interaction.guildId || giveaway.ended || giveaway.cancelled) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "No active giveaway found for that message ID in this server." })],
        ephemeral: true,
      });
      return;
    }

    await cancelGiveaway(interaction.client, giveaway.id);

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: "Giveaway cancelled." })],
      ephemeral: true,
    });
  },
};
