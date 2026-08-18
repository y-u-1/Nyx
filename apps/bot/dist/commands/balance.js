import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const balance = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your (or another member's) coin balance.")
        .addUserOption((opt) => opt.setName("user").setDescription("Member to check (default: you)")),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const target = interaction.options.getUser("user") ?? interaction.user;
        const record = await prisma.userLevel.findUnique({
            where: { guildId_userId: { guildId: interaction.guildId, userId: target.id } },
            select: { coins: true },
        });
        const settings = await prisma.guildSettings.findUnique({ where: { guildId: interaction.guildId } });
        const currency = settings?.currencyName ?? "coins";
        await interaction.reply({
            embeds: [baseEmbed({ tone: "primary", description: `${target} has \`${(record?.coins ?? 0n).toString()}\` ${currency}.` })],
        });
    },
};
//# sourceMappingURL=balance.js.map