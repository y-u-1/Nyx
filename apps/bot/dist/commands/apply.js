import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const apply = {
    data: new SlashCommandBuilder()
        .setName("apply")
        .setDescription("Submit an application.")
        .addStringOption((opt) => opt.setName("name").setDescription("Application name").setRequired(true)),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const name = interaction.options.getString("name", true);
        const applicationType = await prisma.applicationType.findUnique({ where: { guildId_name: { guildId: interaction.guildId, name } } });
        if (!applicationType) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "error", description: "No application found with that name." })],
                ephemeral: true,
            });
            return;
        }
        const modal = new ModalBuilder().setCustomId(`apply:submit:${applicationType.id}`).setTitle(applicationType.name.slice(0, 45));
        applicationType.questions.forEach((question, i) => {
            const input = new TextInputBuilder()
                .setCustomId(`q${i}`)
                .setLabel(question.slice(0, 45))
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
        });
        await interaction.showModal(modal);
    },
};
//# sourceMappingURL=apply.js.map