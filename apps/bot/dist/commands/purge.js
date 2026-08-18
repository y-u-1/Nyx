import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { baseEmbed } from "../utils/embeds.js";
import { logModAction } from "../utils/moderation.js";
export const purge = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Bulk delete recent messages in this channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption((opt) => opt.setName("amount").setDescription("Number of messages to delete (1-100)").setRequired(true).setMinValue(1).setMaxValue(100))
        .addUserOption((opt) => opt.setName("user").setDescription("Only delete messages from this member")),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const amount = interaction.options.getInteger("amount", true);
        const user = interaction.options.getUser("user");
        const channel = interaction.channel;
        await interaction.deferReply({ ephemeral: true });
        const recent = await channel.messages.fetch({ limit: 100 });
        const targeted = user ? recent.filter((m) => m.author.id === user.id) : recent;
        const toDelete = [...targeted.values()].slice(0, amount);
        const deleted = await channel.bulkDelete(toDelete, true).catch(() => null);
        const count = deleted?.size ?? 0;
        await logModAction(interaction.client, interaction.guildId, "purge", interaction.user.id, user?.id ?? null, `Purged ${count} messages in #${channel.name}`);
        await interaction.editReply({
            embeds: [baseEmbed({ tone: "success", description: `Deleted ${count} message(s). (Messages older than 14 days can't be bulk deleted.)` })],
        });
    },
};
//# sourceMappingURL=purge.js.map