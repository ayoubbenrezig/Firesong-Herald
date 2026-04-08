import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

/**
 * Prisma Configuration for Firesong Herald Database
 *
 * This config centralises database connection and migration settings.
 * - Loads environment variables from the root .env file
 * - Points to the Prisma schema in prisma/schema.prisma
 * - Stores migrations in prisma/migrations/ (auto-applied on bot startup)
 * - Reads DATABASE_URL from environment (format: postgresql://user:password@host:port/db)
 *
 */

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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