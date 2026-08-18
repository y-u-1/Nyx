import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const welcomeConfig = {
    data: new SlashCommandBuilder()
        .setName("welcome-config")
        .setDescription("Configure welcome/leave messages.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addBooleanOption((opt) => opt.setName("welcome_enabled").setDescription("Enable welcome messages"))
        .addChannelOption((opt) => opt.setName("welcome_channel").setDescription("Channel for welcome messages").addChannelTypes(ChannelType.GuildText))
        .addBooleanOption((opt) => opt.setName("leave_enabled").setDescription("Enable leave messages"))
        .addChannelOption((opt) => opt.setName("leave_channel").setDescription("Channel for leave messages").addChannelTypes(ChannelType.GuildText)),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const welcomeEnabled = interaction.options.getBoolean("welcome_enabled");
        const welcomeChannel = interaction.options.getChannel("welcome_channel");
        const leaveEnabled = interaction.options.getBoolean("leave_enabled");
        const leaveChannel = interaction.options.getChannel("leave_channel");
        await prisma.guildSettings.upsert({
            where: { guildId: interaction.guildId },
            create: {
                guildId: interaction.guildId,
                welcomeEnabled: welcomeEnabled ?? undefined,
                welcomeChannelId: welcomeChannel?.id,
                leaveEnabled: leaveEnabled ?? undefined,
                leaveChannelId: leaveChannel?.id,
            },
            update: {
                welcomeEnabled: welcomeEnabled ?? undefined,
                welcomeChannelId: welcomeChannel ? welcomeChannel.id : undefined,
                leaveEnabled: leaveEnabled ?? undefined,
                leaveChannelId: leaveChannel ? leaveChannel.id : undefined,
            },
        });
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: "Welcome/leave settings updated." })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=welcome-config.js.map