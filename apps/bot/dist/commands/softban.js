import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { baseEmbed } from "../utils/embeds.js";
import { logModAction, notifyUser } from "../utils/moderation.js";
export const softban = {
    data: new SlashCommandBuilder()
        .setName("softban")
        .setDescription("Ban and immediately unban a member to purge their recent messages.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption((opt) => opt.setName("user").setDescription("Member to softban").setRequired(true))
        .addStringOption((opt) => opt.setName("reason").setDescription("Reason for the softban").setRequired(true))
        .addIntegerOption((opt) => opt.setName("delete_message_days").setDescription("Delete this member's messages from the last N days (0-7, default 1)").setMinValue(0).setMaxValue(7)),
    async execute(interaction) {
        if (!interaction.guildId || !interaction.guild)
            return;
        const target = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason", true);
        const deleteMessageDays = interaction.options.getInteger("delete_message_days") ?? 1;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (member && !member.bannable) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "error", description: "I can't softban that member (missing permissions or role hierarchy)." })],
                ephemeral: true,
            });
            return;
        }
        if (member) {
            await notifyUser(interaction.client, target, interaction.guild.name, "softbanned", reason);
        }
        await interaction.guild.members.ban(target.id, { reason, deleteMessageSeconds: deleteMessageDays * 86400 });
        await interaction.guild.members.unban(target.id, "Softban: automatic unban after message purge").catch(() => null);
        await logModAction(interaction.client, interaction.guildId, "softban", interaction.user.id, target.id, reason);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `${target} has been softbanned (messages purged, not permanently banned).` })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=softban.js.map