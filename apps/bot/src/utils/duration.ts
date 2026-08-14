const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * "10m" / "2h" / "1d" / "30s" 縺ｮ繧医≧縺ｪ蜊倅ｸ縺ｮ謨ｰ蛟､+蜊倅ｽ阪・譁・ｭ怜・繧偵Α繝ｪ遘偵↓螟画鋤縺吶ｋ縲・
 * 荳肴ｭ｣縺ｪ蠖｢蠑上・蝣ｴ蜷医・ null 繧定ｿ斐☆縲・
 */
export function parseDuration(input: string): number | null {
  const match = input.trim().match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!match) return null;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (value <= 0) return null;

  return value * UNIT_MS[unit];
}
