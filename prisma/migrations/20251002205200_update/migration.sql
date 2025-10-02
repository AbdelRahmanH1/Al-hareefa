-- DropForeignKey
ALTER TABLE "public"."AdminProfile" DROP CONSTRAINT "AdminProfile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CoachService" DROP CONSTRAINT "CoachService_coach_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Competition" DROP CONSTRAINT "Competition_typeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompetitionGroup" DROP CONSTRAINT "CompetitionGroup_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupMembership" DROP CONSTRAINT "GroupMembership_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupMembership" DROP CONSTRAINT "GroupMembership_participant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupStanding" DROP CONSTRAINT "GroupStanding_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupStanding" DROP CONSTRAINT "GroupStanding_participantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Multimedia" DROP CONSTRAINT "Multimedia_uploaded_by_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrganizationProfile" DROP CONSTRAINT "OrganizationProfile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlayerBooking" DROP CONSTRAINT "PlayerBooking_playerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlayerBooking" DROP CONSTRAINT "PlayerBooking_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamInvite" DROP CONSTRAINT "TeamInvite_invited_by_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamInvite" DROP CONSTRAINT "TeamInvite_invited_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamInvite" DROP CONSTRAINT "TeamInvite_team_id_fkey";

-- AddForeignKey
ALTER TABLE "CoachService" ADD CONSTRAINT "CoachService_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "CoachProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerBooking" ADD CONSTRAINT "PlayerBooking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerBooking" ADD CONSTRAINT "PlayerBooking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "CoachService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_invited_id_fkey" FOREIGN KEY ("invited_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CompetitionType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionGroup" ADD CONSTRAINT "CompetitionGroup_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "CompetitionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupStanding" ADD CONSTRAINT "GroupStanding_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CompetitionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupStanding" ADD CONSTRAINT "GroupStanding_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationProfile" ADD CONSTRAINT "OrganizationProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Multimedia" ADD CONSTRAINT "Multimedia_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
