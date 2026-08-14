import { SlashCommandBuilder, type ChatInputCommandInteraction, type GuildMember, type User } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const userinfo: Command = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Show info about a member.")
    .addUserOption((opt) => opt.setName("user").setDescription("Member to check (default: you)")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const target = (interaction.options.getUser("user") as User | null) ?? interaction.user;
    const member = (await interaction.guild.members.fetch(target.id).catch(() => null)) as GuildMember | null;

    const lines = [
      `**Username:** ${target.username}`,
      `**ID:** \`${target.id}\``,
      `**Account created:** <t:${Math.floor(target.createdTimestamp / 1000)}:D>`,
      member?.joinedTimestamp ? `**Joined server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : null,
      member ? `**Roles:** \`${member.roles.cache.size - 1}\`` : null,
    ].filter(Boolean);

    const embed = baseEmbed({ tone: "primary", title: target.username, description: lines.join("\n") });
    embed.setThumbnail(target.displayAvatarURL({ extension: "png", size: 256 }));

    await interaction.reply({ embeds: [embed] });
  },
};
