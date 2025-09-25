/*
  Warnings:

  - The values [TEAM_SHARED_FEE] on the enum `FeeType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `team_participant_paymentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `TeamParticipantPayment` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."FeeType_new" AS ENUM ('SINGLE', 'TEAM_SINGLE_FEE');
ALTER TABLE "public"."Competition" ALTER COLUMN "fee_type" TYPE "public"."FeeType_new" USING ("fee_type"::text::"public"."FeeType_new");
ALTER TYPE "public"."FeeType" RENAME TO "FeeType_old";
ALTER TYPE "public"."FeeType_new" RENAME TO "FeeType";
DROP TYPE "public"."FeeType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_team_participant_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamParticipantPayment" DROP CONSTRAINT "TeamParticipantPayment_participant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamParticipantPayment" DROP CONSTRAINT "TeamParticipantPayment_team_id_player_id_fkey";

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "team_participant_paymentId";

-- DropTable
DROP TABLE "public"."TeamParticipantPayment";
