import { MediaGalleryBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, TextDisplayBuilder, } from "discord.js";
import { baseEmbed, buildPanel } from "../utils/embeds.js";
export const announce = {
    data: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Post a formatted announcement.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption((opt) => opt.setName("title").setDescription("Announcement title").setRequired(true))
        .addStringOption((opt) => opt.setName("message").setDescription("Announcement body").setRequired(true))
        .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to post in (default: this channel)"))
        .addRoleOption((opt) => opt.setName("mention_role").setDescription("Role to mention"))
        .addAttachmentOption((opt) => opt.setName("image").setDescription("Image to attach")),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const title = interaction.options.getString("title", true);
        const message = interaction.options.getString("message", true);
        const channel = interaction.options.getChannel("channel") ?? interaction.channel;
        const mentionRole = interaction.options.getRole("mention_role");
        const image = interaction.options.getAttachment("image");
        if (image && !image.contentType?.startsWith("image/")) {
            await interaction.reply({
                embeds: [baseEmbed({ tone: "error", description: "The attached file must be an image." })],
                ephemeral: true,
            });
            return;
        }
        const panel = buildPanel({ title, intro: message, creditLine: "Powered by **Nyx.**" });
        if (image) {
            panel.addMediaGalleryComponents(new MediaGalleryBuilder().addItems((item) => item.setURL(image.url)));
        }
        const components = mentionRole ? [new TextDisplayBuilder().setContent(`${mentionRole}`), panel] : [panel];
        await channel.send({ components, flags: MessageFlags.IsComponentsV2 });
        await interaction.reply({
            embeds: [baseEmbed({ tone: "success", description: `Announcement posted in ${channel}.` })],
            ephemeral: true,
        });
    },
};
//# sourceMappingURL=announce.js.map