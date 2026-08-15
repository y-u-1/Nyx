import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { NyxClient } from "../client.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

// カテゴリ分け(コマンド名の接頭辞や既知のグルーピングで判定)
function categorize(name: string): string {
  if (name.startsWith("giveaway")) return "Giveaway";
  if (name.startsWith("level") || ["rank", "leaderboard", "xp"].includes(name)) return "Leveling";
  if (["balance", "daily", "pay", "shop", "coin", "inventory"].includes(name)) return "Economy";
  if (name.startsWith("automod") || name.startsWith("earthquake") || name.startsWith("logs")) return "AutoMod & Logs";
  if (["warn", "warnings", "kick", "ban", "unban", "softban", "timeout", "purge", "lock", "unlock", "slowmode", "modlog", "clear-warnings"].includes(name))
    return "Moderation";
  if (name.startsWith("redeem")) return "Redeem";
  if (name.startsWith("ticket")) return "Tickets";
  if (name.startsWith("reaction-role") || name.startsWith("role-panel")) return "Roles";
  if (["play", "skip", "stop", "pause", "resume", "queue", "volume", "loop", "nowplaying", "shuffle"].includes(name)) return "Music";
  if (["profile", "badge", "avatar", "banner", "userinfo", "roles", "serverinfo", "vouch", "reputation"].includes(name)) return "Profile & Info";
  if (["poll", "poll-close", "rules", "announce", "partner"].includes(name)) return "Community";
  if (name.startsWith("apply")) return "Applications";
  if (["config", "welcome-config", "verify-panel"].includes(name)) return "Configuration";
  return "Other";
}

export const help: Command = {
  data: new SlashCommandBuilder().setName("help").setDescription("List all available commands."),

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as NyxClient;

    const grouped = new Map<string, string[]>();
    for (const command of client.commands.values()) {
      const category = categorize(command.data.name);
      const list = grouped.get(category) ?? [];
      list.push(`\`/${command.data.name}\``);
      grouped.set(category, list);
    }

    const categoryOrder = [
      "Moderation",
      "AutoMod & Logs",
      "Leveling",
      "Economy",
      "Giveaway",
      "Tickets",
      "Roles",
      "Music",
      "Redeem",
      "Community",
      "Applications",
      "Profile & Info",
      "Configuration",
      "Other",
    ];

    const lines = categoryOrder
      .filter((cat) => grouped.has(cat))
      .map((cat) => `**${cat}**\n${grouped.get(cat)!.join(" ")}`);

    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", title: "Nyx. Commands", description: lines.join("\n\n") })],
      ephemeral: true,
    });
  },
};
