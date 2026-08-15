import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { useQueue } from "discord-player";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const queue: Command = {
  data: new SlashCommandBuilder().setName("queue").setDescription("Show the current queue."),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const q = useQueue(interaction.guildId);
    if (!q?.currentTrack) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: "Nothing is playing." })] });
      return;
    }

    const upcoming = q.tracks
      .toArray()
      .slice(0, 10)
      .map((t, i) => `\`${i + 1}\` ${t.title}`)
      .join("\n");

    const description = [`**Now Playing:** ${q.currentTrack.title}`, upcoming ? `\n**Up Next:**\n${upcoming}` : "\n*(no more tracks queued)*"].join("\n");

    await interaction.reply({ embeds: [baseEmbed({ tone: "primary", title: "Queue", description })] });
  },
};
