import type { Message, PartialMessage } from "discord.js";
import type { NyxClient } from "../client.js";
import { sendLog } from "../utils/logging.js";

export function registerMessageDeleteEvent(client: NyxClient) {
  client.on("messageDelete", async (message: Message | PartialMessage) => {
    try {
      if (!message.guildId || message.author?.bot) return;

      const content = message.partial ? "*(content unavailable)*" : message.content || "*(no text content)*";

      await sendLog(
        client,
        message.guildId,
        "message",
        "Message Deleted",
        `**Author:** ${message.author ? `<@${message.author.id}>` : "Unknown"}\n**Channel:** <#${message.channelId}>\n**Content:**\n${content.slice(0, 1000)}`,
        "error",
      );
    } catch (error) {
      console.error("[Nyx.] Failed to process messageDelete", error);
    }
  });
}
