import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { parseDuration } from "../utils/duration.js";
import { logModAction, notifyUser } from "../utils/moderation.js";

export const timeout: Command = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Time out a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName("user").setDescription("Member to time out").setRequired(true))
    .addStringOption((opt) => opt.setName("duration").setDescription("Duration, e.g. 10m, 1h, 1d").setRequired(true))
    .addStringOption((opt) => opt.setName("reason").setDescription("Reason for the timeout").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId || !interaction.guild) return;

    const target = interaction.options.getUser("user", true) as User;
    const durationInput = interaction.options.getString("duration", true);
    const reason = interaction.options.getString("reason", true);

    const durationMs = parseDuration(durationInput);
    if (!durationMs || durationMs > 28 * 24 * 60 * 60 * 1000) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "Invalid duration. Use a format like `10m`, `1h`, or `1d` (max 28 days)." })],
        ephemeral: true,
      });
      return;
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member || !member.moderatable) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "I can't time out that member (missing permissions or role hierarchy)." })],
        ephemeral: true,
      });
      return;
    }

    await member.timeout(durationMs, reason);
    await notifyUser(interaction.client, target, interaction.guild.name, "timed out", reason);
    await logModAction(interaction.client, interaction.guildId, "timeout", interaction.user.id, target.id, reason, `**Duration:** ${durationInput}`);

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: `${target} has been timed out for ${durationInput}.` })],
      ephemeral: true,
    });
  },
};
