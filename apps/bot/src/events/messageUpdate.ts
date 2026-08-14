import type { Message, PartialMessage } from "discord.js";
import type { NyxClient } from "../client.js";
import { sendLog } from "../utils/logging.js";

export function registerMessageUpdateEvent(client: NyxClient) {
  client.on("messageUpdate", async (oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) => {
    try {
      if (!newMessage.guildId || newMessage.author?.bot) return;
      if (oldMessage.content === newMessage.content) return; // 埋め込み展開などcontentが変わらない更新は無視

      const before = oldMessage.partial ? "*(content unavailable)*" : oldMessage.content || "*(no text content)*";
      const after = newMessage.partial ? "*(content unavailable)*" : newMessage.content || "*(no text content)*";

      await sendLog(
        client,
        newMessage.guildId,
        "message",
        "Message Edited",
        `**Author:** ${newMessage.author ? `<@${newMessage.author.id}>` : "Unknown"}\n**Channel:** <#${newMessage.channelId}>\n\n**Before:**\n${before.slice(0, 500)}\n\n**After:**\n${after.slice(0, 500)}`,
        "warning",
      );
    } catch (error) {
      console.error("[Nyx.] Failed to process messageUpdate", error);
    }
  });
}
