import { type Event, type RsvpOption, type Signup } from '../../../db/generated/prisma/client.js';
import { prisma } from './prisma.js';
import { logger } from '../utils/logger.js';

// ============================================================================
// TYPES
// ============================================================================

/** Input for a single RSVP option when creating an event. */
export interface CreateRsvpOptionInput {
    label: string;
    position: number;
    maxSlots: number | null;
}

/** Input required to create a new event. */
export interface CreateEventInput {
    discordServerId: string;
    channelId: string;
    createdBy: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    maxAttendees: number | null;
    waitlistEnabled: boolean;
    maxWaitlist: number | null;
    rsvpOptions: CreateRsvpOptionInput[];
}

/** An event with its RSVP options included. */
export type EventWithOptions = Event & {
    rsvpOptions: RsvpOption[];
};

/** An event with its RSVP options and signups included. */
export type EventWithDetails = Event & {
    rsvpOptions: (RsvpOption & {
        signups: Signup[];
    })[];
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates input for event creation.
 * Throws an error with a descriptive message if any constraint is violated.
 *
 * @param input - The event input to validate.
 * @throws If any validation constraint is violated.
 */
function validateCreateEventInput(input: CreateEventInput): void {
    if (input.startTime >= input.endTime) {
        throw new Error('Start time must be before end time.');
    }

    if (input.rsvpOptions.length === 0) {
        throw new Error('Event must have at least one RSVP option.');
    }

    if (input.maxAttendees !== null && input.maxAttendees < 1) {
        throw new Error('Max attendees must be at least 1.');
    }

    if (input.maxWaitlist !== null && input.maxWaitlist < 1) {
        throw new Error('Max waitlist must be at least 1.');
    }
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Creates a new event and its RSVP options in a single transaction.
 *
 * @param input - The event data and RSVP options to create.
 * @returns The created event with its RSVP options.
 * @throws If validation fails or the database transaction fails.
 */
export async function createEvent(input: CreateEventInput): Promise<EventWithOptions> {
    validateCreateEventInput(input);

    try {
        return await prisma.$transaction(async (tx: typeof prisma) => {
            return tx.event.create({
                data: {
                    discordServerId: input.discordServerId,
                    channelId: input.channelId,
                    createdBy: input.createdBy,
                    title: input.title,
                    description: input.description,
                    startTime: input.startTime,
                    endTime: input.endTime,
                    durationMinutes: input.durationMinutes,
                    maxAttendees: input.maxAttendees,
                    waitlistEnabled: input.waitlistEnabled,
                    maxWaitlist: input.maxWaitlist,
                    rsvpOptions: {
                        create: input.rsvpOptions.map((option) => ({
                            label: option.label,
                            position: option.position,
                            maxSlots: option.maxSlots,
                        })),
                    },
                },
                include: {
                    rsvpOptions: true,
                },
            });
        });
    } catch (error) {
        logger.error({ err: error }, '❌ [eventService] Failed to create event');
        throw new Error('Failed to create event. Please try again later.');
    }
}

/**
 * Retrieves a single event by its internal ID.
 * Includes RSVP options and their signups.
 *
 * @param id - The internal CUID of the event.
 * @returns The event with options and signups, or null if not found.
 * @throws If the database query fails.
 */
export async function getEventById(id: string): Promise<EventWithDetails | null> {
    try {
        return await prisma.event.findUnique({
            where: { id },
            include: {
                rsvpOptions: {
                    include: {
                        signups: true,
                    },
                },
            },
        });
    } catch (error) {
        logger.error({ err: error, id }, '❌ [eventService] Failed to fetch event by id');
        throw new Error('Failed to fetch event. Please try again later.');
    }
}

/**
 * Retrieves all non-deleted events for a given Discord server.
 * Includes RSVP options. Ordered by start time ascending.
 *
 * @param discordServerId - The Discord guild snowflake ID.
 * @returns An array of events with their RSVP options.
 * @throws If the database query fails.
 */
export async function getEventsByServer(discordServerId: string): Promise<EventWithOptions[]> {
    try {
        return await prisma.event.findMany({
            where: {
                discordServerId,
                deletedAt: null,
            },
            include: {
                rsvpOptions: true,
            },
            orderBy: {
                startTime: 'asc',
            },
        });
    } catch (error) {
        logger.error({ err: error, discordServerId }, '❌ [eventService] Failed to fetch events for server');
        throw new Error('Failed to fetch events. Please try again later.');
    }
}