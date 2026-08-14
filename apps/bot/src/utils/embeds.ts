import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  EmbedBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from "discord.js";

/**
 * Nyx. の既定カラーパレット。
 * サーバーごとに GuildSettings で上書きされる想定(ダッシュボードから変更可能)。
 */
export const DEFAULT_COLORS = {
  primary: 0xefe8d8,
  success: 0xefe8d8,
  warning: 0xefe8d8,
  error: 0xefe8d8,
} as const;

export type EmbedTone = keyof typeof DEFAULT_COLORS;

interface BaseEmbedOptions {
  tone?: EmbedTone;
  title?: string;
  description?: string;
  footer?: string;
  colors?: Partial<Record<EmbedTone, number>>;
}

/**
 * 基本のEmbedを組み立てる。
 * 絵文字は使わず、見出し(###)・引用(>)・インラインコードで視覚的な階層を作る運用を前提とする。
 */
export function baseEmbed({ tone = "primary", title, description, footer, colors }: BaseEmbedOptions) {
  const palette = { ...DEFAULT_COLORS, ...colors };
  const embed = new EmbedBuilder().setColor(palette[tone]);

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (footer) embed.setFooter({ text: footer });

  return embed;
}

interface PanelButton {
  label: string;
  style?: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger;
  /** インタラクションボタン(Bot側でinteractionCreateを処理する)にする場合はこちら */
  customId?: string;
  /** Linkボタン(直接URLを開く)にする場合はこちら。customIdとは併用不可。 */
  url?: string;
}

interface PanelOptions {
  title: string;
  intro: string;
  button?: PanelButton;
  /** "Powered by **Nyx.**" のようなクレジット行。ボタンの下に小さいグレー文字で表示される。 */
  creditLine?: string;
  tone?: EmbedTone;
  colors?: Partial<Record<EmbedTone, number>>;
}

/**
 * Double Counterの認証パネルと同じ構成(見出し + 本文 → 区切り線 → ボタン → 区切り線 → クレジット)を
 * Components V2 (ContainerBuilder) で組み立てる。
 *
 * 通常のEmbedでは「ボタンは常にEmbedの下」という制約があり、区切り線でボタンを挟む配置ができない。
 * Components V2 なら TextDisplay / Separator / ActionRow を自由な順番で並べられるため、これが再現できる。
 *
 * 送信時は `flags: MessageFlags.IsComponentsV2` を必ず付ける。Componentsを使う場合、
 * 同じメッセージに `embeds` や `content` は併用できない。
 *
 * @example
 * const container = buildPanel({
 *   title: "Verify to access this server",
 *   intro: "This server is protected by **Nyx.**. Click the button below to verify.",
 *   button: { label: "Verify my account", style: ButtonStyle.Success, customId: "verify:start" },
 *   creditLine: "Powered by **Nyx.**",
 * });
 * await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
 */
export function buildPanel({ title, intro, button, creditLine, tone = "primary", colors }: PanelOptions) {
  const palette = { ...DEFAULT_COLORS, ...colors };

  const container = new ContainerBuilder().setAccentColor(palette[tone]);

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${title}\n\n${intro}`));

  if (button) {
    container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    const btn = new ButtonBuilder().setLabel(button.label);
    if (button.url) {
      btn.setStyle(ButtonStyle.Link).setURL(button.url);
    } else {
      btn.setStyle(button.style ?? ButtonStyle.Success).setCustomId(button.customId!);
    }

    container.addActionRowComponents(new ActionRowBuilder<ButtonBuilder>().addComponents(btn));
  }

  if (creditLine) {
    container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${creditLine}`));
  }

  return container;
}

interface MultiButtonPanelOptions {
  title: string;
  intro: string;
  buttons: { label: string; customId: string; style?: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger }[];
  creditLine?: string;
  tone?: EmbedTone;
  colors?: Partial<Record<EmbedTone, number>>;
}

/**
 * 複数ボタン(最大25個、5個ずつ行に分割)を並べるパネル。ロールパネルなどに使用する。
 * 見た目は buildPanel と同じ見出し+説明の構成に、ActionRowを複数追加する。
 */
export function buildMultiButtonPanel({ title, intro, buttons, creditLine, tone = "primary", colors }: MultiButtonPanelOptions) {
  const palette = { ...DEFAULT_COLORS, ...colors };
  const container = new ContainerBuilder().setAccentColor(palette[tone]);

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${title}\n\n${intro}`));

  if (buttons.length > 0) {
    container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    for (let i = 0; i < buttons.length; i += 5) {
      const chunk = buttons.slice(i, i + 5);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        chunk.map((b) => new ButtonBuilder().setLabel(b.label).setCustomId(b.customId).setStyle(b.style ?? ButtonStyle.Secondary)),
      );
      container.addActionRowComponents(row);
    }
  }

  if (creditLine) {
    container.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${creditLine}`));
  }

  return container;
}
