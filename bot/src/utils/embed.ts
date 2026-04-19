import { EmbedBuilder, type RestOrArray, type APIEmbedField } from 'discord.js';
import { Colours } from './colours.js';

// ============================================================================
// EMBED BUILDER UTILITY
// ============================================================================
// Centralised factory functions for Discord embeds.
// All embeds should be constructed via these helpers to ensure consistency.

/** Supported colour keys from the centralised Colours map. */
export type ColourKey = keyof typeof Colours;

/** Options accepted by {@link buildEmbed}. */
export interface EmbedOptions {
    /** Colour key from {@link Colours}. Defaults to `'info'`. */
    colour?: ColourKey;
    /** Main body text of the embed. */
    description?: string;
    /** Optional title shown above the description. */
    title?: string;
    /** Optional fields appended below the description. */
    fields?: RestOrArray<APIEmbedField>;
    /** Optional footer text. */
    footer?: string;
    /** Optional thumbnail URL. */
    thumbnail?: string;
}

/**
 * Builds a styled {@link EmbedBuilder} from the provided options.
 * Uses centralised {@link Colours} to ensure colour consistency.
 *
 * @param options - Configuration for the embed.
 * @returns A configured {@link EmbedBuilder} ready to send.
 *
 * @example
 * ```ts
 * const embed = buildEmbed({
 *     colour: 'error',
 *     title: 'Something went wrong',
 *     description: 'Please try again later.',
 * });
 * await interaction.reply({ embeds: [embed], ephemeral: true });
 * ```
 */
export function buildEmbed(options: EmbedOptions): EmbedBuilder {
    const { colour = 'info', description, title, fields, footer, thumbnail } = options;

    const embed = new EmbedBuilder().setColor(Colours[colour]);

    if (title)       embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (fields)      embed.addFields(...(Array.isArray(fields) ? fields : [fields]));
    if (footer)      embed.setFooter({ text: footer });
    if (thumbnail)   embed.setThumbnail(thumbnail);

    return embed;
}

/**
 * Shorthand for a success-coloured embed.
 *
 * @param description - The message body.
 * @param title       - Optional title.
 */
export function successEmbed(description: string, title?: string): EmbedBuilder {
    return buildEmbed({ colour: 'success', description, title });
}

/**
 * Shorthand for an error-coloured embed.
 *
 * @param description - The message body.
 * @param title       - Optional title.
 */
export function errorEmbed(description: string, title?: string): EmbedBuilder {
    return buildEmbed({ colour: 'error', description, title });
}

/**
 * Shorthand for an info-coloured embed.
 *
 * @param description - The message body.
 * @param title       - Optional title.
 */
export function infoEmbed(description: string, title?: string): EmbedBuilder {
    return buildEmbed({ colour: 'info', description, title });
}