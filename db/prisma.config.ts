import path from "path";
import { defineConfig } from "prisma/config";

/**
 * Prisma Configuration for Firesong Herald Database
 *
 * This config centralises database connection and migration settings.
 * - Loads environment variables from the root .env file in development
 * - Points to the Prisma schema in prisma/schema.prisma
 * - Stores migrations in prisma/migrations/ (auto-applied on API startup)
 * - Reads DATABASE_URL from environment (format: postgresql://user:password@host:port/db)
 *
 */

// Load environment variables from root directory in development only
// In production, DATABASE_URL is injected via Docker environment variables
if (process.env.NODE_ENV !== "production") {
    const { default: dotenv } = await import("dotenv");
    dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

export default defineConfig({
    // Schema definition file
    schema: "prisma/schema.prisma",
    // Where Prisma stores and reads migration files
    migrations: {
        path: "prisma/migrations",
    },
    // Database connection string (PostgreSQL URL from .env)
    datasource: {
        url: process.env["DATABASE_URL"],
    },
});