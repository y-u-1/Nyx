import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
import { addXp, calculateLevel } from "../utils/leveling.js";
export const xp = {
    data: new SlashCommandBuilder()
        .setName("xp")
        .setDescription("Manually adjust a member's XP.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((sub) => sub
        .setName("add")
        .setDescription("Add XP to a member (triggers level-up rewards if applicable)")
        .addUserOption((opt) => opt.setName("user").setDescription("Target member").setRequired(true))
        .addIntegerOption((opt) => opt.setName("amount").setDescription("Amount of XP to add").setRequired(true).setMinValue(1).setMaxValue(1_000_000_000)))
        .addSubcommand((sub) => sub
        .setName("remove")
        .setDescription("Remove XP from a member")
        .addUserOption((opt) => opt.setName("user").setDescription("Target member").setRequired(true))
        .addIntegerOption((opt) => opt.setName("amount").setDescription("Amount of XP to remove").setRequired(true).setMinValue(1).setMaxValue(1_000_000_000)))
        .addSubcommand((sub) => sub
        .setName("set")
        .setDescription("Set a member's total XP")
        .addUserOption((opt) => opt.setName("user").setDescription("Target member").setRequired(true))
        .addIntegerOption((opt) => opt.setName("amount").setDescription("New total XP").setRequired(true).setMinValue(0).setMaxValue(1_000_000_000))),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser("user", true);
        const amount = interaction.options.getInteger("amount", true);
        if (subcommand === "add") {
            const result = await addXp(interaction.client, interaction.guildId, target.id, amount);
            await interaction.reply({
                embeds: [
                    baseEmbed({
                        tone: "success",
                        description: `Added \`${amount}\` XP to ${target}.${result.leveledUp ? ` They reached level **${result.newLevel}**.` : ""}`,
                    }),
                ],
                ephemeral: true,
            });
            return;
        }
        if (subcommand === "remove") {
            const record = await prisma.userLevel.findUnique({ where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } } });
            const newXp = record ? Math.max(0, Number(record.xp) - amount) : 0;
            const { level } = calculateLevel(newXp);
            await prisma.userLevel.upsert({
                where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } },
                create: { guildId: interaction.guildId, userId: target.id, xp: newXp, level },
                update: { xp: newXp, level },
            });
            await interaction.reply({
                embeds: [baseEmbed({ tone: "success", description: `Removed \`${amount}\` XP from ${target}. New total: \`${newXp}\`.` })],
                ephemeral: true,
            });
            return;
        }
        // set
        const { level } = calculateLevel(amount);
        await prisma.userLevel.upsert({
            where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } },
            create: { guildId: interaction.guildId, userId: target.id, xp: amount, level },
            update: { xp: amount, level },
        });
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `Set ${target}'s XP to \`${amount}\` (level ${level}).` })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=xp.js.map