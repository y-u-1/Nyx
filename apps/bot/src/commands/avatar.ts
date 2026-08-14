import { SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const avatar: Command = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Show a member's avatar.")
    .addUserOption((opt) => opt.setName("user").setDescription("Member to check (default: you)")),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = (interaction.options.getUser("user") as User | null) ?? interaction.user;
    const url = target.displayAvatarURL({ extension: "png", size: 512 });

    const embed = baseEmbed({ tone: "primary", title: `${target.username}'s avatar` });
    embed.setImage(url);

    await interaction.reply({ embeds: [embed] });
  },
};
