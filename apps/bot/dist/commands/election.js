import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { baseEmbed } from "../utils/embeds.js";
import { parseDuration } from "../utils/duration.js";
import { createElection, getActiveElection, registerCandidate, castVote, tallyVotes, scheduleElectionPhaseTimers, cancelElection, ElectionError, } from "../utils/election.js";
export const election = {
    data: new SlashCommandBuilder()
        .setName("election")
        .setDescription("Run elections with a registration period, voting period, and optional term.")
        .addSubcommand((sub) => sub
        .setName("start")
        .setDescription("Start a new election (staff)")
        .addStringOption((opt) => opt.setName("title").setDescription("Election title, e.g. King's Election").setRequired(true))
        .addRoleOption((opt) => opt.setName("role").setDescription("Role to grant the winner").setRequired(true))
        .addStringOption((opt) => opt.setName("registration_duration").setDescription("Candidacy registration period, e.g. 1d").setRequired(true))
        .addStringOption((opt) => opt.setName("voting_duration").setDescription("Voting period, e.g. 1d").setRequired(true))
        .addIntegerOption((opt) => opt.setName("term_days").setDescription("Term length in days (omit for indefinite)").setMinValue(1).setMaxValue(3650)))
        .addSubcommand((sub) => sub
        .setName("candidate")
        .setDescription("Register as a candidate in the current election")
        .addStringOption((opt) => opt.setName("manifesto").setDescription("Your pitch to voters (optional)")))
        .addSubcommand((sub) => sub
        .setName("vote")
        .setDescription("Vote in the current election")
        .addUserOption((opt) => opt.setName("candidate").setDescription("Who you're voting for").setRequired(true)))
        .addSubcommand((sub) => sub.setName("results").setDescription("Show the current standings"))
        .addSubcommand((sub) => sub.setName("cancel").setDescription("Cancel the current election (staff)")),
    async execute(interaction) {
        if (!interaction.guildId)
            return;
        const sub = interaction.options.getSubcommand();
        // start/cancel はスタッフ限定。サブコマンド単位ではDiscordの権限設定を使えないため実行時にチェックする。
        if (["start", "cancel"].includes(sub) && !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "You need the Manage Server permission to use this." })], ephemeral: true });
            return;
        }
        if (sub === "start") {
            const title = interaction.options.getString("title", true);
            const role = interaction.options.getRole("role", true);
            const registrationDuration = interaction.options.getString("registration_duration", true);
            const votingDuration = interaction.options.getString("voting_duration", true);
            const termDays = interaction.options.getInteger("term_days");
            const registrationMs = parseDuration(registrationDuration);
            const votingMs = parseDuration(votingDuration);
            if (!registrationMs || !votingMs) {
                await interaction.reply({
                    embeds: [baseEmbed({ tone: "error", description: "Invalid duration format. Use e.g. `30m`, `2h`, `1d`." })],
                    ephemeral: true,
                });
                return;
            }
            const existing = await getActiveElection(interaction.guildId);
            if (existing) {
                await interaction.reply({
                    embeds: [baseEmbed({ tone: "warning", description: `There's already an active election: **${existing.title}**. Cancel it first with \`/election cancel\`.` })],
                    ephemeral: true,
                });
                return;
            }
            const newElection = await createElection({
                guildId: interaction.guildId,
                channelId: interaction.channelId,
                title,
                roleId: role.id,
                registrationMs,
                votingMs,
                termDays,
                createdById: interaction.user.id,
            });
            scheduleElectionPhaseTimers(interaction.client, newElection);
            await interaction.reply({
                embeds: [
                    baseEmbed({
                        tone: "success",
                        title: `Election Started — ${title}`,
                        description: [
                            `Winner receives <@&${role.id}>.`,
                            `Candidacy registration ends <t:${Math.floor(newElection.registrationEndsAt.getTime() / 1000)}:R>.`,
                            `Voting ends <t:${Math.floor(newElection.votingEndsAt.getTime() / 1000)}:R>.`,
                            termDays ? `Term length: ${termDays} day(s).` : "Term: indefinite.",
                            "Run `/election candidate` to run, and `/election vote` once voting opens.",
                        ].join("\n"),
                    }),
                ],
            });
            return;
        }
        if (sub === "candidate") {
            const manifesto = interaction.options.getString("manifesto");
            const activeElection = await getActiveElection(interaction.guildId);
            if (!activeElection) {
                await interaction.reply({ embeds: [baseEmbed({ tone: "warning", description: "There's no active election right now." })], ephemeral: true });
                return;
            }
            try {
                await registerCandidate(activeElection.id, interaction.user.id, manifesto);
            }
            catch (error) {
                if (error instanceof ElectionError) {
                    await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: "Candidacy registration is closed for this election." })], ephemeral: true });
                    return;
                }
                throw error;
            }
            await interaction.reply({
                embeds: [baseEmbed({ tone: "success", description: `You're registered as a candidate for **${activeElection.title}**.` })],
            });
            return;
        }
        if (sub === "vote") {
            const candidate = interaction.options.getUser("candidate", true);
            const activeElection = await getActiveElection(interaction.guildId);
            if (!activeElection) {
                await interaction.reply({ embeds: [baseEmbed({ tone: "warning", description: "There's no active election right now." })], ephemeral: true });
                return;
            }
            try {
                await castVote(activeElection.id, interaction.user.id, candidate.id);
            }
            catch (error) {
                if (error instanceof ElectionError) {
                    const message = error.message === "not_in_voting" ? "Voting hasn't opened yet for this election." : "That user isn't a registered candidate.";
                    await interaction.reply({ embeds: [baseEmbed({ tone: "error", description: message })], ephemeral: true });
                    return;
                }
                throw error;
            }
            await interaction.reply({
                embeds: [baseEmbed({ tone: "success", description: `Your vote for ${candidate} has been recorded.` })],
                ephemeral: true,
            });
            return;
        }
        if (sub === "results") {
            const currentElection = await getActiveElection(interaction.guildId);
            if (!currentElection) {
                await interaction.reply({ embeds: [baseEmbed({ tone: "warning", description: "There's no active election right now." })] });
                return;
            }
            const results = await tallyVotes(currentElection.id);
            if (results.length === 0) {
                await interaction.reply({ embeds: [baseEmbed({ tone: "primary", description: `No candidates have registered for **${currentElection.title}** yet.` })] });
                return;
            }
            const lines = results.map((r, i) => `\`${i + 1}.\` <@${r.userId}> — **${r.votes}** votes${r.manifesto ? `\n> ${r.manifesto}` : ""}`);
            await interaction.reply({
                embeds: [baseEmbed({ tone: "primary", title: `${currentElection.title} — Standings (${currentElection.status})`, description: lines.join("\n") })],
            });
            return;
        }
        if (sub === "cancel") {
            const activeElection = await getActiveElection(interaction.guildId);
            if (!activeElection) {
                await interaction.reply({ embeds: [baseEmbed({ tone: "warning", description: "There's no active election to cancel." })], ephemeral: true });
                return;
            }
            await cancelElection(activeElection.id);
            await interaction.reply({
                embeds: [baseEmbed({ tone: "warning", description: `**${activeElection.title}** has been cancelled.` })],
            });
        }
    },
};
//# sourceMappingURL=election.js.map