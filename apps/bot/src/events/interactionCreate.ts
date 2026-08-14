import { MessageFlags, type ButtonInteraction, type Interaction, type ModalSubmitInteraction } from "discord.js";
import { prisma } from "@nyx/database";
import type { NyxClient } from "../client.js";
import { baseEmbed, buildPanel } from "../utils/embeds.js";
import { sendLog } from "../utils/logging.js";

const VERIFY_SITE_URL = process.env.VERIFY_SITE_URL ?? "https://verify.example.com";

/**
 * "Verify my account" ボタン押下時の処理。
 * 個別の認証リンクをephemeralで返す(Linkボタンは全ユーザー共通URLしか持てないため、
 * ここでBotが一度受け取ってユーザー/サーバー固有のURLを組み立てる二段構成にしている)。
 *
 * 実運用では guildId/userId をそのままクエリに載せるだけでなく、署名付きトークン化するなど
 * 改ざん防止の仕組みを追加する想定。
 */
async function handleVerifyStart(interaction: ButtonInteraction) {
  if (!interaction.guildId) return;

  const url = `${VERIFY_SITE_URL}/start?guild=${interaction.guildId}&user=${interaction.user.id}`;

  const container = buildPanel({
    title: "Verification Link",
    intro: "Click the button below to open your personal verification page.",
    button: { label: "Open verification page", url },
  });

  await interaction.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  });
}

/**
 * "Enter Giveaway" ボタン押下時の処理。
 * 重複エントリーはunique制約([giveawayId, userId])違反(Prisma P2002)で検出し、ephemeralで案内する。
 * 成功時はパネル本体のEntries数も更新する。
 */
async function handleGiveawayEnter(interaction: ButtonInteraction, giveawayId: string) {
  const giveaway = await prisma.giveaway.findUnique({ where: { id: giveawayId }, include: { entries: true } });

  if (!giveaway || giveaway.ended || giveaway.cancelled) {
    await interaction.reply({
      embeds: [baseEmbed({ tone: "error", description: "This giveaway is no longer active." })],
      ephemeral: true,
    });
    return;
  }

  const member = interaction.member;
  const roleCache = member && !Array.isArray(member.roles) ? member.roles.cache : null;

  const hasBypass = Boolean(giveaway.bypassRoleId && roleCache?.has(giveaway.bypassRoleId));

  if (!hasBypass) {
    if (giveaway.blacklistRoleId && roleCache?.has(giveaway.blacklistRoleId)) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "You're not eligible to enter this giveaway." })],
        ephemeral: true,
      });
      return;
    }

    if (giveaway.requiredRoleId && !roleCache?.has(giveaway.requiredRoleId)) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: `You need the <@&${giveaway.requiredRoleId}> role to enter this giveaway.` })],
        ephemeral: true,
      });
      return;
    }

    if (giveaway.minAccountAgeDays) {
      const accountAgeDays = (Date.now() - interaction.user.createdTimestamp) / (1000 * 60 * 60 * 24);
      if (accountAgeDays < giveaway.minAccountAgeDays) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: `Your Discord account must be at least ${giveaway.minAccountAgeDays} days old to enter this giveaway.` })],
          ephemeral: true,
        });
        return;
      }
    }

    if (giveaway.minLevel && interaction.guildId) {
      const userLevel = await prisma.userLevel.findUnique({
        where: { guildId_userId: { guildId: interaction.guildId, userId: interaction.user.id } },
        select: { level: true },
      });
      const currentLevel = userLevel?.level ?? 0;
      if (currentLevel < giveaway.minLevel) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: `You need to be at least level ${giveaway.minLevel} to enter this giveaway. (Currently: ${currentLevel})` })],
          ephemeral: true,
        });
        return;
      }
    }
  }

  const weight = giveaway.bonusRoleId && roleCache?.has(giveaway.bonusRoleId) ? giveaway.bonusEntries : 1;

  try {
    await prisma.giveawayEntry.create({ data: { giveawayId, userId: interaction.user.id, weight } });
  } catch (error: any) {
    if (error?.code === "P2002") {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "warning", description: "You've already entered this giveaway." })],
        ephemeral: true,
      });
      return;
    }
    throw error;
  }

  await interaction.reply({
    embeds: [baseEmbed({ tone: "success", description: `You're entered for **${giveaway.prize}**. Good luck!` })],
    ephemeral: true,
  });

  // パネル本体のEntries数を更新(buildGiveawayContainerはgiveaway.tsに定義。循環import回避のため動的import)
  const { buildGiveawayContainer } = await import("../utils/giveaway.js");
  const container = buildGiveawayContainer({
    prize: giveaway.prize,
    description: giveaway.description,
    imageUrl: giveaway.imageUrl,
    thumbnailUrl: giveaway.thumbnailUrl,
    accentColor: giveaway.accentColor,
    endColor: giveaway.endColor,
    endsAt: giveaway.endsAt,
    winnerCount: giveaway.winnerCount,
    hostId: giveaway.hostId,
    entryCount: giveaway.entries.length + 1,
    status: "active",
    giveawayId,
    requiredRoleId: giveaway.requiredRoleId,
    blacklistRoleId: giveaway.blacklistRoleId,
    bypassRoleId: giveaway.bypassRoleId,
    bonusRoleId: giveaway.bonusRoleId,
    bonusEntries: giveaway.bonusEntries,
    minAccountAgeDays: giveaway.minAccountAgeDays,
    minLevel: giveaway.minLevel,
    winnersRoleId: giveaway.winnersRoleId,
    coinPrize: giveaway.coinPrize,
  });

  await interaction.message.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

/**
 * "Open Ticket" ボタン押下時の処理。
 * 既に開いているチケットがあれば案内し、なければ新規チャンネルを作成する。
 */
async function handleTicketOpen(interaction: ButtonInteraction) {
  if (!interaction.guild) return;

  await interaction.deferReply({ ephemeral: true });

  const { createTicketChannel } = await import("../utils/ticket.js");
  const result = await createTicketChannel(interaction.guild, interaction.user.id);

  if ("error" in result) {
    await interaction.editReply({ embeds: [baseEmbed({ tone: "error", description: result.error })] });
    return;
  }

  await interaction.editReply({
    embeds: [baseEmbed({ tone: "success", description: `Your ticket has been created: ${result.channel}` })],
  });
}

/** "Claim" ボタン押下時の処理。スタッフロールのメンバーのみクレーム可能。 */
async function handleTicketClaim(interaction: ButtonInteraction, ticketNumber: string) {
  if (!interaction.guildId || !interaction.channelId) return;

  const settings = await prisma.ticketSettings.findUnique({ where: { guildId: interaction.guildId } });
  const member = interaction.member;
  const roleCache = member && !Array.isArray(member.roles) ? member.roles.cache : null;

  if (settings?.staffRoleId && !roleCache?.has(settings.staffRoleId)) {
    await interaction.reply({
      embeds: [baseEmbed({ tone: "error", description: "Only staff can claim this ticket." })],
      ephemeral: true,
    });
    return;
  }

  const ticket = await prisma.ticket.update({
    where: { channelId: interaction.channelId },
    data: { claimedById: interaction.user.id, status: "claimed" },
  });

  await sendLog(interaction.client, interaction.guildId, "ticket", "Ticket Claimed", `**Ticket:** #${ticketNumber.padStart(4, "0")}\n**Claimed by:** <@${interaction.user.id}>`, "warning");

  const { buildTicketChannelPanel } = await import("../utils/ticket.js");
  const { container, row } = buildTicketChannelPanel({
    ticketNumber: Number(ticketNumber),
    openerId: ticket.openerId,
    claimedById: ticket.claimedById,
    status: "open",
  });

  await interaction.update({ components: row ? [container, row] : [container] });
}

/** "Close" ボタン押下時の処理。ステータス更新後、少し待ってチャンネルを削除する。 */
async function handleTicketClose(interaction: ButtonInteraction, ticketNumber: string) {
  if (!interaction.channelId || !interaction.guildId) return;

  await prisma.ticket.update({
    where: { channelId: interaction.channelId },
    data: { status: "closed", closedAt: new Date() },
  });

  await sendLog(interaction.client, interaction.guildId, "ticket", "Ticket Closed", `**Ticket:** #${ticketNumber.padStart(4, "0")}\n**Closed by:** <@${interaction.user.id}>`, "error");

  await interaction.reply({
    embeds: [baseEmbed({ tone: "warning", description: "This ticket will be closed in a few seconds." })],
  });

  setTimeout(async () => {
    try {
      if (interaction.channel && "delete" in interaction.channel) {
        await interaction.channel.delete();
      }
    } catch (error) {
      console.error(`[Nyx.] Failed to delete ticket channel ${interaction.channelId}`, error);
    }
  }, 5000);
}

/** "ロールパネル" のボタン押下時の処理。既にロールを持っていれば剥奪、なければ付与する(トグル式)。 */
async function handleRolePanelToggle(interaction: ButtonInteraction, panelRoleId: string) {
  if (!interaction.guild) return;

  const panelRole = await prisma.rolePanelRole.findUnique({ where: { id: panelRoleId } });
  if (!panelRole) {
    await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "This button is no longer valid." })], ephemeral: true });
    return;
  }

  const member = await interaction.guild.members.fetch(interaction.user.id);
  const hasRole = member.roles.cache.has(panelRole.roleId);

  try {
    if (hasRole) {
      await member.roles.remove(panelRole.roleId);
      await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Removed <@&${panelRole.roleId}>.` })], ephemeral: true });
    } else {
      await member.roles.add(panelRole.roleId);
      await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Added <@&${panelRole.roleId}>.` })], ephemeral: true });
    }
  } catch (error) {
    console.error("[Nyx.] Failed to toggle role panel role", error);
    await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "I couldn't update your roles (check my role position)." })], ephemeral: true });
  }
}

/** 投票ボタン押下時の処理。既に投票済みなら選択肢を変更、未投票なら新規登録する。 */
async function handlePollVote(interaction: ButtonInteraction, pollId: string, optionIndex: number) {
  const pollRecord = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!pollRecord || pollRecord.closed) {
    await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "This poll is closed." })], ephemeral: true });
    return;
  }

  await prisma.pollVote.upsert({
    where: { pollId_userId: { pollId, userId: interaction.user.id } },
    create: { pollId, userId: interaction.user.id, optionIndex },
    update: { optionIndex },
  });

  await interaction.reply({
    embeds: [baseEmbed({ tone: "success", description: `Your vote for **${pollRecord.options[optionIndex]}** has been recorded.` })],
    ephemeral: true,
  });

  const { refreshPollMessage } = await import("../utils/poll.js");
  await refreshPollMessage(interaction.client, pollId);
}

/** 申請フォーム(Modal)送信時の処理。回答をレビューチャンネルに投稿する。 */
async function handleApplySubmit(interaction: ModalSubmitInteraction) {
  const applicationTypeId = interaction.customId.replace("apply:submit:", "");
  const applicationType = await prisma.applicationType.findUnique({ where: { id: applicationTypeId } });

  if (!applicationType) {
    await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "This application is no longer available." })], ephemeral: true });
    return;
  }

  const answers = applicationType.questions.map((_, i) => interaction.fields.getTextInputValue(`q${i}`));

  await prisma.applicationSubmission.create({
    data: { applicationTypeId: applicationType.id, userId: interaction.user.id, answers },
  });

  const qaLines = applicationType.questions.map((q, i) => `**${q}**\n${answers[i]}`).join("\n\n");

  try {
    const channel = await interaction.client.channels.fetch(applicationType.reviewChannelId);
    if (channel && !channel.isDMBased() && channel.isTextBased()) {
      await channel.send({
        embeds: [baseEmbed({ tone: "primary", title: `${applicationType.name} — <@${interaction.user.id}>`, description: qaLines })],
      });
    }
  } catch (error) {
    console.error("[Nyx.] Failed to post application submission", error);
  }

  await interaction.reply({
    embeds: [baseEmbed({ tone: "success", description: "Your application has been submitted." })],
    ephemeral: true,
  });
}

async function handleButton(interaction: ButtonInteraction) {
  if (interaction.customId === "verify:start") {
    await handleVerifyStart(interaction);
    return;
  }

  if (interaction.customId.startsWith("giveaway:enter:")) {
    const giveawayId = interaction.customId.replace("giveaway:enter:", "");
    await handleGiveawayEnter(interaction, giveawayId);
    return;
  }

  if (interaction.customId.startsWith("rolepanel:toggle:")) {
    await handleRolePanelToggle(interaction, interaction.customId.replace("rolepanel:toggle:", ""));
    return;
  }

  if (interaction.customId.startsWith("poll:vote:")) {
    const [, , pollId, optionIndex] = interaction.customId.split(":");
    await handlePollVote(interaction, pollId, Number(optionIndex));
    return;
  }

  if (interaction.customId === "ticket:open") {
    await handleTicketOpen(interaction);
    return;
  }

  if (interaction.customId.startsWith("ticket:claim:")) {
    await handleTicketClaim(interaction, interaction.customId.replace("ticket:claim:", ""));
    return;
  }

  if (interaction.customId.startsWith("ticket:close:")) {
    await handleTicketClose(interaction, interaction.customId.replace("ticket:close:", ""));
    return;
  }
}

export function registerInteractionCreateEvent(client: NyxClient) {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isButton()) {
      try {
        await handleButton(interaction);
      } catch (error) {
        console.error("[Nyx.] Error handling button interaction", error);
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      try {
        if (interaction.customId.startsWith("apply:submit:")) {
          await handleApplySubmit(interaction);
        }
      } catch (error) {
        console.error("[Nyx.] Error handling modal submit", error);
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`[Nyx.] Error executing /${interaction.commandName}`, error);

      const errorEmbed = baseEmbed({ tone: "error", description: "An unexpected error occurred." });

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  });
}
