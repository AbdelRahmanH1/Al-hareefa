-- ===============================
-- Constraints for User
-- ===============================
ALTER TABLE "User"
ADD CONSTRAINT name_not_empty CHECK (char_length(name) > 0);

ALTER TABLE "User"
ADD CONSTRAINT birth_date_valid CHECK (birth_date <= CURRENT_DATE);

-- ===============================
-- Constraints for Guardian
-- ===============================
ALTER TABLE "Guardian"
ADD CONSTRAINT guardian_name_not_empty CHECK (char_length(name) > 0);

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
-- Constraints for Match
-- ===============================
ALTER TABLE "Match"
ADD CONSTRAINT scores_json_format CHECK (
  jsonb_typeof(scores) = 'object' AND
  scores ? 'participant1' AND scores ? 'participant2'
);

-- ===============================
-- Constraints for Payment
-- ===============================
ALTER TABLE "Payment"
ADD CONSTRAINT amount_non_negative CHECK (amount >= 0);

-- ===============================
-- Constraints for TeamMember
-- ===============================
ALTER TABLE "TeamMember"
ADD CONSTRAINT valid_status CHECK (status IN ('PENDING','ACCEPTED','REJECTED'));

-- ===============================
-- Constraints for enums in BookingService
-- ===============================
ALTER TABLE "BookingService"
ADD CONSTRAINT valid_status_booking CHECK (status IN ('REQUESTED','CONFIRMED','COMPLETED','CANCELED'));

-- ===============================
-- Constraints for enums in User
-- ===============================
ALTER TABLE "User"
ADD CONSTRAINT valid_role CHECK (role IN ('ADMIN','ORGANIZATION','PLAYER','CAPTAIN'));
ALTER TABLE "User"
ADD CONSTRAINT valid_gender CHECK (gender IN ('MALE','FEMALE'));
ALTER TABLE "User"
ADD CONSTRAINT valid_provider CHECK (provider IN ('EMAIL','PHONE','GOOGLE','FACEBOOK'));

-- ===============================
-- Constraints for PaymentStatus
-- ===============================
ALTER TABLE "Payment"
ADD CONSTRAINT valid_payment_status CHECK (status IN ('PENDING','COMPLETED','FAILED','CANCELED'));

-- ===============================
-- Constraints for MembershipStatus
-- ===============================
ALTER TABLE "TeamMember"
ADD CONSTRAINT valid_membership_status CHECK (status IN ('PENDING','ACCEPTED','REJECTED'));

-- ===============================
-- Constraints for MatchStatus
-- ===============================
ALTER TABLE "Match"
ADD CONSTRAINT valid_match_status CHECK (status IN ('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELED'));
