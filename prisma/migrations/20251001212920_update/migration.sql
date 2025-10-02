/*
  Warnings:

  - The primary key for the `TeamMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `playerId` on the `TeamMember` table. All the data in the column will be lost.
  - Added the required column `userId` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."TeamMember" DROP CONSTRAINT "TeamMember_playerId_fkey";

-- AlterTable
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_pkey",
DROP COLUMN "playerId",
ADD COLUMN     "userId" BIGINT NOT NULL,
ADD CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("teamId", "userId");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
