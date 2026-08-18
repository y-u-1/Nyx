import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const clearWarnings = {
    data: new SlashCommandBuilder()
        .setName("clear-warnings")
        .setDescription("Clear a member's warning history.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption((opt) => opt.setName("user").setDescription("Member to clear warnings for").setRequired(true)),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const target = interaction.options.getUser("user", true);
        const { count } = await prisma.warning.deleteMany({
            where: { guildId: interaction.guildId, userId: target.id },
        });
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `Cleared \`${count}\` warning(s) for ${target}.` })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=clear-warnings.js.map