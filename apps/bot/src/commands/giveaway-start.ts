import {
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextDisplayBuilder,
  type Attachment,
  type ChatInputCommandInteraction,
  type Role,
  type TextChannel,
  type User,
} from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { parseDuration } from "../utils/duration.js";
import { buildGiveawayContainer, scheduleGiveawayEnd } from "../utils/giveaway.js";

const HEX_COLOR_PATTERN = /^#?[0-9a-fA-F]{6}$/;

export const giveawayStart: Command = {
  data: new SlashCommandBuilder()
    .setName("giveaway-start")
    .setDescription("Start a giveaway in this channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName("prize").setDescription("What are you giving away?").setRequired(true))
    .addStringOption((opt) =>
      opt.setName("duration").setDescription("How long the giveaway runs, e.g. 10m, 2h, 1d").setRequired(true),
    )
    .addIntegerOption((opt) =>
      opt.setName("winners").setDescription("Number of winners (default 1)").setMinValue(1).setMaxValue(20),
    )
    .addChannelOption((opt) =>
      opt.setName("channel").setDescription("Channel to post in (default: this channel)").addChannelTypes(ChannelType.GuildText),
    )
    .addUserOption((opt) => opt.setName("host").setDescription("Credit a different host (default: you)"))
    .addStringOption((opt) => opt.setName("description").setDescription("Extra details or rules to show on the panel"))
    .addAttachmentOption((opt) => opt.setName("image").setDescription("Large image to display on the panel"))
    .addAttachmentOption((opt) => opt.setName("thumbnail").setDescription("Small thumbnail image next to the title"))
    .addStringOption((opt) => opt.setName("color").setDescription("Panel accent color while active, e.g. #5865F2"))
    .addStringOption((opt) => opt.setName("end_color").setDescription("Panel accent color once ended, e.g. #57F287"))
    .addStringOption((opt) => opt.setName("create_message").setDescription("Extra message sent alongside the panel when it's posted"))
    .addStringOption((opt) =>
      opt.setName("winners_dm_message").setDescription("Custom DM text for winners. Use {prize} to insert the prize name"),
    )
    .addBooleanOption((opt) => opt.setName("dm_winners").setDescription("Also DM the winner(s) when the giveaway ends"))
    .addRoleOption((opt) => opt.setName("winners_role").setDescription("Role to automatically give to the winner(s)"))
    .addIntegerOption((opt) => opt.setName("coin_prize").setDescription("Coins to award each winner (economy system)").setMinValue(1).setMaxValue(1_000_000_000))
    .addRoleOption((opt) => opt.setName("ping_role").setDescription("Role to mention when the giveaway starts and ends"))
    .addRoleOption((opt) => opt.setName("required_role").setDescription("Only members with this role can enter"))
    .addRoleOption((opt) => opt.setName("blacklist_role").setDescription("Members with this role cannot enter"))
    .addRoleOption((opt) => opt.setName("bypass_role").setDescription("Members with this role skip all entry requirements"))
    .addRoleOption((opt) => opt.setName("bonus_role").setDescription("Members with this role get better odds"))
    .addIntegerOption((opt) =>
      opt
        .setName("bonus_entries")
        .setDescription("How many entries bonus_role members get (default 2)")
        .setMinValue(2)
        .setMaxValue(10),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("min_account_age")
        .setDescription("Minimum Discord account age in days to enter (anti-alt protection)")
        .setMinValue(1)
        .setMaxValue(365),
    )
    .addIntegerOption((opt) =>
      opt.setName("min_level").setDescription("Minimum Nyx. level required to enter").setMinValue(1).setMaxValue(1000),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const prize = interaction.options.getString("prize", true);
    const durationInput = interaction.options.getString("duration", true);
    const winnerCount = interaction.options.getInteger("winners") ?? 1;
    const targetChannel = (interaction.options.getChannel("channel") as TextChannel | null) ?? (interaction.channel as TextChannel);
    const host = interaction.options.getUser("host") as User | null;
    const description = interaction.options.getString("description");
    const image = interaction.options.getAttachment("image") as Attachment | null;
    const thumbnail = interaction.options.getAttachment("thumbnail") as Attachment | null;
    const colorInput = interaction.options.getString("color");
    const endColorInput = interaction.options.getString("end_color");
    const createMessage = interaction.options.getString("create_message");
    const winnersDmMessage = interaction.options.getString("winners_dm_message");
    const dmWinners = interaction.options.getBoolean("dm_winners") ?? false;
    const winnersRole = interaction.options.getRole("winners_role") as Role | null;
    const coinPrize = interaction.options.getInteger("coin_prize");
    const pingRole = interaction.options.getRole("ping_role") as Role | null;
    const requiredRole = interaction.options.getRole("required_role") as Role | null;
    const blacklistRole = interaction.options.getRole("blacklist_role") as Role | null;
    const bypassRole = interaction.options.getRole("bypass_role") as Role | null;
    const bonusRole = interaction.options.getRole("bonus_role") as Role | null;
    const bonusEntries = interaction.options.getInteger("bonus_entries") ?? 2;
    const minAccountAgeDays = interaction.options.getInteger("min_account_age");
    const minLevel = interaction.options.getInteger("min_level");

    const durationMs = parseDuration(durationInput);
    if (!durationMs) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "Invalid duration. Use a format like `10m`, `2h`, or `1d`." })],
        ephemeral: true,
      });
      return;
    }

    for (const [label, attachment] of [
      ["image", image],
      ["thumbnail", thumbnail],
    ] as const) {
      if (attachment && !attachment.contentType?.startsWith("image/")) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: `The \`${label}\` attachment must be an image.` })],
          ephemeral: true,
        });
        return;
      }
    }

    for (const [label, value] of [
      ["color", colorInput],
      ["end_color", endColorInput],
    ] as const) {
      if (value && !HEX_COLOR_PATTERN.test(value)) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: `Invalid \`${label}\`. Use a hex code like \`#5865F2\`.` })],
          ephemeral: true,
        });
        return;
      }
    }

    const endsAt = new Date(Date.now() + durationMs);
    const hostId = host?.id ?? interaction.user.id;

    // 繝｡繝・そ繝ｼ繧ｸID縺檎｢ｺ螳壹☆繧句燕縺ｫDB繝ｬ繧ｳ繝ｼ繝峨ｒ菴懊ｋ蠢・ｦ√′縺ゅｋ縺溘ａ縲∽ｸ譎ら噪縺ｪmessageId縺ｧ菴懈・縺怜ｾ後°繧画峩譁ｰ縺吶ｋ縲・
    const giveaway = await prisma.giveaway.create({
      data: {
        guildId: interaction.guildId,
        channelId: targetChannel.id,
        messageId: `pending-${interaction.id}`,
        prize,
        description,
        imageUrl: image?.url,
        thumbnailUrl: thumbnail?.url,
        accentColor: colorInput,
        endColor: endColorInput,
        createMessage,
        winnersDmMessage,
        dmWinners,
        winnersRoleId: winnersRole?.id,
        coinPrize,
        winnerCount,
        hostId,
        endsAt,
        requiredRoleId: requiredRole?.id,
        blacklistRoleId: blacklistRole?.id,
        bypassRoleId: bypassRole?.id,
        bonusRoleId: bonusRole?.id,
        bonusEntries,
        pingRoleId: pingRole?.id,
        minAccountAgeDays,
        minLevel,
      },
    });

    const container = buildGiveawayContainer({
      prize,
      description,
      imageUrl: image?.url,
      thumbnailUrl: thumbnail?.url,
      accentColor: colorInput,
      endColor: endColorInput,
      endsAt,
      winnerCount,
      hostId,
      entryCount: 0,
      status: "active",
      giveawayId: giveaway.id,
      requiredRoleId: requiredRole?.id,
      blacklistRoleId: blacklistRole?.id,
      bypassRoleId: bypassRole?.id,
      bonusRoleId: bonusRole?.id,
      bonusEntries,
      minAccountAgeDays,
      minLevel,
      winnersRoleId: winnersRole?.id,
      coinPrize,
    });

    const contentParts = [pingRole ? `${pingRole}` : null, createMessage].filter(Boolean) as string[];
    const extraDisplay = contentParts.length > 0 ? new TextDisplayBuilder().setContent(contentParts.join("\n")) : null;

    const message = await targetChannel.send({
      components: extraDisplay ? [extraDisplay, container] : [container],
      flags: MessageFlags.IsComponentsV2,
    });

    await prisma.giveaway.update({ where: { id: giveaway.id }, data: { messageId: message.id } });

    scheduleGiveawayEnd(interaction.client, giveaway.id, endsAt);

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: `Giveaway posted in ${targetChannel}.` })],
      ephemeral: true,
    });
  },
};
