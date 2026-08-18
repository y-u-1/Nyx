import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const levelRole = {
    data: new SlashCommandBuilder()
        .setName("level-role")
        .setDescription("Manage role rewards for reaching a level.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((sub) => sub
        .setName("add")
        .setDescription("Give a role automatically at a certain level")
        .addIntegerOption((opt) => opt.setName("level").setDescription("Level required").setRequired(true).setMinValue(1))
        .addRoleOption((opt) => opt.setName("role").setDescription("Role to grant").setRequired(true)))
        .addSubcommand((sub) => sub
        .setName("remove")
        .setDescription("Remove a level role reward")
        .addIntegerOption((opt) => opt.setName("level").setDescription("Level to remove from").setRequired(true).setMinValue(1))
        .addRoleOption((opt) => opt.setName("role").setDescription("Role to remove").setRequired(true)))
        .addSubcommand((sub) => sub.setName("list").setDescription("List all configured level role rewards")),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "add") {
            const level = interaction.options.getInteger("level", true);
            const role = interaction.options.getRole("role", true);
            await prisma.levelRoleReward.upsert({
                where: { guildId_level_roleId: { guildId: interaction.guildId, level, roleId: role.id } },
                create: { guildId: interaction.guildId, level, roleId: role.id },
                update: {},
            });
            await interaction.reply({
                embeds: [baseEmbed({ tone: "success", description: `Members will now receive ${role} at level ${level}.` })],
                ephemeral: true,
            });
            return;
        }
        if (subcommand === "remove") {
            const level = interaction.options.getInteger("level", true);
            const role = interaction.options.getRole("role", true);
            await prisma.levelRoleReward
                .delete({ where: { guildId_level_roleId: { guildId: interaction.guildId, level, roleId: role.id } } })
                .catch(() => null);
            await interaction.reply({
                embeds: [baseEmbed({ tone: "success", description: `Removed the level ${level} reward for ${role}.` })],
                ephemeral: true,
            });
            return;
        }
        // list
        const rewards = await prisma.levelRoleReward.findMany({
            where: { guildId: interaction.guildId },
            orderBy: { level: "asc" },
        });
        if (rewards.length === 0) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "primary", description: "No level role rewards configured yet." })],
                ephemeral: true,
            });
            return;
        }
        const lines = rewards.map((r) => `**Level ${r.level}:** <@&${r.roleId}>`);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "primary", description: lines.join("\n") })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=level-role.js.map