import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { logModAction, notifyUser } from "../utils/moderation.js";

export const kick: Command = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((opt) => opt.setName("user").setDescription("Member to kick").setRequired(true))
    .addStringOption((opt) => opt.setName("reason").setDescription("Reason for the kick").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId || !interaction.guild) return;

    const target = interaction.options.getUser("user", true) as User;
    const reason = interaction.options.getString("reason", true);

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member || !member.kickable) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "I can't kick that member (missing permissions or role hierarchy)." })],
        ephemeral: true,
      });
      return;
    }

    await notifyUser(interaction.client, target, interaction.guild.name, "kicked", reason);
    await member.kick(reason);
    await logModAction(interaction.client, interaction.guildId, "kick", interaction.user.id, target.id, reason);

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: `${target} has been kicked.` })],
      ephemeral: true,
    });
  },
};
