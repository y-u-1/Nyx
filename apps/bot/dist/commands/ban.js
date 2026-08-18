import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { baseEmbed } from "../utils/embeds.js";
import { logModAction, notifyUser } from "../utils/moderation.js";
export const ban = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a member from the server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption((opt) => opt.setName("user").setDescription("Member to ban").setRequired(true))
        .addStringOption((opt) => opt.setName("reason").setDescription("Reason for the ban").setRequired(true))
        .addIntegerOption((opt) => opt.setName("delete_message_days").setDescription("Delete this member's messages from the last N days (0-7)").setMinValue(0).setMaxValue(7)),
    async execute(interaction) {
        if (!interaction.guildId || !interaction.guild)
            return;
        const target = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason", true);
        const deleteMessageDays = interaction.options.getInteger("delete_message_days") ?? 0;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (member && !member.bannable) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "error", description: "I can't ban that member (missing permissions or role hierarchy)." })],
                ephemeral: true,
            });
            return;
        }
        if (member) {
            await notifyUser(interaction.client, target, interaction.guild.name, "banned", reason);
        }
        await interaction.guild.members.ban(target.id, { reason, deleteMessageSeconds: deleteMessageDays * 86400 });
        await logModAction(interaction.client, interaction.guildId, "ban", interaction.user.id, target.id, reason);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `${target} has been banned.` })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=ban.js.map