DROP PROCEDURE IF EXISTS srpoly_add_column_if_missing;
DELIMITER //
CREATE PROCEDURE srpoly_add_column_if_missing(
  IN table_name_value VARCHAR(64),
  IN column_name_value VARCHAR(64),
  IN column_definition_value TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = table_name_value
      AND column_name = column_name_value
  ) THEN
    SET @srpoly_add_column_sql = CONCAT(
      'ALTER TABLE `',
      REPLACE(table_name_value, '`', '``'),
      '` ADD COLUMN ',
      column_definition_value
    );
    PREPARE srpoly_add_column_stmt FROM @srpoly_add_column_sql;
    EXECUTE srpoly_add_column_stmt;
    DEALLOCATE PREPARE srpoly_add_column_stmt;
  END IF;
END//
DELIMITER ;

CALL srpoly_add_column_if_missing('personnel_profiles', 'committee_role', 'committee_role VARCHAR(255) NULL AFTER department');
CALL srpoly_add_column_if_missing('personnel_profiles', 'contact_phone', 'contact_phone VARCHAR(100) NULL AFTER committee_role');
CALL srpoly_add_column_if_missing('personnel_profiles', 'contact_email', 'contact_email VARCHAR(190) NULL AFTER contact_phone');
CALL srpoly_add_column_if_missing('personnel_profiles', 'contact_channel', 'contact_channel VARCHAR(255) NULL AFTER contact_email');
CALL srpoly_add_column_if_missing('personnel_profiles', 'term_period', 'term_period VARCHAR(255) NULL AFTER contact_channel');
CALL srpoly_add_column_if_missing('personnel_profiles', 'appointment_file', 'appointment_file VARCHAR(500) NULL AFTER photo_path');
CALL srpoly_add_column_if_missing('personnel_profiles', 'profile_note', 'profile_note TEXT NULL AFTER appointment_file');

DROP PROCEDURE IF EXISTS srpoly_add_column_if_missing;

UPDATE personnel_profiles
SET committee_role = NULLIF(position_title, '')
WHERE page_slug IN ('college-board', 'school-management-board')
  AND (committee_role IS NULL OR committee_role = '');

UPDATE personnel_profiles
SET contact_phone = '044-514414'
WHERE page_slug = 'administrators'
  AND (contact_phone IS NULL OR contact_phone = '');
