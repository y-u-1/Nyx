import { PermissionFlagsBits, SlashCommandBuilder, type Attachment, type ChatInputCommandInteraction, type Role } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { parseDuration } from "../utils/duration.js";
import { sendLog } from "../utils/logging.js";

export const redeemCreate: Command = {
  data: new SlashCommandBuilder()
    .setName("redeem-create")
    .setDescription("Create a redeem code.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName("code").setDescription("The code members will redeem").setRequired(true))
    .addRoleOption((opt) => opt.setName("role").setDescription("Role to grant on redemption"))
    .addAttachmentOption((opt) => opt.setName("image").setDescription("Image to DM the redeemer"))
    .addIntegerOption((opt) => opt.setName("max_uses").setDescription("Maximum number of redemptions (default 1)").setMinValue(1).setMaxValue(100_000))
    .addStringOption((opt) => opt.setName("expires_in").setDescription("Expires after, e.g. 1d, 7d (default: never)")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const code = interaction.options.getString("code", true);
    const role = interaction.options.getRole("role") as Role | null;
    const image = interaction.options.getAttachment("image") as Attachment | null;
    const maxUses = interaction.options.getInteger("max_uses") ?? 1;
    const expiresInInput = interaction.options.getString("expires_in");

    if (image && !image.contentType?.startsWith("image/")) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "The attached file must be an image." })],
        ephemeral: true,
      });
      return;
    }

    let expiresAt: Date | undefined;
    if (expiresInInput) {
      const ms = parseDuration(expiresInInput);
      if (!ms) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: "Invalid `expires_in`. Use a format like `1d` or `7d`." })],
          ephemeral: true,
        });
        return;
      }
      expiresAt = new Date(Date.now() + ms);
    }

    const existing = await prisma.redeemCode.findUnique({ where: { guildId_code: { guildId: interaction.guildId, code } } });
    if (existing) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "That code already exists." })],
        ephemeral: true,
      });
      return;
    }

    await prisma.redeemCode.create({
      data: {
        guildId: interaction.guildId,
        code,
        roleId: role?.id,
        imageUrl: image?.url,
        maxUses,
        expiresAt,
      },
    });

    await sendLog(
      interaction.client,
      interaction.guildId,
      "redeem",
      "Redeem Code Created",
      `**Code:** \`${code}\`\n**Created by:** <@${interaction.user.id}>\n**Max uses:** \`${maxUses}\`${role ? `\n**Role:** <@&${role.id}>` : ""}`,
      "primary",
    );

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: `Created redeem code \`${code}\` (max uses: ${maxUses}).` })],
      ephemeral: true,
    });
  },
};
