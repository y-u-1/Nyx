import { sendLog } from "../utils/logging.js";
export function registerUserUpdateEvent(client) {
    client.on("userUpdate", async (oldUser, newUser) => {
        try {
            const usernameChanged = oldUser.username !== newUser.username;
            const avatarChanged = oldUser.avatar !== newUser.avatar;
            if (!usernameChanged && !avatarChanged)
                return;
            // userUpdateはサーバー単位ではなくグローバルなイベントなので、Botと同じサーバーにいる全ギルドへログを送る
            const mutualGuilds = client.guilds.cache.filter((g) => g.members.cache.has(newUser.id));
            for (const guild of mutualGuilds.values()) {
                if (usernameChanged) {
                    await sendLog(client, guild.id, "member", "Username Changed", `**User:** <@${newUser.id}>\n**Before:** ${oldUser.username}\n**After:** ${newUser.username}`, "warning");
                }
                if (avatarChanged) {
                    await sendLog(client, guild.id, "member", "Avatar Changed", `**User:** <@${newUser.id}>`, "warning");
                }
            }
        }
        catch (error) {
            console.error("[Nyx.] Failed to process userUpdate", error);
        }
    });
}
//# sourceMappingURL=userUpdate.js.map