import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
const DAILY_AMOUNT = 100;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const daily = {
    data: new SlashCommandBuilder().setName("daily").setDescription("Claim your daily coins."),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const record = await prisma.userLevel.findUnique({
            where: { guildId_userId: { guildId: interaction.guildId, userId: interaction.user.id } },
            select: { lastDailyAt: true },
        });
        if (record?.lastDailyAt) {
            const elapsed = Date.now() - record.lastDailyAt.getTime();
            if (elapsed < COOLDOWN_MS) {
                const nextClaimUnix = Math.floor((record.lastDailyAt.getTime() + COOLDOWN_MS) / 1000);
                await interaction.reply({
                    embeds: [baseEmbed({ tone: "warning", description: `You already claimed your daily reward. Next claim available <t:${nextClaimUnix}:R>.` })],
                    ephemeral: true,
                });
                return;
            }
        }
        await prisma.userLevel.upsert({
            where: { guildId_userId: { guildId: interaction.guildId, userId: interaction.user.id } },
            create: { guildId: interaction.guildId, userId: interaction.user.id, coins: DAILY_AMOUNT, lastDailyAt: new Date() },
            update: { coins: { increment: DAILY_AMOUNT }, lastDailyAt: new Date() },
        });
        const settings = await prisma.guildSettings.findUnique({ where: { guildId: interaction.guildId } });
        const currency = settings?.currencyName ?? "coins";
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `You claimed \`${DAILY_AMOUNT}\` ${currency}.` })],
        });
    },
};
//# sourceMappingURL=daily.js.map