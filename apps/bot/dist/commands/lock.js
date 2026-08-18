import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { baseEmbed } from "../utils/embeds.js";
import { logModAction } from "../utils/moderation.js";
export const lock = {
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Prevent @everyone from sending messages in this channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption((opt) => opt.setName("reason").setDescription("Reason for locking"))
        .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to lock (default: this channel)")),
    async execute(interaction) {
        if (!interaction.guildId || !interaction.guild)
            return;
        const channel = interaction.options.getChannel("channel") ?? interaction.channel;
        const reason = interaction.options.getString("reason") ?? "No reason provided.";
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }, { reason });
        await logModAction(interaction.client, interaction.guildId, "lock", interaction.user.id, null, reason, `**Channel:** ${channel}`);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `${channel} has been locked.` })],
        });
    },
};
//# sourceMappingURL=lock.js.map