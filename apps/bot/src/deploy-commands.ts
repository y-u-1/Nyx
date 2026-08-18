import "dotenv/config";
import { REST, Routes } from "discord.js";
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
].map((c) => c.data.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

async function main() {
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const devGuildId = process.env.DEV_GUILD_ID;

  if (devGuildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, devGuildId), { body: commands });
    console.log(`[Nyx.] Registered ${commands.length} commands to guild ${devGuildId}`);
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log(`[Nyx.] Registered ${commands.length} global commands`);
  }
}

main().catch(console.error);
