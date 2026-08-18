import { sendLog } from "../utils/logging.js";
export function registerChannelDeleteEvent(client) {
    client.on("channelDelete", async (channel) => {
        try {
            if (!("guild" in channel))
                return; // DMチャンネルが閉じられた場合は対象外
            await sendLog(client, channel.guild.id, "channel", "Channel Deleted", `**Name:** ${channel.name}\n**Type:** \`${channel.type}\``, "error");
        }
        catch (error) {
            console.error("[Nyx.] Failed to process channelDelete", error);
        }
    });
}
//# sourceMappingURL=channelDelete.js.map