import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type TextChannel } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const levelConfig: Command = {
  data: new SlashCommandBuilder()
    .setName("level-config")
    .setDescription("Configure the leveling system for this server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addBooleanOption((opt) => opt.setName("enabled").setDescription("Enable or disable leveling entirely"))
    .addIntegerOption((opt) => opt.setName("cooldown_seconds").setDescription("Seconds between XP-earning messages (0 = no cooldown)").setMinValue(0).setMaxValue(3600))
    .addIntegerOption((opt) => opt.setName("xp_min").setDescription("Minimum XP per message").setMinValue(1))
    .addIntegerOption((opt) => opt.setName("xp_max").setDescription("Maximum XP per message").setMinValue(1))
    .addBooleanOption((opt) => opt.setName("voice_xp_enabled").setDescription("Enable XP for being in voice channels"))
    .addIntegerOption((opt) => opt.setName("voice_xp_amount").setDescription("XP awarded per interval in voice").setMinValue(1))
    .addIntegerOption((opt) => opt.setName("voice_xp_interval_minutes").setDescription("Minutes between voice XP awards").setMinValue(1).setMaxValue(60))
    .addBooleanOption((opt) => opt.setName("voice_xp_ignore_afk").setDescription("Skip muted/deafened members for voice XP"))
    .addIntegerOption((opt) => opt.setName("voice_xp_min_members").setDescription("Minimum humans in a voice channel to earn XP").setMinValue(1))
    .addStringOption((opt) =>
      opt
        .setName("level_up_notify")
        .setDescription("How to announce level-ups")
        .addChoices({ name: "channel", value: "channel" }, { name: "dm", value: "dm" }, { name: "off", value: "off" }),
    )
    .addChannelOption((opt) =>
      opt.setName("level_up_channel").setDescription("Fixed channel for level-up announcements (default: message channel)").addChannelTypes(ChannelType.GuildText),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const enabled = interaction.options.getBoolean("enabled");
    const cooldownSeconds = interaction.options.getInteger("cooldown_seconds");
    const xpMin = interaction.options.getInteger("xp_min");
    const xpMax = interaction.options.getInteger("xp_max");
    const voiceXpEnabled = interaction.options.getBoolean("voice_xp_enabled");
    const voiceXpAmount = interaction.options.getInteger("voice_xp_amount");
    const voiceXpIntervalMinutes = interaction.options.getInteger("voice_xp_interval_minutes");
    const voiceXpIgnoreAfk = interaction.options.getBoolean("voice_xp_ignore_afk");
    const voiceXpMinMembers = interaction.options.getInteger("voice_xp_min_members");
    const levelUpNotify = interaction.options.getString("level_up_notify");
    const levelUpChannel = interaction.options.getChannel("level_up_channel") as TextChannel | null;

    if (xpMin !== null && xpMax !== null && xpMin > xpMax) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "`xp_min` cannot be greater than `xp_max`." })],
        ephemeral: true,
      });
      return;
    }

    await prisma.guildSettings.upsert({
      where: { guildId: interaction.guildId },
      create: {
        guildId: interaction.guildId,
        levelingEnabled: enabled ?? undefined,
        xpCooldownSeconds: cooldownSeconds ?? undefined,
        xpMin: xpMin ?? undefined,
        xpMax: xpMax ?? undefined,
        voiceXpEnabled: voiceXpEnabled ?? undefined,
        voiceXpAmount: voiceXpAmount ?? undefined,
        voiceXpIntervalMinutes: voiceXpIntervalMinutes ?? undefined,
        voiceXpIgnoreAfk: voiceXpIgnoreAfk ?? undefined,
        voiceXpMinMembers: voiceXpMinMembers ?? undefined,
        levelUpNotify: levelUpNotify ?? undefined,
        levelUpChannelId: levelUpChannel?.id,
      },
      update: {
        levelingEnabled: enabled ?? undefined,
        xpCooldownSeconds: cooldownSeconds ?? undefined,
        xpMin: xpMin ?? undefined,
        xpMax: xpMax ?? undefined,
        voiceXpEnabled: voiceXpEnabled ?? undefined,
        voiceXpAmount: voiceXpAmount ?? undefined,
        voiceXpIntervalMinutes: voiceXpIntervalMinutes ?? undefined,
        voiceXpIgnoreAfk: voiceXpIgnoreAfk ?? undefined,
        voiceXpMinMembers: voiceXpMinMembers ?? undefined,
        levelUpNotify: levelUpNotify ?? undefined,
        levelUpChannelId: levelUpChannel ? levelUpChannel.id : undefined,
      },
    });

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: "Leveling settings updated." })],
      ephemeral: true,
    });
  },
};
