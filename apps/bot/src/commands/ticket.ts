import { ChannelType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, type CategoryChannel, type ChatInputCommandInteraction, type Role, type TextChannel } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { buildTicketOpenPanel } from "../utils/ticket.js";

export const ticket: Command = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Set up the ticket system and post the ticket panel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((opt) =>
      opt.setName("category").setDescription("Category to create ticket channels under").setRequired(true).addChannelTypes(ChannelType.GuildCategory),
    )
    .addRoleOption((opt) => opt.setName("staff_role").setDescription("Role that can see and manage tickets").setRequired(true))
    .addChannelOption((opt) =>
      opt.setName("channel").setDescription("Channel to post the ticket panel in (default: this channel)").addChannelTypes(ChannelType.GuildText),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const category = interaction.options.getChannel("category", true) as CategoryChannel;
    const staffRole = interaction.options.getRole("staff_role", true) as Role;
    const targetChannel = (interaction.options.getChannel("channel") as TextChannel | null) ?? (interaction.channel as TextChannel);

    const panel = buildTicketOpenPanel();
    const message = await targetChannel.send({ components: [panel], flags: MessageFlags.IsComponentsV2 });

    await prisma.ticketSettings.upsert({
      where: { guildId: interaction.guildId },
      create: {
        guildId: interaction.guildId,
        categoryId: category.id,
        staffRoleId: staffRole.id,
        panelChannelId: message.channelId,
      },
      update: {
        categoryId: category.id,
        staffRoleId: staffRole.id,
        panelChannelId: message.channelId,
      },
    });

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: `Ticket panel posted in ${targetChannel}.` })],
      ephemeral: true,
    });
  },
};
