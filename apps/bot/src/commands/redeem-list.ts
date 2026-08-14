import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const redeemList: Command = {
  data: new SlashCommandBuilder()
    .setName("redeem-list")
    .setDescription("List all redeem codes in this server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const codes = await prisma.redeemCode.findMany({ where: { guildId: interaction.guildId }, orderBy: { createdAt: "desc" } });

    if (codes.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "primary", description: "No redeem codes exist yet." })],
        ephemeral: true,
      });
      return;
    }

    const lines = codes.map((c) => {
      const expiry = c.expiresAt ? `expires <t:${Math.floor(c.expiresAt.getTime() / 1000)}:R>` : "no expiry";
      return `\`${c.code}\` — ${c.usedCount}/${c.maxUses} uses — ${expiry}`;
    });

    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", description: lines.join("\n") })],
      ephemeral: true,
    });
  },
};
