import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction, type Role, type User } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import {
  createUnit,
  getUnit,
  listUnits,
  createRank,
  listRanks,
  joinUnit,
  leaveUnit,
  getMember,
  setRank,
  addPoints,
  getUnitLeaderboard,
  MilitaryError,
} from "../utils/military.js";

export const military: Command = {
  data: new SlashCommandBuilder()
    .setName("military")
    .setDescription("Manage military units, ranks, and members.")
    .addSubcommandGroup((group) =>
      group
        .setName("unit")
        .setDescription("Manage units (staff)")
        .addSubcommand((sub) =>
          sub
            .setName("create")
            .setDescription("Create a new unit")
            .addStringOption((opt) => opt.setName("name").setDescription("Unit name").setRequired(true))
            .addRoleOption((opt) => opt.setName("role").setDescription("Role granted to members of this unit")),
        )
        .addSubcommand((sub) => sub.setName("list").setDescription("List all units")),
    )
    .addSubcommandGroup((group) =>
      group
        .setName("rank")
        .setDescription("Manage ranks within a unit (staff)")
        .addSubcommand((sub) =>
          sub
            .setName("create")
            .setDescription("Create a new rank")
            .addStringOption((opt) => opt.setName("unit").setDescription("Unit name").setRequired(true))
            .addStringOption((opt) => opt.setName("name").setDescription("Rank name").setRequired(true))
            .addIntegerOption((opt) => opt.setName("order").setDescription("Rank order (higher = more senior)").setRequired(true))
            .addRoleOption((opt) => opt.setName("role").setDescription("Role granted at this rank"))
            .addIntegerOption((opt) => opt.setName("required_points").setDescription("Suggested points threshold (informational)").setMinValue(0)),
        )
        .addSubcommand((sub) =>
          sub.setName("list").setDescription("List ranks in a unit").addStringOption((opt) => opt.setName("unit").setDescription("Unit name").setRequired(true)),
        ),
    )
    .addSubcommand((sub) => sub.setName("join").setDescription("Join a unit").addStringOption((opt) => opt.setName("unit").setDescription("Unit name").setRequired(true)))
    .addSubcommand((sub) => sub.setName("leave").setDescription("Leave your current unit"))
    .addSubcommand((sub) =>
      sub
        .setName("promote")
        .setDescription("Set a member's rank (staff)")
        .addUserOption((opt) => opt.setName("user").setDescription("Member").setRequired(true))
        .addStringOption((opt) => opt.setName("rank").setDescription("Rank name").setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("points")
        .setDescription("Add merit points to a member (staff)")
        .addUserOption((opt) => opt.setName("user").setDescription("Member").setRequired(true))
        .addIntegerOption((opt) => opt.setName("amount").setDescription("Points to add").setRequired(true).setMinValue(1).setMaxValue(1_000_000)),
    )
    .addSubcommand((sub) =>
      sub
        .setName("profile")
        .setDescription("Show a member's unit, rank, and points")
        .addUserOption((opt) => opt.setName("user").setDescription("Member to check (default: you)")),
    )
    .addSubcommand((sub) =>
      sub
        .setName("leaderboard")
        .setDescription("Show the points leaderboard for a unit")
        .addStringOption((opt) => opt.setName("unit").setDescription("Unit name").setRequired(true)),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId || !interaction.guild) return;

    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand();

    // unit/rank作成、昇進、ポイント付与はスタッフ限定。サブコマンド単位ではDiscordの権限設定を
    // 使えないため実行時にチェックする(join/leave/profile/list/leaderboardは誰でも可)。
    const staffOnlySubcommands = ["create", "promote", "points"];
    if (staffOnlySubcommands.includes(sub) && !interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "You need the Manage Roles permission to use this." })], ephemeral: true });
      return;
    }

    if (group === "unit") {
      if (sub === "create") {
        const name = interaction.options.getString("name", true);
        const role = interaction.options.getRole("role") as Role | null;

        try {
          await createUnit(interaction.guildId, name, role?.id ?? null);
        } catch (error) {
          if (error instanceof MilitaryError) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: `A unit named **${name}** already exists.` })], ephemeral: true });
            return;
          }
          throw error;
        }

        await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Unit **${name}** created.${role ? ` Members will receive <@&${role.id}>.` : ""}` })] });
        return;
      }

      if (sub === "list") {
        const units = await listUnits(interaction.guildId);
        if (units.length === 0) {
          await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: "No units created yet." })] });
          return;
        }
        const lines = units.map((u) => `**${u.name}**${u.roleId ? ` — <@&${u.roleId}>` : ""}`);
        await interaction.reply({ embeds: [baseEmbed({ tone: "primary", title: "Units", description: lines.join("\n") })] });
        return;
      }
    }

    if (group === "rank") {
      if (sub === "create") {
        const unitName = interaction.options.getString("unit", true);
        const name = interaction.options.getString("name", true);
        const order = interaction.options.getInteger("order", true);
        const role = interaction.options.getRole("role") as Role | null;
        const requiredPoints = interaction.options.getInteger("required_points") ?? 0;

        const unit = await getUnit(interaction.guildId, unitName);
        if (!unit) {
          await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: `No unit named **${unitName}** found.` })], ephemeral: true });
          return;
        }

        try {
          await createRank(interaction.guildId, unit.id, name, order, role?.id ?? null, requiredPoints);
        } catch (error) {
          if (error instanceof MilitaryError) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: `Rank **${name}** already exists in **${unitName}**.` })], ephemeral: true });
            return;
          }
          throw error;
        }

        await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Rank **${name}** added to **${unitName}**.` })] });
        return;
      }

      if (sub === "list") {
        const unitName = interaction.options.getString("unit", true);
        const unit = await getUnit(interaction.guildId, unitName);
        if (!unit) {
          await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: `No unit named **${unitName}** found.` })], ephemeral: true });
          return;
        }

        const ranks = await listRanks(unit.id);
        if (ranks.length === 0) {
          await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: `**${unitName}** has no ranks defined yet.` })] });
          return;
        }

        const lines = ranks.map((r) => `**${r.name}** (order ${r.order})${r.roleId ? ` — <@&${r.roleId}>` : ""}${r.requiredPoints ? ` — ${r.requiredPoints}pt+` : ""}`);
        await interaction.reply({ embeds: [baseEmbed({ tone: "primary", title: `${unitName} — Ranks`, description: lines.join("\n") })] });
        return;
      }
    }

    if (sub === "join") {
      const unitName = interaction.options.getString("unit", true);
      const unit = await getUnit(interaction.guildId, unitName);
      if (!unit) {
        await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: `No unit named **${unitName}** found.` })], ephemeral: true });
        return;
      }

      try {
        await joinUnit(interaction.guildId, interaction.user.id, unit.id);
      } catch (error) {
        if (error instanceof MilitaryError) {
          await interaction.reply({ embeds: [baseEmbed({ tone: "warning", description: "You're already in a unit. Leave it first with `/military leave`." })], ephemeral: true });
          return;
        }
        throw error;
      }

      if (unit.roleId) {
        try {
          const member = await interaction.guild.members.fetch(interaction.user.id);
          await member.roles.add(unit.roleId);
        } catch (error) {
          console.error("[Nyx.] Failed to assign unit role", error);
        }
      }

      await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Welcome to **${unitName}**!` })] });
      return;
    }

    if (sub === "leave") {
      let existing;
      try {
        existing = await leaveUnit(interaction.guildId, interaction.user.id);
      } catch (error) {
        if (error instanceof MilitaryError) {
          await interaction.reply({ embeds: [baseEmbed({ tone: "warning", description: "You're not currently in a unit." })], ephemeral: true });
          return;
        }
        throw error;
      }

      await interaction.reply({ embeds: [baseEmbed({ tone: "warning", description: "You've left your unit." })] });
      return;
    }

    if (sub === "promote") {
      const target = interaction.options.getUser("user", true) as User;
      const rankName = interaction.options.getString("rank", true);

      const member = await getMember(interaction.guildId, target.id);
      if (!member) {
        await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: `${target} isn't in a unit.` })], ephemeral: true });
        return;
      }

      const ranks = await listRanks(member.unitId);
      const rank = ranks.find((r) => r.name === rankName);
      if (!rank) {
        await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: `No rank named **${rankName}** found in ${target}'s unit.` })], ephemeral: true });
        return;
      }

      await setRank(interaction.guildId, target.id, rank.id);

      try {
        const guildMember = await interaction.guild.members.fetch(target.id);
        if (member.rank?.roleId) await guildMember.roles.remove(member.rank.roleId).catch(() => {});
        if (rank.roleId) await guildMember.roles.add(rank.roleId).catch(() => {});
      } catch (error) {
        console.error("[Nyx.] Failed to update rank role", error);
      }

      await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `${target} is now **${rankName}**.` })] });
      return;
    }

    if (sub === "points") {
      const target = interaction.options.getUser("user", true) as User;
      const amount = interaction.options.getInteger("amount", true);

      try {
        await addPoints(interaction.guildId, target.id, amount);
      } catch (error) {
        if (error instanceof MilitaryError) {
          await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: `${target} isn't in a unit.` })], ephemeral: true });
          return;
        }
        throw error;
      }

      await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: `Gave ${target} **+${amount}** points.` })] });
      return;
    }

    if (sub === "profile") {
      const target = (interaction.options.getUser("user") ?? interaction.user) as User;
      const member = await getMember(interaction.guildId, target.id);

      if (!member) {
        await interaction.reply({ embeds: [baseEmbed({ tone: "warning", description: `${target} isn't in a unit yet.` })] });
        return;
      }

      await interaction.reply({
        embeds: [
          baseEmbed({
            tone: "primary",
            title: `${target.username} — ${member.unit.name}`,
            description: `**Rank:** ${member.rank?.name ?? "None"}\n**Points:** ${member.points}\n**Joined:** <t:${Math.floor(member.joinedAt.getTime() / 1000)}:D>`,
          }),
        ],
      });
      return;
    }

    if (sub === "leaderboard") {
      const unitName = interaction.options.getString("unit", true);
      const unit = await getUnit(interaction.guildId, unitName);
      if (!unit) {
        await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: `No unit named **${unitName}** found.` })], ephemeral: true });
        return;
      }

      const rows = await getUnitLeaderboard(unit.id);
      if (rows.length === 0) {
        await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: `**${unitName}** has no members yet.` })] });
        return;
      }

      const lines = rows.map((r, i) => `\`${i + 1}.\` <@${r.userId}> — **${r.points}**pt${r.rank ? ` (${r.rank.name})` : ""}`);
      await interaction.reply({ embeds: [baseEmbed({ tone: "primary", title: `${unitName} — Leaderboard`, description: lines.join("\n") })] });
    }
  },
};
