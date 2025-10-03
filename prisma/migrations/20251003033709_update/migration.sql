/*
  Warnings:

  - You are about to drop the column `scheduled_at` on the `PlayerBooking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlayerBooking" DROP COLUMN "scheduled_at",
ADD COLUMN     "end_at" TIMESTAMP(3),
ADD COLUMN     "start_at" TIMESTAMP(3);
