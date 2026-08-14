import { SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const banner: Command = {
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Show a member's banner.")
    .addUserOption((opt) => opt.setName("user").setDescription("Member to check (default: you)")),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = (interaction.options.getUser("user") as User | null) ?? interaction.user;
    const fullUser = await interaction.client.users.fetch(target.id, { force: true });
    const url = fullUser.bannerURL({ extension: "png", size: 512 });

    if (!url) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "primary", description: `${target} doesn't have a banner set.` })],
        ephemeral: true,
      });
      return;
    }

    const embed = baseEmbed({ tone: "primary", title: `${target.username}'s banner` });
    embed.setImage(url);

    await interaction.reply({ embeds: [embed] });
  },
};
