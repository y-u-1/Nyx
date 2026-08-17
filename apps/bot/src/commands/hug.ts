import { SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { addAffinity, isGestureOnCooldown } from "../utils/affinity.js";

const GESTURE_AFFINITY_AMOUNT = 5;

export const hug: Command = {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Give someone a hug (raises affinity).")
    .addUserOption((opt) => opt.setName("user").setDescription("Member to hug").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const target = interaction.options.getUser("user", true) as User;

    if (target.id === interaction.user.id) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "warning", description: "You can't hug yourself. Try someone else!" })],
        ephemeral: true,
      });
      return;
    }

    if (target.bot) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "warning", description: "You can't hug a bot." })],
        ephemeral: true,
      });
      return;
    }

    if (isGestureOnCooldown("hug", interaction.user.id, target.id)) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "warning", description: `You've hugged ${target} recently. Wait a bit before doing it again.` })],
        ephemeral: true,
      });
      return;
    }

    await addAffinity(interaction.guildId, interaction.user.id, target.id, GESTURE_AFFINITY_AMOUNT);

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: `${interaction.user} hugs ${target}! (+${GESTURE_AFFINITY_AMOUNT} affinity)` })],
    });
  },
};
