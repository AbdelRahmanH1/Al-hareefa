/*
  Warnings:

  - Made the column `fee_amount` on table `Competition` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Competition" ALTER COLUMN "fee_amount" SET NOT NULL,
ALTER COLUMN "fee_amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DEFAULT 0;
