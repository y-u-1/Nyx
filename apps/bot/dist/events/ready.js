import { resumeElectionTimers } from "../utils/election.js";
export function registerReadyEvent(client) {
    client.once("ready", () => {
        console.log(`[Nyx.] Logged in as ${client.user?.tag}`);
        // 再起動をまたぐ選挙のフェーズ移行/任期失効タイマーを復元する
        resumeElectionTimers(client).catch((error) => {
            console.error("[Nyx.] Failed to resume election timers", error);
        });
    });
}
//# sourceMappingURL=ready.js.map