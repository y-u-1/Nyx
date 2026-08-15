import { SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const inventory: Command = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Show a member's purchased items.")
    .addUserOption((opt) => opt.setName("user").setDescription("Member to check (default: you)")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const target = (interaction.options.getUser("user") as User | null) ?? interaction.user;

    const purchases = await prisma.purchase.findMany({
      where: { guildId: interaction.guildId, userId: target.id },
      orderBy: { purchasedAt: "desc" },
    });

    if (purchases.length === 0) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: `${target} hasn't bought anything yet.` })] });
      return;
    }

    const lines = purchases.map((p) => `**${p.itemName}** — \`${p.price.toString()}\` — <t:${Math.floor(p.purchasedAt.getTime() / 1000)}:d>`);

    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", title: `${target.username}'s Inventory`, description: lines.slice(0, 20).join("\n") })],
    });
  },
};
