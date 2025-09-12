-- ===============================
-- Constraints for User
-- ===============================
ALTER TABLE "User"
ADD CONSTRAINT name_not_empty CHECK (char_length(full_name) > 0);

ALTER TABLE "User"
ADD CONSTRAINT birth_date_valid CHECK (birth_date <= CURRENT_DATE);

ALTER TABLE "User"
ADD CONSTRAINT valid_gender CHECK (gender IN ('MALE','FEMALE'));

-- ===============================
-- Constraints for Guardian
-- ===============================
ALTER TABLE "Guardian"
ADD CONSTRAINT guardian_name_not_empty CHECK (char_length(full_name) > 0);

-- ===============================
-- Constraints for CoachService
-- ===============================
ALTER TABLE "CoachService"
ADD CONSTRAINT price_non_negative CHECK (price >= 0);

-- ===============================
-- Constraints for PlayerBooking
-- ===============================
ALTER TABLE "PlayerBooking"
ADD CONSTRAINT price_non_negative CHECK (price >= 0);

ALTER TABLE "PlayerBooking"
ADD CONSTRAINT valid_status_booking CHECK (
  status IN ('REQUESTED','CONFIRMED','COMPLETED','CANCELED')
);

-- ===============================
-- Constraints for Competition
-- ===============================
ALTER TABLE "Competition"
ADD CONSTRAINT price_non_negative CHECK (price >= 0);

-- ===============================
-- Constraints for OrganizationProfile
-- ===============================
ALTER TABLE "OrganizationProfile"
ADD CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES "AdminProfile"(id);

-- ===============================
-- Constraints for Team
-- ===============================
ALTER TABLE "Team"
ADD CONSTRAINT team_name_not_empty CHECK (char_length(name) > 0);

-- ===============================
-- Constraints for TeamMember
-- ===============================
ALTER TABLE "TeamMember"
ADD CONSTRAINT valid_membership_status CHECK (
  status IN ('PENDING','ACCEPTED','REJECTED')
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
ADD CONSTRAINT valid_match_status CHECK (
  status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELED')
);

-- winner relation already exists as winner_participant_id, no need to add manually

-- ===============================
-- Constraints for Payment
-- ===============================
ALTER TABLE "Payment"
ADD CONSTRAINT amount_non_negative CHECK (amount >= 0);

ALTER TABLE "Payment"
ADD CONSTRAINT valid_payment_status CHECK (
  status IN ('PENDING','COMPLETED','FAILED','CANCELED')
);

-- ===============================
-- Constraints for TeamParticipantPayment
-- ===============================
ALTER TABLE "TeamParticipantPayment"
ADD CONSTRAINT fee_share_non_negative CHECK (fee_share >= 0);
