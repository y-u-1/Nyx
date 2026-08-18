import { SlashCommandBuilder } from "discord.js";
import { useMainPlayer } from "discord-player";
import { baseEmbed } from "../utils/embeds.js";
export const play = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song or add it to the queue.")
        .addStringOption((opt) => opt.setName("query").setDescription("Song name or URL").setRequired(true)),
    async execute(interaction) {
        const member = interaction.member;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "Join a voice channel first." })], ephemeral: true });
            return;
        }
        await interaction.deferReply();
        const query = interaction.options.getString("query", true);
        const player = useMainPlayer();
        try {
            // discord-playerが参照するdiscord.jsの型と、こちらのdiscord.jsの型が
            // TypeScriptのNodeNext解決モードの都合で別物として扱われてしまう既知の問題への回避策。
            // 実行時の型は完全に一致しているため、動作上の問題はない。
            const { track } = await player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: interaction.channel,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 60_000,
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 60_000,
                    volume: 50,
                },
            });
            await interaction.editReply({ embeds: [baseEmbed({ tone: "success", description: `Queued **${track.title}**.` })] });
        }
        catch (error) {
            console.error("[Nyx.] Failed to play track", error);
            await interaction.editReply({ embeds: [baseEmbed({ tone: "error", description: "Couldn't find or play that track." })] });
        }
    },
};
//# sourceMappingURL=play.js.map