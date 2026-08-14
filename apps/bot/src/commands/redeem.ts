import { AttachmentBuilder, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { sendLog } from "../utils/logging.js";

export const redeem: Command = {
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem a code.")
    .addStringOption((opt) => opt.setName("code").setDescription("The code to redeem").setRequired(true)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId || !interaction.guild) return;

    const code = interaction.options.getString("code", true);
    const redeemCode = await prisma.redeemCode.findUnique({ where: { guildId_code: { guildId: interaction.guildId, code } } });

    if (!redeemCode) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "Invalid code." })],
        ephemeral: true,
      });
      return;
    }

    if (redeemCode.expiresAt && redeemCode.expiresAt.getTime() < Date.now()) {
      await interaction.reply({
        embeds: [baseEmbed({ tone: "error", description: "This code has expired." })],
        ephemeral: true,
      });
      return;
    }

    // usedCountの増加と上限チェックを1つのトランザクション内でアトミックに行う。
    // 「先着N名」を正確に守るため、チェックしてから加算するのではなく、
    // 加算条件(usedCount < maxUses)をDB側のupdateMany条件として同時に評価する。
    // これにより、複数人がほぼ同時に redeem した場合でも maxUses を超えて通ることがない。
    try {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.redeemCode.updateMany({
          where: { id: redeemCode.id, usedCount: { lt: redeemCode.maxUses } },
          data: { usedCount: { increment: 1 } },
        });

        if (claimed.count === 0) {
          throw new Error("LIMIT_REACHED");
        }

        // ここで一意制約違反(P2002)が起きた場合、トランザクション全体がロールバックされ
        // 上のusedCount加算も自動的に取り消される
        await tx.redeemRedemption.create({ data: { redeemCodeId: redeemCode.id, userId: interaction.user.id } });
      });
    } catch (error: any) {
      if (error?.message === "LIMIT_REACHED") {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: "This code has already reached its maximum number of uses." })],
          ephemeral: true,
        });
        return;
      }
      if (error?.code === "P2002") {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "warning", description: "You've already redeemed this code." })],
          ephemeral: true,
        });
        return;
      }
      throw error;
    }

    if (redeemCode.roleId) {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      await member.roles.add(redeemCode.roleId).catch((error) => console.error("[Nyx.] Failed to grant redeem role", error));
    }

    await sendLog(
      interaction.client,
      interaction.guildId,
      "redeem",
      "Redeem Code Used",
      `**Code:** \`${code}\`\n**Redeemed by:** <@${interaction.user.id}>\n**Uses:** \`${redeemCode.usedCount + 1}/${redeemCode.maxUses}\``,
      "success",
    );

    await interaction.reply({
      embeds: [baseEmbed({ tone: "success", description: "Code redeemed successfully." })],
      ephemeral: true,
    });

    if (redeemCode.imageUrl) {
      try {
        const response = await fetch(redeemCode.imageUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        await interaction.user.send({ files: [new AttachmentBuilder(buffer, { name: "redeem.png" })] });
      } catch (error) {
        // DMを閉じている、または画像取得に失敗した場合は無視する
        console.error("[Nyx.] Failed to DM redeem image", error);
      }
    }
  },
};
