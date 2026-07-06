ALTER TABLE student_enrollments
  ADD COLUMN IF NOT EXISTS report_date DATE NULL AFTER academic_year,
  ADD COLUMN IF NOT EXISTS registered_count INT UNSIGNED NULL AFTER female_count,
  ADD COLUMN IF NOT EXISTS unregistered_count INT UNSIGNED NULL AFTER registered_count,
  ADD COLUMN IF NOT EXISTS repeat_count INT UNSIGNED NULL AFTER unregistered_count,
  ADD COLUMN IF NOT EXISTS credit_collect_count INT UNSIGNED NULL AFTER repeat_count,
  ADD COLUMN IF NOT EXISTS actual_count INT UNSIGNED NULL AFTER credit_collect_count;

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
SET status = 'inactive',
    note = COALESCE(NULLIF(note, ''), 'ปิดรายการรอกรอกเดิม หลังนำเข้าข้อมูลจากรายงานวันที่ 24 มิถุนายน 2569'),
    updated_at = NOW()
WHERE academic_year = '2569'
  AND status = 'active'
  AND student_count = 0;

DROP TEMPORARY TABLE IF EXISTS tmp_student_enrollment_seed;

CREATE TEMPORARY TABLE tmp_student_enrollment_seed (
  academic_year VARCHAR(10) NOT NULL,
  report_date DATE NULL,
  level_label VARCHAR(80) NOT NULL,
  department_name VARCHAR(190) NOT NULL,
  student_count INT UNSIGNED NOT NULL DEFAULT 0,
  registered_count INT UNSIGNED NOT NULL DEFAULT 0,
  unregistered_count INT UNSIGNED NOT NULL DEFAULT 0,
  repeat_count INT UNSIGNED NOT NULL DEFAULT 0,
  credit_collect_count INT UNSIGNED NOT NULL DEFAULT 0,
  actual_count INT UNSIGNED NOT NULL DEFAULT 0,
  note TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

INSERT INTO tmp_student_enrollment_seed
  (academic_year, report_date, level_label, department_name, student_count, registered_count, unregistered_count, repeat_count, credit_collect_count, actual_count, note, sort_order)
VALUES
  ('2569', '2026-06-24', 'ปวช.1', 'ช่างยนต์ 1/1', 17, 8, 0, 9, 0, 17, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 11),
  ('2569', '2026-06-24', 'ปวช.1', 'ช่างกลโรงงาน 1/1', 11, 11, 0, 0, 0, 11, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 12),
  ('2569', '2026-06-24', 'ปวช.1', 'ช่างไฟฟ้ากำลัง 1/1', 18, 9, 0, 9, 0, 18, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 13),
  ('2569', '2026-06-24', 'ปวช.1', 'การบัญชี 1/1', 10, 2, 0, 8, 0, 10, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 14),
  ('2569', '2026-06-24', 'ปวช.1', 'อาหารและโภชนาการ 1/1', 8, 0, 0, 8, 0, 8, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 15),
  ('2569', '2026-06-24', 'ปวช.1', 'เทคโนโลยีธุรกิจดิจิทัล 1/1', 14, 3, 0, 11, 0, 14, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 16),

  ('2569', '2026-06-24', 'ปวช.2', 'ช่างยนต์ 2/1', 10, 4, 1, 5, 0, 9, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 21),
  ('2569', '2026-06-24', 'ปวช.2', 'ช่างกลโรงงาน 2/1', 7, 3, 4, 0, 0, 3, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 22),
  ('2569', '2026-06-24', 'ปวช.2', 'ไฟฟ้า 2/1', 20, 2, 0, 18, 0, 20, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 23),
  ('2569', '2026-06-24', 'ปวช.2', 'อิเล็กทรอนิกส์ 2/1', 20, 3, 1, 16, 0, 19, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 24),
  ('2569', '2026-06-24', 'ปวช.2', 'อาหารและโภชนาการ 2/1', 18, 0, 0, 18, 0, 18, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 25),
  ('2569', '2026-06-24', 'ปวช.2', 'คอมพิวเตอร์ธุรกิจ 2/1', 15, 6, 2, 7, 0, 13, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 26),

  ('2569', '2026-06-24', 'ปวช.3', 'ช่างยนต์ 3/1', 2, 1, 1, 0, 0, 1, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 31),
  ('2569', '2026-06-24', 'ปวช.3', 'ช่างกลโรงงาน 3/1', 7, 6, 1, 0, 0, 6, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 32),
  ('2569', '2026-06-24', 'ปวช.3', 'ไฟฟ้ากำลัง 3/1', 13, 2, 0, 11, 0, 13, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 33),
  ('2569', '2026-06-24', 'ปวช.3', 'อิเล็กทรอนิกส์ 3/1', 2, 2, 0, 0, 0, 2, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 34),
  ('2569', '2026-06-24', 'ปวช.3', 'การบัญชี 3/1', 1, 1, 0, 0, 0, 1, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 35),
  ('2569', '2026-06-24', 'ปวช.3', 'อาหารและโภชนาการ 3/1', 2, 2, 0, 0, 0, 2, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 36),
  ('2569', '2026-06-24', 'ปวช.3', 'เทคโนโลยีธุรกิจดิจิทัล 3/1', 5, 4, 1, 0, 0, 4, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 37),

  ('2569', '2026-06-24', 'ปวส.1', 'เทคนิคเครื่องกล ทวิ สายตรง', 1, 1, 0, 0, 0, 1, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 51),
  ('2569', '2026-06-24', 'ปวส.1', 'เทคนิคเครื่องกล ทวิ สาย ม.6', 8, 0, 0, 8, 0, 8, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 52),
  ('2569', '2026-06-24', 'ปวส.1', 'เทคนิคเครื่องกล สมทบ สายตรง', 1, 0, 1, 0, 0, 0, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 53),
  ('2569', '2026-06-24', 'ปวส.1', 'เทคนิคเครื่องกล สมทบ สาย ม.6', 7, 5, 2, 0, 0, 5, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 54),
  ('2569', '2026-06-24', 'ปวส.1', 'เทคนิคการผลิต ทวิ สายตรง', 13, 11, 2, 0, 0, 11, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 55),
  ('2569', '2026-06-24', 'ปวส.1', 'เทคนิคการผลิต ทวิ สาย ม.6', 5, 4, 1, 0, 0, 4, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 56),
  ('2569', '2026-06-24', 'ปวส.1', 'ไฟฟ้า ทวิ สายตรง', 2, 0, 2, 0, 0, 0, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 57),
  ('2569', '2026-06-24', 'ปวส.1', 'ไฟฟ้า ทวิ สาย ม.6', 10, 0, 0, 10, 0, 10, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 58),
  ('2569', '2026-06-24', 'ปวส.1', 'ไฟฟ้า สมทบ สาย ม.6', 24, 20, 4, 0, 0, 20, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 59),
  ('2569', '2026-06-24', 'ปวส.1', 'อิเล็กทรอนิกส์ ทวิ สายตรง', 6, 6, 0, 0, 0, 6, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 60),
  ('2569', '2026-06-24', 'ปวส.1', 'การบัญชี ทวิ สายตรง', 1, 0, 0, 1, 0, 1, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 61),
  ('2569', '2026-06-24', 'ปวส.1', 'การบัญชี ทวิ สาย ม.6', 17, 0, 0, 17, 0, 17, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 62),
  ('2569', '2026-06-24', 'ปวส.1', 'การบัญชี สมทบ สาย ม.6', 29, 28, 1, 0, 0, 28, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 63),
  ('2569', '2026-06-24', 'ปวส.1', 'อาหารและโภชนาการ ทวิ สายตรง', 18, 17, 1, 0, 0, 17, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 64),
  ('2569', '2026-06-24', 'ปวส.1', 'อาหารและโภชนาการ ทวิ สาย ม.6', 10, 10, 0, 0, 0, 10, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 65),
  ('2569', '2026-06-24', 'ปวส.1', 'ธุรกิจดิจิทัล ทวิ สายตรง', 3, 0, 3, 0, 0, 0, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 66),
  ('2569', '2026-06-24', 'ปวส.1', 'ธุรกิจดิจิทัล ทวิ สาย ม.6', 7, 5, 2, 0, 0, 5, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 67),
  ('2569', '2026-06-24', 'ปวส.1', 'ธุรกิจดิจิทัล สมทบ สายตรง', 1, 1, 0, 0, 0, 1, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 68),
  ('2569', '2026-06-24', 'ปวส.1', 'ธุรกิจดิจิทัล สมทบ สาย ม.6', 22, 21, 1, 0, 0, 21, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 69),

  ('2569', '2026-06-24', 'ปวส.2', 'เทคนิคเครื่องกล สาย ม.6', 12, 0, 0, 12, 0, 12, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 71),
  ('2569', '2026-06-24', 'ปวส.2', 'เทคนิคเครื่องกล สมทบ สายตรง', 1, 1, 0, 0, 0, 1, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 72),
  ('2569', '2026-06-24', 'ปวส.2', 'เทคนิคเครื่องกล สมทบ สาย ม.6', 2, 1, 1, 0, 0, 1, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 73),
  ('2569', '2026-06-24', 'ปวส.2', 'เทคนิคการผลิต ทวิ สายตรง', 7, 7, 0, 0, 0, 7, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 74),
  ('2569', '2026-06-24', 'ปวส.2', 'เทคนิคการผลิต ทวิ สาย ม.6', 5, 2, 3, 0, 0, 2, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 75),
  ('2569', '2026-06-24', 'ปวส.2', 'ไฟฟ้ากำลัง ทวิ สายตรง', 13, 0, 0, 13, 0, 13, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 76),
  ('2569', '2026-06-24', 'ปวส.2', 'ไฟฟ้ากำลัง สมทบ สายตรง', 1, 1, 0, 0, 0, 1, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 77),
  ('2569', '2026-06-24', 'ปวส.2', 'ไฟฟ้ากำลัง สมทบ สาย ม.6', 10, 10, 0, 0, 0, 10, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 78),
  ('2569', '2026-06-24', 'ปวส.2', 'การบัญชี ทวิ สายตรง', 4, 3, 0, 1, 0, 4, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 79),
  ('2569', '2026-06-24', 'ปวส.2', 'การบัญชี ทวิ สาย ม.6', 7, 0, 0, 7, 0, 7, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 80),
  ('2569', '2026-06-24', 'ปวส.2', 'การบัญชี สมทบ สายตรง', 1, 1, 0, 0, 0, 1, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 81),
  ('2569', '2026-06-24', 'ปวส.2', 'การบัญชี สมทบ สาย ม.6', 8, 8, 0, 0, 0, 8, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 82),
  ('2569', '2026-06-24', 'ปวส.2', 'อาหารและโภชนาการ สายตรง', 3, 3, 0, 0, 0, 3, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 83),
  ('2569', '2026-06-24', 'ปวส.2', 'อาหารและโภชนาการ สาย ม.6', 13, 13, 0, 0, 0, 13, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 84),
  ('2569', '2026-06-24', 'ปวส.2', 'ธุรกิจดิจิทัล ทวิ สาย ม.6', 6, 6, 0, 0, 0, 6, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 85),
  ('2569', '2026-06-24', 'ปวส.2', 'ธุรกิจดิจิทัล สมทบ สายตรง', 1, 0, 1, 0, 0, 0, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 86),
  ('2569', '2026-06-24', 'ปวส.2', 'ธุรกิจดิจิทัล สมทบ สาย ม.6', 12, 4, 8, 0, 0, 4, 'ข้อมูลจากรายงานจำนวนนักเรียน ภาคเรียนที่ 1/2569', 87);

UPDATE student_enrollments AS target
JOIN tmp_student_enrollment_seed AS seed
  ON target.academic_year = seed.academic_year
 AND target.level_label = seed.level_label
 AND target.department_name = seed.department_name
SET target.report_date = seed.report_date,
    target.student_count = seed.student_count,
    target.registered_count = seed.registered_count,
    target.unregistered_count = seed.unregistered_count,
    target.repeat_count = seed.repeat_count,
    target.credit_collect_count = seed.credit_collect_count,
    target.actual_count = seed.actual_count,
    target.note = seed.note,
    target.sort_order = seed.sort_order,
    target.status = 'active',
    target.updated_at = NOW();

INSERT INTO student_enrollments
  (academic_year, report_date, level_label, department_name, student_count, male_count, female_count, registered_count, unregistered_count, repeat_count, credit_collect_count, actual_count, note, sort_order, status, created_at, updated_at)
SELECT
  seed.academic_year,
  seed.report_date,
  seed.level_label,
  seed.department_name,
  seed.student_count,
  NULL,
  NULL,
  seed.registered_count,
  seed.unregistered_count,
  seed.repeat_count,
  seed.credit_collect_count,
  seed.actual_count,
  seed.note,
  seed.sort_order,
  'active',
  NOW(),
  NOW()
FROM tmp_student_enrollment_seed AS seed
WHERE NOT EXISTS (
  SELECT 1
  FROM student_enrollments AS existing
  WHERE existing.academic_year = seed.academic_year
    AND existing.level_label = seed.level_label
    AND existing.department_name = seed.department_name
);

DROP TEMPORARY TABLE IF EXISTS tmp_student_enrollment_seed;
