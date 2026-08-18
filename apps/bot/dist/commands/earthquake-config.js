import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
const SCALE_CHOICES = [
    { name: "震度1", value: 10 },
    { name: "震度2", value: 20 },
    { name: "震度3", value: 30 },
    { name: "震度4", value: 40 },
    { name: "震度5弱", value: 45 },
    { name: "震度5強", value: 50 },
    { name: "震度6弱", value: 55 },
    { name: "震度6強", value: 60 },
    { name: "震度7", value: 70 },
];
export const earthquakeConfig = {
    data: new SlashCommandBuilder()
        .setName("earthquake-config")
        .setDescription("Configure earthquake notifications.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addBooleanOption((opt) => opt.setName("enabled").setDescription("Enable or disable earthquake notifications"))
        .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to post notifications in").addChannelTypes(ChannelType.GuildText))
        .addIntegerOption((opt) => opt.setName("min_scale").setDescription("Minimum intensity to notify").addChoices(...SCALE_CHOICES))
        .addBooleanOption((opt) => opt.setName("eew_enabled").setDescription("Also notify for Earthquake Early Warning (faster, less confirmed)")),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const enabled = interaction.options.getBoolean("enabled");
        const channel = interaction.options.getChannel("channel");
        const minScale = interaction.options.getInteger("min_scale");
        const eewEnabled = interaction.options.getBoolean("eew_enabled");
        await prisma.guildSettings.upsert({
            where: { guildId: interaction.guildId },
            create: {
                guildId: interaction.guildId,
                earthquakeEnabled: enabled ?? undefined,
                earthquakeChannelId: channel?.id,
                earthquakeMinScale: minScale ?? undefined,
                earthquakeEewEnabled: eewEnabled ?? undefined,
            },
            update: {
                earthquakeEnabled: enabled ?? undefined,
                earthquakeChannelId: channel ? channel.id : undefined,
                earthquakeMinScale: minScale ?? undefined,
                earthquakeEewEnabled: eewEnabled ?? undefined,
            },
        });
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: "Earthquake notification settings updated." })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=earthquake-config.js.map