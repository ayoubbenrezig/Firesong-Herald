-- DropForeignKey
ALTER TABLE "user_reminder_presets" DROP CONSTRAINT "user_reminder_presets_discord_user_id_fkey";

-- AlterTable
ALTER TABLE "servers" ADD COLUMN     "deactivation_reason" TEXT;

-- AddForeignKey
ALTER TABLE "user_reminder_presets" ADD CONSTRAINT "user_reminder_presets_discord_user_id_fkey" FOREIGN KEY ("discord_user_id") REFERENCES "users"("discord_user_id") ON DELETE CASCADE ON UPDATE CASCADE;
