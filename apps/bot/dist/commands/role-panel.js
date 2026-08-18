import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { prisma } from "@nyx/database";
import { baseEmbed } from "../utils/embeds.js";
import { buildRolePanelContainer, syncRolePanelMessage } from "../utils/rolepanel.js";
export const rolePanel = {
    data: new SlashCommandBuilder()
        .setName("role-panel")
        .setDescription("Manage button-based self-assign role panels.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand((sub) => sub
        .setName("create")
        .setDescription("Post a new role panel")
        .addStringOption((opt) => opt.setName("title").setDescription("Panel title").setRequired(true))
        .addStringOption((opt) => opt.setName("description").setDescription("Panel description").setRequired(true))
        .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to post in (default: this channel)")))
        .addSubcommand((sub) => sub
        .setName("add-role")
        .setDescription("Add a role button to a panel")
        .addStringOption((opt) => opt.setName("message_id").setDescription("Panel message ID").setRequired(true))
        .addRoleOption((opt) => opt.setName("role").setDescription("Role to toggle").setRequired(true))
        .addStringOption((opt) => opt.setName("label").setDescription("Button label").setRequired(true)))
        .addSubcommand((sub) => sub
        .setName("remove-role")
        .setDescription("Remove a role button from a panel")
        .addStringOption((opt) => opt.setName("message_id").setDescription("Panel message ID").setRequired(true))
        .addRoleOption((opt) => opt.setName("role").setDescription("Role to remove").setRequired(true))),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "create") {
            const title = interaction.options.getString("title", true);
            const description = interaction.options.getString("description", true);
            const channel = interaction.options.getChannel("channel") ?? interaction.channel;
            const container = buildRolePanelContainer(title, description, []);
            const message = await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            await prisma.rolePanel.create({
                data: { guildId: interaction.guildId, channelId: channel.id, messageId: message.id, title },
            });
            await interaction.reply({
                embeds: [baseEmbed({ tone: "success", description: `Role panel posted in ${channel}. Use \`/role-panel add-role\` to add buttons.` })],
                ephemeral: true,
            });
            return;
        }
        const messageId = interaction.options.getString("message_id", true);
        const panel = await prisma.rolePanel.findUnique({ where: { messageId } });
        if (!panel || panel.guildId !== interaction.guildId) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "error", description: "No role panel found for that message ID in this server." })],
                ephemeral: true,
            });
            return;
        }
        if (subcommand === "add-role") {
            const role = interaction.options.getRole("role", true);
            const label = interaction.options.getString("label", true);
            const roleCount = await prisma.rolePanelRole.count({ where: { panelId: panel.id } });
            if (roleCount >= 25) {
                await interaction.reply({
                    embeds: [baseEmbed({ tone: "error", description: "This panel already has the maximum of 25 role buttons." })],
                    ephemeral: true,
                });
                return;
            }
            await prisma.rolePanelRole.upsert({
                where: { panelId_roleId: { panelId: panel.id, roleId: role.id } },
                create: { panelId: panel.id, roleId: role.id, label },
                update: { label },
            });
            await syncRolePanelMessage(interaction.client, panel.id);
            await interaction.reply({
                embeds: [baseEmbed({ tone: "success", description: `Added a button for ${role} labeled "${label}".` })],
                ephemeral: true,
            });
            return;
        }
        // remove-role
        const role = interaction.options.getRole("role", true);
        await prisma.rolePanelRole.delete({ where: { panelId_roleId: { panelId: panel.id, roleId: role.id } } }).catch(() => null);
        await syncRolePanelMessage(interaction.client, panel.id);
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `Removed the button for ${role}.` })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=role-panel.js.map