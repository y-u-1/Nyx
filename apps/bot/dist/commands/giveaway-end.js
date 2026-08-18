import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
import { endGiveaway } from "../utils/giveaway.js";
export const giveawayEnd = {
    data: new SlashCommandBuilder()
        .setName("giveaway-end")
        .setDescription("End a giveaway early and pick winners now.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption((opt) => opt.setName("message_id").setDescription("Message ID of the giveaway panel").setRequired(true)),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const messageId = interaction.options.getString("message_id", true);
        const giveaway = await prisma.giveaway.findUnique({ where: { messageId } });
        if (!giveaway || giveaway.guildId !== interaction.guildId || giveaway.ended || giveaway.cancelled) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "error", description: "No active giveaway found for that message ID in this server." })],
                ephemeral: true,
            });
            return;
        }
        await endGiveaway(interaction.client, giveaway.id);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: "Giveaway ended and winners announced." })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=giveaway-end.js.map