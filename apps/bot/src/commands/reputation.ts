import { SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const reputation: Command = {
  data: new SlashCommandBuilder()
    .setName("reputation")
    .setDescription("Show a member's vouch count and recent comments.")
    .addUserOption((opt) => opt.setName("user").setDescription("Member to check (default: you)")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const target = (interaction.options.getUser("user") as User | null) ?? interaction.user;

    const vouches = await prisma.vouch.findMany({
      where: { guildId: interaction.guildId, toUserId: target.id },
      orderBy: { createdAt: "desc" },
    });

    if (vouches.length === 0) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: `${target} has no vouches yet.` })] });
      return;
    }

    const recentLines = vouches
      .slice(0, 5)
      .map((v) => `<@${v.fromUserId}>${v.comment ? `: ${v.comment}` : ""}`);

    await interaction.reply({
      embeds: [
        baseEmbed({
          tone: "primary",
          title: `${target.username}'s Reputation`,
          description: `**Total vouches:** \`${vouches.length}\`\n\n${recentLines.join("\n")}`,
        }),
      ],
    });
  },
};
