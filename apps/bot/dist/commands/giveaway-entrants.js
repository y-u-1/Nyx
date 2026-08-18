import { SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const giveawayEntrants = {
    data: new SlashCommandBuilder()
        .setName("giveaway-entrants")
        .setDescription("Show everyone entered in a giveaway.")
        .addStringOption((opt) => opt.setName("message_id").setDescription("Giveaway message ID").setRequired(true)),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const messageId = interaction.options.getString("message_id", true);
        const giveaway = await prisma.giveaway.findUnique({
            where: { messageId },
            include: { entries: { orderBy: { createdAt: "asc" } } },
        });
        if (!giveaway || giveaway.guildId !== interaction.guildId) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "error", description: "No giveaway found for that message ID in this server." })],
                ephemeral: true,
            });
            return;
        }
        if (giveaway.entries.length === 0) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: "No one has entered this giveaway yet." })] });
            return;
        }
        const lines = giveaway.entries.map((e, i) => `\`${i + 1}\` <@${e.userId}>${e.weight > 1 ? ` (\`${e.weight}x\`)` : ""}`);
        await interaction.reply({
            embeds: [
                baseEmbed({
                    tone: "primary",
                    title: `Entrants: ${giveaway.prize}`,
                    description: `**Total:** \`${giveaway.entries.length}\`\n\n${lines.slice(0, 40).join("\n")}`,
                }),
            ],
        });
    },
};
//# sourceMappingURL=giveaway-entrants.js.map