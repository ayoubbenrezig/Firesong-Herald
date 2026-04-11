import { ModalSubmitInteraction } from 'discord.js';
import { createEvent } from '../services/eventService.js';
import { logger } from '../utils/logger.js';

/**
 * Handles all incoming modal submit interactions and routes them by custom ID.
 *
 * @param interaction - The incoming modal submit interaction.
 */
export async function handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    if (interaction.customId === 'event_create') {
        await handleEventCreate(interaction);
        return;
    }

    logger.warn({ customId: interaction.customId }, '⚠️ [modalSubmit] Unhandled modal customId');
}

/**
 * Processes the event creation modal submission.
 * Parses and validates user input, then persists the event via eventService.
 *
 * @param interaction - The modal submit interaction for event creation.
 */
async function handleEventCreate(interaction: ModalSubmitInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const title = interaction.fields.getTextInputValue('title').trim();
    const description = interaction.fields.getTextInputValue('description').trim() || null;
    const startTimeRaw = interaction.fields.getTextInputValue('start_time').trim();
    const endTimeRaw = interaction.fields.getTextInputValue('end_time').trim();
    const maxAttendeesRaw = interaction.fields.getTextInputValue('max_attendees').trim();

    if (!title) {
        await interaction.editReply('❌ Title cannot be empty.');
        return;
    }

    const startTime = parseDateTime(startTimeRaw);
    const endTime = parseDateTime(endTimeRaw);

    if (!startTime) {
        await interaction.editReply('❌ Invalid start time. Use format: YYYY-MM-DD HH:MM');
        return;
    }

    if (!endTime) {
        await interaction.editReply('❌ Invalid end time. Use format: YYYY-MM-DD HH:MM');
        return;
    }

    if (startTime >= endTime) {
        await interaction.editReply('❌ Start time must be before end time.');
        return;
    }

    let maxAttendees: number | null = null;
    if (maxAttendeesRaw !== '') {
        const parsed = Number(maxAttendeesRaw);
        if (!Number.isInteger(parsed) || parsed < 1) {
            await interaction.editReply('❌ Max attendees must be a positive number.');
            return;
        }
        maxAttendees = parsed;
    }

    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    if (!interaction.guildId || !interaction.channelId) {
        await interaction.editReply('❌ This command must be used inside a server channel.');
        return;
    }

    try {
        const event = await createEvent({
            discordServerId: interaction.guildId,
            channelId: interaction.channelId,
            createdBy: interaction.user.id,
            title,
            description,
            startTime,
            endTime,
            durationMinutes,
            maxAttendees,
            waitlistEnabled: false,
            maxWaitlist: null,
            rsvpOptions: [
                {
                    label: 'Sign Up',
                    position: 0,
                    maxSlots: null,
                },
            ],
        });

        await interaction.editReply(`✅ Event **${event.title}** created successfully.`);
    } catch (error) {
        logger.error({ err: error }, '❌ [modalSubmit] Failed to create event');
        await interaction.editReply('❌ Failed to create event. Please try again later.');
    }
}

/**
 * Parses a date-time string in the format YYYY-MM-DD HH:MM into a Date object.
 * Returns null if the input is invalid.
 *
 * @param value - The raw string to parse.
 * @returns A valid Date, or null if parsing fails.
 */
function parseDateTime(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})$/.exec(value);
    if (!match) return null;

    const [, year, month, day, hour, minute] = match.map(Number);
    const date = new Date(year, month - 1, day, hour, minute);

    if (isNaN(date.getTime())) return null;

    // Reject rolled-over dates e.g. Feb 30 becoming March 2
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day ||
        date.getHours() !== hour ||
        date.getMinutes() !== minute
    ) return null;

    return date;
}