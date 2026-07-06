CREATE TABLE IF NOT EXISTS student_enrollments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  academic_year VARCHAR(10) NOT NULL,
  level_label VARCHAR(80) NOT NULL,
  department_name VARCHAR(190) NOT NULL,
  student_count INT UNSIGNED NOT NULL DEFAULT 0,
  male_count INT UNSIGNED NULL,
  female_count INT UNSIGNED NULL,
  note TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_student_enrollments_year (academic_year),
  KEY idx_student_enrollments_department (department_name),
  KEY idx_student_enrollments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS personnel_summary_stats (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  academic_year VARCHAR(10) NOT NULL,
  personnel_type VARCHAR(120) NOT NULL,
  department VARCHAR(190) NULL,
  staff_count INT UNSIGNED NOT NULL DEFAULT 0,
  context_note TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_personnel_summary_year (academic_year),
  KEY idx_personnel_summary_type (personnel_type),
  KEY idx_personnel_summary_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS legal_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(160) NULL,
  description TEXT NULL,
  content LONGTEXT NULL,
  fiscal_year VARCHAR(10) NULL,
  effective_date DATE NULL,
  file_path VARCHAR(500) NULL,
  source_url VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'published',
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_legal_items_category (category),
  KEY idx_legal_items_year (fiscal_year),
  KEY idx_legal_items_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO student_enrollments
  (academic_year, level_label, department_name, student_count, male_count, female_count, note, sort_order, status, created_at, updated_at)
SELECT
  '2569',
  levels.level_label,
  TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(levels.courses_text, '\n', numbers.n), '\n', -1)) AS department_name,
  0,
  NULL,
  NULL,
  'รอกรอกจำนวนผู้เรียนจริง',
  levels.sort_order + numbers.n,
  'active',
  NOW(),
  NOW()
FROM course_groups AS levels
JOIN (
  SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
  UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
  UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
) AS numbers
  ON numbers.n <= 1 + LENGTH(levels.courses_text) - LENGTH(REPLACE(levels.courses_text, '\n', ''))
WHERE levels.status = 'active'
  AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(levels.courses_text, '\n', numbers.n), '\n', -1)) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM student_enrollments AS existing
    WHERE existing.academic_year = '2569'
      AND existing.level_label = levels.level_label
      AND existing.department_name = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(levels.courses_text, '\n', numbers.n), '\n', -1))
  );

INSERT INTO personnel_summary_stats
  (academic_year, personnel_type, department, staff_count, context_note, sort_order, status, created_at, updated_at)
SELECT '2569', 'ผู้บริหาร', 'วิทยาลัย', COUNT(*), 'นับจากข้อมูลคณะผู้บริหารที่มีสถานะใช้งาน', 10, 'active', NOW(), NOW()
FROM personnel_profiles
WHERE page_slug = 'administrators'
  AND status = 'active'
  AND full_name <> '- ว่าง -'
HAVING NOT EXISTS (
  SELECT 1 FROM personnel_summary_stats WHERE academic_year = '2569' AND personnel_type = 'ผู้บริหาร'
);

INSERT INTO personnel_summary_stats
  (academic_year, personnel_type, department, staff_count, context_note, sort_order, status, created_at, updated_at)
SELECT seed.academic_year, seed.personnel_type, seed.department, seed.staff_count, seed.context_note, seed.sort_order, 'active', NOW(), NOW()
FROM (
  SELECT '2569' AS academic_year, 'ข้าราชการครู' AS personnel_type, 'สายการสอน' AS department, 0 AS staff_count, 'รอกรอกข้อมูลจริงจากงานบุคลากร' AS context_note, 20 AS sort_order
  UNION ALL SELECT '2569', 'พนักงานราชการ', 'สายการสอน/สนับสนุน', 0, 'รอกรอกข้อมูลจริงจากงานบุคลากร', 30
  UNION ALL SELECT '2569', 'ครูพิเศษสอน', 'สายการสอน', 0, 'รอกรอกข้อมูลจริงจากงานบุคลากร', 40
  UNION ALL SELECT '2569', 'เจ้าหน้าที่สนับสนุน', 'สายสนับสนุน', 0, 'รอกรอกข้อมูลจริงจากงานบุคลากร', 50
  UNION ALL SELECT '2569', 'ลูกจ้าง', 'สายสนับสนุน', 0, 'รอกรอกข้อมูลจริงจากงานบุคลากร', 60
) AS seed
WHERE NOT EXISTS (
  SELECT 1
  FROM personnel_summary_stats AS existing
  WHERE existing.academic_year = seed.academic_year
    AND existing.personnel_type = seed.personnel_type
);

INSERT INTO legal_items
  (title, category, description, content, fiscal_year, effective_date, file_path, source_url, sort_order, status, created_at, updated_at)
SELECT seed.title, seed.category, seed.description, seed.content, seed.fiscal_year, seed.effective_date, seed.file_path, seed.source_url, seed.sort_order, 'published', NOW(), NOW()
FROM (
  SELECT
    'พระราชบัญญัติการศึกษาแห่งชาติ' AS title,
    'กฎหมายการศึกษา' AS category,
    'กฎหมายหลักที่เกี่ยวข้องกับการจัดการศึกษา' AS description,
    '<p>จัดเก็บลิงก์หรือไฟล์ฉบับเต็ม และสามารถเพิ่มสาระสำคัญของกฎหมายในช่องเนื้อหาได้</p>' AS content,
    '2569' AS fiscal_year,
    NULL AS effective_date,
    NULL AS file_path,
    NULL AS source_url,
    10 AS sort_order
  UNION ALL SELECT
    'ระเบียบว่าด้วยการบริหารสถานศึกษา',
    'ระเบียบวิทยาลัย',
    'ระเบียบและแนวปฏิบัติที่ใช้ในการบริหารสถานศึกษา',
    '<p>สามารถแนบไฟล์ PDF หรือเพิ่มลิงก์อ้างอิงเพื่อให้ประชาชนคลิกอ่านรายละเอียดได้</p>',
    '2569',
    NULL,
    NULL,
    NULL,
    20
) AS seed
WHERE NOT EXISTS (
  SELECT 1 FROM legal_items AS existing WHERE existing.title = seed.title
);

UPDATE personnel_profiles
SET profile_note = 'งานศูนย์ข้อมูลสารสนเทศ
งานประกันคุณภาพและมาตรฐานการศึกษา'
WHERE page_slug IN ('administrators', 'personnel-data')
  AND full_name = 'นายเทอดศักดิ์ ผลพูน'
  AND (profile_note IS NULL OR profile_note = '');

UPDATE personnel_profiles
SET profile_note = 'งานความร่วมมือ
งานวิจัย พัฒนานวัตกรรมและสิ่งประดิษฐ์'
WHERE page_slug IN ('administrators', 'personnel-data')
  AND full_name = 'นางปาลิดา ศรีตุลานุกค์'
  AND (profile_note IS NULL OR profile_note = '');

UPDATE personnel_profiles
SET profile_note = 'งานวางแผนและงบประมาณ
งานส่งเสริมผลิตผลการค้าและประกอบธุรกิจ'
WHERE page_slug IN ('administrators', 'personnel-data')
  AND full_name = 'นางสุนีย์ ปรีชานนทกุล'
  AND (profile_note IS NULL OR profile_note = '');

UPDATE content_pages
SET content_type = 'legal',
    summary = 'กฎหมาย ระเบียบ และแนวปฏิบัติที่เกี่ยวข้อง แสดงเป็นตารางพร้อมไฟล์แนบหรือลิงก์อ้างอิง',
    updated_at = NOW()
WHERE slug = 'laws';
