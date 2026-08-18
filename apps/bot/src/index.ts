import "dotenv/config";
import { createClient } from "./client.js";
import { startHealthServer } from "./health.js";
import { registerReadyEvent } from "./events/ready.js";
import { registerInteractionCreateEvent } from "./events/interactionCreate.js";
import { registerMessageCreateEvent } from "./events/messageCreate.js";
import { registerGuildMemberAddEvent } from "./events/guildMemberAdd.js";
import { registerGuildMemberRemoveEvent } from "./events/guildMemberRemove.js";
import { registerGuildMemberUpdateEvent } from "./events/guildMemberUpdate.js";
import { registerUserUpdateEvent } from "./events/userUpdate.js";
import { registerMessageDeleteEvent } from "./events/messageDelete.js";
import { registerMessageUpdateEvent } from "./events/messageUpdate.js";
import { registerVoiceStateUpdateEvent } from "./events/voiceStateUpdate.js";
import { registerChannelCreateEvent } from "./events/channelCreate.js";
import { registerChannelDeleteEvent } from "./events/channelDelete.js";
import { registerMessageReactionAddEvent } from "./events/messageReactionAdd.js";
import { registerMessageReactionRemoveEvent } from "./events/messageReactionRemove.js";
import { ping } from "./commands/ping.js";
import { verifyPanel } from "./commands/verify-panel.js";
import { giveawayStart } from "./commands/giveaway-start.js";
import { giveawayReroll } from "./commands/giveaway-reroll.js";
import { giveawayList } from "./commands/giveaway-list.js";
import { giveawayEnd } from "./commands/giveaway-end.js";
import { giveawayCancel } from "./commands/giveaway-cancel.js";
import { giveawayEdit } from "./commands/giveaway-edit.js";
import { rank } from "./commands/rank.js";
import { leaderboard } from "./commands/leaderboard.js";
import { levelConfig } from "./commands/level-config.js";
import { levelRole } from "./commands/level-role.js";
import { levelNoXp } from "./commands/level-noxp.js";
import { ticket } from "./commands/ticket.js";
import { automodConfig } from "./commands/automod-config.js";
import { automodWords } from "./commands/automod-words.js";
import { warn } from "./commands/warn.js";
import { warnings } from "./commands/warnings.js";
import { kick } from "./commands/kick.js";
import { ban } from "./commands/ban.js";
import { timeout } from "./commands/timeout.js";
import { purge } from "./commands/purge.js";
import { reactionRole } from "./commands/reaction-role.js";
import { balance } from "./commands/balance.js";
import { daily } from "./commands/daily.js";
import { pay } from "./commands/pay.js";
import { shop } from "./commands/shop.js";
import { redeemCreate } from "./commands/redeem-create.js";
import { redeem } from "./commands/redeem.js";
import { redeemList } from "./commands/redeem-list.js";
import { rolePanel } from "./commands/role-panel.js";
import { xp } from "./commands/xp.js";
import { coin } from "./commands/coin.js";
import { profile } from "./commands/profile.js";
import { badge } from "./commands/badge.js";
import { announce } from "./commands/announce.js";
import { serverinfo } from "./commands/serverinfo.js";
import { avatar } from "./commands/avatar.js";
import { banner } from "./commands/banner.js";
import { userinfo } from "./commands/userinfo.js";
import { roles } from "./commands/roles.js";
import { poll } from "./commands/poll.js";
import { pollClose } from "./commands/poll-close.js";
import { rules } from "./commands/rules.js";
import { applyCreate } from "./commands/apply-create.js";
import { apply } from "./commands/apply.js";
import { partner } from "./commands/partner.js";
import { config } from "./commands/config.js";
import { softban } from "./commands/softban.js";
import { lock } from "./commands/lock.js";
import { unlock } from "./commands/unlock.js";
import { slowmode } from "./commands/slowmode.js";
import { modlog } from "./commands/modlog.js";
import { logsConfig } from "./commands/logs-config.js";
import { earthquakeConfig } from "./commands/earthquake-config.js";
import { inventory } from "./commands/inventory.js";
import { vouch } from "./commands/vouch.js";
import { reputation } from "./commands/reputation.js";
import { welcomeConfig } from "./commands/welcome-config.js";
import { giveawayEntrants } from "./commands/giveaway-entrants.js";
import { level } from "./commands/level.js";
import { unban } from "./commands/unban.js";
import { clearWarnings } from "./commands/clear-warnings.js";
import { help } from "./commands/help.js";
import { affinity } from "./commands/affinity.js";
import { hug } from "./commands/hug.js";
import { pat } from "./commands/pat.js";
import { citizen } from "./commands/citizen.js";
import { election } from "./commands/election.js";
import { military } from "./commands/military.js";
import { requeueGiveaways } from "./utils/giveaway.js";
import { startVoiceXpTracker } from "./utils/voiceXp.js";
import { startEarthquakeListener } from "./utils/earthquake.js";

const client = createClient();

// コマンド登録(手動マップ。数が増えたらディレクトリ自動読み込みに切り替える)
const commands = [
  ping,
  verifyPanel,
  giveawayStart,
  giveawayReroll,
  giveawayList,
  giveawayEnd,
  giveawayCancel,
  giveawayEdit,
  rank,
  leaderboard,
  levelConfig,
  levelRole,
  levelNoXp,
  ticket,
  automodConfig,
  automodWords,
  warn,
  warnings,
  kick,
  ban,
  timeout,
  purge,
  reactionRole,
  balance,
  daily,
  pay,
  shop,
  redeemCreate,
  redeem,
  redeemList,
  rolePanel,
  xp,
  coin,
  profile,
  badge,
  announce,
  serverinfo,
  avatar,
  banner,
  userinfo,
  roles,
  poll,
  pollClose,
  rules,
  applyCreate,
  apply,
  partner,
  config,
  softban,
  lock,
  unlock,
  slowmode,
  modlog,
  logsConfig,
  earthquakeConfig,
  inventory,
  vouch,
  reputation,
  welcomeConfig,
  giveawayEntrants,
  level,
  unban,
  clearWarnings,
  help,
  affinity,
  hug,
  pat,
  citizen,
  election,
  military,
];
for (const command of commands) {
  client.commands.set(command.data.name, command);
}

registerReadyEvent(client);
registerInteractionCreateEvent(client);
registerMessageCreateEvent(client);
registerGuildMemberAddEvent(client);
registerGuildMemberRemoveEvent(client);
registerGuildMemberUpdateEvent(client);
registerUserUpdateEvent(client);
registerMessageDeleteEvent(client);
registerMessageUpdateEvent(client);
registerVoiceStateUpdateEvent(client);
registerChannelCreateEvent(client);
registerChannelDeleteEvent(client);
registerMessageReactionAddEvent(client);
registerMessageReactionRemoveEvent(client);

client.once("ready", () => {
  requeueGiveaways(client).catch((error) => console.error("[Nyx.] Failed to requeue giveaways", error));
  startVoiceXpTracker(client);
  startEarthquakeListener(client);
});

startHealthServer();

client.login(process.env.DISCORD_TOKEN);
