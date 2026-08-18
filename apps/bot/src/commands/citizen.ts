import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type User } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { applyForCitizenship, approveCitizenship, rejectCitizenship, getCitizen, getPendingApplications, CitizenError } from "../utils/citizen.js";

export const citizen: Command = {
  data: new SlashCommandBuilder()
    .setName("citizen")
    .setDescription("Citizenship registration (passport system).")
    .addSubcommand((sub) =>
      sub
        .setName("register")
        .setDescription("Apply for citizenship")
        .addRoleOption((opt) => opt.setName("role").setDescription("Role/nationality you're applying for"))
        .addStringOption((opt) => opt.setName("reason").setDescription("Reason / introduction (optional)")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("approve")
        .setDescription("Approve a citizenship application (staff)")
        .addUserOption((opt) => opt.setName("user").setDescription("Applicant").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("reject")
        .setDescription("Reject a citizenship application (staff)")
        .addUserOption((opt) => opt.setName("user").setDescription("Applicant").setRequired(true))
        .addStringOption((opt) => opt.setName("reason").setDescription("Reason for rejection")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("profile")
        .setDescription("Show a citizen's passport")
        .addUserOption((opt) => opt.setName("user").setDescription("Member to check (default: you)")),
    )
    .addSubcommand((sub) => sub.setName("pending").setDescription("List pending applications (staff)")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId || !interaction.guild) return;

    const sub = interaction.options.getSubcommand();

    // approve/reject/pending は "register" "profile" と違いスタッフ限定。
    // サブコマンド単位ではDiscordの権限設定(setDefaultMemberPermissions)を使えないため、
    // 実行時にここでチェックする。
    const staffOnlySubcommands = ["approve", "reject", "pending"];
    if (staffOnlySubcommands.includes(sub) && !interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "You need the Manage Roles permission to use this." })], ephemeral: true });
      return;
    }

    if (sub === "register") {
      const role = interaction.options.getRole("role");
      const reason = interaction.options.getString("reason");

      try {
        await applyForCitizenship(interaction.guildId, interaction.user.id, role?.id ?? null, reason);
      } catch (error) {
        if (error instanceof CitizenError) {
          const message = error.message === "already_citizen" ? "You're already a citizen." : "You already have a pending application.";
          await interaction.reply({ embeds: [baseEmbed({ tone: "warning", description: message })], ephemeral: true });
          return;
        }
        throw error;
      }

      await interaction.reply({
        embeds: [
          baseEmbed({
            tone: "success",
            title: "Application Submitted",
            description: `Your citizenship application has been submitted${role ? ` for <@&${role.id}>` : ""}. Staff will review it soon.`,
          }),
        ],
        ephemeral: true,
      });
      return;
    }

    if (sub === "approve") {
      const target = interaction.options.getUser("user", true) as User;

      let record;
      try {
        record = await approveCitizenship(interaction.guildId, target.id, interaction.user.id);
      } catch (error) {
        if (error instanceof CitizenError) {
          await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "No pending application found for that user." })], ephemeral: true });
          return;
        }
        throw error;
      }

      if (record.requestedRoleId) {
        try {
          const member = await interaction.guild.members.fetch(target.id);
          await member.roles.add(record.requestedRoleId);
        } catch (error) {
          console.error("[Nyx.] Failed to assign citizenship role", error);
        }
      }

      await interaction.reply({
        embeds: [
          baseEmbed({
            tone: "success",
            title: "Citizenship Approved",
            description: `${target} is now citizen **#${record.citizenNumber}**${record.requestedRoleId ? ` with <@&${record.requestedRoleId}>` : ""}.`,
          }),
        ],
      });
      return;
    }

    if (sub === "reject") {
      const target = interaction.options.getUser("user", true) as User;
      const reason = interaction.options.getString("reason");

      try {
        await rejectCitizenship(interaction.guildId, target.id, interaction.user.id, reason);
      } catch (error) {
        if (error instanceof CitizenError) {
          await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "No pending application found for that user." })], ephemeral: true });
          return;
        }
        throw error;
      }

      await interaction.reply({
        embeds: [baseEmbed({ tone: "warning", description: `${target}'s citizenship application was rejected.${reason ? `\nReason: ${reason}` : ""}` })],
      });
      return;
    }

    if (sub === "profile") {
      const target = (interaction.options.getUser("user") ?? interaction.user) as User;
      const record = await getCitizen(interaction.guildId, target.id);

      if (!record || record.status !== "approved") {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "warning", description: `${target} is not a registered citizen yet.` })],
        });
        return;
      }

      await interaction.reply({
        embeds: [
          baseEmbed({
            tone: "primary",
            title: `Passport — ${target.username}`,
            description: [
              `**Citizen No.** \`#${record.citizenNumber}\``,
              `**Status:** Approved`,
              `**Registered:** <t:${Math.floor((record.approvedAt ?? record.appliedAt).getTime() / 1000)}:D>`,
              record.requestedRoleId ? `**Role:** <@&${record.requestedRoleId}>` : null,
            ]
              .filter(Boolean)
              .join("\n"),
          }),
        ],
      });
      return;
    }

    if (sub === "pending") {
      const applications = await getPendingApplications(interaction.guildId);

      if (applications.length === 0) {
        await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: "No pending applications." })], ephemeral: true });
        return;
      }

      const lines = applications.map((a) => `<@${a.userId}> — applied <t:${Math.floor(a.appliedAt.getTime() / 1000)}:R>${a.requestedRoleId ? ` (wants <@&${a.requestedRoleId}>)` : ""}`);

      await interaction.reply({
        embeds: [baseEmbed({ tone: "primary", title: `Pending Applications (${applications.length})`, description: lines.join("\n") })],
        ephemeral: true,
      });
    }
  },
};
