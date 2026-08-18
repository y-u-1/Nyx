import { SlashCommandBuilder } from "discord.js";
import { useQueue } from "discord-player";
import { baseEmbed } from "../utils/embeds.js";
export const volume = {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Set the playback volume.")
        .addIntegerOption((opt) => opt.setName("percent").setDescription("Volume percentage (0-100)").setRequired(true).setMinValue(0).setMaxValue(100)),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const percent = interaction.options.getInteger("percent", true);
        const q = useQueue(interaction.guildId);
        if (!q) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "Nothing is playing." })], ephemeral: true });
            return;
        }
        q.node.setVolume(percent);
        await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Volume set to \`${percent}%\`.` })] });
    },
};
//# sourceMappingURL=volume.js.map