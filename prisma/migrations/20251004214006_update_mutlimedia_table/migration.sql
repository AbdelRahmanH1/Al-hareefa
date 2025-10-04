/*
  Warnings:

  - You are about to drop the column `team_id` on the `Multimedia` table. All the data in the column will be lost.
  - Made the column `competition_id` on table `Multimedia` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Multimedia" DROP CONSTRAINT "Multimedia_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Multimedia" DROP CONSTRAINT "Multimedia_team_id_fkey";

-- AlterTable
ALTER TABLE "Multimedia" DROP COLUMN "team_id",
ALTER COLUMN "competition_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Multimedia" ADD CONSTRAINT "Multimedia_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
