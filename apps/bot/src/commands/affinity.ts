import { SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { getAffinity, getTopPartners, getGuildLeaderboard, tierForPoints, nextTier } from "../utils/affinity.js";

export const affinity: Command = {
  data: new SlashCommandBuilder()
    .setName("affinity")
    .setDescription("Check affinity between members.")
    .addSubcommand((sub) =>
      sub
        .setName("with")
        .setDescription("Check your affinity with another member")
        .addUserOption((opt) => opt.setName("user").setDescription("Member to check").setRequired(true)),
    )
    .addSubcommand((sub) => sub.setName("top").setDescription("Show your top affinity partners"))
    .addSubcommand((sub) => sub.setName("leaderboard").setDescription("Show the server's top affinity pairs")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const sub = interaction.options.getSubcommand();

    if (sub === "with") {
      const target = interaction.options.getUser("user", true) as User;

      if (target.id === interaction.user.id) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "warning", description: "You can't check affinity with yourself." })],
          ephemeral: true,
        });
        return;
      }

      const record = await getAffinity(interaction.guildId, interaction.user.id, target.id);
      const points = record?.points ?? 0;
      const tier = tierForPoints(points);
      const next = nextTier(points);

      const progressLine = next
        ? `Next tier: **${next.labelEn}** at \`${next.threshold}\` points (\`${next.threshold - points}\` to go)`
        : `Maximum tier reached.`;

      await interaction.reply({
        embeds: [
          baseEmbed({
            tone: "primary",
            title: `Affinity — ${interaction.user.username} × ${target.username}`,
            description: `**${points}** points — currently **${tier.labelEn}**\n${progressLine}`,
          }),
        ],
      });
      return;
    }

    if (sub === "top") {
      const partners = await getTopPartners(interaction.guildId, interaction.user.id, 10);

      if (partners.length === 0) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "primary", description: "No affinity data yet. Chat with people or try `/hug` and `/pat`!" })],
        });
        return;
      }

      const lines = partners.map((p, i) => `\`${i + 1}.\` <@${p.partnerId}> — **${p.points}** (${tierForPoints(p.points).labelEn})`);

      await interaction.reply({
        embeds: [baseEmbed({ tone: "primary", title: `${interaction.user.username}'s Top Partners`, description: lines.join("\n") })],
      });
      return;
    }

    if (sub === "leaderboard") {
      const rows = await getGuildLeaderboard(interaction.guildId, 10);

      if (rows.length === 0) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "primary", description: "No affinity data yet for this server." })],
        });
        return;
      }

      const lines = rows.map((r, i) => `\`${i + 1}.\` <@${r.userAId}> × <@${r.userBId}> — **${r.points}** (${tierForPoints(r.points).labelEn})`);

      await interaction.reply({
        embeds: [baseEmbed({ tone: "primary", title: "Server Affinity Leaderboard", description: lines.join("\n") })],
      });
    }
  },
};
