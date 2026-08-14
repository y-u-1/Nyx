import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const roles: Command = {
  data: new SlashCommandBuilder().setName("roles").setDescription("List all roles in this server."),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const roleList = interaction.guild.roles.cache
      .filter((r) => r.id !== interaction.guild!.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => `<@&${r.id}> — \`${r.members.size}\` members`);

    if (roleList.length === 0) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: "This server has no roles." })] });
      return;
    }

    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", title: "Roles", description: roleList.slice(0, 30).join("\n") })],
    });
  },
};
