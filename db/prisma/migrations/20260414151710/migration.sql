-- CreateTable
CREATE TABLE "testers" (
    "discord_user_id" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testers_pkey" PRIMARY KEY ("discord_user_id")
);

-- CreateTable
CREATE TABLE "approved_servers" (
    "discord_server_id" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approved_servers_pkey" PRIMARY KEY ("discord_server_id")
);
