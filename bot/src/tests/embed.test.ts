/**
 * Unit tests for bot/src/utils/embed.ts
 *
 * Tests cover:
 * - buildEmbed sets correct colour from Colours map
 * - buildEmbed sets title, description, footer, thumbnail when provided
 * - buildEmbed omits optional fields when not provided
 * - buildEmbed defaults to info colour when no colour provided
 * - successEmbed, errorEmbed, infoEmbed use correct colours and set description and title
 */

import { describe, it, expect } from 'vitest';
import { buildEmbed, successEmbed, errorEmbed, infoEmbed } from '../utils/embed.js';
import { Colours } from '../utils/colours.js';

// ============================================================================
// buildEmbed
// ============================================================================

describe('buildEmbed', () => {

    it('sets the correct colour for each colour key', () => {
        const keys = ['owner', 'admin', 'success', 'error', 'info'] as const;

        for (const key of keys) {
            const embed = buildEmbed({ colour: key });
            expect(embed.toJSON().color).toBe(Colours[key]);
        }
    });

    it('defaults to info colour when no colour is provided', () => {
        const embed = buildEmbed({});
        expect(embed.toJSON().color).toBe(Colours.info);
    });

    it('sets title when provided', () => {
        const embed = buildEmbed({ title: 'Test Title' });
        expect(embed.toJSON().title).toBe('Test Title');
    });

    it('sets description when provided', () => {
        const embed = buildEmbed({ description: 'Test description' });
        expect(embed.toJSON().description).toBe('Test description');
    });

    it('sets footer when provided', () => {
        const embed = buildEmbed({ footer: 'Test footer' });
        expect(embed.toJSON().footer?.text).toBe('Test footer');
    });

    it('sets thumbnail when provided', () => {
        const embed = buildEmbed({ thumbnail: 'https://example.com/image.png' });
        expect(embed.toJSON().thumbnail?.url).toBe('https://example.com/image.png');
    });

    it('omits title when not provided', () => {
        const embed = buildEmbed({ description: 'only description' });
        expect(embed.toJSON().title).toBeUndefined();
    });

    it('omits footer when not provided', () => {
        const embed = buildEmbed({ description: 'only description' });
        expect(embed.toJSON().footer).toBeUndefined();
    });

    it('omits thumbnail when not provided', () => {
        const embed = buildEmbed({ description: 'only description' });
        expect(embed.toJSON().thumbnail).toBeUndefined();
    });
});

// ============================================================================
// successEmbed
// ============================================================================

describe('successEmbed', () => {

    it('uses the success colour', () => {
        const embed = successEmbed('Done');
        expect(embed.toJSON().color).toBe(Colours.success);
    });

    it('sets the description', () => {
        const embed = successEmbed('Done');
        expect(embed.toJSON().description).toBe('Done');
    });

    it('sets the title when provided', () => {
        const embed = successEmbed('Done', 'All good');
        expect(embed.toJSON().title).toBe('All good');
    });

    it('omits title when not provided', () => {
        const embed = successEmbed('Done');
        expect(embed.toJSON().title).toBeUndefined();
    });
});

// ============================================================================
// errorEmbed
// ============================================================================

describe('errorEmbed', () => {

    it('uses the error colour', () => {
        const embed = errorEmbed('Failed');
        expect(embed.toJSON().color).toBe(Colours.error);
    });

    it('sets the description', () => {
        const embed = errorEmbed('Failed');
        expect(embed.toJSON().description).toBe('Failed');
    });

    it('sets the title when provided', () => {
        const embed = errorEmbed('Failed', 'Oops');
        expect(embed.toJSON().title).toBe('Oops');
    });

    it('omits title when not provided', () => {
        const embed = errorEmbed('Failed');
        expect(embed.toJSON().title).toBeUndefined();
    });
});

// ============================================================================
// infoEmbed
// ============================================================================

describe('infoEmbed', () => {

    it('uses the info colour', () => {
        const embed = infoEmbed('Note');
        expect(embed.toJSON().color).toBe(Colours.info);
    });

    it('sets the description', () => {
        const embed = infoEmbed('Note');
        expect(embed.toJSON().description).toBe('Note');
    });

    it('sets the title when provided', () => {
        const embed = infoEmbed('Note', 'Heads up');
        expect(embed.toJSON().title).toBe('Heads up');
    });

    it('omits title when not provided', () => {
        const embed = infoEmbed('Note');
        expect(embed.toJSON().title).toBeUndefined();
    });
});