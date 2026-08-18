import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";
import { baseEmbed } from "../utils/embeds.js";
export const shuffle = {
    data: new SlashCommandBuilder().setName("shuffle").setDescription("Shuffle the queue."),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const q = useQueue(interaction.guildId);
        if (!q || q.tracks.size === 0) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "The queue is empty." })], ephemeral: true });
            return;
        }
        q.tracks.shuffle();
        await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: "Queue shuffled." })] });
    },
};
//# sourceMappingURL=shuffle.js.map