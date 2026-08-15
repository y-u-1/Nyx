import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { useQueue } from "discord-player";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const skip: Command = {
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip the current track."),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const queue = useQueue(interaction.guildId);
    if (!queue?.currentTrack) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "Nothing is playing." })], ephemeral: true });
      return;
    }

    const skipped = queue.currentTrack;
    queue.node.skip();

    await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Skipped **${skipped.title}**.` })] });
  },
};
