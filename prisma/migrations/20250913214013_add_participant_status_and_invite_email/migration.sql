/*
  Warnings:

  - You are about to drop the column `price` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `payment_date` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `provider_info` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `due_date` on the `TeamParticipantPayment` table. All the data in the column will be lost.
  - Added the required column `fee_type` to the `Competition` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."FeeType" AS ENUM ('SINGLE', 'TEAM_SHARED_FEE', 'TEAM_SINGLE_FEE');

-- AlterTable
ALTER TABLE "public"."Competition" DROP COLUMN "price",
ADD COLUMN     "fee_amount" DOUBLE PRECISION,
ADD COLUMN     "fee_type" "public"."FeeType" NOT NULL,
ADD COLUMN     "is_fee_per_person" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Participant" ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "payment_date",
DROP COLUMN "provider_info",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "method" TEXT,
ADD COLUMN     "payment_info" JSONB;

-- AlterTable
ALTER TABLE "public"."TeamMember" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "public"."TeamParticipantPayment" DROP COLUMN "due_date";

-- CreateTable
CREATE TABLE "public"."TeamInvite" (
    "id" BIGSERIAL NOT NULL,
    "team_id" BIGINT NOT NULL,
    "invited_id" BIGINT NOT NULL,
    "invited_role" "public"."UserRole" NOT NULL,
    "invited_email" TEXT,
    "invited_by_id" BIGINT NOT NULL,
    "status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "TeamInvite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TeamInvite" ADD CONSTRAINT "TeamInvite_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInvite" ADD CONSTRAINT "TeamInvite_invited_id_fkey" FOREIGN KEY ("invited_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInvite" ADD CONSTRAINT "TeamInvite_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
