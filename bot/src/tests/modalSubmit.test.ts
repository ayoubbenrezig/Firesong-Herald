/**
 * Unit tests for modalSubmit handler.
 *
 * Tests cover:
 * - Routing by customId
 * - Date/time parsing and validation
 * - Max attendees parsing and validation
 * - Guild/channel presence check
 * - Successful event creation
 * - Database failure handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import type { ModalSubmitInteraction } from 'discord.js';

// ============================================================================
// MOCKS
// ============================================================================

vi.mock('../services/eventService', () => ({
    createEvent: vi.fn(),
}));

vi.mock('../utils/logger', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

import { handleModalSubmit } from '../handlers/modalSubmit';
import { createEvent } from '../services/eventService';

const createEventMock = vi.mocked(createEvent);

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Builds a mock ModalSubmitInteraction with the given field values.
 */
function buildInteraction(fields: Record<string, string>, overrides: Partial<{
    customId: string;
    guildId: string | null;
    channelId: string | null;
    userId: string;
}> = {}): ModalSubmitInteraction {
    const interaction = mockDeep<ModalSubmitInteraction>();

    Object.defineProperty(interaction, 'customId', { value: overrides.customId ?? 'event_create', configurable: true });
    Object.defineProperty(interaction, 'guildId', { value: overrides.guildId !== undefined ? overrides.guildId : '123456789', configurable: true });
    Object.defineProperty(interaction, 'channelId', { value: overrides.channelId !== undefined ? overrides.channelId : '987654321', configurable: true });
    Object.defineProperty(interaction, 'user', { value: { id: overrides.userId ?? '111111111' }, configurable: true });

    interaction.fields.getTextInputValue.mockImplementation((key: string) => fields[key] ?? '');
    interaction.deferReply.mockResolvedValue(undefined as never);
    interaction.editReply.mockResolvedValue(undefined as never);

    return interaction as unknown as ModalSubmitInteraction;
}

// ============================================================================
// FIXTURES
// ============================================================================

const validFields = {
    title: 'Palia Cooking Party',
    description: 'Bring your ingredients!',
    start_time: '2026-06-01 20:00',
    end_time: '2026-06-01 22:00',
    max_attendees: '',
};

const baseEvent = {
    id: 'cuid_event_1',
    title: 'Palia Cooking Party',
    discordServerId: '123456789',
    channelId: '987654321',
    createdBy: '111111111',
    discordMessageId: null,
    description: 'Bring your ingredients!',
    startTime: new Date('2026-06-01T20:00:00'),
    endTime: new Date('2026-06-01T22:00:00'),
    durationMinutes: 120,
    maxAttendees: null,
    waitlistEnabled: false,
    maxWaitlist: null,
    status: 'draft' as const,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    rsvpOptions: [
        { id: 'cuid_opt_1', eventId: 'cuid_event_1', label: 'Sign Up', position: 0, maxSlots: null },
    ],
};

// ============================================================================
// TESTS
// ============================================================================

beforeEach(() => {
    vi.clearAllMocks();
});

describe('handleModalSubmit routing', () => {
    it('ignores unknown customIds and warns', async () => {
        const { logger } = await import('../utils/logger');
        const interaction = buildInteraction({}, { customId: 'unknown_modal' });

        await handleModalSubmit(interaction);

        expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({ customId: 'unknown_modal' }),
            expect.any(String),
        );
        expect(interaction.deferReply).not.toHaveBeenCalled();
    });
});

describe('handleModalSubmit — event_create', () => {

    // ───── Happy path ─────

    it('creates an event successfully with valid input', async () => {
        createEventMock.mockResolvedValue(baseEvent);
        const interaction = buildInteraction(validFields);

        await handleModalSubmit(interaction);

        expect(createEventMock).toHaveBeenCalledOnce();
        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Palia Cooking Party'),
        );
    });

    it('passes null description when description is empty', async () => {
        createEventMock.mockResolvedValue(baseEvent);
        const interaction = buildInteraction({ ...validFields, description: '' });

        await handleModalSubmit(interaction);

        expect(createEventMock).toHaveBeenCalledWith(
            expect.objectContaining({ description: null }),
        );
    });

    it('passes null maxAttendees when field is empty', async () => {
        createEventMock.mockResolvedValue(baseEvent);
        const interaction = buildInteraction({ ...validFields, max_attendees: '' });

        await handleModalSubmit(interaction);

        expect(createEventMock).toHaveBeenCalledWith(
            expect.objectContaining({ maxAttendees: null }),
        );
    });

    it('parses maxAttendees correctly when provided', async () => {
        createEventMock.mockResolvedValue(baseEvent);
        const interaction = buildInteraction({ ...validFields, max_attendees: '10' });

        await handleModalSubmit(interaction);

        expect(createEventMock).toHaveBeenCalledWith(
            expect.objectContaining({ maxAttendees: 10 }),
        );
    });

    it('calculates durationMinutes correctly', async () => {
        createEventMock.mockResolvedValue(baseEvent);
        const interaction = buildInteraction(validFields);

        await handleModalSubmit(interaction);

        expect(createEventMock).toHaveBeenCalledWith(
            expect.objectContaining({ durationMinutes: 120 }),
        );
    });

    it('injects default Sign Up RSVP option', async () => {
        createEventMock.mockResolvedValue(baseEvent);
        const interaction = buildInteraction(validFields);

        await handleModalSubmit(interaction);

        expect(createEventMock).toHaveBeenCalledWith(
            expect.objectContaining({
                rsvpOptions: [{ label: 'Sign Up', position: 0, maxSlots: null }],
            }),
        );
    });

    // ───── Start time validation ─────

    it('rejects invalid start time format', async () => {
        const interaction = buildInteraction({ ...validFields, start_time: 'not-a-date' });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Invalid start time'),
        );
        expect(createEventMock).not.toHaveBeenCalled();
    });

    it('rejects start time with wrong separator', async () => {
        const interaction = buildInteraction({ ...validFields, start_time: '2026/06/01 20:00' });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Invalid start time'),
        );
    });

    // ───── End time validation ─────

    it('rejects invalid end time format', async () => {
        const interaction = buildInteraction({ ...validFields, end_time: 'not-a-date' });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Invalid end time'),
        );
        expect(createEventMock).not.toHaveBeenCalled();
    });

    // ───── Time order validation ─────

    it('rejects when start time is after end time', async () => {
        const interaction = buildInteraction({
            ...validFields,
            start_time: '2026-06-01 22:00',
            end_time: '2026-06-01 20:00',
        });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Start time must be before end time'),
        );
        expect(createEventMock).not.toHaveBeenCalled();
    });

    it('rejects when start time equals end time', async () => {
        const interaction = buildInteraction({
            ...validFields,
            start_time: '2026-06-01 20:00',
            end_time: '2026-06-01 20:00',
        });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Start time must be before end time'),
        );
    });

    // ───── Max attendees validation ─────

    it('rejects non-numeric max attendees', async () => {
        const interaction = buildInteraction({ ...validFields, max_attendees: 'abc' });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Max attendees must be a positive number'),
        );
        expect(createEventMock).not.toHaveBeenCalled();
    });

    it('rejects zero max attendees', async () => {
        const interaction = buildInteraction({ ...validFields, max_attendees: '0' });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Max attendees must be a positive number'),
        );
    });

    it('rejects negative max attendees', async () => {
        const interaction = buildInteraction({ ...validFields, max_attendees: '-5' });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Max attendees must be a positive number'),
        );
    });

    // ───── Guild/channel checks ─────

    it('rejects when guildId is null', async () => {
        const interaction = buildInteraction(validFields, { guildId: null });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('server channel'),
        );
        expect(createEventMock).not.toHaveBeenCalled();
    });

    it('rejects when channelId is null', async () => {
        const interaction = buildInteraction(validFields, { channelId: null });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('server channel'),
        );
        expect(createEventMock).not.toHaveBeenCalled();
    });

    // ───── Title edge cases ─────

    it('rejects whitespace-only title', async () => {
        const interaction = buildInteraction({ ...validFields, title: '   ' });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Title cannot be empty'),
        );
        expect(createEventMock).not.toHaveBeenCalled();
    });

    // ───── Date edge cases ─────

    it('rejects impossible date like February 30', async () => {
        const interaction = buildInteraction({ ...validFields, start_time: '2026-02-30 20:00' });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Invalid start time'),
        );
        expect(createEventMock).not.toHaveBeenCalled();
    });

    it('rejects date with time missing', async () => {
        const interaction = buildInteraction({ ...validFields, start_time: '2026-06-01' });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Invalid start time'),
        );
    });

    it('rejects date with seconds included', async () => {
        const interaction = buildInteraction({ ...validFields, start_time: '2026-06-01 20:00:00' });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Invalid start time'),
        );
    });

    // ───── Max attendees edge cases ─────

    it('rejects decimal max attendees', async () => {
        const interaction = buildInteraction({ ...validFields, max_attendees: '1.5' });

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Max attendees must be a positive number'),
        );
        expect(createEventMock).not.toHaveBeenCalled();
    });

    it('accepts max attendees of 1', async () => {
        createEventMock.mockResolvedValue(baseEvent);
        const interaction = buildInteraction({ ...validFields, max_attendees: '1' });

        await handleModalSubmit(interaction);

        expect(createEventMock).toHaveBeenCalledWith(
            expect.objectContaining({ maxAttendees: 1 }),
        );
    });

    // ───── Database failure ─────

    it('handles createEvent failure gracefully', async () => {
        createEventMock.mockRejectedValue(new Error('DB error'));
        const interaction = buildInteraction(validFields);

        await handleModalSubmit(interaction);

        expect(interaction.editReply).toHaveBeenCalledWith(
            expect.stringContaining('Failed to create event'),
        );
    });
});