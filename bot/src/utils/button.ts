import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type MessageActionRowComponentBuilder,
} from 'discord.js';

// ============================================================================
// BUTTON BUILDER UTILITY
// ============================================================================
// Centralised factory functions for Discord buttons and action rows.
// All buttons should be constructed via these helpers to ensure consistency.

/** Options accepted by {@link buildButton}. */
export interface ButtonOptions {
    /** The custom ID used to identify this button in interaction events. */
    customId: string;
    /** The label displayed on the button. */
    label: string;
    /** The visual style of the button. */
    style: ButtonStyle;
    /** Whether the button is disabled. Defaults to `false`. */
    disabled?: boolean;
    /** Optional emoji displayed before the label. */
    emoji?: string;
}

/**
 * Builds a single {@link ButtonBuilder} from the provided options.
 *
 * @param options - Configuration for the button.
 * @returns A configured {@link ButtonBuilder}.
 *
 * @example
 * ```ts
 * const btn = buildButton({
 *     customId: 'confirm_delete',
 *     label: 'Yes, delete my account',
 *     style: ButtonStyle.Danger,
 * });
 * ```
 */
export function buildButton(options: ButtonOptions): ButtonBuilder {
    const { customId, label, style, disabled = false, emoji } = options;

    const button = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(style)
        .setDisabled(disabled);

    if (emoji) button.setEmoji(emoji);

    return button;
}

/**
 * Wraps one or more {@link ButtonBuilder} instances into an {@link ActionRowBuilder}.
 * Discord permits a maximum of five buttons per action row.
 *
 * @param buttons - One or more buttons to include in the row.
 * @returns A configured {@link ActionRowBuilder}.
 *
 * @example
 * ```ts
 * const row = buildActionRow(confirmButton, cancelButton);
 * await interaction.reply({ embeds: [embed], components: [row] });
 * ```
 */
export function buildActionRow(
    ...buttons: ButtonBuilder[]
): ActionRowBuilder<MessageActionRowComponentBuilder> {
    return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(...buttons);
}