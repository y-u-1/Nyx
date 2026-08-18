import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const rules = {
    data: new SlashCommandBuilder()
        .setName("rules")
        .setDescription("Show or set the server rules.")
        .addSubcommand((sub) => sub.setName("show").setDescription("Show the server rules"))
        .addSubcommand((sub) => sub
        .setName("set")
        .setDescription("Set the server rules (admin)")
        .addStringOption((opt) => opt.setName("text").setDescription("Rules text").setRequired(true))),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "set") {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
                await interaction.reply({
                    embeds: [baseEmbed({ tone: "error", description: "You need the Manage Server permission to do that." })],
                    ephemeral: true,
                });
                return;
            }
            const text = interaction.options.getString("text", true);
            await prisma.guildSettings.upsert({
                where: { guildId: interaction.guildId },
                create: { guildId: interaction.guildId, rulesText: text },
                update: { rulesText: text },
            });
            await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: "Rules updated." })], ephemeral: true });
            return;
        }
        const settings = await prisma.guildSettings.findUnique({ where: { guildId: interaction.guildId } });
        if (!settings?.rulesText) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "primary", description: "No rules have been set for this server yet." })],
            });
            return;
        }
        await interaction.reply({
            embeds: [baseEmbed({ tone: "primary", title: "Server Rules", description: settings.rulesText })],
        });
    },
};
//# sourceMappingURL=rules.js.map