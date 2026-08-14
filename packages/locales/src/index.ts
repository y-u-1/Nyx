import ja from "./ja.json";
import en from "./en.json";

export type Locale = "ja" | "en";

const dictionaries: Record<Locale, Record<string, string>> = { ja, en };

/**
 * 翻訳ヘルパー。
 * Bot・ダッシュボード双方から同じ辞書を参照する。
 *
 * @example
 * t("ja", "verify.title") // -> "Nyx. Verification"
 * t("en", "level.rank", { rank: "3" }) // -> "{rank} 部分を置換"
 */
export function t(locale: Locale, key: string, vars: Record<string, string | number> = {}): string {
  const dict = dictionaries[locale] ?? dictionaries.ja;
  let str = dict[key] ?? key;

  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, String(v));
  }

  return str;
}

export { ja, en };
