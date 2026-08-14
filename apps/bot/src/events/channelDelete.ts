import type { DMChannel, NonThreadGuildBasedChannel } from "discord.js";
import type { NyxClient } from "../client.js";
import { sendLog } from "../utils/logging.js";

export function registerChannelDeleteEvent(client: NyxClient) {
  client.on("channelDelete", async (channel: DMChannel | NonThreadGuildBasedChannel) => {
    try {
      if (!("guild" in channel)) return; // DMチャンネルが閉じられた場合は対象外

      await sendLog(client, channel.guild.id, "channel", "Channel Deleted", `**Name:** ${channel.name}\n**Type:** \`${channel.type}\``, "error");
    } catch (error) {
      console.error("[Nyx.] Failed to process channelDelete", error);
    }
  });
}
