import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const warnings = {
    data: new SlashCommandBuilder()
        .setName("warnings")
        .setDescription("Show a member's warning history.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((opt) => opt.setName("user").setDescription("Member to check").setRequired(true)),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const target = interaction.options.getUser("user", true);
        const records = await prisma.warning.findMany({
            where: { guildId: interaction.guildId, userId: target.id },
            orderBy: { createdAt: "desc" },
            take: 15,
        });
        if (records.length === 0) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "primary", description: `${target} has no warnings.` })],
                ephemeral: true,
            });
            return;
        }
        const lines = records.map((w, i) => `\`${i + 1}\` ${w.reason} — <@${w.moderatorId}> — <t:${Math.floor(w.createdAt.getTime() / 1000)}:R>`);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "primary", description: `**${target.username}'s warnings (${records.length})**\n\n${lines.join("\n")}` })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=warnings.js.map