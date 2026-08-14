import type { GuildChannel } from "discord.js";
import type { NyxClient } from "../client.js";
import { sendLog } from "../utils/logging.js";

export function registerChannelCreateEvent(client: NyxClient) {
  client.on("channelCreate", async (channel: GuildChannel) => {
    try {
      await sendLog(client, channel.guild.id, "channel", "Channel Created", `**Name:** ${channel.name}\n**Type:** \`${channel.type}\`\n**Channel:** <#${channel.id}>`, "success");
    } catch (error) {
      console.error("[Nyx.] Failed to process channelCreate", error);
    }
  });
}
