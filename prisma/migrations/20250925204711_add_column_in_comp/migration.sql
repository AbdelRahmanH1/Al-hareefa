/*
  Warnings:

  - The values [DOUBLE_ELIMINATION] on the enum `EliminationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `scores` on the `Match` table. All the data in the column will be lost.
  - Made the column `name` on table `CompetitionGroup` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EliminationType_new" AS ENUM ('SINGLE_ELIMINATION', 'KNOCKOUT');
ALTER TABLE "public"."Competition" ALTER COLUMN "eliminationType" DROP DEFAULT;
ALTER TABLE "public"."Competition" ALTER COLUMN "eliminationType" TYPE "public"."EliminationType_new" USING ("eliminationType"::text::"public"."EliminationType_new");
ALTER TYPE "public"."EliminationType" RENAME TO "EliminationType_old";
ALTER TYPE "public"."EliminationType_new" RENAME TO "EliminationType";
DROP TYPE "public"."EliminationType_old";
ALTER TABLE "public"."Competition" ALTER COLUMN "eliminationType" SET DEFAULT 'SINGLE_ELIMINATION';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Competition" ADD COLUMN     "hasGroupStage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."CompetitionGroup" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Match" DROP COLUMN "scores",
ADD COLUMN     "score_participant1" INTEGER DEFAULT 0,
ADD COLUMN     "score_participant2" INTEGER DEFAULT 0;
