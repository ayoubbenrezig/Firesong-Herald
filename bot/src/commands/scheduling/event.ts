import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder,
    MessageFlags,
} from 'discord.js';
import { logger } from '../../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('event')
    .setDescription('Manage events')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('create')
            .setDescription('Create a new event'),
    );

/**
 * Handles the /event command and routes to the appropriate subcommand.
 *
 * @param interaction - The incoming slash command interaction.
 */
export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
        await handleCreate(interaction);
    }
}

/**
 * Shows the event creation modal to the user.
 *
 * @param interaction - The incoming slash command interaction.
 */
async function handleCreate(interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = new ModalBuilder()
        .setCustomId('event_create')
        .setTitle('Create Event');

    const titleLabel = new LabelBuilder()
        .setLabel('Title')
        .setTextInputComponent(
            new TextInputBuilder()
                .setCustomId('title')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(100)
                .setRequired(true),
        );

    const descriptionLabel = new LabelBuilder()
        .setLabel('Description')
        .setTextInputComponent(
            new TextInputBuilder()
                .setCustomId('description')
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(1000)
                .setRequired(false),
        );

    const startTimeLabel = new LabelBuilder()
        .setLabel('Start Time (YYYY-MM-DD HH:MM)')
        .setTextInputComponent(
            new TextInputBuilder()
                .setCustomId('start_time')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('2025-06-01 20:00')
                .setRequired(true),
        );

    const endTimeLabel = new LabelBuilder()
        .setLabel('End Time (YYYY-MM-DD HH:MM)')
        .setTextInputComponent(
            new TextInputBuilder()
                .setCustomId('end_time')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('2025-06-01 22:00')
                .setRequired(true),
        );

    const maxAttendeesLabel = new LabelBuilder()
        .setLabel('Max Attendees (leave blank for unlimited)')
        .setTextInputComponent(
            new TextInputBuilder()
                .setCustomId('max_attendees')
                .setStyle(TextInputStyle.Short)
                .setRequired(false),
        );

    modal.addLabelComponents(
        titleLabel,
        descriptionLabel,
        startTimeLabel,
        endTimeLabel,
        maxAttendeesLabel,
    );

    try {
        await interaction.showModal(modal);
    } catch (error) {
        logger.error({ err: error }, '❌ [event] Failed to show event creation modal');
        await interaction.reply({ content: 'Something went wrong. Please try again.', flags: MessageFlags.Ephemeral });
    }
}