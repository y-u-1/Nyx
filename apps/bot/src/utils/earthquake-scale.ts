/**
 * P2P地震情報APIの震度表現(10倍値、-1=不明)を日本語表記・色に変換するユーティリティ。
 * 例: 10=震度1, 45=震度5弱, 50=震度5強, 70=震度7
 */
export function scaleToKanji(scale: number): string {
  const table: Record<number, string> = {
    "-1": "不明",
    10: "震度1",
    20: "震度2",
    30: "震度3",
    40: "震度4",
    45: "震度5弱",
    50: "震度5強",
    55: "震度6弱",
    60: "震度6強",
    70: "震度7",
  };
  return table[scale] ?? `震度不明(${scale})`;
}

/** 震度に応じたマップ表示用の色(震度が高いほど赤く) */
export function scaleToColor(scale: number): string {
  if (scale >= 60) return "#8b0000"; // 震度6強以上
  if (scale >= 50) return "#d7263d"; // 震度5強〜6弱
  if (scale >= 40) return "#f46036"; // 震度4〜5弱
  if (scale >= 30) return "#f6c445"; // 震度3
  if (scale >= 10) return "#8fd694"; // 震度1〜2
  return "#5a5a5f"; // 不明・震度0
}

/** パネルのアクセントカラー(最大震度がEmbedの色になる) */
export function scaleToAccentColor(scale: number): number {
  return parseInt(scaleToColor(scale).replace("#", ""), 16);
}
