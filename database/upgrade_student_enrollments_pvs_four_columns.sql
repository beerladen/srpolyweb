SET @schema_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'student_enrollments' AND COLUMN_NAME = 'report_date') = 0,
  'ALTER TABLE student_enrollments ADD COLUMN report_date DATE NULL AFTER academic_year',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'student_enrollments' AND COLUMN_NAME = 'registered_count') = 0,
  'ALTER TABLE student_enrollments ADD COLUMN registered_count INT UNSIGNED NULL AFTER female_count',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'student_enrollments' AND COLUMN_NAME = 'unregistered_count') = 0,
  'ALTER TABLE student_enrollments ADD COLUMN unregistered_count INT UNSIGNED NULL AFTER registered_count',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'student_enrollments' AND COLUMN_NAME = 'repeat_count') = 0,
  'ALTER TABLE student_enrollments ADD COLUMN repeat_count INT UNSIGNED NULL AFTER unregistered_count',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'student_enrollments' AND COLUMN_NAME = 'credit_collect_count') = 0,
  'ALTER TABLE student_enrollments ADD COLUMN credit_collect_count INT UNSIGNED NULL AFTER repeat_count',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'student_enrollments' AND COLUMN_NAME = 'actual_count') = 0,
  'ALTER TABLE student_enrollments ADD COLUMN actual_count INT UNSIGNED NULL AFTER credit_collect_count',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE student_enrollments
SET registered_count = COALESCE(registered_count, student_count),
    actual_count = COALESCE(actual_count, student_count),
    unregistered_count = COALESCE(unregistered_count, 0),
    repeat_count = COALESCE(repeat_count, 0),
    credit_collect_count = COALESCE(credit_collect_count, 0),
    updated_at = NOW()
WHERE registered_count IS NULL
   OR actual_count IS NULL
   OR unregistered_count IS NULL
   OR repeat_count IS NULL
   OR credit_collect_count IS NULL;

CREATE TABLE IF NOT EXISTS short_course_enrollments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  academic_year VARCHAR(10) NOT NULL,
  term_label VARCHAR(120) NULL,
  department_name VARCHAR(190) NULL,
  course_name VARCHAR(255) NOT NULL,
  batch_label VARCHAR(160) NULL,
  hours INT UNSIGNED NULL,
  learner_count INT UNSIGNED NOT NULL DEFAULT 0,
  male_count INT UNSIGNED NULL,
  female_count INT UNSIGNED NULL,
  completed_count INT UNSIGNED NULL,
  certificate_count INT UNSIGNED NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  instructor_name VARCHAR(190) NULL,
  note TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_short_course_year (academic_year),
  KEY idx_short_course_department (department_name),
  KEY idx_short_course_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

UPDATE student_enrollments
SET level_label = CASE
    WHEN REPLACE(level_label, ' ', '') IN ('ปวส.1', 'ปวส1')
      AND (department_name LIKE '%สมทบ%' OR department_name LIKE '%ภาคสมทบ%')
      THEN 'ปวส.ภาคสมทบ ปี 1'
    WHEN REPLACE(level_label, ' ', '') IN ('ปวส.2', 'ปวส2')
      AND (department_name LIKE '%สมทบ%' OR department_name LIKE '%ภาคสมทบ%')
      THEN 'ปวส.ภาคสมทบ ปี 2'
    WHEN REPLACE(level_label, ' ', '') IN ('ปวส.1', 'ปวส1')
      THEN 'ปวส.ทวิ ปี 1'
    WHEN REPLACE(level_label, ' ', '') IN ('ปวส.2', 'ปวส2')
      THEN 'ปวส.ทวิ ปี 2'
    ELSE level_label
  END,
  updated_at = NOW()
WHERE REPLACE(level_label, ' ', '') IN ('ปวส.1', 'ปวส1', 'ปวส.2', 'ปวส2');
