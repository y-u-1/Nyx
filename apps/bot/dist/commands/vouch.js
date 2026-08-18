import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const vouch = {
    data: new SlashCommandBuilder()
        .setName("vouch")
        .setDescription("Vouch for a member.")
        .addUserOption((opt) => opt.setName("user").setDescription("Member to vouch for").setRequired(true))
        .addStringOption((opt) => opt.setName("comment").setDescription("Optional comment")),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const target = interaction.options.getUser("user", true);
        const comment = interaction.options.getString("comment");
        if (target.id === interaction.user.id) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "You can't vouch for yourself." })], ephemeral: true });
            return;
        }
        await prisma.vouch.create({
            data: { guildId: interaction.guildId, fromUserId: interaction.user.id, toUserId: target.id, comment },
        });
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `Vouched for ${target}.` })],
        });
    },
};
//# sourceMappingURL=vouch.js.map