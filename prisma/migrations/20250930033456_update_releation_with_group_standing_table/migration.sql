/*
  Warnings:

  - You are about to drop the column `draws` on the `GroupStanding` table. All the data in the column will be lost.
  - You are about to drop the column `goals_against` on the `GroupStanding` table. All the data in the column will be lost.
  - You are about to drop the column `goals_for` on the `GroupStanding` table. All the data in the column will be lost.
  - You are about to drop the column `played` on the `GroupStanding` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[participant_id,group_id]` on the table `GroupStanding` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."GroupStanding" DROP CONSTRAINT "GroupStanding_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupStanding" DROP CONSTRAINT "GroupStanding_participant_id_fkey";

-- DropIndex
DROP INDEX "public"."GroupStanding_group_id_participant_id_key";

-- AlterTable
ALTER TABLE "public"."GroupStanding" DROP COLUMN "draws",
DROP COLUMN "goals_against",
DROP COLUMN "goals_for",
DROP COLUMN "played";

-- CreateIndex
CREATE UNIQUE INDEX "GroupStanding_participant_id_group_id_key" ON "public"."GroupStanding"("participant_id", "group_id");
