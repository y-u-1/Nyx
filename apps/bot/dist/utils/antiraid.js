import { GuildVerificationLevel } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "./embeds.js";
// 繧ｵ繝ｼ繝舌・縺斐→縺ｮ逶ｴ霑代・蜿ょ刈譎ょ綾繧偵Γ繝｢繝ｪ荳翫〒菫晄戟縺励∝盾蜉騾溷ｺｦ縺九ｉ繝ｬ繧､繝峨ｒ讀懃衍縺吶ｋ縲・
const joinTimestamps = new Map(); // key: guildId
async function logSecurityEvent(member, description) {
    const guildSettings = await prisma.guildSettings.findUnique({ where: { guildId: member.guild.id } });
    if (!guildSettings?.logChannelId)
        return;
    try {
        const channel = await member.client.channels.fetch(guildSettings.logChannelId);
        if (!channel || channel.isDMBased() || !channel.isTextBased())
            return;
        await channel.send({ embeds: [baseEmbed({ tone: "error", title: "Security", description })] });
    }
    catch (error) {
        console.error("[Nyx.] Failed to send security log", error);
    }
}
/**
 * 繝｡繝ｳ繝舌・蜿ょ刈譎ゅ↓蜻ｼ縺ｶ縲よ怙菴弱い繧ｫ繧ｦ繝ｳ繝亥ｹｴ鮨｢繝√ぉ繝・け縺ｨ縲∝盾蜉騾溷ｺｦ縺ｫ繧医ｋ繝ｬ繧､繝画､懃衍縺ｮ荳｡譁ｹ繧定｡後≧縲・
 */
export async function handleMemberJoin(member) {
    const settings = await prisma.autoModSettings.findUnique({ where: { guildId: member.guild.id } });
    if (!settings)
        return;
    // 蟶ｸ譎よ怏蜉ｹ: 譁ｰ隕上い繧ｫ繧ｦ繝ｳ繝医・閾ｪ蜍輔く繝・け
    if (settings.minAccountAgeDays) {
        const accountAgeDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
        if (accountAgeDays < settings.minAccountAgeDays) {
            try {
                await member.kick(`Account younger than ${settings.minAccountAgeDays} days (anti-raid).`);
                await logSecurityEvent(member, `Kicked <@${member.id}> 窶・account is younger than ${settings.minAccountAgeDays} days.`);
            }
            catch (error) {
                console.error("[Nyx.] Failed to kick underage account", error);
            }
            return;
        }
    }
    if (!settings.antiRaidEnabled)
        return;
    const now = Date.now();
    const windowMs = settings.raidJoinWindowSeconds * 1000;
    const timestamps = (joinTimestamps.get(member.guild.id) ?? []).filter((t) => now - t < windowMs);
    timestamps.push(now);
    joinTimestamps.set(member.guild.id, timestamps);
    if (timestamps.length < settings.raidJoinThreshold)
        return;
    // 繝ｬ繧､繝画､懃衍縲りｨｭ螳壹＆繧後◆繧｢繧ｯ繧ｷ繝ｧ繝ｳ繧貞ｮ溯｡後☆繧九・
    await logSecurityEvent(member, `Raid detected: \`${timestamps.length}\` joins within ${settings.raidJoinWindowSeconds}s. Action: \`${settings.raidAction}\`.`);
    try {
        if (settings.raidAction === "ban") {
            await member.ban({ reason: "Anti-raid: rapid join detected." });
        }
        else if (settings.raidAction === "lockdown") {
            await member.guild.setVerificationLevel(GuildVerificationLevel.VeryHigh, "Anti-raid lockdown triggered.");
        }
        else {
            await member.kick("Anti-raid: rapid join detected.");
        }
    }
    catch (error) {
        console.error("[Nyx.] Failed to apply anti-raid action", error);
    }
}
//# sourceMappingURL=antiraid.js.map