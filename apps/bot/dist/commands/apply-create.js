import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const applyCreate = {
    data: new SlashCommandBuilder()
        .setName("apply-create")
        .setDescription("Create an application type (e.g. Staff Application).")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption((opt) => opt.setName("name").setDescription("Application name, e.g. Staff Application").setRequired(true))
        .addChannelOption((opt) => opt.setName("review_channel").setDescription("Channel where submissions are posted").setRequired(true))
        .addStringOption((opt) => opt.setName("question1").setDescription("Question 1").setRequired(true))
        .addStringOption((opt) => opt.setName("question2").setDescription("Question 2"))
        .addStringOption((opt) => opt.setName("question3").setDescription("Question 3"))
        .addStringOption((opt) => opt.setName("question4").setDescription("Question 4"))
        .addStringOption((opt) => opt.setName("question5").setDescription("Question 5"))
        .addStringOption((opt) => opt.setName("description").setDescription("Short description of this application")),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const name = interaction.options.getString("name", true);
        const reviewChannel = interaction.options.getChannel("review_channel", true);
        const description = interaction.options.getString("description");
        const questions = [1, 2, 3, 4, 5]
            .map((n) => interaction.options.getString(`question${n}`))
            .filter((q) => Boolean(q));
        await prisma.applicationType.upsert({
            where: { guildId_name: { guildId: interaction.guildId, name } },
            create: { guildId: interaction.guildId, name, description, reviewChannelId: reviewChannel.id, questions },
            update: { description, reviewChannelId: reviewChannel.id, questions },
        });
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `Created application **${name}**. Members can apply with \`/apply name:${name}\`.` })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=apply-create.js.map