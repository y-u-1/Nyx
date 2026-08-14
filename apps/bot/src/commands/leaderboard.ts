import { AttachmentBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { calculateLevel } from "../utils/leveling.js";
import { generateLeaderboardCard } from "../utils/rankcard.js";

export const leaderboard: Command = {
  data: new SlashCommandBuilder().setName("leaderboard").setDescription("Show the top 10 members by XP."),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    await interaction.deferReply();

    const top = await prisma.userLevel.findMany({
      where: { guildId: interaction.guildId },
      orderBy: { xp: "desc" },
      take: 10,
    });

    if (top.length === 0) {
      await interaction.editReply({
        embeds: [baseEmbed({ tone: "primary", description: "No one has earned XP yet." })],
      });
      return;
    }

    const entries = [];
    for (const record of top) {
      let username = record.userId;
      let avatarUrl = interaction.client.user!.displayAvatarURL({ extension: "png", size: 64 });

      try {
        const user = await interaction.client.users.fetch(record.userId);
        username = user.username;
        avatarUrl = user.displayAvatarURL({ extension: "png", size: 64 });
      } catch {
        // 繝ｦ繝ｼ繧ｶ繝ｼ縺悟叙蠕励〒縺阪↑縺・騾莨壽ｸ医∩縺ｪ縺ｩ)蝣ｴ蜷医・ID縺ｮ縺ｾ縺ｾ陦ｨ遉ｺ
      }

      const { level, currentLevelXp, xpForNextLevel } = calculateLevel(Number(record.xp));
      entries.push({ username, avatarUrl, level, currentLevelXp, xpForNextLevel });
    }

    const buffer = await generateLeaderboardCard(entries);

    await interaction.editReply({ files: [new AttachmentBuilder(buffer, { name: "leaderboard.png" })] });
  },
};
