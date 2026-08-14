import { createServer } from "node:http";

/**
 * RenderのWeb Service(無料枠)として動かすための最小限のHTTPサーバー。
 * Botプロセス自体はDiscordのgatewayに接続し続けるだけで、外部からのHTTPアクセスは不要だが、
 * Renderの無料枠は「HTTPポートを開いているWeb Service」しか対象にならないため、
 * ヘルスチェック用の応答だけを返すサーバーをここで立てる。
 *
 * UptimeRobot等で `https://<render-url>/` に5分間隔でpingすることで、
 * 15分間無アクセスによるスリープを防ぐ想定。
 */
export function startHealthServer() {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  const server = createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Nyx. is running.");
  });

  server.listen(port, () => {
    console.log(`[Nyx.] Health check server listening on port ${port}`);
  });
}
