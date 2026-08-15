import { Player, useMainPlayer } from "discord-player";
import { DefaultExtractors } from "@discord-player/extractor";
import { MessageFlags, type Client, type TextBasedChannel } from "discord.js";
import { buildPanel } from "./embeds.js";

/**
 * discord-playerのPlayerインスタンスを初期化する。Bot起動時に一度だけ呼ぶ。
 * 曲の再生開始・キュー終了時にComponents V2パネルを自動投稿するイベントもここで登録する。
 */
export async function initPlayer(client: Client) {
  // 上記と同じ理由(discord-player側とこちら側のdiscord.js型がNodeNext解決モードで別物扱いされる既知の問題)の回避策
  const player = new Player(client as any);
  await player.extractors.loadMulti(DefaultExtractors);

  player.events.on("playerStart", async (queue, track) => {
    const channel = queue.metadata as TextBasedChannel | undefined;
    if (!channel || !("send" in channel)) return;

    const panel = buildPanel({
      tone: "success",
      title: "Now Playing",
      intro: `**${track.title}**\nRequested by ${track.requestedBy}\nDuration: \`${track.duration}\``,
    });

    try {
      await channel.send({ components: [panel], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("[Nyx.] Failed to send now-playing panel", error);
    }
  });

  player.events.on("emptyQueue", async (queue) => {
    const channel = queue.metadata as TextBasedChannel | undefined;
    if (!channel || !("send" in channel)) return;

    const panel = buildPanel({ tone: "primary", title: "Queue Finished", intro: "No more tracks in the queue. Leaving the voice channel." });

    try {
      await channel.send({ components: [panel], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error("[Nyx.] Failed to send queue-finished panel", error);
    }
  });

  player.events.on("playerError", (queue, error) => {
    console.error(`[Nyx.] Player error in guild ${queue.guild.id}`, error);
  });

  return player;
}

export { useMainPlayer };
