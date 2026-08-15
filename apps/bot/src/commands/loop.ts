import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { QueueRepeatMode, useQueue } from "discord-player";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

const MODES: Record<string, QueueRepeatMode> = {
  off: QueueRepeatMode.OFF,
  track: QueueRepeatMode.TRACK,
  queue: QueueRepeatMode.QUEUE,
};

export const loop: Command = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set the loop mode.")
    .addStringOption((opt) =>
      opt
        .setName("mode")
        .setDescription("Loop mode")
        .setRequired(true)
        .addChoices({ name: "off", value: "off" }, { name: "track", value: "track" }, { name: "queue", value: "queue" }),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const mode = interaction.options.getString("mode", true);
    const q = useQueue(interaction.guildId);
    if (!q) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "Nothing is playing." })], ephemeral: true });
      return;
    }

    q.setRepeatMode(MODES[mode]);
    await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Loop mode set to \`${mode}\`.` })] });
  },
};
