import { prisma } from "@nyx/database";
export function registerMessageReactionRemoveEvent(client) {
    client.on("messageReactionRemove", async (reaction, user) => {
        try {
            if (user.bot)
                return;
            if (reaction.partial)
                await reaction.fetch().catch(() => null);
            if (!reaction.message.guildId)
                return;
            const emoji = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;
            if (!emoji)
                return;
            const mapping = await prisma.reactionRole.findUnique({
                where: { messageId_emoji: { messageId: reaction.message.id, emoji } },
            });
            if (!mapping)
                return;
            const guild = await client.guilds.fetch(reaction.message.guildId);
            const member = await guild.members.fetch(user.id);
            await member.roles.remove(mapping.roleId).catch((error) => console.error("[Nyx.] Failed to remove reaction role", error));
        }
        catch (error) {
            console.error("[Nyx.] Failed to process messageReactionRemove", error);
        }
    });
}
//# sourceMappingURL=messageReactionRemove.js.map