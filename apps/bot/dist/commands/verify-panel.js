import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { buildPanel } from "../utils/embeds.js";
/**
 * Double Counter蜷檎ｭ峨・隱崎ｨｼ繝代ロ繝ｫ繧呈兜遞ｿ縺吶ｋ繧ｳ繝槭Φ繝・邂｡逅・・畑)縲・
 * Bot譛ｬ菴薙・UI縺ｯ闍ｱ隱槫崋螳・繧ｳ繝槭Φ繝牙錐繝ｻ繝代ロ繝ｫ譁・ｨ縺ｨ繧・縲ゅム繝・す繝･繝懊・繝牙・縺ｮ險隱槫・繧頑崛縺医→縺ｯ蛻･霆ｸ縲・
 *
 * 繝懊ち繝ｳ縺ｯ騾壼ｸｸ縺ｮ繧､繝ｳ繧ｿ繝ｩ繧ｯ繧ｷ繝ｧ繝ｳ繝懊ち繝ｳ(customId: "verify:start")縲・
 * 繧ｯ繝ｪ繝・け譎ゅ・謖吝虚縺ｯ events/interactionCreate.ts 縺ｮ handleVerifyStart 縺ｧ蜃ｦ逅・☆繧・
 * (蛟句挨縺ｮ隱崎ｨｼ繝ｪ繝ｳ繧ｯ繧堤函謌舌＠縺ｦephemeral縺ｧ霑斐☆諠ｳ螳・縲・
 */
export const verifyPanel = {
    data: new SlashCommandBuilder()
        .setName("verify-panel")
        .setDescription("Post the verification panel in this channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const container = buildPanel({
            title: "Verify to access this server",
            intro: "This server is protected by **Nyx.**. Click the button below to verify.",
            button: { label: "Verify my account", customId: "verify:start" },
            creditLine: "Powered by **Nyx.**",
        });
        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },
};
//# sourceMappingURL=verify-panel.js.map