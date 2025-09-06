-- ===============================
-- Constraints for User
-- ===============================
ALTER TABLE "User"
ADD CONSTRAINT name_not_empty CHECK (char_length(name) > 0);

ALTER TABLE "User"
ADD CONSTRAINT birth_date_valid CHECK (birth_date <= CURRENT_DATE);

ALTER TABLE "User"
ADD CONSTRAINT valid_gender CHECK (gender IN ('MALE','FEMALE'));


-- ===============================
-- Constraints for Guardian
-- ===============================
ALTER TABLE "Guardian"
ADD CONSTRAINT guardian_name_not_empty CHECK (char_length(name) > 0);

-- ===============================
-- Constraint: PlayerProfile guardian required for minors
-- ===============================
ALTER TABLE "PlayerProfile"
ADD CONSTRAINT minor_must_have_guardian CHECK (
  (EXTRACT(YEAR FROM age(CURRENT_DATE, (SELECT birth_date FROM "User" u WHERE u.user_id = user_id))) < 18 AND guardian_id IS NOT NULL)
  OR (EXTRACT(YEAR FROM age(CURRENT_DATE, (SELECT birth_date FROM "User" u WHERE u.user_id = user_id))) >= 18)
);

-- ===============================
-- Constraints for CaptainService
-- ===============================
ALTER TABLE "CaptainService"
ADD CONSTRAINT price_non_negative CHECK (price >= 0);

-- ===============================
-- Constraints for BookingService
-- ===============================
ALTER TABLE "BookingService"
ADD CONSTRAINT price_non_negative CHECK (price >= 0);

ALTER TABLE "BookingService"
ADD CONSTRAINT valid_status_booking CHECK (status IN ('REQUESTED','CONFIRMED','COMPLETED','CANCELED'));

-- ===============================
-- Constraints for Competition
-- ===============================
ALTER TABLE "Competition"
ADD CONSTRAINT price_non_negative CHECK (price >= 0);

-- ===============================
-- Constraints for OrganizationProfile
-- ===============================
ALTER TABLE "OrganizationProfile"
ADD CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES "User"(user_id);

-- ===============================
-- Constraints for Team
-- ===============================
ALTER TABLE "Team"
ADD CONSTRAINT team_name_not_empty CHECK (char_length(name) > 0);

-- ===============================
-- Constraints for TeamMember
-- ===============================
ALTER TABLE "TeamMember"
ADD CONSTRAINT valid_membership_status CHECK (status IN ('PENDING','ACCEPTED','REJECTED'));

-- ===============================
-- Constraints for Knockout competitions
-- ===============================
ALTER TABLE "Competition"
ADD CONSTRAINT knockout_must_have_groups CHECK (
  (elimination_format = 'KNOCKOUT' AND (SELECT COUNT(*) FROM "CompetitionGroup" g WHERE g.competition_id = "Competition".competition_id) > 0)
  OR elimination_format != 'KNOCKOUT'
);

-- ===============================
-- Constraints for Match
-- ===============================
ALTER TABLE "Match"
ADD CONSTRAINT scores_json_format CHECK (
  jsonb_typeof(scores) = 'object' AND
  scores ? 'participant1' AND scores ? 'participant2'
);

ALTER TABLE "Match"
ADD CONSTRAINT valid_match_status CHECK (status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELED'));

-- Optional: winner tracking for knockout
ALTER TABLE "Match"
ADD COLUMN winner_participant_id BIGINT NULL REFERENCES "Participant"(participant_id);

-- ===============================
-- Constraints for Payment
-- ===============================
ALTER TABLE "Payment"
ADD CONSTRAINT amount_non_negative CHECK (amount >= 0);

ALTER TABLE "Payment"
ADD CONSTRAINT valid_payment_status CHECK (status IN ('PENDING','COMPLETED','FAILED','CANCELED'));

-- Optional: ensure each player pays individually for team participation
ALTER TABLE "TeamParticipantMemberParticipation"
ADD CONSTRAINT fee_share_non_negative CHECK (fee_share >= 0);
