-- CreateEnum
CREATE TYPE "ServerStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "PermissionLevel" AS ENUM ('admin', 'host');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('draft', 'active', 'cancelled', 'completed', 'deleted');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('daily', 'weekly', 'biweekly', 'every_3_weeks', 'monthly', 'custom');

-- CreateEnum
CREATE TYPE "RecurrenceUnit" AS ENUM ('days', 'weeks', 'months');

-- CreateEnum
CREATE TYPE "ColorScheme" AS ENUM ('light', 'dark', 'system');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('event_created', 'event_edited', 'event_cancelled', 'event_deleted', 'event_restored', 'rsvp_removed', 'role_added', 'role_removed');

-- CreateTable
CREATE TABLE "servers" (
    "discord_server_id" TEXT NOT NULL,
    "status" "ServerStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servers_pkey" PRIMARY KEY ("discord_server_id")
);

-- CreateTable
CREATE TABLE "server_roles" (
    "id" TEXT NOT NULL,
    "discord_server_id" TEXT NOT NULL,
    "discord_role_id" TEXT NOT NULL,
    "permission_level" "PermissionLevel" NOT NULL,

    CONSTRAINT "server_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "discord_server_id" TEXT NOT NULL,
    "discord_message_id" TEXT,
    "channel_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "max_attendees" INTEGER,
    "waitlist_enabled" BOOLEAN NOT NULL DEFAULT false,
    "max_waitlist" INTEGER,
    "status" "EventStatus" NOT NULL DEFAULT 'draft',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_recurrence" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "custom_interval" INTEGER,
    "custom_unit" "RecurrenceUnit",
    "ends_at" TIMESTAMP(3),

    CONSTRAINT "event_recurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rsvp_options" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "max_slots" INTEGER,

    CONSTRAINT "rsvp_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signups" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "rsvp_option_id" TEXT NOT NULL,
    "discord_user_id" TEXT NOT NULL,
    "is_waitlisted" BOOLEAN NOT NULL DEFAULT false,
    "signed_up_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_alerts" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "send_at" TIMESTAMP(3) NOT NULL,
    "ping_role_id" TEXT,
    "sent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "event_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "discord_user_id" TEXT NOT NULL,
    "dm_consent" BOOLEAN NOT NULL DEFAULT false,
    "dm_consent_given_at" TIMESTAMP(3),
    "theme" TEXT,
    "color_scheme" "ColorScheme" NOT NULL DEFAULT 'system',
    "last_active_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("discord_user_id")
);

-- CreateTable
CREATE TABLE "user_reminder_presets" (
    "id" TEXT NOT NULL,
    "discord_user_id" TEXT NOT NULL,
    "weeks" INTEGER,
    "days" INTEGER,
    "hours" INTEGER,
    "minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_reminder_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "discord_server_id" TEXT NOT NULL,
    "action_by" TEXT NOT NULL,
    "action_by_username" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "target_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "server_roles_discord_server_id_discord_role_id_key" ON "server_roles"("discord_server_id", "discord_role_id");

-- CreateIndex
CREATE INDEX "events_discord_server_id_idx" ON "events"("discord_server_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_recurrence_event_id_key" ON "event_recurrence"("event_id");

-- CreateIndex
CREATE INDEX "signups_discord_user_id_idx" ON "signups"("discord_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "signups_event_id_rsvp_option_id_discord_user_id_key" ON "signups"("event_id", "rsvp_option_id", "discord_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_discord_server_id_idx" ON "audit_logs"("discord_server_id");

-- AddForeignKey
ALTER TABLE "server_roles" ADD CONSTRAINT "server_roles_discord_server_id_fkey" FOREIGN KEY ("discord_server_id") REFERENCES "servers"("discord_server_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_discord_server_id_fkey" FOREIGN KEY ("discord_server_id") REFERENCES "servers"("discord_server_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_recurrence" ADD CONSTRAINT "event_recurrence_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvp_options" ADD CONSTRAINT "rsvp_options_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signups" ADD CONSTRAINT "signups_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signups" ADD CONSTRAINT "signups_rsvp_option_id_fkey" FOREIGN KEY ("rsvp_option_id") REFERENCES "rsvp_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_alerts" ADD CONSTRAINT "event_alerts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reminder_presets" ADD CONSTRAINT "user_reminder_presets_discord_user_id_fkey" FOREIGN KEY ("discord_user_id") REFERENCES "users"("discord_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_discord_server_id_fkey" FOREIGN KEY ("discord_server_id") REFERENCES "servers"("discord_server_id") ON DELETE RESTRICT ON UPDATE CASCADE;
