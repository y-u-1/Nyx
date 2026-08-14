import { ChannelType, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../client.js";
import { baseEmbed } from "../utils/embeds.js";

export const serverinfo: Command = {
  data: new SlashCommandBuilder().setName("serverinfo").setDescription("Show statistics and info about this server."),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;

    const guild = interaction.guild;
    await guild.members.fetch().catch(() => null);

    const textChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;
    const boostCount = guild.premiumSubscriptionCount ?? 0;
    const onlineCount = guild.members.cache.filter((m) => m.presence?.status && m.presence.status !== "offline").size;

    const lines = [
      `**Members:** \`${guild.memberCount}\` (\`${onlineCount}\` online)`,
      `**Text channels:** \`${textChannels}\``,
      `**Voice channels:** \`${voiceChannels}\``,
      `**Roles:** \`${guild.roles.cache.size}\``,
      `**Boosts:** \`${boostCount}\``,
      `**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
      `**Owner:** <@${guild.ownerId}>`,
    ];

    await interaction.reply({
      embeds: [baseEmbed({ tone: "primary", title: guild.name, description: lines.join("\n") })],
    });
  },
};
