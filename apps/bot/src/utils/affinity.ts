import { prisma } from "@nyx/database";

/**
 * 2人1組の結婚/パートナー制ではなく、誰とでも個別に育つ累積ポイント制の親密度システム。
 * userAId/userBId は常に文字列比較で小さい方をA、大きい方をBに正規化する
 * (@userA/@userB どちらの並びで呼ばれても同じレコードを指すようにするため)。
 */
function normalizePair(userId1: string, userId2: string): [string, string] {
  return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
}

/** 手動ジェスチャー(/hug, /pat等)のペアごとのクールダウン。メモリ上で管理し、
 * 再起動でリセットされても実害はない(あくまで連打による稼ぎ防止のためのもの)。 */
const gestureCooldowns = new Map<string, number>();
const GESTURE_COOLDOWN_MS = 60 * 1000;

/** 手動ジェスチャーがクールダウン中かどうかを判定する。クールダウン中でなければ即座に記録して false を返す。 */
export function isGestureOnCooldown(gesture: string, userId1: string, userId2: string): boolean {
  const [a, b] = normalizePair(userId1, userId2);
  const key = `${gesture}:${a}:${b}`;
  const last = gestureCooldowns.get(key);

  if (last && Date.now() - last < GESTURE_COOLDOWN_MS) {
    return true;
  }

  gestureCooldowns.set(key, Date.now());
  return false;
}

/** 会話によるオート加算のクールダウン(ペアごと)。連投による稼ぎ防止。 */
const AUTO_GAIN_COOLDOWN_MS = 3 * 60 * 1000;

/** 1回の会話オート加算で入る親密度ポイント */
const AUTO_GAIN_AMOUNT = 1;

export interface AffinityTier {
  key: string;
  labelEn: string;
  labelJa: string;
  threshold: number;
}

/** 親密度の段階(ポイントの下限値で判定)。 */
export const AFFINITY_TIERS: AffinityTier[] = [
  { key: "stranger", labelEn: "Stranger", labelJa: "見知らぬ仲", threshold: 0 },
  { key: "acquaintance", labelEn: "Acquaintance", labelJa: "顔見知り", threshold: 20 },
  { key: "friend", labelEn: "Friend", labelJa: "友達", threshold: 75 },
  { key: "close_friend", labelEn: "Close Friend", labelJa: "親友", threshold: 200 },
  { key: "best_friend", labelEn: "Best Friend", labelJa: "大親友", threshold: 500 },
  { key: "soulmate", labelEn: "Soulmate", labelJa: "運命の相手", threshold: 1000 },
];

export function tierForPoints(points: number): AffinityTier {
  let current = AFFINITY_TIERS[0];
  for (const tier of AFFINITY_TIERS) {
    if (points >= tier.threshold) current = tier;
  }
  return current;
}

export function nextTier(points: number): AffinityTier | null {
  return AFFINITY_TIERS.find((tier) => tier.threshold > points) ?? null;
}

/** 2人の親密度レコードを取得する(無ければ0扱い)。 */
export async function getAffinity(guildId: string, userId1: string, userId2: string) {
  const [userAId, userBId] = normalizePair(userId1, userId2);
  return prisma.affinity.findUnique({ where: { guildId_userAId_userBId: { guildId, userAId, userBId } } });
}

/** 親密度ポイントを加算する(手動コマンド用。クールダウン判定なし)。 */
export async function addAffinity(guildId: string, userId1: string, userId2: string, amount: number) {
  const [userAId, userBId] = normalizePair(userId1, userId2);
  return prisma.affinity.upsert({
    where: { guildId_userAId_userBId: { guildId, userAId, userBId } },
    create: { guildId, userAId, userBId, points: amount },
    update: { points: { increment: amount } },
  });
}

/**
 * 会話によるオート加算を試みる。ペアごとにクールダウンがあるため、
 * 短時間に連投しても加算されるのは最初の1回だけ。
 * 加算が発生したかどうかを返す(呼び出し側でのログ等に利用可能)。
 */
export async function tryAutoGainAffinity(guildId: string, userId1: string, userId2: string): Promise<boolean> {
  if (userId1 === userId2) return false;

  const [userAId, userBId] = normalizePair(userId1, userId2);
  const existing = await prisma.affinity.findUnique({ where: { guildId_userAId_userBId: { guildId, userAId, userBId } } });

  if (existing?.lastAutoGainAt && Date.now() - existing.lastAutoGainAt.getTime() < AUTO_GAIN_COOLDOWN_MS) {
    return false;
  }

  await prisma.affinity.upsert({
    where: { guildId_userAId_userBId: { guildId, userAId, userBId } },
    create: { guildId, userAId, userBId, points: AUTO_GAIN_AMOUNT, lastAutoGainAt: new Date() },
    update: { points: { increment: AUTO_GAIN_AMOUNT }, lastAutoGainAt: new Date() },
  });

  return true;
}

/** 指定ユーザーの上位パートランキング(親密度が高い相手順)を取得する。 */
export async function getTopPartners(guildId: string, userId: string, limit = 5) {
  const rows = await prisma.affinity.findMany({
    where: { guildId, OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { points: "desc" },
    take: limit,
  });

  return rows.map((row) => ({
    partnerId: row.userAId === userId ? row.userBId : row.userAId,
    points: row.points,
  }));
}

/** サーバー全体の親密度ペアランキングを取得する。 */
export async function getGuildLeaderboard(guildId: string, limit = 10) {
  return prisma.affinity.findMany({
    where: { guildId },
    orderBy: { points: "desc" },
    take: limit,
  });
}
