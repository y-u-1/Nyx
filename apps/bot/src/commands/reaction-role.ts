import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type Role, type TextChannel } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const reactionRole: Command = {
  data: new SlashCommandBuilder()
    .setName("reaction-role")
    .setDescription("Manage reaction roles on a message.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Attach a reaction role to a message")
        .addStringOption((opt) => opt.setName("message_id").setDescription("Target message ID").setRequired(true))
        .addStringOption((opt) => opt.setName("emoji").setDescription("Emoji to react with").setRequired(true))
        .addRoleOption((opt) => opt.setName("role").setDescription("Role to grant/remove on reaction").setRequired(true))
        .addChannelOption((opt) => opt.setName("channel").setDescription("Channel containing the message (default: this channel)")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove a reaction role from a message")
        .addStringOption((opt) => opt.setName("message_id").setDescription("Target message ID").setRequired(true))
        .addStringOption((opt) => opt.setName("emoji").setDescription("Emoji to remove").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("list")
        .setDescription("List reaction roles on a message")
        .addStringOption((opt) => opt.setName("message_id").setDescription("Target message ID").setRequired(true)),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const subcommand = interaction.options.getSubcommand();
    const messageId = interaction.options.getString("message_id", true);

    if (subcommand === "add") {
      const emoji = interaction.options.getString("emoji", true);
      const role = interaction.options.getRole("role", true) as Role;
      const channel = (interaction.options.getChannel("channel") as TextChannel | null) ?? (interaction.channel as TextChannel);

      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (!message) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: "Couldn't find that message in the specified channel." })],
          ephemeral: true,
        });
        return;
      }

      try {
        await message.react(emoji);
      } catch {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: "Invalid emoji, or I don't have access to it." })],
          ephemeral: true,
        });
        return;
      }

      await prisma.reactionRole.upsert({
        where: { messageId_emoji: { messageId, emoji } },
        create: { guildId: interaction.guildId, messageId, emoji, roleId: role.id },
        update: { roleId: role.id },
      });

      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `Reacting with ${emoji} on that message now grants ${role}.` })],
        ephemeral: true,
      });
      return;
    }

    if (subcommand === "remove") {
      const emoji = interaction.options.getString("emoji", true);

      await prisma.reactionRole.delete({ where: { messageId_emoji: { messageId, emoji } } }).catch(() => null);

      await interaction.reply({
        embeds: [baseEmbed({ tone: "success", description: `Removed the reaction role for ${emoji}.` })],
        ephemeral: true,
      });
      return;
    }

    // list
    const mappings = await prisma.reactionRole.findMany({ where: { guildId: interaction.guildId, messageId } });
    if (mappings.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "primary", description: "No reaction roles configured on that message." })],
        ephemeral: true,
      });
      return;
    }

    const lines = mappings.map((m) => `${m.emoji} → <@&${m.roleId}>`);
    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", description: lines.join("\n") })],
      ephemeral: true,
    });
  },
};
