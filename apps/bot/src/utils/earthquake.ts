import WebSocket from "ws";
import { AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, type Client } from "discord.js";
import { prisma } from "@nyx/database";
import { generateEarthquakeMap } from "./earthquake-map.js";
import { scaleToAccentColor, scaleToKanji } from "./earthquake-scale.js";

const P2P_WS_URL = "wss://api.p2pquake.net/v2/ws";
const RECONNECT_DELAY_MS = 10_000;

// P2P地震情報APIのcode値
// 551: 地震情報, 554/555: 緊急地震速報(予報), 556: 緊急地震速報(警報)
const CODE_QUAKE_INFO = 551;
const CODE_EEW_WARNING = 556;

interface QuakePoint {
  pref?: string;
  addr?: string;
  scale?: number;
}

interface QuakeMessage {
  code: number;
  time?: string;
  earthquake?: {
    time?: string;
    hypocenter?: { name?: string; latitude?: number; longitude?: number; depth?: number; magnitude?: number };
    maxScale?: number;
    domesticTsunami?: string;
  };
  points?: QuakePoint[];
  areas?: { name?: string; scaleFrom?: number; scaleTo?: number }[];
}

/**
 * 地震情報パネル(Components V2)を組み立てる。マップ画像はMediaGalleryで添付する。
 */
function buildEarthquakeContainer({
  title,
  hypocenterName,
  magnitude,
  depth,
  maxScale,
  occurredAt,
  pointLines,
  tsunami,
}: {
  title: string;
  hypocenterName: string;
  magnitude: number | null;
  depth: number | null;
  maxScale: number;
  occurredAt: string | null;
  pointLines: string[];
  tsunami?: string;
}) {
  const container = new ContainerBuilder().setAccentColor(scaleToAccentColor(maxScale));

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${title}`));

  const detailLines = [
    `**Epicenter:** ${hypocenterName}`,
    magnitude !== null ? `**Magnitude:** \`M${magnitude.toFixed(1)}\`` : null,
    depth !== null ? `**Depth:** \`${depth}km\`` : null,
    `**Max intensity:** \`${scaleToKanji(maxScale)}\``,
    occurredAt ? `**Time:** ${occurredAt}` : null,
    tsunami ? `**Tsunami:** ${tsunami}` : null,
  ].filter(Boolean);

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(detailLines.join("\n")));

  if (pointLines.length > 0) {
    container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(pointLines.slice(0, 15).join("\n")));
  }

  return container;
}

async function broadcast(client: Client, container: ContainerBuilder, imageBuffer: Buffer, minScale: number, maxScale: number, requireEew: boolean, isEew: boolean) {
  const targets = await prisma.guildSettings.findMany({
    where: {
      earthquakeEnabled: true,
      earthquakeChannelId: { not: null },
      earthquakeMinScale: { lte: maxScale },
      ...(isEew ? { earthquakeEewEnabled: true } : {}),
    },
  });

  for (const settings of targets) {
    if (!settings.earthquakeChannelId) continue;

    try {
      const channel = await client.channels.fetch(settings.earthquakeChannelId);
      if (!channel || channel.isDMBased() || !channel.isTextBased()) continue;

      const attachment = new AttachmentBuilder(imageBuffer, { name: "earthquake-map.png" });
      const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL("attachment://earthquake-map.png"));

      const fullContainer = ContainerBuilder.from(container).addMediaGalleryComponents(gallery);

      await channel.send({ components: [fullContainer], files: [attachment], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error(`[Nyx.] Failed to send earthquake notification to guild ${settings.guildId}`, error);
    }
  }
}

async function handleQuakeInfo(client: Client, data: QuakeMessage) {
  const hypocenter = data.earthquake?.hypocenter;
  if (!hypocenter?.latitude || !hypocenter?.longitude) return;

  const maxScale = data.earthquake?.maxScale ?? -1;

  const points = (data.points ?? [])
    .filter((p) => typeof p.scale === "number")
    .map((p) => ({ lat: hypocenter.latitude!, lng: hypocenter.longitude!, scale: p.scale, label: p.pref ?? p.addr }));
  // 注: 観測点の正確な緯度経度はAPIレスポンスに含まれないため、現状は震央近辺に集約表示している。
  // 都道府県ごとの正確な座標テーブルを追加すれば、観測点ごとの正しい位置にプロットできる。

  const imageBuffer = await generateEarthquakeMap({
    epicenter: { lat: hypocenter.latitude, lng: hypocenter.longitude, name: hypocenter.name },
    points,
  });

  const pointLines = (data.points ?? [])
    .filter((p) => typeof p.scale === "number")
    .sort((a, b) => (b.scale ?? 0) - (a.scale ?? 0))
    .map((p) => `${p.pref ?? p.addr ?? "?"}: \`${scaleToKanji(p.scale!)}\``);

  const container = buildEarthquakeContainer({
    title: "Earthquake Information",
    hypocenterName: hypocenter.name ?? "Unknown",
    magnitude: hypocenter.magnitude ?? null,
    depth: hypocenter.depth ?? null,
    maxScale,
    occurredAt: data.earthquake?.time ?? null,
    pointLines,
    tsunami: data.earthquake?.domesticTsunami,
  });

  await broadcast(client, container, imageBuffer, maxScale, maxScale, false, false);
}

async function handleEewWarning(client: Client, data: QuakeMessage) {
  const hypocenter = data.earthquake?.hypocenter;
  if (!hypocenter?.latitude || !hypocenter?.longitude) return;

  const maxScale = data.earthquake?.maxScale ?? -1;

  const points = (data.areas ?? [])
    .filter((a) => typeof a.scaleTo === "number")
    .map((a) => ({ lat: hypocenter.latitude!, lng: hypocenter.longitude!, scale: a.scaleTo, label: a.name }));

  const imageBuffer = await generateEarthquakeMap({
    epicenter: { lat: hypocenter.latitude, lng: hypocenter.longitude, name: hypocenter.name },
    points,
  });

  const areaLines = (data.areas ?? [])
    .filter((a) => typeof a.scaleTo === "number")
    .sort((a, b) => (b.scaleTo ?? 0) - (a.scaleTo ?? 0))
    .map((a) => `${a.name}: \`${scaleToKanji(a.scaleTo!)}\``);

  const container = buildEarthquakeContainer({
    title: "Earthquake Early Warning",
    hypocenterName: hypocenter.name ?? "Unknown",
    magnitude: hypocenter.magnitude ?? null,
    depth: hypocenter.depth ?? null,
    maxScale,
    occurredAt: data.earthquake?.time ?? null,
    pointLines: areaLines,
  });

  await broadcast(client, container, imageBuffer, maxScale, maxScale, true, true);
}

let socket: WebSocket | null = null;

/** Bot起動時に呼ぶ。P2P地震情報のWebSocketに接続し、切断時は自動再接続する。 */
export function startEarthquakeListener(client: Client) {
  connect(client);
}

function connect(client: Client) {
  socket = new WebSocket(P2P_WS_URL);

  socket.on("open", () => console.log("[Nyx.] Connected to P2P Quake WebSocket"));

  socket.on("message", async (raw) => {
    try {
      const data = JSON.parse(raw.toString()) as QuakeMessage;

      if (data.code === CODE_QUAKE_INFO) {
        await handleQuakeInfo(client, data);
      } else if (data.code === CODE_EEW_WARNING) {
        await handleEewWarning(client, data);
      }
    } catch (error) {
      console.error("[Nyx.] Failed to process P2P Quake message", error);
    }
  });

  socket.on("close", () => {
    console.log("[Nyx.] P2P Quake WebSocket closed, reconnecting...");
    setTimeout(() => connect(client), RECONNECT_DELAY_MS);
  });

  socket.on("error", (error) => {
    console.error("[Nyx.] P2P Quake WebSocket error", error);
  });
}
