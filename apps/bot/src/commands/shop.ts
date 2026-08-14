import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type Role } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const shop: Command = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Browse and buy items from the server shop.")
    .addSubcommand((sub) => sub.setName("list").setDescription("List items available in the shop"))
    .addSubcommand((sub) =>
      sub.setName("buy").setDescription("Buy an item").addStringOption((opt) => opt.setName("name").setDescription("Item name").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add an item to the shop (admin)")
        .addStringOption((opt) => opt.setName("name").setDescription("Item name").setRequired(true))
        .addIntegerOption((opt) => opt.setName("price").setDescription("Price in coins").setRequired(true).setMinValue(1))
        .addRoleOption((opt) => opt.setName("role").setDescription("Role granted on purchase").setRequired(true))
        .addStringOption((opt) => opt.setName("description").setDescription("Short description")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove an item from the shop (admin)")
        .addStringOption((opt) => opt.setName("name").setDescription("Item name").setRequired(true)),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add" || subcommand === "remove") {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: "You need the Manage Server permission to do that." })],
          ephemeral: true,
        });
        return;
      }
    }

    if (subcommand === "add") {
      const name = interaction.options.getString("name", true);
      const price = interaction.options.getInteger("price", true);
      const role = interaction.options.getRole("role", true) as Role;
      const description = interaction.options.getString("description");

      await prisma.shopItem.upsert({
        where: { guildId_name: { guildId: interaction.guildId, name } },
        create: { guildId: interaction.guildId, name, price, roleId: role.id, description },
        update: { price, roleId: role.id, description },
      });

      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `Added **${name}** to the shop for \`${price}\` coins.` })],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "remove") {
      const name = interaction.options.getString("name", true);
      await prisma.shopItem.delete({ where: { guildId_name: { guildId: interaction.guildId, name } } }).catch(() => null);

      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `Removed **${name}** from the shop.` })],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "buy") {
      const name = interaction.options.getString("name", true);
      const item = await prisma.shopItem.findUnique({ where: { guildId_name: { guildId: interaction.guildId, name } } });

      if (!item) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: "That item doesn't exist." })],
          ephemeral: true,
        });
        return;
      }

      const member = interaction.member;
      const roleCache = member && !Array.isArray(member.roles) ? member.roles.cache : null;
      if (roleCache?.has(item.roleId)) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "warning", description: "You already own this item." })],
          ephemeral: true,
        });
        return;
      }

      const balance = await prisma.userLevel.findUnique({
        where: { guildId_userId: { guildId: interaction.guildId, userId: interaction.user.id } },
        select: { coins: true },
      });

      if (!balance || balance.coins < item.price) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: "You don't have enough coins for that." })],
          ephemeral: true,
        });
        return;
      }

      await prisma.userLevel.update({
        where: { guildId_userId: { guildId: interaction.guildId, userId: interaction.user.id } },
        data: { coins: { decrement: item.price } },
      });

      const guildMember = await interaction.guild!.members.fetch(interaction.user.id);
      await guildMember.roles.add(item.roleId);

      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `You bought **${item.name}**.` })],
      });
      return;
    }

    // list
    const items = await prisma.shopItem.findMany({ where: { guildId: interaction.guildId }, orderBy: { price: "asc" } });
    if (items.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "primary", description: "The shop is empty." })],
      });
      return;
    }

    const settings = await prisma.guildSettings.findUnique({ where: { guildId: interaction.guildId } });
    const currency = settings?.currencyName ?? "coins";

    const lines = items.map((i) => `**${i.name}** — \`${i.price.toString()}\` ${currency}${i.description ? `\n${i.description}` : ""}`);
    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", description: lines.join("\n\n") })],
    });
  },
};
