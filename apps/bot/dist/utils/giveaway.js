import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, MediaGalleryBuilder, MessageFlags, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, ThumbnailBuilder, } from "discord.js";
import { prisma } from "@nyx/database";
import { buildPanel, DEFAULT_COLORS } from "./embeds.js";
import { safeSetTimeout } from "./duration.js";
// 繧ｵ繝ｼ繝舌・蜀崎ｵｷ蜍輔ｒ縺ｾ縺溘＞縺ｧ繧ゅち繧､繝槭・繧貞・逋ｻ骭ｲ縺ｧ縺阪ｋ繧医≧縲・ｲ陦御ｸｭ縺ｮ繧ｿ繧､繝槭・繧偵Γ繝｢繝ｪ荳翫↓菫晄戟縺吶ｋ縲・
const activeTimers = new Map();
function parseHexColor(hex) {
    if (!hex)
        return null;
    const cleaned = hex.replace("#", "");
    const value = parseInt(cleaned, 16);
    return Number.isNaN(value) ? null : value;
}
/**
 * 繧ｮ繝悶い繧ｦ繧ｧ繧､繝代ロ繝ｫ繧辰omponents V2縺ｧ邨・∩遶九※繧九・
 * 髢句ぎ荳ｭ縺ｯ繧ｨ繝ｳ繝医Μ繝ｼ繝懊ち繝ｳ莉倥″縲∫ｵゆｺ・繧ｭ繝｣繝ｳ繧ｻ繝ｫ蠕後・繝懊ち繝ｳ繧貞､悶＠縺ｦ邨先棡繧定｡ｨ遉ｺ縺吶ｋ縲・
 * thumbnailUrl 縺後≠繧句ｴ蜷医・ Section + Thumbnail 繧｢繧ｯ繧ｻ繧ｵ繝ｪ縺ｧ繧ｿ繧､繝医Ν讓ｪ縺ｫ蟆上＆縺・判蜒上ｒ陦ｨ遉ｺ縺吶ｋ縲・
 */
export function buildGiveawayContainer({ prize, description, imageUrl, thumbnailUrl, endsAt, winnerCount, hostId, entryCount, status, winnerIds, giveawayId, requiredRoleId, bonusRoleId, bonusEntries, minAccountAgeDays, minLevel, blacklistRoleId, bypassRoleId, winnersRoleId, coinPrize, accentColor, endColor, }) {
    const endedColor = parseHexColor(endColor) ?? DEFAULT_COLORS.success;
    const statusColor = status === "ended" ? endedColor : status === "cancelled" ? DEFAULT_COLORS.error : DEFAULT_COLORS.primary;
    const color = status === "active" ? (parseHexColor(accentColor) ?? statusColor) : statusColor;
    const container = new ContainerBuilder().setAccentColor(color);
    const unix = Math.floor(endsAt.getTime() / 1000);
    const basicInfoLines = [
        `**Ends:** ${status === "active" ? `<t:${unix}:R>` : status === "ended" ? `Ended <t:${unix}:R>` : "Cancelled"}`,
        `**Winners:** \`${winnerCount}\``,
        `**Hosted by:** <@${hostId}>`,
        `**Entries:** \`${entryCount}\``,
    ];
    const requirementLines = [];
    if (requiredRoleId)
        requirementLines.push(`**Requires role:** <@&${requiredRoleId}>`);
    if (blacklistRoleId)
        requirementLines.push(`**Blocked role:** <@&${blacklistRoleId}>`);
    if (bypassRoleId)
        requirementLines.push(`**Bypass role:** <@&${bypassRoleId}>`);
    if (bonusRoleId)
        requirementLines.push(`**Bonus entries:** <@&${bonusRoleId}> members get \`${bonusEntries}x\` odds`);
    if (minAccountAgeDays)
        requirementLines.push(`**Minimum account age:** \`${minAccountAgeDays} days\``);
    if (minLevel)
        requirementLines.push(`**Minimum level:** \`${minLevel}\``);
    const rewardLines = [];
    if (winnersRoleId)
        rewardLines.push(`**Winner role:** <@&${winnersRoleId}>`);
    if (coinPrize)
        rewardLines.push(`**Coin reward:** \`${coinPrize}\` per winner`);
    const titleDisplay = new TextDisplayBuilder().setContent(`## Giveaway: ${prize}`);
    const descriptionDisplay = description ? new TextDisplayBuilder().setContent(description) : null;
    const divider = () => new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small);
    // 繝悶Ο繝・け1: 繧ｿ繧､繝医Ν(+繧ｵ繝繝阪う繝ｫ)縲４ection縺ｯ譛螟ｧ3縺､縺ｾ縺ｧTextDisplay繧呈戟縺ｦ繧九◆繧∬ｪｬ譏取枚繧ゅ％縺薙↓蜿弱ａ繧・
    if (thumbnailUrl) {
        const section = new SectionBuilder().setThumbnailAccessory(new ThumbnailBuilder({ media: { url: thumbnailUrl } }));
        section.addTextDisplayComponents(titleDisplay);
        if (descriptionDisplay)
            section.addTextDisplayComponents(descriptionDisplay);
        container.addSectionComponents(section);
    }
    else {
        container.addTextDisplayComponents(titleDisplay);
        if (descriptionDisplay) {
            container.addSeparatorComponents(divider());
            container.addTextDisplayComponents(descriptionDisplay);
        }
    }
    // 繝悶Ο繝・け2: 逕ｻ蜒・
    if (imageUrl) {
        container.addSeparatorComponents(divider());
        container.addMediaGalleryComponents(new MediaGalleryBuilder().addItems((item) => item.setURL(imageUrl).setDescription(`Image for ${prize}`)));
    }
    // 繝悶Ο繝・け3: 蝓ｺ譛ｬ諠・ｱ(邨ゆｺ・凾蛻ｻ繝ｻ蠖馴∈莠ｺ謨ｰ繝ｻ荳ｻ蛯ｬ閠・・繧ｨ繝ｳ繝医Μ繝ｼ謨ｰ)
    container.addSeparatorComponents(divider());
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Details**\n${basicInfoLines.join("\n")}`));
    // 繝悶Ο繝・け4: 蜿ょ刈譚｡莉ｶ(險ｭ螳壹＆繧後※縺・ｋ鬆・岼縺後≠繧句ｴ蜷医・縺ｿ)
    if (requirementLines.length > 0) {
        container.addSeparatorComponents(divider());
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Requirements**\n${requirementLines.join("\n")}`));
    }
    // 繝悶Ο繝・け5: 蠖馴∈迚ｹ蜈ｸ(險ｭ螳壹＆繧後※縺・ｋ鬆・岼縺後≠繧句ｴ蜷医・縺ｿ)
    if (rewardLines.length > 0) {
        container.addSeparatorComponents(divider());
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Rewards**\n${rewardLines.join("\n")}`));
    }
    // 繝悶Ο繝・け6: 繝懊ち繝ｳ縲√∪縺溘・邨先棡
    container.addSeparatorComponents(divider());
    if (status === "active") {
        container.addActionRowComponents(new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setLabel("Enter Giveaway")
            .setStyle(ButtonStyle.Success)
            .setCustomId(`giveaway:enter:${giveawayId}`)));
    }
    else if (status === "cancelled") {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent("**Status:** This giveaway was cancelled."));
    }
    else {
        const winnerText = winnerIds && winnerIds.length > 0 ? winnerIds.map((id) => `<@${id}>`).join(", ") : "No valid entries.";
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Winner(s):** ${winnerText}`));
    }
    return container;
}
/** 驥阪∩(weight)繧定・・縺励▽縺､縲・㍾隍・↑縺励〒繝ｩ繝ｳ繝繝縺ｫ蠖馴∈閠・ｒ驕ｸ縺ｶ */
function pickWinners(entries, count) {
    const pool = [];
    for (const entry of entries) {
        for (let i = 0; i < Math.max(1, entry.weight); i++)
            pool.push(entry.userId);
    }
    const winners = [];
    const remaining = [...pool];
    while (remaining.length > 0 && winners.length < count) {
        const index = Math.floor(Math.random() * remaining.length);
        const winnerId = remaining[index];
        winners.push(winnerId);
        for (let i = remaining.length - 1; i >= 0; i--) {
            if (remaining[i] === winnerId)
                remaining.splice(i, 1);
        }
    }
    return winners;
}
/** 蠖馴∈閠・∈縺ｮ繧ｳ繧､繝ｳ莉倅ｸ弱・繝ｭ繝ｼ繝ｫ莉倅ｸ弱↑縺ｩ縲∝ｽ馴∈遒ｺ螳壼ｾ後・蜑ｯ菴懃畑蜃ｦ逅・ｒ縺ｾ縺ｨ繧√※陦後≧ */
async function applyWinnerRewards(client, giveaway, winnerIds) {
    if (winnerIds.length === 0)
        return;
    if (giveaway.winnersRoleId) {
        try {
            const guild = await client.guilds.fetch(giveaway.guildId);
            for (const winnerId of winnerIds) {
                try {
                    const member = await guild.members.fetch(winnerId);
                    await member.roles.add(giveaway.winnersRoleId);
                }
                catch (error) {
                    console.error(`[Nyx.] Failed to assign winner role to ${winnerId}`, error);
                }
            }
        }
        catch (error) {
            console.error("[Nyx.] Failed to fetch guild for winner role assignment", error);
        }
    }
    if (giveaway.coinPrize) {
        for (const winnerId of winnerIds) {
            await prisma.userLevel.upsert({
                where: { guildId_userId: { guildId: giveaway.guildId, userId: winnerId } },
                create: { guildId: giveaway.guildId, userId: winnerId, coins: giveaway.coinPrize },
                update: { coins: { increment: giveaway.coinPrize } },
            });
        }
    }
}
/**
 * 繧ｮ繝悶い繧ｦ繧ｧ繧､繧堤ｵゆｺ・＠縲∝ｽ馴∈閠・ｒ謚ｽ驕ｸ縺励※繝代ロ繝ｫ繧呈峩譁ｰ縺吶ｋ縲・
 * 繧ｵ繝ｼ繝舌・蜀崎ｵｷ蜍慕峩蠕後・蜀咲匳骭ｲ繝ｻ謇句虚繝ｪ繝ｭ繝ｼ繝ｫ繝ｻ蠑ｷ蛻ｶ邨ゆｺ・←縺｡繧峨°繧峨ｂ蜻ｼ縺ｰ繧後ｋ蜈ｱ騾壼・逅・・
 */
export async function endGiveaway(client, giveawayId) {
    clearGiveawayTimer(giveawayId);
    const giveaway = await prisma.giveaway.findUnique({ where: { id: giveawayId }, include: { entries: true } });
    if (!giveaway || giveaway.ended || giveaway.cancelled)
        return;
    const winnerIds = pickWinners(giveaway.entries, giveaway.winnerCount);
    await prisma.giveaway.update({ where: { id: giveawayId }, data: { ended: true } });
    try {
        const channel = await client.channels.fetch(giveaway.channelId);
        if (!channel)
            return;
        // 繧ｪ繝励す繝ｧ繝翫Ν繝√ぉ繝ｼ繝ｳ雜翫＠縺ｮ蝙九ぎ繝ｼ繝牙他縺ｳ蜃ｺ縺励・TypeScript縺檎ｵ槭ｊ霎ｼ繧√↑縺・◆繧√・
        // null 繝√ぉ繝・け縺ｨ isTextBased() 繝√ぉ繝・け繧貞・縺代※縺・ｋ縲・M邉ｻ繝√Ε繝ｳ繝阪Ν繧よ・遉ｺ逧・↓髯､螟悶☆繧九・
        if (!channel.isTextBased() || channel.isDMBased())
            return;
        const message = await channel.messages.fetch(giveaway.messageId);
        const container = buildGiveawayContainer({
            prize: giveaway.prize,
            description: giveaway.description,
            imageUrl: giveaway.imageUrl,
            thumbnailUrl: giveaway.thumbnailUrl,
            endsAt: giveaway.endsAt,
            winnerCount: giveaway.winnerCount,
            hostId: giveaway.hostId,
            entryCount: giveaway.entries.length,
            status: "ended",
            winnerIds,
            giveawayId,
            requiredRoleId: giveaway.requiredRoleId,
            bonusRoleId: giveaway.bonusRoleId,
            bonusEntries: giveaway.bonusEntries,
            minAccountAgeDays: giveaway.minAccountAgeDays,
            minLevel: giveaway.minLevel,
            blacklistRoleId: giveaway.blacklistRoleId,
            bypassRoleId: giveaway.bypassRoleId,
            winnersRoleId: giveaway.winnersRoleId,
            coinPrize: giveaway.coinPrize,
            accentColor: giveaway.accentColor,
            endColor: giveaway.endColor,
        });
        await message.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
        const pingPrefix = giveaway.pingRoleId ? `<@&${giveaway.pingRoleId}> ` : "";
        const announcement = winnerIds.length > 0
            ? buildPanel({
                tone: "success",
                title: "Giveaway Ended",
                intro: `Congratulations ${winnerIds.map((id) => `<@${id}>`).join(", ")}! You won **${giveaway.prize}**.`,
            })
            : buildPanel({
                tone: "warning",
                title: "Giveaway Ended",
                intro: `The giveaway for **${giveaway.prize}** ended with no valid entries.`,
            });
        const pingDisplay = pingPrefix ? new TextDisplayBuilder().setContent(pingPrefix.trim()) : null;
        await channel.send({
            components: pingDisplay ? [pingDisplay, announcement] : [announcement],
            flags: MessageFlags.IsComponentsV2,
        });
        await applyWinnerRewards(client, giveaway, winnerIds);
        if (giveaway.dmWinners && winnerIds.length > 0) {
            const dmText = (giveaway.winnersDmMessage ?? "You won **{prize}** in a giveaway. Check the server for details.").replace("{prize}", giveaway.prize);
            for (const winnerId of winnerIds) {
                try {
                    const user = await client.users.fetch(winnerId);
                    const dmPanel = buildPanel({ tone: "success", title: "You Won a Giveaway", intro: dmText });
                    await user.send({ components: [dmPanel], flags: MessageFlags.IsComponentsV2 });
                }
                catch {
                    // DM繧帝哩縺倥※縺・ｋ繝ｦ繝ｼ繧ｶ繝ｼ縺ｯ辟｡隕悶☆繧・
                }
            }
        }
    }
    catch (error) {
        console.error(`[Nyx.] Failed to finalize giveaway ${giveawayId}`, error);
    }
}
/**
 * 繧ｮ繝悶い繧ｦ繧ｧ繧､繧貞ｽ馴∈閠・ｒ驕ｸ縺ｰ縺壹↓繧ｭ繝｣繝ｳ繧ｻ繝ｫ縺吶ｋ(荳肴ｭ｣髢句ぎ繝ｻ隱､謫堺ｽ懊・蜿悶ｊ豸医＠逕ｨ)縲・
 */
export async function cancelGiveaway(client, giveawayId) {
    clearGiveawayTimer(giveawayId);
    const giveaway = await prisma.giveaway.findUnique({ where: { id: giveawayId }, include: { entries: true } });
    if (!giveaway || giveaway.ended || giveaway.cancelled)
        return;
    await prisma.giveaway.update({ where: { id: giveawayId }, data: { cancelled: true } });
    try {
        const channel = await client.channels.fetch(giveaway.channelId);
        if (!channel)
            return;
        // 繧ｪ繝励す繝ｧ繝翫Ν繝√ぉ繝ｼ繝ｳ雜翫＠縺ｮ蝙九ぎ繝ｼ繝牙他縺ｳ蜃ｺ縺励・TypeScript縺檎ｵ槭ｊ霎ｼ繧√↑縺・◆繧√・
        // null 繝√ぉ繝・け縺ｨ isTextBased() 繝√ぉ繝・け繧貞・縺代※縺・ｋ縲・M邉ｻ繝√Ε繝ｳ繝阪Ν繧よ・遉ｺ逧・↓髯､螟悶☆繧九・
        if (!channel.isTextBased() || channel.isDMBased())
            return;
        const message = await channel.messages.fetch(giveaway.messageId);
        const container = buildGiveawayContainer({
            prize: giveaway.prize,
            description: giveaway.description,
            imageUrl: giveaway.imageUrl,
            thumbnailUrl: giveaway.thumbnailUrl,
            endsAt: giveaway.endsAt,
            winnerCount: giveaway.winnerCount,
            hostId: giveaway.hostId,
            entryCount: giveaway.entries.length,
            status: "cancelled",
            giveawayId,
            requiredRoleId: giveaway.requiredRoleId,
            bonusRoleId: giveaway.bonusRoleId,
            bonusEntries: giveaway.bonusEntries,
            minAccountAgeDays: giveaway.minAccountAgeDays,
            minLevel: giveaway.minLevel,
            blacklistRoleId: giveaway.blacklistRoleId,
            bypassRoleId: giveaway.bypassRoleId,
            winnersRoleId: giveaway.winnersRoleId,
            coinPrize: giveaway.coinPrize,
            accentColor: giveaway.accentColor,
            endColor: giveaway.endColor,
        });
        await message.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
    catch (error) {
        console.error(`[Nyx.] Failed to update panel for cancelled giveaway ${giveawayId}`, error);
    }
}
function clearGiveawayTimer(giveawayId) {
    const timer = activeTimers.get(giveawayId);
    if (timer) {
        timer.cancel();
        activeTimers.delete(giveawayId);
    }
}
/** 譁ｰ隕丈ｽ懈・譎ゅ∵欠螳壹＠縺溽ｵゆｺ・凾蛻ｻ縺ｫendGiveaway縺悟他縺ｰ繧後ｋ繧医≧繧ｿ繧､繝槭・繧堤匳骭ｲ縺吶ｋ */
export function scheduleGiveawayEnd(client, giveawayId, endsAt) {
    clearGiveawayTimer(giveawayId);
    const delay = Math.max(0, endsAt.getTime() - Date.now());
    const timer = safeSetTimeout(() => endGiveaway(client, giveawayId), delay);
    activeTimers.set(giveawayId, timer);
}
/**
 * Bot襍ｷ蜍墓凾縺ｫ蜻ｼ縺ｶ縲・B荳翫〒縺ｾ縺邨ゆｺ・繧ｭ繝｣繝ｳ繧ｻ繝ｫ縺輔ｌ縺ｦ縺・↑縺・ぐ繝悶い繧ｦ繧ｧ繧､繧貞・縺ｦ蜀阪せ繧ｱ繧ｸ繝･繝ｼ繝ｫ縺吶ｋ縲・
 * 邨ゆｺ・凾蛻ｻ繧帝℃縺弱※縺・ｋ繧ゅ・縺ｯ蜊ｳ蠎ｧ縺ｫ邨ゆｺ・・逅・＆繧後ｋ縲・
 */
export async function requeueGiveaways(client) {
    const pending = await prisma.giveaway.findMany({ where: { ended: false, cancelled: false } });
    for (const giveaway of pending) {
        scheduleGiveawayEnd(client, giveaway.id, giveaway.endsAt);
    }
    if (pending.length > 0) {
        console.log(`[Nyx.] Requeued ${pending.length} active giveaway(s)`);
    }
}
//# sourceMappingURL=giveaway.js.map