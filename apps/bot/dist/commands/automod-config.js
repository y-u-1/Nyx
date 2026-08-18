import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
export const automodConfig = {
    data: new SlashCommandBuilder()
        .setName("automod-config")
        .setDescription("Configure AutoMod and anti-raid settings for this server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addBooleanOption((opt) => opt.setName("block_invites").setDescription("Delete messages containing Discord invite links"))
        .addBooleanOption((opt) => opt.setName("block_links").setDescription("Delete messages containing any link"))
        .addIntegerOption((opt) => opt.setName("max_mentions").setDescription("Max mentions per message before action (0 = disabled)").setMinValue(0).setMaxValue(50))
        .addIntegerOption((opt) => opt.setName("spam_threshold").setDescription("Messages within the spam window before action (0 = disabled)").setMinValue(0).setMaxValue(50))
        .addIntegerOption((opt) => opt.setName("spam_window_seconds").setDescription("Time window for spam detection, in seconds").setMinValue(1).setMaxValue(60))
        .addIntegerOption((opt) => opt.setName("timeout_seconds").setDescription("Timeout duration applied on violation (0 = no timeout)").setMinValue(0).setMaxValue(2419200))
        .addRoleOption((opt) => opt.setName("bypass_role").setDescription("Role exempt from AutoMod"))
        .addBooleanOption((opt) => opt.setName("anti_raid_enabled").setDescription("Enable anti-raid join detection"))
        .addIntegerOption((opt) => opt.setName("raid_join_threshold").setDescription("Joins within the window that triggers raid mode").setMinValue(2).setMaxValue(200))
        .addIntegerOption((opt) => opt.setName("raid_join_window_seconds").setDescription("Time window for raid detection, in seconds").setMinValue(5).setMaxValue(600))
        .addStringOption((opt) => opt
        .setName("raid_action")
        .setDescription("What to do when a raid is detected")
        .addChoices({ name: "kick", value: "kick" }, { name: "ban", value: "ban" }, { name: "lockdown", value: "lockdown" }))
        .addIntegerOption((opt) => opt.setName("min_account_age_days").setDescription("Auto-kick accounts younger than this on join (0 to disable)").setMinValue(0).setMaxValue(365)),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const blockInvites = interaction.options.getBoolean("block_invites");
        const blockLinks = interaction.options.getBoolean("block_links");
        const maxMentions = interaction.options.getInteger("max_mentions");
        const spamThreshold = interaction.options.getInteger("spam_threshold");
        const spamWindowSeconds = interaction.options.getInteger("spam_window_seconds");
        const timeoutSeconds = interaction.options.getInteger("timeout_seconds");
        const bypassRole = interaction.options.getRole("bypass_role");
        const antiRaidEnabled = interaction.options.getBoolean("anti_raid_enabled");
        const raidJoinThreshold = interaction.options.getInteger("raid_join_threshold");
        const raidJoinWindowSeconds = interaction.options.getInteger("raid_join_window_seconds");
        const raidAction = interaction.options.getString("raid_action");
        const minAccountAgeDaysInput = interaction.options.getInteger("min_account_age_days");
        const minAccountAgeDays = minAccountAgeDaysInput === 0 ? null : minAccountAgeDaysInput;
        await prisma.autoModSettings.upsert({
            where: { guildId: interaction.guildId },
            create: {
                guildId: interaction.guildId,
                blockInvites: blockInvites ?? undefined,
                blockLinks: blockLinks ?? undefined,
                maxMentions: maxMentions ?? undefined,
                spamMessageThreshold: spamThreshold ?? undefined,
                spamWindowSeconds: spamWindowSeconds ?? undefined,
                timeoutSeconds: timeoutSeconds ?? undefined,
                bypassRoleId: bypassRole?.id,
                antiRaidEnabled: antiRaidEnabled ?? undefined,
                raidJoinThreshold: raidJoinThreshold ?? undefined,
                raidJoinWindowSeconds: raidJoinWindowSeconds ?? undefined,
                raidAction: raidAction ?? undefined,
                minAccountAgeDays: minAccountAgeDaysInput !== null ? minAccountAgeDays : undefined,
            },
            update: {
                blockInvites: blockInvites ?? undefined,
                blockLinks: blockLinks ?? undefined,
                maxMentions: maxMentions ?? undefined,
                spamMessageThreshold: spamThreshold ?? undefined,
                spamWindowSeconds: spamWindowSeconds ?? undefined,
                timeoutSeconds: timeoutSeconds ?? undefined,
                bypassRoleId: bypassRole ? bypassRole.id : undefined,
                antiRaidEnabled: antiRaidEnabled ?? undefined,
                raidJoinThreshold: raidJoinThreshold ?? undefined,
                raidJoinWindowSeconds: raidJoinWindowSeconds ?? undefined,
                raidAction: raidAction ?? undefined,
                minAccountAgeDays: minAccountAgeDaysInput !== null ? minAccountAgeDays : undefined,
            },
        });
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: "AutoMod settings updated." })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=automod-config.js.map