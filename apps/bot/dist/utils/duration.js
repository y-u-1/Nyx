const UNIT_MS = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
};
/** parseDuration が受け付ける最大の長さ(10年)。異常に巨大な入力による Date/setTimeout の破綻を防ぐための安全上限。 */
export const MAX_DURATION_MS = 10 * 365 * 24 * 60 * 60 * 1000;
/**
 * "10m" / "2h" / "1d" / "30s" のような単一の数値+単位の文字列をミリ秒に変換する。
 * 不正な形式・0以下・MAX_DURATION_MS超え・非有限値(Infinityなど)の場合は null を返す。
 */
export function parseDuration(input) {
    const match = input.trim().match(/^(\d+)\s*(s|m|h|d)$/i);
    if (!match)
        return null;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (!Number.isFinite(value) || value <= 0)
        return null;
    const ms = value * UNIT_MS[unit];
    if (!Number.isFinite(ms) || ms > MAX_DURATION_MS)
        return null;
    return ms;
}
/** Node.js の setTimeout は内部で32bit符号付き整数(最大約24.8日)しかdelayに扱えない。
 * これを超える値を渡すと即座に発火してしまう(TimeoutOverflowWarning)ため、
 * ギブアウェイやアンケートの終了時刻など長期間の待機はこのヘルパーを必ず経由すること。
 */
const MAX_SAFE_TIMEOUT_MS = 2 ** 31 - 1;
/** delayMs がどれだけ大きくても正しく待機できる setTimeout ラッパー。
 * MAX_SAFE_TIMEOUT_MS を超える場合は内部でタイマーを繋ぎ直して残り時間を待つ。
 */
export function safeSetTimeout(callback, delayMs) {
    let cancelled = false;
    let handle;
    const arm = (remaining) => {
        if (remaining > MAX_SAFE_TIMEOUT_MS) {
            handle = setTimeout(() => arm(remaining - MAX_SAFE_TIMEOUT_MS), MAX_SAFE_TIMEOUT_MS);
        }
        else {
            handle = setTimeout(() => {
                if (!cancelled)
                    callback();
            }, Math.max(0, remaining));
        }
    };
    arm(delayMs);
    return {
        cancel: () => {
            cancelled = true;
            clearTimeout(handle);
        },
    };
}
//# sourceMappingURL=duration.js.map