import type { NyxClient } from "../client.js";

export function registerReadyEvent(client: NyxClient) {
  client.once("ready", () => {
    console.log(`[Nyx.] Logged in as ${client.user?.tag}`);
  });
}
