
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.GuildSettingsScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  locale: 'locale',
  automodEnabled: 'automodEnabled',
  logChannelId: 'logChannelId',
  verificationEnabled: 'verificationEnabled',
  verifiedRoleId: 'verifiedRoleId',
  unverifiedRoleId: 'unverifiedRoleId',
  colorSuccess: 'colorSuccess',
  colorWarning: 'colorWarning',
  colorError: 'colorError',
  colorPrimary: 'colorPrimary',
  currencyName: 'currencyName',
  welcomeEnabled: 'welcomeEnabled',
  welcomeChannelId: 'welcomeChannelId',
  leaveEnabled: 'leaveEnabled',
  leaveChannelId: 'leaveChannelId',
  caseCounter: 'caseCounter',
  rulesText: 'rulesText',
  levelingEnabled: 'levelingEnabled',
  xpCooldownSeconds: 'xpCooldownSeconds',
  xpMin: 'xpMin',
  xpMax: 'xpMax',
  voiceXpEnabled: 'voiceXpEnabled',
  voiceXpAmount: 'voiceXpAmount',
  voiceXpIntervalMinutes: 'voiceXpIntervalMinutes',
  voiceXpIgnoreAfk: 'voiceXpIgnoreAfk',
  voiceXpMinMembers: 'voiceXpMinMembers',
  levelUpNotify: 'levelUpNotify',
  levelUpChannelId: 'levelUpChannelId',
  earthquakeEnabled: 'earthquakeEnabled',
  earthquakeChannelId: 'earthquakeChannelId',
  earthquakeMinScale: 'earthquakeMinScale',
  earthquakeEewEnabled: 'earthquakeEewEnabled',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NoXpChannelScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  channelId: 'channelId'
};

exports.Prisma.LevelRoleRewardScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  level: 'level',
  roleId: 'roleId'
};

exports.Prisma.ShopItemScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  name: 'name',
  price: 'price',
  roleId: 'roleId',
  description: 'description'
};

exports.Prisma.UserLevelScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  userId: 'userId',
  xp: 'xp',
  coins: 'coins',
  level: 'level',
  lastMessageAt: 'lastMessageAt',
  lastDailyAt: 'lastDailyAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WarningScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  userId: 'userId',
  moderatorId: 'moderatorId',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.ModCaseScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  caseNumber: 'caseNumber',
  userId: 'userId',
  moderatorId: 'moderatorId',
  action: 'action',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.VerificationLogScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  userId: 'userId',
  success: 'success',
  ipHash: 'ipHash',
  createdAt: 'createdAt'
};

exports.Prisma.LogSettingsScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  memberLogChannelId: 'memberLogChannelId',
  messageLogChannelId: 'messageLogChannelId',
  vcLogChannelId: 'vcLogChannelId',
  channelLogChannelId: 'channelLogChannelId',
  spamLogChannelId: 'spamLogChannelId',
  moderationLogChannelId: 'moderationLogChannelId',
  ticketLogChannelId: 'ticketLogChannelId',
  redeemLogChannelId: 'redeemLogChannelId'
};

exports.Prisma.ReactionRoleScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  messageId: 'messageId',
  emoji: 'emoji',
  roleId: 'roleId'
};

exports.Prisma.RolePanelScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  channelId: 'channelId',
  messageId: 'messageId',
  title: 'title',
  createdAt: 'createdAt'
};

exports.Prisma.RolePanelRoleScalarFieldEnum = {
  id: 'id',
  panelId: 'panelId',
  roleId: 'roleId',
  label: 'label'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  channelId: 'channelId',
  openerId: 'openerId',
  claimedById: 'claimedById',
  status: 'status',
  createdAt: 'createdAt',
  closedAt: 'closedAt'
};

exports.Prisma.AutoModSettingsScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  bannedWords: 'bannedWords',
  blockInvites: 'blockInvites',
  blockLinks: 'blockLinks',
  maxMentions: 'maxMentions',
  spamMessageThreshold: 'spamMessageThreshold',
  spamWindowSeconds: 'spamWindowSeconds',
  timeoutSeconds: 'timeoutSeconds',
  bypassRoleId: 'bypassRoleId',
  antiRaidEnabled: 'antiRaidEnabled',
  raidJoinThreshold: 'raidJoinThreshold',
  raidJoinWindowSeconds: 'raidJoinWindowSeconds',
  raidAction: 'raidAction',
  minAccountAgeDays: 'minAccountAgeDays'
};

exports.Prisma.TicketSettingsScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  categoryId: 'categoryId',
  staffRoleId: 'staffRoleId',
  panelChannelId: 'panelChannelId',
  ticketCounter: 'ticketCounter'
};

exports.Prisma.GiveawayScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  channelId: 'channelId',
  messageId: 'messageId',
  prize: 'prize',
  winnerCount: 'winnerCount',
  hostId: 'hostId',
  endsAt: 'endsAt',
  ended: 'ended',
  cancelled: 'cancelled',
  requiredRoleId: 'requiredRoleId',
  bonusRoleId: 'bonusRoleId',
  bonusEntries: 'bonusEntries',
  imageUrl: 'imageUrl',
  thumbnailUrl: 'thumbnailUrl',
  description: 'description',
  pingRoleId: 'pingRoleId',
  minAccountAgeDays: 'minAccountAgeDays',
  minLevel: 'minLevel',
  blacklistRoleId: 'blacklistRoleId',
  bypassRoleId: 'bypassRoleId',
  accentColor: 'accentColor',
  endColor: 'endColor',
  winnersRoleId: 'winnersRoleId',
  createMessage: 'createMessage',
  winnersDmMessage: 'winnersDmMessage',
  coinPrize: 'coinPrize',
  dmWinners: 'dmWinners',
  createdAt: 'createdAt'
};

exports.Prisma.GiveawayEntryScalarFieldEnum = {
  id: 'id',
  giveawayId: 'giveawayId',
  userId: 'userId',
  weight: 'weight',
  createdAt: 'createdAt'
};

exports.Prisma.RedeemCodeScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  code: 'code',
  roleId: 'roleId',
  imageUrl: 'imageUrl',
  maxUses: 'maxUses',
  usedCount: 'usedCount',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.RedeemRedemptionScalarFieldEnum = {
  id: 'id',
  redeemCodeId: 'redeemCodeId',
  userId: 'userId',
  redeemedAt: 'redeemedAt'
};

exports.Prisma.BadgeScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  name: 'name',
  emoji: 'emoji',
  description: 'description'
};

exports.Prisma.UserBadgeScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  userId: 'userId',
  badgeId: 'badgeId',
  awardedAt: 'awardedAt'
};

exports.Prisma.PollScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  channelId: 'channelId',
  messageId: 'messageId',
  question: 'question',
  options: 'options',
  closed: 'closed',
  createdAt: 'createdAt'
};

exports.Prisma.PollVoteScalarFieldEnum = {
  id: 'id',
  pollId: 'pollId',
  userId: 'userId',
  optionIndex: 'optionIndex'
};

exports.Prisma.ApplicationTypeScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  name: 'name',
  description: 'description',
  reviewChannelId: 'reviewChannelId',
  questions: 'questions'
};

exports.Prisma.ApplicationSubmissionScalarFieldEnum = {
  id: 'id',
  applicationTypeId: 'applicationTypeId',
  userId: 'userId',
  answers: 'answers',
  createdAt: 'createdAt'
};

exports.Prisma.PartnerScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  name: 'name',
  inviteUrl: 'inviteUrl',
  description: 'description',
  addedAt: 'addedAt'
};

exports.Prisma.GuildTermScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  key: 'key',
  value: 'value'
};

exports.Prisma.PurchaseScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  userId: 'userId',
  itemName: 'itemName',
  price: 'price',
  purchasedAt: 'purchasedAt'
};

exports.Prisma.VouchScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  fromUserId: 'fromUserId',
  toUserId: 'toUserId',
  comment: 'comment',
  createdAt: 'createdAt'
};

exports.Prisma.AffinityScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  userAId: 'userAId',
  userBId: 'userBId',
  points: 'points',
  lastAutoGainAt: 'lastAutoGainAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CitizenScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  userId: 'userId',
  status: 'status',
  requestedRoleId: 'requestedRoleId',
  reason: 'reason',
  citizenNumber: 'citizenNumber',
  appliedAt: 'appliedAt',
  approvedAt: 'approvedAt',
  approvedById: 'approvedById',
  rejectedAt: 'rejectedAt',
  rejectedById: 'rejectedById',
  rejectReason: 'rejectReason'
};

exports.Prisma.ElectionScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  title: 'title',
  roleId: 'roleId',
  channelId: 'channelId',
  status: 'status',
  registrationEndsAt: 'registrationEndsAt',
  votingEndsAt: 'votingEndsAt',
  termDays: 'termDays',
  winnerUserId: 'winnerUserId',
  termEndsAt: 'termEndsAt',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.ElectionCandidateScalarFieldEnum = {
  id: 'id',
  electionId: 'electionId',
  userId: 'userId',
  manifesto: 'manifesto',
  createdAt: 'createdAt'
};

exports.Prisma.ElectionVoteScalarFieldEnum = {
  id: 'id',
  electionId: 'electionId',
  voterId: 'voterId',
  candidateUserId: 'candidateUserId',
  createdAt: 'createdAt'
};

exports.Prisma.MilitaryUnitScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  name: 'name',
  roleId: 'roleId',
  createdAt: 'createdAt'
};

exports.Prisma.MilitaryRankScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  unitId: 'unitId',
  name: 'name',
  order: 'order',
  roleId: 'roleId',
  requiredPoints: 'requiredPoints'
};

exports.Prisma.MilitaryMemberScalarFieldEnum = {
  id: 'id',
  guildId: 'guildId',
  userId: 'userId',
  unitId: 'unitId',
  rankId: 'rankId',
  points: 'points',
  joinedAt: 'joinedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  GuildSettings: 'GuildSettings',
  NoXpChannel: 'NoXpChannel',
  LevelRoleReward: 'LevelRoleReward',
  ShopItem: 'ShopItem',
  UserLevel: 'UserLevel',
  Warning: 'Warning',
  ModCase: 'ModCase',
  VerificationLog: 'VerificationLog',
  LogSettings: 'LogSettings',
  ReactionRole: 'ReactionRole',
  RolePanel: 'RolePanel',
  RolePanelRole: 'RolePanelRole',
  Ticket: 'Ticket',
  AutoModSettings: 'AutoModSettings',
  TicketSettings: 'TicketSettings',
  Giveaway: 'Giveaway',
  GiveawayEntry: 'GiveawayEntry',
  RedeemCode: 'RedeemCode',
  RedeemRedemption: 'RedeemRedemption',
  Badge: 'Badge',
  UserBadge: 'UserBadge',
  Poll: 'Poll',
  PollVote: 'PollVote',
  ApplicationType: 'ApplicationType',
  ApplicationSubmission: 'ApplicationSubmission',
  Partner: 'Partner',
  GuildTerm: 'GuildTerm',
  Purchase: 'Purchase',
  Vouch: 'Vouch',
  Affinity: 'Affinity',
  Citizen: 'Citizen',
  Election: 'Election',
  ElectionCandidate: 'ElectionCandidate',
  ElectionVote: 'ElectionVote',
  MilitaryUnit: 'MilitaryUnit',
  MilitaryRank: 'MilitaryRank',
  MilitaryMember: 'MilitaryMember'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\nyx\\packages\\database\\generated\\client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters"
    ],
    "sourceFilePath": "C:\\nyx\\packages\\database\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../.env",
    "schemaEnvPath": "../../.env"
  },
  "relativePath": "../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// Nyx. - Prisma Schema\n// 設計方針: 全テーブルに guildId を持たせ、サーバーごとにデータを分離する\n\ngenerator client {\n  provider        = \"prisma-client-js\"\n  previewFeatures = [\"driverAdapters\"]\n  output          = \"../generated/client\"\n}\n\ndatasource db {\n  provider  = \"postgresql\"\n  url       = env(\"DATABASE_URL\")\n  directUrl = env(\"DIRECT_URL\")\n}\n\n// ─────────────────────────────\n// サーバー単位の設定(ダッシュボードから編集)\n// ─────────────────────────────\nmodel GuildSettings {\n  id      String @id @default(cuid())\n  guildId String @unique\n  locale  String @default(\"ja\") // \"ja\" | \"en\" (Embed本文の言語。コマンド名は英語固定)\n\n  // モデレーション\n  automodEnabled Boolean @default(true)\n  logChannelId   String?\n\n  // 認証\n  verificationEnabled Boolean @default(false)\n  verifiedRoleId      String?\n  unverifiedRoleId    String?\n\n  // ブランディング(Embed用カラーパレット。16進数カラーコード)\n  colorSuccess String @default(\"#57F287\")\n  colorWarning String @default(\"#FEE75C\")\n  colorError   String @default(\"#ED4245\")\n  colorPrimary String @default(\"#5865F2\")\n\n  // 汎用化(サーバーごとに用語をカスタマイズ)\n  currencyName String @default(\"coins\") // 経済システムの通貨名\n\n  // Welcome/Leaveメッセージ\n  welcomeEnabled   Boolean @default(true)\n  welcomeChannelId String?\n  leaveEnabled     Boolean @default(true)\n  leaveChannelId   String?\n\n  // モデレーション処分履歴(/modlog)のケース番号カウンター\n  caseCounter Int @default(0)\n\n  // サーバールール(/rules で表示)\n  rulesText String?\n\n  // レベル機能(メッセージXP)\n  levelingEnabled   Boolean @default(true)\n  xpCooldownSeconds Int     @default(60) // 連続メッセージでのXP獲得を防ぐクールダウン(0でクールダウンなし)\n  xpMin             Int     @default(15) // 1メッセージあたりの最小XP\n  xpMax             Int     @default(25) // 1メッセージあたりの最大XP\n\n  // レベル機能(ボイスXP)\n  voiceXpEnabled         Boolean @default(false)\n  voiceXpAmount          Int     @default(10) // インターバルごとの付与XP\n  voiceXpIntervalMinutes Int     @default(5)\n  voiceXpIgnoreAfk       Boolean @default(true) // ミュート/スピーカーオフのメンバーを対象外にする\n  voiceXpMinMembers      Int     @default(2) // このボイスチャンネルの人数未満はXP対象外(1人配信対策)\n\n  // レベルアップ通知\n  levelUpNotify    String  @default(\"channel\") // \"channel\" | \"dm\" | \"off\"\n  levelUpChannelId String? // 未設定ならメッセージ送信元チャンネルに通知\n\n  // 地震速報\n  earthquakeEnabled    Boolean @default(false)\n  earthquakeChannelId  String?\n  earthquakeMinScale   Int     @default(30) // 震度x10表記(30=震度3)。これ以上の地震情報のみ通知\n  earthquakeEewEnabled Boolean @default(true) // 緊急地震速報(警報)も通知するか\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\n// レベル機能の対象外にするチャンネル(コマンド専用チャンネルなど)\nmodel NoXpChannel {\n  id        String @id @default(cuid())\n  guildId   String\n  channelId String\n\n  @@unique([guildId, channelId])\n}\n\n// レベル到達時に自動付与するロール(1レベルに複数ロード可)\nmodel LevelRoleReward {\n  id      String @id @default(cuid())\n  guildId String\n  level   Int\n  roleId  String\n\n  @@unique([guildId, level, roleId])\n  @@index([guildId, level])\n}\n\n// ─────────────────────────────\n// レベル / 経済\n// ─────────────────────────────\n\n// 経済システムのショップ(サーバーごとに購入可能なロールを設定)\nmodel ShopItem {\n  id          String  @id @default(cuid())\n  guildId     String\n  name        String\n  price       BigInt\n  roleId      String\n  description String?\n\n  @@unique([guildId, name])\n}\n\nmodel UserLevel {\n  id      String @id @default(cuid())\n  guildId String\n  userId  String\n\n  xp    BigInt @default(0)\n  coins BigInt @default(0)\n  level Int    @default(0)\n\n  lastMessageAt DateTime? // メッセージXPのクールダウン判定に使用\n  lastDailyAt   DateTime? // /daily コマンドのクールダウン判定に使用\n\n  updatedAt DateTime @updatedAt\n\n  @@unique([guildId, userId])\n  @@index([guildId, xp])\n}\n\n// ─────────────────────────────\n// モデレーション(警告履歴)\n// ─────────────────────────────\nmodel Warning {\n  id          String   @id @default(cuid())\n  guildId     String\n  userId      String\n  moderatorId String\n  reason      String\n  createdAt   DateTime @default(now())\n\n  @@index([guildId, userId])\n}\n\n// 全モデレーションアクション(warn/kick/ban/timeout/softban等)を横断する処分履歴(/modlog)\nmodel ModCase {\n  id          String   @id @default(cuid())\n  guildId     String\n  caseNumber  Int\n  userId      String\n  moderatorId String\n  action      String\n  reason      String\n  createdAt   DateTime @default(now())\n\n  @@unique([guildId, caseNumber])\n  @@index([guildId, userId])\n}\n\n// ─────────────────────────────\n// 認証ログ\n// ─────────────────────────────\nmodel VerificationLog {\n  id        String   @id @default(cuid())\n  guildId   String\n  userId    String\n  success   Boolean\n  ipHash    String? // 生IPは保存せずハッシュ化して保存する想定\n  createdAt DateTime @default(now())\n\n  @@index([guildId, userId])\n}\n\n// イベントログ設定(参加/退出・メッセージ編集/削除・ボイス・チャンネル作成/削除)\nmodel LogSettings {\n  id                     String  @id @default(cuid())\n  guildId                String  @unique\n  memberLogChannelId     String? // メンバー参加/退出\n  messageLogChannelId    String? // メッセージ編集/削除\n  vcLogChannelId         String? // ボイスチャンネル参加/退出/移動\n  channelLogChannelId    String? // チャンネル作成/削除\n  spamLogChannelId       String? // AutoMod違反\n  moderationLogChannelId String? // warn/kick/ban/timeout等の処分\n  ticketLogChannelId     String? // チケットの開設/クレーム/クローズ\n  redeemLogChannelId     String? // Redeemコードの作成/使用\n}\n\n// ─────────────────────────────\n// リアクションロール\n// ─────────────────────────────\nmodel ReactionRole {\n  id        String @id @default(cuid())\n  guildId   String\n  messageId String\n  emoji     String\n  roleId    String\n\n  @@unique([messageId, emoji])\n  @@index([guildId])\n}\n\n// ボタン式のロールパネル(認証パネルと同じComponents V2の見た目)\nmodel RolePanel {\n  id        String   @id @default(cuid())\n  guildId   String\n  channelId String\n  messageId String   @unique\n  title     String\n  createdAt DateTime @default(now())\n\n  roles RolePanelRole[]\n}\n\nmodel RolePanelRole {\n  id      String @id @default(cuid())\n  panelId String\n  roleId  String\n  label   String\n\n  panel RolePanel @relation(fields: [panelId], references: [id], onDelete: Cascade)\n\n  @@unique([panelId, roleId])\n}\n\n// ─────────────────────────────\n// チケットシステム\n// ─────────────────────────────\nmodel Ticket {\n  id          String    @id @default(cuid())\n  guildId     String\n  channelId   String    @unique\n  openerId    String\n  claimedById String?\n  status      String    @default(\"open\") // \"open\" | \"claimed\" | \"closed\"\n  createdAt   DateTime  @default(now())\n  closedAt    DateTime?\n\n  @@index([guildId, status])\n}\n\n// AutoMod・アンチレイド設定\nmodel AutoModSettings {\n  id      String @id @default(cuid())\n  guildId String @unique\n\n  // メッセージ系フィルター\n  bannedWords          String[] @default([])\n  blockInvites         Boolean  @default(false)\n  blockLinks           Boolean  @default(false)\n  maxMentions          Int      @default(5) // 0で無効\n  spamMessageThreshold Int      @default(5) // spamWindowSeconds内にこの件数を超えると連投判定\n  spamWindowSeconds    Int      @default(5)\n  timeoutSeconds       Int      @default(600) // 違反時の自動タイムアウト時間\n  bypassRoleId         String? // このロールを持つメンバーはAutoMod対象外(モデレーター等)\n\n  // アンチレイド(参加系)\n  antiRaidEnabled       Boolean @default(false)\n  raidJoinThreshold     Int     @default(10)\n  raidJoinWindowSeconds Int     @default(30)\n  raidAction            String  @default(\"kick\") // \"kick\" | \"ban\" | \"lockdown\"\n  minAccountAgeDays     Int? // 常時有効。未設定なら無効。これより新しいアカウントは参加時に自動キック\n}\n\nmodel TicketSettings {\n  id             String  @id @default(cuid())\n  guildId        String  @unique\n  categoryId     String? // チケットチャンネルを作成するカテゴリ\n  staffRoleId    String? // チケットを見える・対応できるスタッフロール\n  panelChannelId String? // パネルを投稿したチャンネル\n  ticketCounter  Int     @default(0) // チケット連番(ticket-0001 のような命名に使用)\n}\n\n// ─────────────────────────────\n// ギブアウェイ\n// ─────────────────────────────\nmodel Giveaway {\n  id          String   @id @default(cuid())\n  guildId     String\n  channelId   String\n  messageId   String   @unique\n  prize       String\n  winnerCount Int      @default(1)\n  hostId      String\n  endsAt      DateTime\n  ended       Boolean  @default(false)\n  cancelled   Boolean  @default(false)\n\n  // このロールを持つメンバーのみ参加可能(未設定なら誰でも参加可)\n  requiredRoleId String?\n\n  // このロールを持つメンバーはエントリーの重み(当選確率)が上がる\n  bonusRoleId  String?\n  bonusEntries Int     @default(2)\n\n  // 追加オプション(GiveawayBot系の主要機能に相当)\n  imageUrl          String? // パネルに表示する画像\n  thumbnailUrl      String? // パネル右上に表示する小さいサムネイル画像\n  description       String? // 賞品説明・注意書きなど任意の追加テキスト\n  pingRoleId        String? // 開始時・終了時にメンションするロール\n  minAccountAgeDays Int? // これより新しいアカウントは参加不可(荒らし対策)\n  minLevel          Int? // レベルシステム(UserLevel)と連携した参加条件\n  blacklistRoleId   String? // このロールを持つメンバーは参加不可\n  bypassRoleId      String? // このロールを持つメンバーは他の全条件を無視して参加可能(モデレーター用など)\n  accentColor       String? // 開催中パネルのアクセントカラー(16進数、例: \"#5865F2\")\n  endColor          String? // 終了時パネルのアクセントカラー(未指定なら既定の成功色を使用)\n  winnersRoleId     String? // 当選者に自動付与するロール\n  createMessage     String? // 開始時にパネルと一緒に送る追加メッセージ\n  winnersDmMessage  String? // 当選DMのカスタム文面({prize} で賞品名を埋め込み可能)\n  coinPrize         Int? // 当選者に自動付与するコイン数(経済システムと連携)\n  dmWinners         Boolean @default(false) // 当選者にDMでも通知するか\n\n  createdAt DateTime @default(now())\n\n  entries GiveawayEntry[]\n\n  @@index([guildId, ended])\n}\n\nmodel GiveawayEntry {\n  id         String   @id @default(cuid())\n  giveawayId String\n  userId     String\n  // エントリー時点でのボーナスロール保有状況から算出した重み(当選抽選時にこの数だけ枠に入る)\n  weight     Int      @default(1)\n  createdAt  DateTime @default(now())\n\n  giveaway Giveaway @relation(fields: [giveawayId], references: [id], onDelete: Cascade)\n\n  @@unique([giveawayId, userId])\n}\n\n// ─────────────────────────────\n// Redeemシステム(独自仕様)\n// ─────────────────────────────\nmodel RedeemCode {\n  id        String    @id @default(cuid())\n  guildId   String\n  code      String\n  roleId    String?\n  imageUrl  String?\n  maxUses   Int       @default(1)\n  usedCount Int       @default(0)\n  expiresAt DateTime?\n  createdAt DateTime  @default(now())\n\n  redemptions RedeemRedemption[]\n\n  @@unique([guildId, code])\n}\n\nmodel RedeemRedemption {\n  id           String   @id @default(cuid())\n  redeemCodeId String\n  userId       String\n  redeemedAt   DateTime @default(now())\n\n  redeemCode RedeemCode @relation(fields: [redeemCodeId], references: [id], onDelete: Cascade)\n\n  @@unique([redeemCodeId, userId])\n}\n\n// ─────────────────────────────\n// 実績・バッジ\n// ─────────────────────────────\nmodel Badge {\n  id          String  @id @default(cuid())\n  guildId     String\n  name        String\n  emoji       String?\n  description String?\n\n  userBadges UserBadge[]\n\n  @@unique([guildId, name])\n}\n\nmodel UserBadge {\n  id        String   @id @default(cuid())\n  guildId   String\n  userId    String\n  badgeId   String\n  awardedAt DateTime @default(now())\n\n  badge Badge @relation(fields: [badgeId], references: [id], onDelete: Cascade)\n\n  @@unique([guildId, userId, badgeId])\n}\n\n// ─────────────────────────────\n// 投票\n// ─────────────────────────────\nmodel Poll {\n  id        String   @id @default(cuid())\n  guildId   String\n  channelId String\n  messageId String   @unique\n  question  String\n  options   String[]\n  closed    Boolean  @default(false)\n  createdAt DateTime @default(now())\n\n  votes PollVote[]\n}\n\nmodel PollVote {\n  id          String @id @default(cuid())\n  pollId      String\n  userId      String\n  optionIndex Int\n\n  poll Poll @relation(fields: [pollId], references: [id], onDelete: Cascade)\n\n  @@unique([pollId, userId])\n}\n\n// ─────────────────────────────\n// 申請フォーム\n// ─────────────────────────────\nmodel ApplicationType {\n  id              String   @id @default(cuid())\n  guildId         String\n  name            String\n  description     String?\n  reviewChannelId String\n  questions       String[] // 最大5問(Discord Modalの入力欄上限)\n\n  submissions ApplicationSubmission[]\n\n  @@unique([guildId, name])\n}\n\nmodel ApplicationSubmission {\n  id                String   @id @default(cuid())\n  applicationTypeId String\n  userId            String\n  answers           String[]\n  createdAt         DateTime @default(now())\n\n  applicationType ApplicationType @relation(fields: [applicationTypeId], references: [id], onDelete: Cascade)\n}\n\n// ─────────────────────────────\n// パートナー/外交関係\n// ─────────────────────────────\nmodel Partner {\n  id          String   @id @default(cuid())\n  guildId     String\n  name        String\n  inviteUrl   String?\n  description String?\n  addedAt     DateTime @default(now())\n\n  @@unique([guildId, name])\n}\n\n// ─────────────────────────────\n// 汎用化(サーバーごとの用語カスタマイズ)\n// ─────────────────────────────\n// 通貨名(GuildSettings.currencyName)以外の任意の用語を key-value で保持する。\n// 例: key=\"rank_label\" value=\"Rank\" のように、コマンド側で getTerm(guildId, key, default) 経由で参照する。\nmodel GuildTerm {\n  id      String @id @default(cuid())\n  guildId String\n  key     String\n  value   String\n\n  @@unique([guildId, key])\n}\n\n// ─────────────────────────────\n// 経済(購入履歴/持ち物)\n// ─────────────────────────────\nmodel Purchase {\n  id          String   @id @default(cuid())\n  guildId     String\n  userId      String\n  itemName    String\n  price       BigInt\n  purchasedAt DateTime @default(now())\n\n  @@index([guildId, userId])\n}\n\n// ─────────────────────────────\n// 評価/評判(Vouch)\n// ─────────────────────────────\nmodel Vouch {\n  id         String   @id @default(cuid())\n  guildId    String\n  fromUserId String\n  toUserId   String\n  comment    String?\n  createdAt  DateTime @default(now())\n\n  @@index([guildId, toUserId])\n}\n\n// ─────────────────────────────\n// 親密度(Affinity)\n// 2人1組の結婚/パートナー制ではなく、誰とでも個別に育つ累積ポイント制。\n// userAId/userBId は常に文字列比較で小さい方をA、大きい方をBに正規化して格納する\n// (A-BとB-Aで別レコードにならないようにするため)。\n// ─────────────────────────────\nmodel Affinity {\n  id      String @id @default(cuid())\n  guildId String\n  userAId String\n  userBId String\n\n  points Int @default(0)\n\n  // 会話量による自動加算のクールダウン判定用(連投による稼ぎ防止)\n  lastAutoGainAt DateTime?\n\n  updatedAt DateTime @updatedAt\n\n  @@unique([guildId, userAId, userBId])\n  @@index([guildId, userAId])\n  @@index([guildId, userBId])\n}\n\n// ─────────────────────────────\n// 国民登録・パスポート(Citizen)\n// サーバーへの「入国審査」的な申請フロー。\n// 承認されるとcitizenNumber(国民番号)が発行され、指定ロールが付与される。\n// ─────────────────────────────\nmodel Citizen {\n  id      String @id @default(cuid())\n  guildId String\n  userId  String\n\n  status String @default(\"pending\") // \"pending\" | \"approved\" | \"rejected\"\n\n  // 申請時に希望したロール(国籍/身分など)。承認時にこのロールが付与される。\n  requestedRoleId String?\n  reason          String? // 申請理由・自己紹介など(任意)\n\n  citizenNumber Int? // 承認された順番に発行される国民番号(承認まではnull)\n\n  appliedAt    DateTime  @default(now())\n  approvedAt   DateTime?\n  approvedById String?\n  rejectedAt   DateTime?\n  rejectedById String?\n  rejectReason String?\n\n  @@unique([guildId, userId])\n  @@index([guildId, status])\n}\n\n// ─────────────────────────────\n// 選挙・任期制(Election)\n// 立候補登録 → 投票期間 → 自動集計 → 当選者にロール付与 → (任期があれば)自動失効\n// ─────────────────────────────\nmodel Election {\n  id      String @id @default(cuid())\n  guildId String\n\n  title     String // 例: \"国王選挙\"\n  roleId    String // 当選者に付与するロール\n  channelId String // 結果を告知するチャンネル(/election start を実行したチャンネル)\n\n  status String @default(\"registration\") // \"registration\" | \"voting\" | \"ended\" | \"cancelled\"\n\n  registrationEndsAt DateTime\n  votingEndsAt       DateTime\n\n  termDays Int? // 任期(日数)。nullなら無期限\n\n  winnerUserId String?\n  termEndsAt   DateTime?\n\n  createdById String\n  createdAt   DateTime @default(now())\n\n  candidates ElectionCandidate[]\n  votes      ElectionVote[]\n\n  @@index([guildId, status])\n}\n\nmodel ElectionCandidate {\n  id         String   @id @default(cuid())\n  electionId String\n  userId     String\n  manifesto  String?\n  createdAt  DateTime @default(now())\n\n  election Election @relation(fields: [electionId], references: [id], onDelete: Cascade)\n\n  @@unique([electionId, userId])\n}\n\nmodel ElectionVote {\n  id              String   @id @default(cuid())\n  electionId      String\n  voterId         String\n  candidateUserId String\n  createdAt       DateTime @default(now())\n\n  election Election @relation(fields: [electionId], references: [id], onDelete: Cascade)\n\n  @@unique([electionId, voterId])\n  @@index([electionId, candidateUserId])\n}\n\n// ─────────────────────────────\n// 軍事・隊列(Military)\n// 隊列(部隊)への所属と、隊列内での階級・功績ポイントを管理する。\n// ─────────────────────────────\nmodel MilitaryUnit {\n  id        String   @id @default(cuid())\n  guildId   String\n  name      String // 隊列名(例: \"近衛騎士団\")\n  roleId    String? // 所属時に付与するロール\n  createdAt DateTime @default(now())\n\n  ranks   MilitaryRank[]\n  members MilitaryMember[]\n\n  @@unique([guildId, name])\n}\n\nmodel MilitaryRank {\n  id             String  @id @default(cuid())\n  guildId        String\n  unitId         String\n  name           String // 階級名(例: \"少尉\")\n  order          Int // 昇進順(数値が大きいほど上位階級)\n  roleId         String? // 階級ロール\n  requiredPoints Int     @default(0) // この階級に必要な功績ポイントの目安(手動昇進の参考値)\n\n  unit    MilitaryUnit     @relation(fields: [unitId], references: [id], onDelete: Cascade)\n  members MilitaryMember[]\n\n  @@unique([unitId, name])\n  @@index([guildId, unitId])\n}\n\nmodel MilitaryMember {\n  id       String   @id @default(cuid())\n  guildId  String\n  userId   String\n  unitId   String\n  rankId   String?\n  points   Int      @default(0)\n  joinedAt DateTime @default(now())\n\n  unit MilitaryUnit  @relation(fields: [unitId], references: [id], onDelete: Cascade)\n  rank MilitaryRank? @relation(fields: [rankId], references: [id], onDelete: SetNull)\n\n  @@unique([guildId, userId])\n  @@index([guildId, unitId])\n}\n",
  "inlineSchemaHash": "74b7b8dd959e1be718e1a9dfcdeaedfd3f1a6e689b3e8962c705d4b5491c8390",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"GuildSettings\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"locale\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"automodEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"logChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"verificationEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"verifiedRoleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"unverifiedRoleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"colorSuccess\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"colorWarning\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"colorError\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"colorPrimary\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"currencyName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"welcomeEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"welcomeChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"leaveEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"leaveChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"caseCounter\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"rulesText\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"levelingEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"xpCooldownSeconds\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"xpMin\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"xpMax\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"voiceXpEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"voiceXpAmount\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"voiceXpIntervalMinutes\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"voiceXpIgnoreAfk\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"voiceXpMinMembers\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"levelUpNotify\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"levelUpChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"earthquakeEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"earthquakeChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"earthquakeMinScale\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"earthquakeEewEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"NoXpChannel\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"channelId\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"LevelRoleReward\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"level\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"roleId\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"ShopItem\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"price\",\"kind\":\"scalar\",\"type\":\"BigInt\"},{\"name\":\"roleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"UserLevel\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"xp\",\"kind\":\"scalar\",\"type\":\"BigInt\"},{\"name\":\"coins\",\"kind\":\"scalar\",\"type\":\"BigInt\"},{\"name\":\"level\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"lastMessageAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"lastDailyAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Warning\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"moderatorId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"ModCase\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"caseNumber\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"moderatorId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"action\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"VerificationLog\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"success\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"ipHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"LogSettings\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"memberLogChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"messageLogChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"vcLogChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"channelLogChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"spamLogChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"moderationLogChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ticketLogChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"redeemLogChannelId\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"ReactionRole\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"messageId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"emoji\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"roleId\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"RolePanel\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"channelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"messageId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"roles\",\"kind\":\"object\",\"type\":\"RolePanelRole\",\"relationName\":\"RolePanelToRolePanelRole\"}],\"dbName\":null},\"RolePanelRole\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"panelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"roleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"label\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"panel\",\"kind\":\"object\",\"type\":\"RolePanel\",\"relationName\":\"RolePanelToRolePanelRole\"}],\"dbName\":null},\"Ticket\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"channelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"openerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"claimedById\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"closedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"AutoModSettings\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bannedWords\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"blockInvites\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"blockLinks\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"maxMentions\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"spamMessageThreshold\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"spamWindowSeconds\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"timeoutSeconds\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"bypassRoleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"antiRaidEnabled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"raidJoinThreshold\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"raidJoinWindowSeconds\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"raidAction\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"minAccountAgeDays\",\"kind\":\"scalar\",\"type\":\"Int\"}],\"dbName\":null},\"TicketSettings\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"categoryId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"staffRoleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"panelChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ticketCounter\",\"kind\":\"scalar\",\"type\":\"Int\"}],\"dbName\":null},\"Giveaway\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"channelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"messageId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"prize\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"winnerCount\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"hostId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"endsAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"ended\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"cancelled\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"requiredRoleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bonusRoleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bonusEntries\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"imageUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"thumbnailUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"pingRoleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"minAccountAgeDays\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"minLevel\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"blacklistRoleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"bypassRoleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accentColor\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"endColor\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"winnersRoleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createMessage\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"winnersDmMessage\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"coinPrize\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"dmWinners\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"entries\",\"kind\":\"object\",\"type\":\"GiveawayEntry\",\"relationName\":\"GiveawayToGiveawayEntry\"}],\"dbName\":null},\"GiveawayEntry\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"giveawayId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"weight\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"giveaway\",\"kind\":\"object\",\"type\":\"Giveaway\",\"relationName\":\"GiveawayToGiveawayEntry\"}],\"dbName\":null},\"RedeemCode\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"code\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"roleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"imageUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"maxUses\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"usedCount\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"redemptions\",\"kind\":\"object\",\"type\":\"RedeemRedemption\",\"relationName\":\"RedeemCodeToRedeemRedemption\"}],\"dbName\":null},\"RedeemRedemption\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"redeemCodeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"redeemedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"redeemCode\",\"kind\":\"object\",\"type\":\"RedeemCode\",\"relationName\":\"RedeemCodeToRedeemRedemption\"}],\"dbName\":null},\"Badge\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"emoji\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userBadges\",\"kind\":\"object\",\"type\":\"UserBadge\",\"relationName\":\"BadgeToUserBadge\"}],\"dbName\":null},\"UserBadge\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"badgeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"awardedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"badge\",\"kind\":\"object\",\"type\":\"Badge\",\"relationName\":\"BadgeToUserBadge\"}],\"dbName\":null},\"Poll\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"channelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"messageId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"question\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"options\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"closed\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"votes\",\"kind\":\"object\",\"type\":\"PollVote\",\"relationName\":\"PollToPollVote\"}],\"dbName\":null},\"PollVote\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"pollId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"optionIndex\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"poll\",\"kind\":\"object\",\"type\":\"Poll\",\"relationName\":\"PollToPollVote\"}],\"dbName\":null},\"ApplicationType\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reviewChannelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"questions\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"submissions\",\"kind\":\"object\",\"type\":\"ApplicationSubmission\",\"relationName\":\"ApplicationSubmissionToApplicationType\"}],\"dbName\":null},\"ApplicationSubmission\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"applicationTypeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"answers\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"applicationType\",\"kind\":\"object\",\"type\":\"ApplicationType\",\"relationName\":\"ApplicationSubmissionToApplicationType\"}],\"dbName\":null},\"Partner\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"inviteUrl\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"addedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"GuildTerm\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"key\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"value\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"Purchase\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"itemName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"price\",\"kind\":\"scalar\",\"type\":\"BigInt\"},{\"name\":\"purchasedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Vouch\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fromUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"toUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"comment\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Affinity\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userAId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userBId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"points\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"lastAutoGainAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Citizen\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"requestedRoleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"citizenNumber\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"appliedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"approvedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"approvedById\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"rejectedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"rejectedById\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"rejectReason\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"Election\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"roleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"channelId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"registrationEndsAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"votingEndsAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"termDays\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"winnerUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"termEndsAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdById\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"candidates\",\"kind\":\"object\",\"type\":\"ElectionCandidate\",\"relationName\":\"ElectionToElectionCandidate\"},{\"name\":\"votes\",\"kind\":\"object\",\"type\":\"ElectionVote\",\"relationName\":\"ElectionToElectionVote\"}],\"dbName\":null},\"ElectionCandidate\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"electionId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"manifesto\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"election\",\"kind\":\"object\",\"type\":\"Election\",\"relationName\":\"ElectionToElectionCandidate\"}],\"dbName\":null},\"ElectionVote\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"electionId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"voterId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"candidateUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"election\",\"kind\":\"object\",\"type\":\"Election\",\"relationName\":\"ElectionToElectionVote\"}],\"dbName\":null},\"MilitaryUnit\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"roleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"ranks\",\"kind\":\"object\",\"type\":\"MilitaryRank\",\"relationName\":\"MilitaryRankToMilitaryUnit\"},{\"name\":\"members\",\"kind\":\"object\",\"type\":\"MilitaryMember\",\"relationName\":\"MilitaryMemberToMilitaryUnit\"}],\"dbName\":null},\"MilitaryRank\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"unitId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"order\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"roleId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"requiredPoints\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"unit\",\"kind\":\"object\",\"type\":\"MilitaryUnit\",\"relationName\":\"MilitaryRankToMilitaryUnit\"},{\"name\":\"members\",\"kind\":\"object\",\"type\":\"MilitaryMember\",\"relationName\":\"MilitaryMemberToMilitaryRank\"}],\"dbName\":null},\"MilitaryMember\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"guildId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"unitId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"rankId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"points\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"joinedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"unit\",\"kind\":\"object\",\"type\":\"MilitaryUnit\",\"relationName\":\"MilitaryMemberToMilitaryUnit\"},{\"name\":\"rank\",\"kind\":\"object\",\"type\":\"MilitaryRank\",\"relationName\":\"MilitaryMemberToMilitaryRank\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

