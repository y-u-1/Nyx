import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type TextChannel } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { logModAction } from "../utils/moderation.js";

export const slowmode: Command = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set slowmode for a channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((opt) => opt.setName("seconds").setDescription("Seconds between messages (0 to disable)").setRequired(true).setMinValue(0).setMaxValue(21600))
    .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to set (default: this channel)")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const seconds = interaction.options.getInteger("seconds", true);
    const channel = (interaction.options.getChannel("channel") as TextChannel | null) ?? (interaction.channel as TextChannel);

    await channel.setRateLimitPerUser(seconds);
    await logModAction(
      interaction.client,
      interaction.guildId,
      "slowmode",
      interaction.user.id,
      null,
      seconds === 0 ? "Slowmode disabled." : `Slowmode set to ${seconds}s.`,
      `**Channel:** ${channel}`,
    );

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: seconds === 0 ? `Slowmode disabled in ${channel}.` : `Slowmode set to \`${seconds}s\` in ${channel}.` })],
    });
  },
};
