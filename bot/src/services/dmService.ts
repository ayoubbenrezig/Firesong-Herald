import { EmbedBuilder, type User } from 'discord.js';
import { Colours } from '../utils/colours.js';
import { Emoji } from '../utils/emojis.js';
import { logger } from '../utils/logger.js';

// ============================================================================
// DM SERVICE
// ============================================================================
// Centralised service for all bot direct messages.
// All DMs are routed through this module — never call user.send() directly.
//
// To add a new DM type:
//   1. Add a new entry to the DmType enum.
//   2. Add the corresponding payload interface to DmPayloadMap.
//   3. Add a builder function (buildX) for the embed/message.
//   4. Add the case to the switch in buildDmMessage.

// ============================================================================
// TYPES
// ============================================================================

/** All supported DM types. Extend this enum when adding new DM flows. */
export enum DmType {
    GuildRejected = 'GuildRejected',
    GuildApproved = 'GuildApproved',
}

/** Maps each DmType to its required payload shape. */
export type DmPayloadMap = {
    [DmType.GuildRejected]: {
        /** The name of the server the bot left. */
        serverName: string;
    };
    [DmType.GuildApproved]: {
        /** The name of the server that was registered. */
        serverName: string;
    };
};

/** A discriminated union of all possible DM payloads. */
export type DmPayload = {
    [K in DmType]: { type: K } & DmPayloadMap[K];
}[DmType];

// ============================================================================
// EMBED BUILDERS
// ============================================================================

/**
 * Builds the embed for a rejected (unapproved) guild DM.
 * Sent to the server owner when the bot leaves an unapproved server.
 */
function buildGuildRejectedEmbed(payload: DmPayloadMap[DmType.GuildRejected]): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(Colours.error)
        .setDescription(
            `${Emoji.LurkingOwl} Hey there!\n` +
            `\n` +
            `${Emoji.SadOwl} Thanks for adding Firesong Herald to **${payload.serverName}**. ` +
            `We're currently in closed testing and aren't accepting new servers just yet, ` +
            `so the bot has left your server for now.\n` +
            `\n` +
            `If you'd like to get involved, open a thread in our support server and we'll take it from there.\n` +
            `\n` +
            `https://discord.gg/e8eVQTB24z\n` +
            `\n` +
            `Take care!\n` +
            `— Your faithful Owl ${Emoji.FeatherHeart}`
        );
}

/**
 * Builds the embed for an approved guild DM.
 * Sent to the server owner when their server is successfully registered.
 */
function buildGuildApprovedEmbed(payload: DmPayloadMap[DmType.GuildApproved]): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(Colours.success)
        .setDescription(
            `${Emoji.LurkingOwl} Hey there!\n` +
            `\n` +
            `${Emoji.HappyOwl} You're in! **${payload.serverName}** has been registered and the bot is ready to go.\n` +
            `\n` +
            `If your community wants access to the dashboard too, they can sign up as dashboard testers:\n` +
            `\n` +
            `https://firesongherald.com\n` +
            `\n` +
            `Join our support server:\n` +
            `\n` +
            `https://discord.gg/e8eVQTB24z\n` +
            `\n` +
            `Welcome aboard!\n` +
            `— Your faithful Owl ${Emoji.FeatherSparkle}`
        );
}

// ============================================================================
// MESSAGE FACTORY
// ============================================================================

/**
 * Resolves the correct embed builder for the given DM payload.
 *
 * @param payload - The typed DM payload containing type and required data.
 * @returns An EmbedBuilder instance for the given DM type.
 */
function buildDmMessage(payload: DmPayload): EmbedBuilder {
    switch (payload.type) {
        case DmType.GuildRejected:
            return buildGuildRejectedEmbed(payload);
        case DmType.GuildApproved:
            return buildGuildApprovedEmbed(payload);
    }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Sends a direct message to a Discord user.
 *
 * Resolves the correct embed from the payload type, attempts to send the DM,
 * and handles the case where the user has DMs disabled gracefully.
 *
 * @param user    - The Discord.js User to send the DM to.
 * @param payload - The typed DM payload containing type and required data.
 * @returns `true` if the DM was sent successfully, `false` otherwise.
 *
 * @example
 * await sendDm(guild.owner.user, {
 *     type: DmType.GuildRejected,
 *     serverName: guild.name,
 * });
 */
export async function sendDm(user: User, payload: DmPayload): Promise<boolean> {
    try {
        const embed = buildDmMessage(payload);

        await user.send({ embeds: [embed] });

        logger.info(
            { discordUserId: user.id, dmType: payload.type },
            'DM sent successfully',
        );

        return true;
    } catch (error) {
        // Discord throws when a user has DMs disabled — log but do not throw.
        logger.warn(
            { err: error, discordUserId: user.id, dmType: payload.type },
            'Failed to send DM — user may have DMs disabled',
        );

        return false;
    }
}