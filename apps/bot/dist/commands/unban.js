import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { baseEmbed } from "../utils/embeds.js";
import { logModAction } from "../utils/moderation.js";
export const unban = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user by ID.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption((opt) => opt.setName("user_id").setDescription("The banned user's ID").setRequired(true))
        .addStringOption((opt) => opt.setName("reason").setDescription("Reason for the unban")),
    async execute(interaction) {
        if (!interaction.guildId || !interaction.guild)
            return;
        const userId = interaction.options.getString("user_id", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided.";
        const bans = await interaction.guild.bans.fetch();
        if (!bans.has(userId)) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "error", description: "That user isn't banned." })],
                ephemeral: true,
            });
            return;
        }
        await interaction.guild.members.unban(userId, reason);
        await logModAction(interaction.client, interaction.guildId, "ban", interaction.user.id, userId, `Unbanned: ${reason}`);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `<@${userId}> has been unbanned.` })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=unban.js.map