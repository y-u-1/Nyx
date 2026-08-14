import type { GuildMember, PartialGuildMember } from "discord.js";
import type { NyxClient } from "../client.js";
import { handleMemberJoin } from "../utils/antiraid.js";
import { sendLog } from "../utils/logging.js";

export function registerGuildMemberAddEvent(client: NyxClient) {
  client.on("guildMemberAdd", async (member: GuildMember | PartialGuildMember) => {
    try {
      await handleMemberJoin(member as GuildMember);

      const accountCreatedUnix = Math.floor(member.user.createdTimestamp / 1000);
      await sendLog(
        client,
        member.guild.id,
        "member",
        "Member Joined",
        `**User:** <@${member.id}> (\`${member.user.tag}\`)\n**Account created:** <t:${accountCreatedUnix}:R>\n**Member count:** \`${member.guild.memberCount}\``,
        "success",
      );
    } catch (error) {
      console.error("[Nyx.] Failed to process guildMemberAdd", error);
    }
  });
}
