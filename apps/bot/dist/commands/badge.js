import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const badge = {
    data: new SlashCommandBuilder()
        .setName("badge")
        .setDescription("Manage achievement badges.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((sub) => sub
        .setName("create")
        .setDescription("Create a new badge")
        .addStringOption((opt) => opt.setName("name").setDescription("Badge name").setRequired(true))
        .addStringOption((opt) => opt.setName("emoji").setDescription("Emoji representing the badge"))
        .addStringOption((opt) => opt.setName("description").setDescription("Badge description")))
        .addSubcommand((sub) => sub
        .setName("award")
        .setDescription("Award a badge to a member")
        .addUserOption((opt) => opt.setName("user").setDescription("Member to award").setRequired(true))
        .addStringOption((opt) => opt.setName("name").setDescription("Badge name").setRequired(true)))
        .addSubcommand((sub) => sub
        .setName("revoke")
        .setDescription("Revoke a badge from a member")
        .addUserOption((opt) => opt.setName("user").setDescription("Member to revoke from").setRequired(true))
        .addStringOption((opt) => opt.setName("name").setDescription("Badge name").setRequired(true)))
        .addSubcommand((sub) => sub.setName("list").setDescription("List all badges in this server")),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "create") {
            const name = interaction.options.getString("name", true);
            const emoji = interaction.options.getString("emoji");
            const description = interaction.options.getString("description");
            await prisma.badge.upsert({
                where: { guildId_name: { guildId: interaction.guildId, name } },
                create: { guildId: interaction.guildId, name, emoji, description },
                update: { emoji, description },
            });
            await interaction.reply({
                embeds: [baseEmbed({ tone: "success", description: `Created badge **${name}**.` })],
                ephemeral: true,
            });
            return;
        }
        if (subcommand === "award" || subcommand === "revoke") {
            const target = interaction.options.getUser("user", true);
            const name = interaction.options.getString("name", true);
            const badgeRecord = await prisma.badge.findUnique({ where: { guildId_name: { guildId: interaction.guildId, name } } });
            if (!badgeRecord) {
                await interaction.reply({
                    embeds: [baseEmbed({ tone: "error", description: "That badge doesn't exist." })],
                    ephemeral: true,
                });
                return;
            }
            if (subcommand === "award") {
                await prisma.userBadge
                    .create({ data: { guildId: interaction.guildId, userId: target.id, badgeId: badgeRecord.id } })
                    .catch(() => null);
                await interaction.reply({
                    embeds: [baseEmbed({ tone: "success", description: `Awarded **${name}** to ${target}.` })],
                    ephemeral: true,
                });
                return;
            }
            await prisma.userBadge
                .delete({ where: { guildId_userId_badgeId: { guildId: interaction.guildId, userId: target.id, badgeId: badgeRecord.id } } })
                .catch(() => null);
            await interaction.reply({
                embeds: [baseEmbed({ tone: "success", description: `Revoked **${name}** from ${target}.` })],
                ephemeral: true,
            });
            return;
        }
        // list
        const badges = await prisma.badge.findMany({ where: { guildId: interaction.guildId } });
        if (badges.length === 0) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "primary", description: "No badges created yet." })],
                ephemeral: true,
            });
            return;
        }
        const lines = badges.map((b) => `${b.emoji ?? ""} **${b.name}**${b.description ? ` — ${b.description}` : ""}`);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "primary", description: lines.join("\n") })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=badge.js.map