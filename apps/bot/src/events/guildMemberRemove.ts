import type { GuildMember, PartialGuildMember } from "discord.js";
import type { NyxClient } from "../client.js";
import { sendLog } from "../utils/logging.js";

export function registerGuildMemberRemoveEvent(client: NyxClient) {
  client.on("guildMemberRemove", async (member: GuildMember | PartialGuildMember) => {
    try {
      const roles = "roles" in member ? member.roles.cache.filter((r) => r.id !== member.guild.id).map((r) => `<@&${r.id}>`) : [];

      await sendLog(
        client,
        member.guild.id,
        "member",
        "Member Left",
        `**User:** <@${member.id}> (\`${member.user.tag}\`)\n**Roles:** ${roles.length > 0 ? roles.join(", ") : "None"}\n**Member count:** \`${member.guild.memberCount}\``,
        "error",
      );
    } catch (error) {
      console.error("[Nyx.] Failed to process guildMemberRemove", error);
    }
  });
}
