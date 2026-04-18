// ============================================================================
// CUSTOM EMOJI
// ============================================================================
// Centralised custom emoji references for all bot messages and embeds.
// Format: <:name:id> — uploaded via the Discord Developer Portal.
// Import this file and reference with a dot wherever emoji are needed.

export const Emoji = {

    // ── Owls ─────────────────────────────────────────────────────────────────

    /** Used for greetings and neutral openers. */
    LurkingOwl:  '<:LurkingOwl:1494826568881799349>',

    /** Used for positive news and approvals. */
    HappyOwl:    '<:HappyOwl:1494826567271055451>',

    /** Used for unfortunate news such as rejections. */
    SadOwl:      '<:SadOwl:1494823203028209724>',

    /** Used for celebratory or warm moments. */
    BlushingOwl: '<:BlushingOwl:1494827022449512448>',

    /** Used for humour or lighthearted messages. */
    LaughingOwl: '<:LaughingOwl:1494827023816855684>',

    // ── Feathers ──────────────────────────────────────────────────────────────

    /** Used for warm sign-offs and farewell messages. */
    FeatherHeart:               '<:FeatherHeart:1494840167880724590>',

    /** Used for celebratory sign-offs and success moments. */
    FeatherSparkle:             '<:FeatherSparkle:1494840173849088061>',

    /** Used for notifications and reminder-related messages. */
    FeatherBell:                '<:FeatherBell:1494840166714703952>',

    /** Used for writing, event creation, and editorial actions. */
    FeatherQuill:               '<:FeatherQuill:1494840171991138506>',

    /** Used for unknown states or help prompts. */
    FeatherQuestionMark:        '<:FeatherQuestionMark:1494840169470365787>',

    /** Used for inverted/alternate unknown or confused states. */
    FeatherQuestionMarkInverted: '<:FeatherQuestionMarkInverted:1494840170741239988>',

} as const;