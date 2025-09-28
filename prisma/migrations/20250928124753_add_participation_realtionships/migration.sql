/*
  Warnings:

  - The `stage` column on the `Match` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Match" ADD COLUMN     "next_match_id" BIGINT,
ADD COLUMN     "next_match_slot" INTEGER,
ADD COLUMN     "round" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "stage",
ADD COLUMN     "stage" "public"."MatchStage",
ALTER COLUMN "venue_name" DROP NOT NULL,
ALTER COLUMN "venue_address" DROP NOT NULL,
ALTER COLUMN "venue_city" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Participant" ADD CONSTRAINT "Participant_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Participant" ADD CONSTRAINT "Participant_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."PlayerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_winner_participant_id_fkey" FOREIGN KEY ("winner_participant_id") REFERENCES "public"."Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_next_match_id_fkey" FOREIGN KEY ("next_match_id") REFERENCES "public"."Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;
