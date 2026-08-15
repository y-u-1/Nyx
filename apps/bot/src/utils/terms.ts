import { prisma } from "@nyx/database";

/**
 * サーバーごとにカスタマイズ可能な用語を取得する。未設定ならdefaultValueを返す。
 * 通貨名(GuildSettings.currencyName)のような専用フィールドではなく、
 * 任意のkey-valueとして管理したい用語(ランクの呼び方など)に使う。
 */
export async function getTerm(guildId: string, key: string, defaultValue: string): Promise<string> {
  const term = await prisma.guildTerm.findUnique({ where: { guildId_key: { guildId, key } } });
  return term?.value ?? defaultValue;
}
