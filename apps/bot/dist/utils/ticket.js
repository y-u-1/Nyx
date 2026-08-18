import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageFlags, PermissionFlagsBits, TextDisplayBuilder, } from "discord.js";
import { prisma } from "@nyx/database";
import { buildPanel } from "./embeds.js";
import { sendLog } from "./logging.js";
/** サーバー入口に掲示する、認証パネルと同じ最小構成(見出し+説明+ボタン)のチケットパネル */
export function buildTicketOpenPanel() {
    return buildPanel({
        title: "Open a Ticket",
        intro: "Need help or want to get in touch with the staff? Click the button below to open a private ticket.",
        button: { label: "Open Ticket", style: ButtonStyle.Success, customId: "ticket:open" },
        creditLine: "Powered by **Nyx.**",
    });
}
/** 個別のチケットチャンネル内に投稿するパネル(担当・クローズボタン付き) */
export function buildTicketChannelPanel({ ticketNumber, openerId, claimedById, status, }) {
    const number = String(ticketNumber).padStart(4, "0");
    const claimLine = claimedById ? `Claimed by <@${claimedById}>` : "Not yet claimed.";
    const panel = buildPanel({
        title: `Ticket #${number}`,
        intro: `Opened by <@${openerId}>.\n${claimLine}`,
        creditLine: status === "open" ? "Powered by **Nyx.**" : undefined,
    });
    if (status === "closed")
        return { container: panel, row: null };
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Claim").setStyle(ButtonStyle.Primary).setCustomId(`ticket:claim:${ticketNumber}`), new ButtonBuilder().setLabel("Close").setStyle(ButtonStyle.Danger).setCustomId(`ticket:close:${ticketNumber}`));
    return { container: panel, row };
}
/**
 * チケットチャンネルを新規作成する。
 * カテゴリ配下に、開設者とスタッフロールだけが見える非公開チャンネルを作る。
 */
export async function createTicketChannel(guild, openerId) {
    const settings = await prisma.ticketSettings.findUnique({ where: { guildId: guild.id } });
    if (!settings)
        return { error: "Ticket system hasn't been set up yet. Ask an admin to run `/ticket`." };
    const existing = await prisma.ticket.findFirst({ where: { guildId: guild.id, openerId, status: { not: "closed" } } });
    if (existing)
        return { error: `You already have an open ticket: <#${existing.channelId}>` };
    const ticketNumber = (settings.ticketCounter ?? 0) + 1;
    const permissionOverwrites = [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: openerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        { id: guild.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
    ];
    if (settings.staffRoleId) {
        permissionOverwrites.push({
            id: settings.staffRoleId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        });
    }
    const channel = await guild.channels.create({
        name: `ticket-${String(ticketNumber).padStart(4, "0")}`,
        type: ChannelType.GuildText,
        parent: settings.categoryId ?? undefined,
        permissionOverwrites,
    });
    await prisma.ticketSettings.update({ where: { guildId: guild.id }, data: { ticketCounter: ticketNumber } });
    await prisma.ticket.create({ data: { guildId: guild.id, channelId: channel.id, openerId } });
    const { container, row } = buildTicketChannelPanel({ ticketNumber, openerId, status: "open" });
    const mentionText = settings.staffRoleId ? `<@&${settings.staffRoleId}> <@${openerId}>` : `<@${openerId}>`;
    const mentionDisplay = new TextDisplayBuilder().setContent(mentionText);
    await channel.send({
        components: row ? [mentionDisplay, container, row] : [mentionDisplay, container],
        flags: MessageFlags.IsComponentsV2,
    });
    await sendLog(guild.client, guild.id, "ticket", "Ticket Opened", `**Ticket:** #${String(ticketNumber).padStart(4, "0")}\n**Opened by:** <@${openerId}>\n**Channel:** ${channel}`, "success");
    return { channel };
}
//# sourceMappingURL=ticket.js.map