import type { VoiceState } from "discord.js";
import type { NyxClient } from "../client.js";
import { sendLog } from "../utils/logging.js";

export function registerVoiceStateUpdateEvent(client: NyxClient) {
  client.on("voiceStateUpdate", async (oldState: VoiceState, newState: VoiceState) => {
    try {
      const guildId = newState.guild.id;
      const userId = newState.id;

      if (!oldState.channelId && newState.channelId) {
        await sendLog(client, guildId, "vc", "Voice Channel Joined", `**User:** <@${userId}>\n**Channel:** <#${newState.channelId}>`, "success");
      } else if (oldState.channelId && !newState.channelId) {
        await sendLog(client, guildId, "vc", "Voice Channel Left", `**User:** <@${userId}>\n**Channel:** <#${oldState.channelId}>`, "error");
      } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        await sendLog(
          client,
          guildId,
          "vc",
          "Voice Channel Moved",
          `**User:** <@${userId}>\n**From:** <#${oldState.channelId}>\n**To:** <#${newState.channelId}>`,
          "warning",
        );
      }
    } catch (error) {
      console.error("[Nyx.] Failed to process voiceStateUpdate", error);
    }
  });
}
