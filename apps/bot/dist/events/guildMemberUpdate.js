import { sendLog } from "../utils/logging.js";
export function registerGuildMemberUpdateEvent(client) {
    client.on("guildMemberUpdate", async (oldMember, newMember) => {
        try {
            if (oldMember.nickname !== newMember.nickname) {
                await sendLog(client, newMember.guild.id, "member", "Nickname Changed", `**User:** <@${newMember.id}>\n**Before:** ${oldMember.nickname ?? "*(none)*"}\n**After:** ${newMember.nickname ?? "*(none)*"}`, "warning");
            }
            if (oldMember.avatar !== newMember.avatar) {
                await sendLog(client, newMember.guild.id, "member", "Server Avatar Changed", `**User:** <@${newMember.id}>`, "warning");
            }
        }
        catch (error) {
            console.error("[Nyx.] Failed to process guildMemberUpdate", error);
        }
    });
}
//# sourceMappingURL=guildMemberUpdate.js.map