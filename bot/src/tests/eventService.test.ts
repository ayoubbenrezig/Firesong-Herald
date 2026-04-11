/**
 * Unit tests for eventService module.
 *
 * Tests cover:
 * - Event creation with validation (times, RSVP options, capacity)
 * - Event retrieval by ID and by server
 * - Error handling and user-friendly error messages
 * - Database transaction integrity
 *
 * Note: Audit logging and soft delete tests are NOT yet included
 * and should be added when those features are implemented.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import { type PrismaClient } from '../../../db/generated/prisma/client';

// ============================================================================
// MOCKS
// ============================================================================

vi.mock('../services/prisma', () => ({
    prisma: mockDeep<PrismaClient>(),
}));

vi.mock('../utils/logger', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

import { prisma } from '../services/prisma';
import {
    createEvent,
    getEventById,
    getEventsByServer,
    type CreateEventInput,
} from '../services/eventService';

const prismaMock = prisma as DeepMockProxy<PrismaClient>;

// ============================================================================
// FIXTURES
// ============================================================================

/**
 * Base input for testing event creation.
 * Valid in all aspects, use as template for invalid variants.
 */
const baseInput: CreateEventInput = {
    discordServerId: '123456789',
    channelId: '987654321',
    createdBy: '111111111',
    title: 'Palia Cooking Party',
    description: 'Bring your ingredients!',
    startTime: new Date('2026-05-01T18:00:00Z'),
    endTime: new Date('2026-05-01T20:00:00Z'),
    durationMinutes: 120,
    maxAttendees: 10,
    waitlistEnabled: false,
    maxWaitlist: null,
    rsvpOptions: [
        { label: 'Fish', position: 0, maxSlots: 3 },
        { label: 'Rice', position: 1, maxSlots: 3 },
    ],
};

/**
 * Base event object returned from the database.
 * Matches Prisma schema with sample CUID IDs and timestamps.
 */
const baseEvent = {
    id: 'cuid_event_1',
    discordServerId: '123456789',
    discordMessageId: null,
    channelId: '987654321',
    createdBy: '111111111',
    title: 'Palia Cooking Party',
    description: 'Bring your ingredients!',
    startTime: new Date('2026-05-01T18:00:00Z'),
    endTime: new Date('2026-05-01T20:00:00Z'),
    durationMinutes: 120,
    maxAttendees: 10,
    waitlistEnabled: false,
    maxWaitlist: null,
    status: 'draft' as const,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    rsvpOptions: [
        { id: 'cuid_opt_1', eventId: 'cuid_event_1', label: 'Fish', position: 0, maxSlots: 3 },
        { id: 'cuid_opt_2', eventId: 'cuid_event_1', label: 'Rice', position: 1, maxSlots: 3 },
    ],
};

// ============================================================================
// TESTS
// ============================================================================

beforeEach(() => {
    mockReset(prismaMock);
});

describe('createEvent', () => {
    it('creates an event and returns it with RSVP options', async () => {
        prismaMock.$transaction.mockImplementation(async (fn) => fn(prismaMock));
        prismaMock.event.create.mockResolvedValue(baseEvent);

        const result = await createEvent(baseInput);

        expect(prismaMock.event.create).toHaveBeenCalledOnce();
        expect(result).toEqual(baseEvent);
    });

    // ───── Validation Tests ─────
    // Time validation

    it('throws if startTime is after endTime', async () => {
        const input: CreateEventInput = {
            ...baseInput,
            startTime: new Date('2026-05-01T20:00:00Z'),
            endTime: new Date('2026-05-01T18:00:00Z'),
        };

        await expect(createEvent(input)).rejects.toThrow('Start time must be before end time.');
    });

    it('throws if startTime equals endTime', async () => {
        const time = new Date('2026-05-01T18:00:00Z');
        const input: CreateEventInput = {
            ...baseInput,
            startTime: time,
            endTime: time,
        };

        await expect(createEvent(input)).rejects.toThrow('Start time must be before end time.');
    });

    // RSVP option validation

    it('throws if rsvpOptions is empty', async () => {
        const input: CreateEventInput = { ...baseInput, rsvpOptions: [] };

        await expect(createEvent(input)).rejects.toThrow('Event must have at least one RSVP option.');
    });

    // Capacity validation

    it('throws if maxAttendees is zero', async () => {
        const input: CreateEventInput = { ...baseInput, maxAttendees: 0 };

        await expect(createEvent(input)).rejects.toThrow('Max attendees must be at least 1.');
    });

    it('throws if maxAttendees is negative', async () => {
        const input: CreateEventInput = { ...baseInput, maxAttendees: -5 };

        await expect(createEvent(input)).rejects.toThrow('Max attendees must be at least 1.');
    });

    it('throws if maxWaitlist is zero', async () => {
        const input: CreateEventInput = { ...baseInput, maxWaitlist: 0 };

        await expect(createEvent(input)).rejects.toThrow('Max waitlist must be at least 1.');
    });

    // Error handling

    it('throws a clean error if the database transaction fails', async () => {
        prismaMock.$transaction.mockImplementation(async (fn) => fn(prismaMock));
        prismaMock.event.create.mockRejectedValue(new Error('DB connection lost'));

        await expect(createEvent(baseInput)).rejects.toThrow('Failed to create event. Please try again later.');
    });
});

describe('getEventById', () => {
    it('returns the event with options and signups when found', async () => {
        const eventWithDetails = {
            ...baseEvent,
            rsvpOptions: baseEvent.rsvpOptions.map((opt) => ({ ...opt, signups: [] })),
        };

        prismaMock.event.findUnique.mockResolvedValue(eventWithDetails as any);

        const result = await getEventById('cuid_event_1');

        expect(prismaMock.event.findUnique).toHaveBeenCalledWith({
            where: { id: 'cuid_event_1' },
            include: { rsvpOptions: { include: { signups: true } } },
        });
        expect(result).toEqual(eventWithDetails);
    });

    it('returns null when the event is not found', async () => {
        prismaMock.event.findUnique.mockResolvedValue(null);

        const result = await getEventById('nonexistent_id');

        expect(result).toBeNull();
    });

    it('throws a clean error if the database query fails', async () => {
        prismaMock.event.findUnique.mockRejectedValue(new Error('DB error'));

        await expect(getEventById('cuid_event_1')).rejects.toThrow('Failed to fetch event. Please try again later.');
    });
});

describe('getEventsByServer', () => {
    it('returns all non-deleted events for a server ordered by startTime', async () => {
        prismaMock.event.findMany.mockResolvedValue([baseEvent]);

        const result = await getEventsByServer('123456789');

        expect(prismaMock.event.findMany).toHaveBeenCalledWith({
            where: { discordServerId: '123456789', deletedAt: null },
            include: { rsvpOptions: true },
            orderBy: { startTime: 'asc' },
        });
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(baseEvent);
    });

    it('returns an empty array when no events exist for the server', async () => {
        prismaMock.event.findMany.mockResolvedValue([]);

        const result = await getEventsByServer('123456789');

        expect(result).toEqual([]);
    });

    it('throws a clean error if the database query fails', async () => {
        prismaMock.event.findMany.mockRejectedValue(new Error('DB error'));

        await expect(getEventsByServer('123456789')).rejects.toThrow('Failed to fetch events. Please try again later.');
    });
});