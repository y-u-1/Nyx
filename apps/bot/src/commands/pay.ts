import { SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const pay: Command = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Send coins to another member.")
    .addUserOption((opt) => opt.setName("user").setDescription("Member to pay").setRequired(true))
    .addIntegerOption((opt) => opt.setName("amount").setDescription("Amount of coins to send").setRequired(true).setMinValue(1)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const target = interaction.options.getUser("user", true) as User;
    const amount = interaction.options.getInteger("amount", true);

    if (target.id === interaction.user.id) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "You can't pay yourself." })],
        ephemeral: true,
      });
      return;
    }

    const sender = await prisma.userLevel.findUnique({
      where: { guildId_userId: { guildId: interaction.guildId, userId: interaction.user.id } },
      select: { coins: true },
    });

    if (!sender || sender.coins < BigInt(amount)) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "You don't have enough coins." })],
        ephemeral: true,
      });
      return;
    }

    await prisma.$transaction([
      prisma.userLevel.update({
        where: { guildId_userId: { guildId: interaction.guildId, userId: interaction.user.id } },
        data: { coins: { decrement: amount } },
      }),
      prisma.userLevel.upsert({
        where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } },
        create: { guildId: interaction.guildId, userId: target.id, coins: amount },
        update: { coins: { increment: amount } },
      }),
    ]);

    const settings = await prisma.guildSettings.findUnique({ where: { guildId: interaction.guildId } });
    const currency = settings?.currencyName ?? "coins";

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: `Sent \`${amount}\` ${currency} to ${target}.` })],
    });
  },
};
