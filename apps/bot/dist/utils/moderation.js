import { prisma } from "@nyx/database";
import { baseEmbed } from "./embeds.js";
import { sendLog } from "./logging.js";
/** モデレーションアクションをケース番号付きでDBに記録し、モデレーションログチャンネルに送信する */
export async function logModAction(client, guildId, action, moderatorId, targetId, reason, extra) {
    const settings = await prisma.guildSettings.upsert({
        where: { guildId },
        create: { guildId, caseCounter: 1 },
        update: { caseCounter: { increment: 1 } },
    });
    await prisma.modCase.create({
        data: {
            guildId,
            caseNumber: settings.caseCounter,
            userId: targetId ?? "N/A",
            moderatorId,
            action,
            reason,
        },
    });
    const lines = [
        `**Case:** \`#${settings.caseCounter}\``,
        `**Action:** \`${action}\``,
        `**Moderator:** <@${moderatorId}>`,
        targetId ? `**Target:** <@${targetId}>` : null,
        `**Reason:** ${reason}`,
        extra ?? null,
    ].filter(Boolean);
    await sendLog(client, guildId, "moderation", "Moderation", lines.join("\n"), "warning");
}
/** 処罰対象にDMで通知する。DMを閉じているユーザーは無視する。 */
export async function notifyUser(client, user, guildName, action, reason) {
    try {
        await user.send({
            embeds: [baseEmbed({ tone: "warning", title: `You were ${action} in ${guildName}`, description: `**Reason:** ${reason}` })],
        });
    }
    catch {
        // DMを閉じているユーザーは無視する
    }
}
//# sourceMappingURL=moderation.js.map