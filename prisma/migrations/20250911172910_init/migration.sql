-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'ORGANIZATION', 'PLAYER', 'COACH');

-- CreateEnum
CREATE TYPE "public"."AuthProvider" AS ENUM ('EMAIL', 'PHONE', 'GOOGLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."MembershipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."Relation" AS ENUM ('FATHER', 'MOTHER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ParticipantType" AS ENUM ('TEAM', 'PLAYER');

-- CreateEnum
CREATE TYPE "public"."GameType" AS ENUM ('FOOTBALL', 'BASKETBALL', 'HANDBALL', 'PLAYSTATION');

-- CreateEnum
CREATE TYPE "public"."EliminationType" AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'KNOCKOUT');

-- CreateEnum
CREATE TYPE "public"."MatchStage" AS ENUM ('GROUP_STAGE', 'FIRST_ELIMINATION', 'SECOND_ELIMINATION', 'FINAL');

-- CreateEnum
CREATE TYPE "public"."TeamMemberRole" AS ENUM ('PLAYER', 'CAPTAIN');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" BIGSERIAL NOT NULL,
    "firebase_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "city" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlayerProfile" (
    "id" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "preferred_games" "public"."GameType"[],
    "guardianId" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Guardian" (
    "id" BIGSERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relation" "public"."Relation" NOT NULL DEFAULT 'FATHER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoachProfile" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "bio" TEXT,
    "experience" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoachService" (
    "id" BIGSERIAL NOT NULL,
    "coach_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION DEFAULT 0,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlayerBooking" (
    "id" BIGSERIAL NOT NULL,
    "playerId" BIGINT NOT NULL,
    "serviceId" BIGINT NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'REQUESTED',
    "price" DOUBLE PRECISION DEFAULT 0,
    "booked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "PlayerBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "game" "public"."GameType" NOT NULL,
    "created_by_id" BIGINT,
    "created_by_role" "public"."UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMember" (
    "teamId" BIGINT NOT NULL,
    "playerId" BIGINT NOT NULL,
    "roleInTeam" "public"."TeamMemberRole" NOT NULL DEFAULT 'PLAYER',
    "status" "public"."MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("teamId","playerId")
);

-- CreateTable
CREATE TABLE "public"."CompetitionType" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "sport" "public"."GameType" NOT NULL,
    "createdByAdmin" BIGINT,
    "min_player_per_team" INTEGER NOT NULL,
    "max_player_per_team" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Competition" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" BIGINT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "venue_name" TEXT NOT NULL,
    "venue_address" TEXT NOT NULL,
    "venue_city" TEXT NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "approval_status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "winner_participant_id" BIGINT,
    "min_age" INTEGER NOT NULL,
    "max_age" INTEGER NOT NULL,
    "max_teams" INTEGER,
    "eliminationType" "public"."EliminationType" NOT NULL DEFAULT 'SINGLE_ELIMINATION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Participant" (
    "id" BIGSERIAL NOT NULL,
    "competition_id" BIGINT NOT NULL,
    "type" "public"."ParticipantType" NOT NULL,
    "team_id" BIGINT,
    "player_id" BIGINT,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qrCode" TEXT,
    "payment_required" DOUBLE PRECISION,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamParticipantPayment" (
    "id" BIGSERIAL NOT NULL,
    "participant_id" BIGINT NOT NULL,
    "team_id" BIGINT NOT NULL,
    "player_id" BIGINT NOT NULL,
    "fee_share" DOUBLE PRECISION NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "due_date" TIMESTAMP(3),

    CONSTRAINT "TeamParticipantPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompetitionGroup" (
    "id" BIGSERIAL NOT NULL,
    "competition_id" BIGINT NOT NULL,
    "name" TEXT,

    CONSTRAINT "CompetitionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GroupMembership" (
    "group_id" BIGINT NOT NULL,
    "participant_id" BIGINT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("group_id","participant_id")
);

-- CreateTable
CREATE TABLE "public"."Match" (
    "id" BIGSERIAL NOT NULL,
    "competition_id" BIGINT NOT NULL,
    "group_id" BIGINT,
    "stage" TEXT,
    "status" "public"."MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_at" TIMESTAMP(3),
    "venue_name" TEXT NOT NULL,
    "venue_address" TEXT NOT NULL,
    "venue_city" TEXT NOT NULL,
    "participant1_id" BIGINT NOT NULL,
    "participant2_id" BIGINT NOT NULL,
    "scores" JSONB NOT NULL,
    "winner_participant_id" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" BIGSERIAL NOT NULL,
    "participant_id" BIGINT,
    "team_participant_paymentId" BIGINT,
    "bookingId" BIGINT,
    "user_id" BIGINT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT DEFAULT 'EGP',
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3),
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider_info" JSONB,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminProfile" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "created_t" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrganizationProfile" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "approval_status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Multimedia" (
    "id" BIGSERIAL NOT NULL,
    "competition_id" BIGINT,
    "team_id" BIGINT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "media_type" "public"."MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "uploaded_by_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Multimedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebase_id_key" ON "public"."User"("firebase_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "public"."PlayerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_email_key" ON "public"."Guardian"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_phone_key" ON "public"."Guardian"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_user_id_key" ON "public"."CoachProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "public"."Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_competition_id_team_id_key" ON "public"."Participant"("competition_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_competition_id_player_id_key" ON "public"."Participant"("competition_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_user_id_key" ON "public"."AdminProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationProfile_user_id_key" ON "public"."OrganizationProfile"("user_id");

-- AddForeignKey
ALTER TABLE "public"."PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerProfile" ADD CONSTRAINT "PlayerProfile_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "public"."Guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoachProfile" ADD CONSTRAINT "CoachProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoachService" ADD CONSTRAINT "CoachService_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."CoachProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerBooking" ADD CONSTRAINT "PlayerBooking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."PlayerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerBooking" ADD CONSTRAINT "PlayerBooking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."CoachService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."PlayerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Competition" ADD CONSTRAINT "Competition_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."CompetitionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Competition" ADD CONSTRAINT "Competition_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."OrganizationProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Participant" ADD CONSTRAINT "Participant_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "public"."Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamParticipantPayment" ADD CONSTRAINT "TeamParticipantPayment_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamParticipantPayment" ADD CONSTRAINT "TeamParticipantPayment_team_id_player_id_fkey" FOREIGN KEY ("team_id", "player_id") REFERENCES "public"."TeamMember"("teamId", "playerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompetitionGroup" ADD CONSTRAINT "CompetitionGroup_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "public"."Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupMembership" ADD CONSTRAINT "GroupMembership_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."CompetitionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupMembership" ADD CONSTRAINT "GroupMembership_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "public"."Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."CompetitionGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_participant1_id_fkey" FOREIGN KEY ("participant1_id") REFERENCES "public"."Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_participant2_id_fkey" FOREIGN KEY ("participant2_id") REFERENCES "public"."Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_team_participant_paymentId_fkey" FOREIGN KEY ("team_participant_paymentId") REFERENCES "public"."TeamParticipantPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."PlayerBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminProfile" ADD CONSTRAINT "AdminProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationProfile" ADD CONSTRAINT "OrganizationProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrganizationProfile" ADD CONSTRAINT "OrganizationProfile_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."AdminProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Multimedia" ADD CONSTRAINT "Multimedia_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "public"."Competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Multimedia" ADD CONSTRAINT "Multimedia_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Multimedia" ADD CONSTRAINT "Multimedia_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
