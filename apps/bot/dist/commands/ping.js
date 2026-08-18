import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { buildPanel } from "../utils/embeds.js";
export const ping = {
    data: new SlashCommandBuilder().setName("ping").setDescription("Check the bot's latency."),
    async execute(interaction) {
        const sent = await interaction.reply({
            components: [buildPanel({ title: "Nyx.", intro: "Measuring latency..." })],
            flags: MessageFlags.IsComponentsV2,
            fetchReply: true,
        });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const container = buildPanel({
            tone: "success",
            title: "Pong",
            intro: `\`Roundtrip\` ${latency}ms\n\`WebSocket\` ${interaction.client.ws.ping}ms`,
            creditLine: "Nyx.",
        });
        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },
};
//# sourceMappingURL=ping.js.map