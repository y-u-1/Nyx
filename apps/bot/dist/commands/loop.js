import { SlashCommandBuilder } from "discord.js";
import { QueueRepeatMode, useQueue } from "discord-player";
import { baseEmbed } from "../utils/embeds.js";
const MODES = {
    off: QueueRepeatMode.OFF,
    track: QueueRepeatMode.TRACK,
    queue: QueueRepeatMode.QUEUE,
};
export const loop = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Set the loop mode.")
        .addStringOption((opt) => opt
        .setName("mode")
        .setDescription("Loop mode")
        .setRequired(true)
        .addChoices({ name: "off", value: "off" }, { name: "track", value: "track" }, { name: "queue", value: "queue" })),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const mode = interaction.options.getString("mode", true);
        const q = useQueue(interaction.guildId);
        if (!q) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "Nothing is playing." })], ephemeral: true });
            return;
        }
        q.setRepeatMode(MODES[mode]);
        await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Loop mode set to \`${mode}\`.` })] });
    },
};
//# sourceMappingURL=loop.js.map