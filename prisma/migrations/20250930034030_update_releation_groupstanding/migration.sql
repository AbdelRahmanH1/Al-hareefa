/*
  Warnings:

  - You are about to drop the column `group_id` on the `GroupStanding` table. All the data in the column will be lost.
  - You are about to drop the column `participant_id` on the `GroupStanding` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupId,participantId]` on the table `GroupStanding` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `GroupStanding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participantId` to the `GroupStanding` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."GroupStanding_participant_id_group_id_key";

-- AlterTable
ALTER TABLE "public"."GroupStanding" DROP COLUMN "group_id",
DROP COLUMN "participant_id",
ADD COLUMN     "groupId" BIGINT NOT NULL,
ADD COLUMN     "participantId" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GroupStanding_groupId_participantId_key" ON "public"."GroupStanding"("groupId", "participantId");

-- AddForeignKey
ALTER TABLE "public"."GroupStanding" ADD CONSTRAINT "GroupStanding_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."CompetitionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupStanding" ADD CONSTRAINT "GroupStanding_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "public"."Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
