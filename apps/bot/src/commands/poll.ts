import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction, type TextChannel } from "discord.js";
import { prisma } from "@nyx/database";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";
import { parseDuration } from "../utils/duration.js";
import { buildPollContainer, schedulePollClose } from "../utils/poll.js";

export const poll: Command = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll.")
    .addStringOption((opt) => opt.setName("question").setDescription("Poll question").setRequired(true))
    .addStringOption((opt) => opt.setName("option1").setDescription("Option 1").setRequired(true))
    .addStringOption((opt) => opt.setName("option2").setDescription("Option 2").setRequired(true))
    .addStringOption((opt) => opt.setName("option3").setDescription("Option 3"))
    .addStringOption((opt) => opt.setName("option4").setDescription("Option 4"))
    .addStringOption((opt) => opt.setName("option5").setDescription("Option 5"))
    .addStringOption((opt) => opt.setName("duration").setDescription("Auto-close after, e.g. 10m, 1h (default: stays open)")),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) return;

    const question = interaction.options.getString("question", true);
    const options = [1, 2, 3, 4, 5]
      .map((n) => interaction.options.getString(`option${n}`))
      .filter((o): o is string => Boolean(o));

    const durationInput = interaction.options.getString("duration");
    let closesAt: Date | undefined;
    if (durationInput) {
      const ms = parseDuration(durationInput);
      if (!ms) {
        await interaction.reply({
          embeds: [baseEmbed({ tone: "error", description: "Invalid duration. Use a format like `10m` or `1h`." })],
          ephemeral: true,
        });
        return;
      }
      closesAt = new Date(Date.now() + ms);
    }

    const channel = interaction.channel as TextChannel;
    const container = buildPollContainer({ question, options, closed: false, voteCounts: new Array(options.length).fill(0), pollId: "pending" });
    const message = await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });

    const pollRecord = await prisma.poll.create({
      data: { guildId: interaction.guildId, channelId: channel.id, messageId: message.id, question, options },
    });

    const finalContainer = buildPollContainer({ question, options, closed: false, voteCounts: new Array(options.length).fill(0), pollId: pollRecord.id });
    await message.edit({ components: [finalContainer], flags: MessageFlags.IsComponentsV2 });

    if (closesAt) schedulePollClose(interaction.client, pollRecord.id, closesAt);

    await interaction.reply({ embeds: [baseEmbed({ tone: "success", description: "Poll posted." })], ephemeral: true });
  },
};
