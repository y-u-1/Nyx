import type { GuildChannel } from "discord.js";
import type { NyxClient } from "../client.js";
import { sendLog } from "../utils/logging.js";

export function registerChannelDeleteEvent(client: NyxClient) {
  client.on("channelDelete", async (channel: GuildChannel) => {
    try {
      await sendLog(client, channel.guild.id, "channel", "Channel Deleted", `**Name:** ${channel.name}\n**Type:** \`${channel.type}\``, "error");
    } catch (error) {
      console.error("[Nyx.] Failed to process channelDelete", error);
    }
  });
}
