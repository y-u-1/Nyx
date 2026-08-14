import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed, } from "../utils/embeds.js";
import { parseDuration } from "../utils/duration.js";
import { buildGiveawayContainer, scheduleGiveawayEnd } from "../utils/giveaway.js";

export const giveawayEdit: Command = {
  data: new SlashCommandBuilder()
    .setName("giveaway-edit")
    .setDescription("Edit an active giveaway.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName("message_id").setDescription("Message ID of the giveaway panel").setRequired(true))
    .addStringOption((opt) => opt.setName("prize").setDescription("New prize text"))
    .addIntegerOption((opt) => opt.setName("winners").setDescription("New winner count").setMinValue(1).setMaxValue(20))
    .addStringOption((opt) =>
      opt.setName("add_duration").setDescription("Extend the end time by this much, e.g. 10m, 1h (use negative-like shorter values are not supported)"),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const messageId = interaction.options.getString("message_id", true);
    const prize = interaction.options.getString("prize");
    const winners = interaction.options.getInteger("winners");
    const addDurationInput = interaction.options.getString("add_duration");

    const giveaway = await prisma.giveaway.findUnique({ where: { messageId }, include: { entries: true } });

    if (!giveaway || giveaway.guildId !== interaction.guildId || giveaway.ended || giveaway.cancelled) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "No active giveaway found for that message ID in this server." })],
        ephemeral: true,
      });
      return;
    }

    let endsAt = giveaway.endsAt;
    if (addDurationInput) {
      const addMs = parseDuration(addDurationInput);
      if (!addMs) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: "Invalid duration for `add_duration`. Use a format like `10m`, `2h`, or `1d`." })],
          ephemeral: true,
        });
        return;
      }
      endsAt = new Date(endsAt.getTime() + addMs);
    }

    const updated = await prisma.giveaway.update({
      where: { id: giveaway.id },
      data: {
        prize: prize ?? undefined,
        winnerCount: winners ?? undefined,
        endsAt,
      },
    });

    if (addDurationInput) {
      scheduleGiveawayEnd(interaction.client, updated.id, endsAt);
    }

    try {
      const channel = await interaction.client.channels.fetch(updated.channelId);
      if (channel?.isTextBased()) {
        const message = await channel.messages.fetch(updated.messageId);
        const container = buildGiveawayContainer({
          prize: updated.prize,
          description: updated.description,
          imageUrl: updated.imageUrl,
          thumbnailUrl: updated.thumbnailUrl,
          accentColor: updated.accentColor,
          endColor: updated.endColor,
          endsAt: updated.endsAt,
          winnerCount: updated.winnerCount,
          hostId: updated.hostId,
          entryCount: giveaway.entries.length,
          status: "active",
          giveawayId: updated.id,
          requiredRoleId: updated.requiredRoleId,
          blacklistRoleId: updated.blacklistRoleId,
          bypassRoleId: updated.bypassRoleId,
          bonusRoleId: updated.bonusRoleId,
          bonusEntries: updated.bonusEntries,
          minAccountAgeDays: updated.minAccountAgeDays,
          minLevel: updated.minLevel,
          winnersRoleId: updated.winnersRoleId,
          coinPrize: updated.coinPrize,
        });
        await message.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
    } catch (error) {
      console.error(`[Nyx.] Failed to update panel for edited giveaway ${updated.id}`, error);
    }

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: "Giveaway updated." })],
      ephemeral: true,
    });
  },
};
