import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";
import { baseEmbed } from "../utils/embeds.js";
export const nowplaying = {
    data: new SlashCommandBuilder().setName("nowplaying").setDescription("Show the currently playing track."),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const q = useQueue(interaction.guildId);
        if (!q?.currentTrack) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: "Nothing is playing." })] });
            return;
        }
        const progress = q.node.createProgressBar();
        const description = [`**${q.currentTrack.title}**`, `Requested by ${q.currentTrack.requestedBy}`, progress ?? ""].join("\n");
        await interaction.reply({ embeds: [baseEmbed({ tone: "primary", title: "Now Playing", description })] });
    },
};
//# sourceMappingURL=nowplaying.js.map