import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";
import { baseEmbed } from "../utils/embeds.js";
export const stop = {
    data: new SlashCommandBuilder().setName("stop").setDescription("Stop playback and clear the queue."),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const queue = useQueue(interaction.guildId);
        if (!queue) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "Nothing is playing." })], ephemeral: true });
            return;
        }
        queue.delete();
        await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: "Stopped playback and cleared the queue." })] });
    },
};
//# sourceMappingURL=stop.js.map