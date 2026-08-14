import { SlashCommandBuilder, type ChatInputCommandInteraction, type GuildMember, type User } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { calculateLevel } from "../utils/leveling.js";

export const profile: Command = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Show a member's profile.")
    .addUserOption((opt) => opt.setName("user").setDescription("Member to check (default: you)")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId || !interaction.guild) return;

    const target = (interaction.options.getUser("user") as User | null) ?? interaction.user;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null) as GuildMember | null;

    const userLevel = await prisma.userLevel.findUnique({
      where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } },
    });

    const badges = await prisma.userBadge.findMany({
      where: { guildId: interaction.guildId, userId: target.id },
      include: { badge: true },
    });

    const { level } = userLevel ? calculateLevel(Number(userLevel.xp)) : { level: 0 };
    const joinedUnix = member?.joinedTimestamp ? Math.floor(member.joinedTimestamp / 1000) : null;

    const lines = [
      `**Level:** \`${level}\``,
      `**Coins:** \`${(userLevel?.coins ?? 0n).toString()}\``,
      joinedUnix ? `**Joined:** <t:${joinedUnix}:D>` : null,
      member ? `**Roles:** ${member.roles.cache.filter((r) => r.id !== interaction.guildId).map((r) => `<@&${r.id}>`).join(", ") || "None"}` : null,
      `**Badges:** ${badges.length > 0 ? badges.map((b) => b.badge.emoji ?? b.badge.name).join(" ") : "None"}`,
    ].filter(Boolean);

    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", title: target.username, description: lines.join("\n") })],
    });
  },
};
