import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
import { closePoll } from "../utils/poll.js";
export const pollClose = {
    data: new SlashCommandBuilder()
        .setName("poll-close")
        .setDescription("Manually close a poll and show final results.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption((opt) => opt.setName("message_id").setDescription("Poll message ID").setRequired(true)),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const messageId = interaction.options.getString("message_id", true);
        const pollRecord = await prisma.poll.findUnique({ where: { messageId } });
        if (!pollRecord || pollRecord.guildId !== interaction.guildId) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "error", description: "No poll found for that message ID in this server." })],
                ephemeral: true,
            });
            return;
        }
        await closePoll(interaction.client, pollRecord.id);
        await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: "Poll closed." })], ephemeral: true });
    },
};
//# sourceMappingURL=poll-close.js.map