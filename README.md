# Nyx.

多機能 Discord Bot モノレポ。discord.js v14 + Prisma + PostgreSQL(Neon想定)+ Next.js ダッシュボード。

## 構成

```
nyx/
├── apps/
│   ├── bot/              # Discord Bot本体 (discord.js v14)
│   └── dashboard/        # Webダッシュボード (Next.js)
├── packages/
│   ├── database/         # Prismaスキーマ・クライアント(Bot/Dashboard共有)
│   ├── locales/          # 日本語/英語 辞書(Bot/Dashboard共有)
│   └── config/           # 共通tsconfig
```

## セットアップ

```bash
pnpm install

# packages/database/.env に DATABASE_URL を設定してから
pnpm db:generate
pnpm db:push

# apps/bot/.env に DISCORD_TOKEN 等を設定してから
pnpm bot:deploy-commands   # スラッシュコマンド登録
pnpm bot:dev

# apps/dashboard/.env を設定してから
pnpm dashboard:dev
```

## 設計方針

- 全テーブルは `guildId` を持ち、サーバーごとにデータを分離する
- Bot応答はすべて Embed。絵文字(Unicode)は使わず、見出し(`###`)・引用(`>`)・インラインコードでレイアウトする。将来的にカスタムGIF絵文字を導入予定
- 多言語対応(日本語/英語)は `GuildSettings.locale` で管理し、ダッシュボードから変更可能。スラッシュコマンド名自体は英語固定
- 音楽再生は discord-player を使用(Lavalinkサーバーの別途ホスティング不要)
