import { MessageFlags, type GuildMember, type PartialGuildMember } from "discord.js";
import { prisma } from "@nyx/database";
import type { NyxClient } from "../client.js";
import { handleMemberJoin } from "../utils/antiraid.js";
import { sendLog } from "../utils/logging.js";
import { buildPanel } from "../utils/embeds.js";

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

      const settings = await prisma.guildSettings.findUnique({ where: { guildId: member.guild.id } });
      if (settings?.welcomeEnabled && settings.welcomeChannelId) {
        const channel = await client.channels.fetch(settings.welcomeChannelId).catch(() => null);
        if (channel && !channel.isDMBased() && channel.isTextBased()) {
          const panel = buildPanel({
            tone: "success",
            title: "Welcome",
            intro: `Welcome to **${member.guild.name}**, <@${member.id}>! We're glad you're here.`,
            creditLine: "Powered by **Nyx.**",
          });
          await channel.send({ components: [panel], flags: MessageFlags.IsComponentsV2 });
        }
      }
    } catch (error) {
      console.error("[Nyx.] Failed to process guildMemberAdd", error);
    }
  });
}
