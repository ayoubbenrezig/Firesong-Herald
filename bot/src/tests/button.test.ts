/**
 * Unit tests for bot/src/utils/button.ts
 *
 * Tests cover:
 * - buildButton sets customId, label, style correctly
 * - buildButton sets disabled to false by default
 * - buildButton sets disabled to true when specified
 * - buildButton sets emoji when provided
 * - buildActionRow wraps buttons correctly
 * - buildActionRow accepts multiple buttons and preserves order
 */

import { describe, it, expect } from 'vitest';
import { ButtonStyle } from 'discord.js';
import type { APIButtonComponentWithCustomId } from 'discord.js';
import { buildButton, buildActionRow } from '../utils/button.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns the button data cast to APIButtonComponentWithCustomId.
 * Safe to use only after setCustomId has been called, which is always
 * the case in buildButton.
 */
function btnData(btn: ReturnType<typeof buildButton>): APIButtonComponentWithCustomId {
    return btn.data as APIButtonComponentWithCustomId;
}

// ============================================================================
// buildButton
// ============================================================================

describe('buildButton', () => {

    it('sets customId correctly', () => {
        const btn = buildButton({ customId: 'test_id', label: 'Click', style: ButtonStyle.Primary });
        expect(btnData(btn).custom_id).toBe('test_id');
    });

    it('sets label correctly', () => {
        const btn = buildButton({ customId: 'test_id', label: 'Click me', style: ButtonStyle.Primary });
        expect(btnData(btn).label).toBe('Click me');
    });

    it('sets style correctly', () => {
        const btn = buildButton({ customId: 'test_id', label: 'Click', style: ButtonStyle.Danger });
        expect(btnData(btn).style).toBe(ButtonStyle.Danger);
    });

    it('defaults disabled to false', () => {
        const btn = buildButton({ customId: 'test_id', label: 'Click', style: ButtonStyle.Primary });
        expect(btnData(btn).disabled).toBe(false);
    });

    it('sets disabled to true when specified', () => {
        const btn = buildButton({ customId: 'test_id', label: 'Click', style: ButtonStyle.Primary, disabled: true });
        expect(btnData(btn).disabled).toBe(true);
    });

    it('sets emoji when provided', () => {
        const btn = buildButton({ customId: 'test_id', label: 'Click', style: ButtonStyle.Primary, emoji: '🔥' });
        expect(btnData(btn).emoji).toBeDefined();
    });

    it('omits emoji when not provided', () => {
        const btn = buildButton({ customId: 'test_id', label: 'Click', style: ButtonStyle.Primary });
        expect(btnData(btn).emoji).toBeUndefined();
    });
});

// ============================================================================
// buildActionRow
// ============================================================================

describe('buildActionRow', () => {

    it('wraps a single button in an action row', () => {
        const btn = buildButton({ customId: 'btn_1', label: 'One', style: ButtonStyle.Primary });
        const row = buildActionRow(btn);
        expect(row.components).toHaveLength(1);
    });

    it('wraps multiple buttons in a single action row', () => {
        const btn1 = buildButton({ customId: 'btn_1', label: 'One', style: ButtonStyle.Primary });
        const btn2 = buildButton({ customId: 'btn_2', label: 'Two', style: ButtonStyle.Secondary });
        const row = buildActionRow(btn1, btn2);
        expect(row.components).toHaveLength(2);
    });

    it('preserves button order in the action row', () => {
        const btn1 = buildButton({ customId: 'btn_1', label: 'First', style: ButtonStyle.Primary });
        const btn2 = buildButton({ customId: 'btn_2', label: 'Second', style: ButtonStyle.Danger });
        const row = buildActionRow(btn1, btn2);
        expect((row.components[0].data as APIButtonComponentWithCustomId).custom_id).toBe('btn_1');
        expect((row.components[1].data as APIButtonComponentWithCustomId).custom_id).toBe('btn_2');
    });
});