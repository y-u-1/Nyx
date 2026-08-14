import { MessageFlags, type Client } from "discord.js";
import { prisma } from "@nyx/database";
import { buildMultiButtonPanel } from "./embeds.js";

/** DB上のロール一覧からパネルのContainerを組み立てる */
export function buildRolePanelContainer(title: string, description: string, roles: { id: string; label: string }[]) {
  return buildMultiButtonPanel({
    title,
    intro: description,
    buttons: roles.map((r) => ({ label: r.label, customId: `rolepanel:toggle:${r.id}` })),
    creditLine: "Powered by **Nyx.**",
  });
}

/** ロールの追加/削除後に、実際のパネルメッセージを最新の状態に更新する */
export async function syncRolePanelMessage(client: Client, panelId: string) {
  const panel = await prisma.rolePanel.findUnique({ where: { id: panelId }, include: { roles: true } });
  if (!panel) return;

  try {
    const channel = await client.channels.fetch(panel.channelId);
    if (!channel || channel.isDMBased() || !channel.isTextBased()) return;

    const message = await channel.messages.fetch(panel.messageId);
    const container = buildRolePanelContainer(panel.title, "Click a button below to toggle the matching role.", panel.roles);

    await message.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
  } catch (error) {
    console.error(`[Nyx.] Failed to sync role panel ${panelId}`, error);
  }
}
