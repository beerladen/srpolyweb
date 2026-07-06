ALTER TABLE personnel_profiles
  ADD COLUMN IF NOT EXISTS committee_role VARCHAR(255) NULL AFTER department,
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(100) NULL AFTER committee_role,
  ADD COLUMN IF NOT EXISTS contact_email VARCHAR(190) NULL AFTER contact_phone,
  ADD COLUMN IF NOT EXISTS contact_channel VARCHAR(255) NULL AFTER contact_email,
  ADD COLUMN IF NOT EXISTS term_period VARCHAR(255) NULL AFTER contact_channel,
  ADD COLUMN IF NOT EXISTS appointment_file VARCHAR(500) NULL AFTER photo_path,
  ADD COLUMN IF NOT EXISTS profile_note TEXT NULL AFTER appointment_file;

UPDATE personnel_profiles
SET committee_role = NULLIF(position_title, '')
WHERE page_slug IN ('college-board', 'school-management-board')
  AND (committee_role IS NULL OR committee_role = '');

UPDATE personnel_profiles
SET contact_phone = '044-514414'
WHERE page_slug = 'administrators'
  AND (contact_phone IS NULL OR contact_phone = '');
