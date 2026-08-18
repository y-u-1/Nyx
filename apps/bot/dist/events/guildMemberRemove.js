import { MessageFlags } from "discord.js";
import { prisma } from "@nyx/database";
import { sendLog } from "../utils/logging.js";
import { buildPanel } from "../utils/embeds.js";
export function registerGuildMemberRemoveEvent(client) {
    client.on("guildMemberRemove", async (member) => {
        try {
            const roles = "roles" in member ? member.roles.cache.filter((r) => r.id !== member.guild.id).map((r) => `<@&${r.id}>`) : [];
            await sendLog(client, member.guild.id, "member", "Member Left", `**User:** <@${member.id}> (\`${member.user.tag}\`)\n**Roles:** ${roles.length > 0 ? roles.join(", ") : "None"}\n**Member count:** \`${member.guild.memberCount}\``, "error");
            const settings = await prisma.guildSettings.findUnique({ where: { guildId: member.guild.id } });
            if (settings?.leaveEnabled && settings.leaveChannelId) {
                const channel = await client.channels.fetch(settings.leaveChannelId).catch(() => null);
                if (channel && !channel.isDMBased() && channel.isTextBased()) {
                    const panel = buildPanel({
                        tone: "error",
                        title: "Goodbye",
                        intro: `**${member.user.tag}** has left the server.`,
                        creditLine: "Powered by **Nyx.**",
                    });
                    await channel.send({ components: [panel], flags: MessageFlags.IsComponentsV2 });
                }
            }
        }
        catch (error) {
            console.error("[Nyx.] Failed to process guildMemberRemove", error);
        }
    });
}
//# sourceMappingURL=guildMemberRemove.js.map