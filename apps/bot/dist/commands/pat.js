import { SlashCommandBuilder } from "discord.js";
import { baseEmbed } from "../utils/embeds.js";
import { addAffinity, isGestureOnCooldown } from "../utils/affinity.js";
const GESTURE_AFFINITY_AMOUNT = 5;
export const pat = {
    data: new SlashCommandBuilder()
        .setName("pat")
        .setDescription("Pat someone on the head (raises affinity).")
        .addUserOption((opt) => opt.setName("user").setDescription("Member to pat").setRequired(true)),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const target = interaction.options.getUser("user", true);
        if (target.id === interaction.user.id) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "warning", description: "You can't pat yourself. Try someone else!" })],
                ephemeral: true,
            });
            return;
        }
        if (target.bot) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "warning", description: "You can't pat a bot." })],
                ephemeral: true,
            });
            return;
        }
        if (isGestureOnCooldown("pat", interaction.user.id, target.id)) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "warning", description: `You've patted ${target} recently. Wait a bit before doing it again.` })],
                ephemeral: true,
            });
            return;
        }
        await addAffinity(interaction.guildId, interaction.user.id, target.id, GESTURE_AFFINITY_AMOUNT);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `${interaction.user} pats ${target} on the head! (+${GESTURE_AFFINITY_AMOUNT} affinity)` })],
        });
    },
};
//# sourceMappingURL=pat.js.map