import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";

export interface Command {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: any) => Promise<void>;
}

export class NyxClient extends Client {
  commands = new Collection<string, Command>();
}

export function createClient() {
  return new NyxClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers, // SERVER MEMBERS INTENT (要Developer Portalで有効化)
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent, // MESSAGE CONTENT INTENT (要Developer Portalで有効化)
      GatewayIntentBits.GuildVoiceStates, // 音楽再生に必要
      GatewayIntentBits.GuildMessageReactions, // リアクションロールに必要
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.User],
  });
}
