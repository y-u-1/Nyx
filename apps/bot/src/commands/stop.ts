import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { useQueue } from "discord-player";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const stop: Command = {
  data: new SlashCommandBuilder().setName("stop").setDescription("Stop playback and clear the queue."),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const queue = useQueue(interaction.guildId);
    if (!queue) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "Nothing is playing." })], ephemeral: true });
      return;
    }

    queue.delete();

    await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: "Stopped playback and cleared the queue." })] });
  },
};
