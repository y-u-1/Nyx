import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { baseEmbed } from "../utils/embeds.js";
import { logModAction } from "../utils/moderation.js";
export const unlock = {
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Allow @everyone to send messages in this channel again.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to unlock (default: this channel)")),
    async execute(interaction) {
        if (!interaction.guildId || !interaction.guild)
            return;
        const channel = interaction.options.getChannel("channel") ?? interaction.channel;
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
        await logModAction(interaction.client, interaction.guildId, "unlock", interaction.user.id, null, "Channel unlocked.", `**Channel:** ${channel}`);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `${channel} has been unlocked.` })],
        });
    },
};
//# sourceMappingURL=unlock.js.map