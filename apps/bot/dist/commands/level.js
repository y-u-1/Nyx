import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
import { addXp, calculateLevel, xpForLevelStart } from "../utils/leveling.js";
export const level = {
    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Directly set a member's level.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((sub) => sub
        .setName("set")
        .setDescription("Set a member's level directly")
        .addUserOption((opt) => opt.setName("user").setDescription("Target member").setRequired(true))
        .addIntegerOption((opt) => opt.setName("level").setDescription("Target level").setRequired(true).setMinValue(0).setMaxValue(1000))),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const target = interaction.options.getUser("user", true);
        const targetLevel = interaction.options.getInteger("level", true);
        const record = await prisma.userLevel.findUnique({
            where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } },
        });
        const currentXp = record ? Number(record.xp) : 0;
        const { level: currentLevel } = calculateLevel(currentXp);
        const targetXp = xpForLevelStart(targetLevel);
        if (targetLevel > currentLevel) {
            // レベルを上げる場合は addXp を経由し、ロールリワード・レベルアップ通知も通常通り発火させる
            const delta = targetXp - currentXp;
            await addXp(interaction.client, interaction.guildId, target.id, delta);
        }
        else {
            // レベルを下げる/据え置く場合は直接更新するだけ(既に付与済みのロールは自動剥奪しない)
            await prisma.userLevel.upsert({
                where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } },
                create: { guildId: interaction.guildId, userId: target.id, xp: targetXp, level: targetLevel },
                update: { xp: targetXp, level: targetLevel },
            });
        }
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `Set ${target}'s level to **${targetLevel}**.` })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=level.js.map