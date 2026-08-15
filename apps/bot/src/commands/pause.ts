import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { useQueue } from "discord-player";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const pause: Command = {
  data: new SlashCommandBuilder().setName("pause").setDescription("Pause playback."),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const queue = useQueue(interaction.guildId);
    if (!queue?.currentTrack) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "Nothing is playing." })], ephemeral: true });
      return;
    }

    queue.node.setPaused(true);
    await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: "Paused." })] });
  },
};
