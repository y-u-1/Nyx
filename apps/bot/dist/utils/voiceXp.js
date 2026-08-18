import { ChannelType } from "discord.js";
import { prisma } from "@nyx/database";
import { addXp } from "./leveling.js";
// 繝ｦ繝ｼ繧ｶ繝ｼ縺斐→縺ｮ邨碁℃蛻・焚繧偵Γ繝｢繝ｪ荳翫〒繧ｫ繧ｦ繝ｳ繝医＠縲∬ｨｭ螳壹う繝ｳ繧ｿ繝ｼ繝舌Ν縺ｫ驕斐＠縺溘ｉXP繧剃ｻ倅ｸ弱☆繧九・
// Bot蜀崎ｵｷ蜍輔〒繧ｫ繧ｦ繝ｳ繝医・繝ｪ繧ｻ繝・ヨ縺輔ｌ繧九′縲√・繧､繧ｹXP縺ｮ諤ｧ雉ｪ荳雁､ｧ縺阪↑蝠城｡後↓縺ｯ縺ｪ繧峨↑縺・・
const minuteCounters = new Map(); // key: `${guildId}:${userId}`
const TICK_INTERVAL_MS = 60 * 1000;
/** Bot襍ｷ蜍墓凾縺ｫ蜻ｼ縺ｶ縲・蛻・＃縺ｨ縺ｫ蜈ｨ繧ｵ繝ｼ繝舌・縺ｮ繝懊う繧ｹ繝√Ε繝ｳ繝阪Ν繧定ｵｰ譟ｻ縺励※XP繧剃ｻ倅ｸ弱☆繧・*/
export function startVoiceXpTracker(client) {
    setInterval(() => {
        tick(client).catch((error) => console.error("[Nyx.] Voice XP tick failed", error));
    }, TICK_INTERVAL_MS);
}
async function tick(client) {
    for (const guild of client.guilds.cache.values()) {
        const settings = await prisma.guildSettings.findUnique({ where: { guildId: guild.id } });
        if (!settings?.voiceXpEnabled)
            continue;
        const voiceChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice);
        for (const channel of voiceChannels.values()) {
            if (!("members" in channel))
                continue;
            const humanMembers = channel.members.filter((m) => !m.user.bot);
            if (humanMembers.size < settings.voiceXpMinMembers)
                continue;
            for (const member of humanMembers.values()) {
                if (settings.voiceXpIgnoreAfk && (member.voice.mute || member.voice.deaf || member.voice.selfMute || member.voice.selfDeaf)) {
                    continue;
                }
                const key = `${guild.id}:${member.id}`;
                const count = (minuteCounters.get(key) ?? 0) + 1;
                if (count >= settings.voiceXpIntervalMinutes) {
                    minuteCounters.set(key, 0);
                    await addXp(client, guild.id, member.id, settings.voiceXpAmount);
                }
                else {
                    minuteCounters.set(key, count);
                }
            }
        }
    }
}
//# sourceMappingURL=voiceXp.js.map