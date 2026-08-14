import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const coin: Command = {
  data: new SlashCommandBuilder()
    .setName("coin")
    .setDescription("Manually adjust a member's coin balance.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add coins to a member")
        .addUserOption((opt) => opt.setName("user").setDescription("Target member").setRequired(true))
        .addIntegerOption((opt) => opt.setName("amount").setDescription("Amount of coins to add").setRequired(true).setMinValue(1)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove coins from a member")
        .addUserOption((opt) => opt.setName("user").setDescription("Target member").setRequired(true))
        .addIntegerOption((opt) => opt.setName("amount").setDescription("Amount of coins to remove").setRequired(true).setMinValue(1)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set a member's coin balance")
        .addUserOption((opt) => opt.setName("user").setDescription("Target member").setRequired(true))
        .addIntegerOption((opt) => opt.setName("amount").setDescription("New balance").setRequired(true).setMinValue(0)),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getUser("user", true) as User;
    const amount = interaction.options.getInteger("amount", true);

    if (subcommand === "add") {
      await prisma.userLevel.upsert({
        where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } },
        create: { guildId: interaction.guildId, userId: target.id, coins: amount },
        update: { coins: { increment: amount } },
      });

      const settings = await prisma.guildSettings.findUnique({ where: { guildId: interaction.guildId } });
      const currency = settings?.currencyName ?? "coins";

      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `Added \`${amount}\` ${currency} to ${target}.` })],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "remove") {
      const record = await prisma.userLevel.findUnique({ where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } } });
      const newBalance = record ? (record.coins > BigInt(amount) ? record.coins - BigInt(amount) : 0n) : 0n;

      await prisma.userLevel.upsert({
        where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } },
        create: { guildId: interaction.guildId, userId: target.id, coins: newBalance },
        update: { coins: newBalance },
      });

      const settingsR = await prisma.guildSettings.findUnique({ where: { guildId: interaction.guildId } });
      const currencyR = settingsR?.currencyName ?? "coins";

      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `Removed \`${amount}\` ${currencyR} from ${target}. New balance: \`${newBalance.toString()}\`.` })],
        ephemeral: true,
      });
      return;
    }

    // set
    await prisma.userLevel.upsert({
      where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } },
      create: { guildId: interaction.guildId, userId: target.id, coins: amount },
      update: { coins: amount },
    });

    const settingsS = await prisma.guildSettings.findUnique({ where: { guildId: interaction.guildId } });
    const currencyS = settingsS?.currencyName ?? "coins";

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: `Set ${target}'s balance to \`${amount}\` ${currencyS}.` })],
      ephemeral: true,
    });
  },
};
