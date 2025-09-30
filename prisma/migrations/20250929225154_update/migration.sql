-- DropForeignKey
ALTER TABLE "public"."Match" DROP CONSTRAINT "Match_participant2_id_fkey";

-- AlterTable
ALTER TABLE "public"."Match" ALTER COLUMN "participant2_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_participant2_id_fkey" FOREIGN KEY ("participant2_id") REFERENCES "public"."Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
