import { AttachmentBuilder, SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { calculateLevel } from "../utils/leveling.js";
import { generateRankCard } from "../utils/rankcard.js";

export const rank: Command = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Show your (or another member's) level and XP.")
    .addUserOption((opt) => opt.setName("user").setDescription("Member to check (default: you)")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const target = (interaction.options.getUser("user") as User | null) ?? interaction.user;

    await interaction.deferReply();

    const userLevel = await prisma.userLevel.findUnique({
      where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } },
    });

    if (!userLevel) {
      await interaction.editReply({
        embeds: [baseEmbed({ tone: "primary", description: `${target} hasn't earned any XP yet.` })],
      });
      return;
    }

    const rankPosition = await prisma.userLevel.count({
      where: { guildId: interaction.guildId, xp: { gt: userLevel.xp } },
    });

    const { level, currentLevelXp, xpForNextLevel } = calculateLevel(Number(userLevel.xp));

    const buffer = await generateRankCard({
      username: target.username,
      avatarUrl: target.displayAvatarURL({ extension: "png", size: 128 }),
      level,
      currentLevelXp,
      xpForNextLevel,
      rank: rankPosition + 1,
    });

    await interaction.editReply({ files: [new AttachmentBuilder(buffer, { name: "rank.png" })] });
  },
};
