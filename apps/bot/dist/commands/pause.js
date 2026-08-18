import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";
import { baseEmbed } from "../utils/embeds.js";
export const pause = {
    data: new SlashCommandBuilder().setName("pause").setDescription("Pause playback."),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const queue = useQueue(interaction.guildId);
        if (!queue?.currentTrack) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "Nothing is playing." })], ephemeral: true });
            return;
        }
        queue.node.setPaused(true);
        await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: "Paused." })] });
    },
};
//# sourceMappingURL=pause.js.map