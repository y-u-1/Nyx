import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const reputation = {
    data: new SlashCommandBuilder()
        .setName("reputation")
        .setDescription("Show a member's vouch count and recent comments.")
        .addUserOption((opt) => opt.setName("user").setDescription("Member to check (default: you)")),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const target = interaction.options.getUser("user") ?? interaction.user;
        const vouches = await prisma.vouch.findMany({
            where: { guildId: interaction.guildId, toUserId: target.id },
            orderBy: { createdAt: "desc" },
        });
        if (vouches.length === 0) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: `${target} has no vouches yet.` })] });
            return;
        }
        const recentLines = vouches
            .slice(0, 5)
            .map((v) => `<@${v.fromUserId}>${v.comment ? `: ${v.comment}` : ""}`);
        await interaction.reply({
            embeds: [
                baseEmbed({
                    tone: "primary",
                    title: `${target.username}'s Reputation`,
                    description: `**Total vouches:** \`${vouches.length}\`\n\n${recentLines.join("\n")}`,
                }),
            ],
        });
    },
};
//# sourceMappingURL=reputation.js.map