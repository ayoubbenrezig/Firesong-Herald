-- CreateEnum
CREATE TYPE "CalendarFrequency" AS ENUM ('daily', 'weekly', 'custom');

-- CreateTable
CREATE TABLE "calendars" (
    "id" TEXT NOT NULL,
    "discord_server_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT,
    "created_by" TEXT NOT NULL,
    "display_days" INTEGER NOT NULL DEFAULT 6,
    "frequency" "CalendarFrequency" NOT NULL,
    "custom_interval_days" INTEGER,
    "post_at" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "ping_role_id" TEXT,
    "status" "ServerStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calendars_discord_server_id_idx" ON "calendars"("discord_server_id");

-- AddForeignKey
ALTER TABLE "calendars" ADD CONSTRAINT "calendars_discord_server_id_fkey" FOREIGN KEY ("discord_server_id") REFERENCES "servers"("discord_server_id") ON DELETE RESTRICT ON UPDATE CASCADE;
