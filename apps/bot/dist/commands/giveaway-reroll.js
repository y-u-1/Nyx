import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
import { endGiveaway } from "../utils/giveaway.js";
export const giveawayReroll = {
    data: new SlashCommandBuilder()
        .setName("giveaway-reroll")
        .setDescription("Reroll winners for an ended giveaway.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption((opt) => opt.setName("message_id").setDescription("Message ID of the giveaway panel").setRequired(true)),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const messageId = interaction.options.getString("message_id", true);
        const giveaway = await prisma.giveaway.findUnique({ where: { messageId } });
        if (!giveaway || giveaway.guildId !== interaction.guildId) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "error", description: "No giveaway found for that message ID in this server." })],
                ephemeral: true,
            });
            return;
        }
        // 蜀肴歓驕ｸ縺ｧ縺阪ｋ繧医≧縺ｫ荳譌ｦ ended 繝輔Λ繧ｰ繧呈綾縺励※縺九ｉ縲・壼ｸｸ縺ｮ邨ゆｺ・・逅・謚ｽ驕ｸ+繝代ロ繝ｫ譖ｴ譁ｰ+蜻顔衍)繧貞・螳溯｡後☆繧・
        await prisma.giveaway.update({ where: { id: giveaway.id }, data: { ended: false } });
        await endGiveaway(interaction.client, giveaway.id);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: "Winners rerolled." })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=giveaway-reroll.js.map