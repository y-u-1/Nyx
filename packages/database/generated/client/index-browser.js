
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
