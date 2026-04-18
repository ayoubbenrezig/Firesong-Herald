-- AlterTable
ALTER TABLE "servers" ADD COLUMN     "invited_by" TEXT;

-- CreateTable
CREATE TABLE "pending_servers" (
    "discord_server_id" TEXT NOT NULL,
    "invited_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_servers_pkey" PRIMARY KEY ("discord_server_id")
);
