import pino from 'pino';

// ============================================================================
// LOGGER
// ============================================================================
// Centralised Pino logger instance used across all services and routes.
// Outputs pretty-printed logs in development and JSON in production.

/**
 * Singleton logger instance.
 * Import this wherever logging is required — never use console.* directly.
 */
export const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:HH:MM:ss',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
});