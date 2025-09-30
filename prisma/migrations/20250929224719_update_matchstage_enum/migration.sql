/*
  Warnings:

  - The values [FIRST_ELIMINATION,SECOND_ELIMINATION] on the enum `MatchStage` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MatchStage_new" AS ENUM ('GROUP_STAGE', 'KNOCKOUT', 'FINAL', 'BYE');
ALTER TABLE "public"."Match" ALTER COLUMN "stage" TYPE "public"."MatchStage_new" USING ("stage"::text::"public"."MatchStage_new");
ALTER TYPE "public"."MatchStage" RENAME TO "MatchStage_old";
ALTER TYPE "public"."MatchStage_new" RENAME TO "MatchStage";
DROP TYPE "public"."MatchStage_old";
COMMIT;
