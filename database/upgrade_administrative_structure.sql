CREATE TABLE IF NOT EXISTS administrative_structure_units (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  academic_year VARCHAR(10) NOT NULL DEFAULT '2569',
  unit_key VARCHAR(100) NOT NULL,
  unit_type VARCHAR(40) NOT NULL DEFAULT 'division',
  title VARCHAR(255) NOT NULL,
  leader_name VARCHAR(255) NULL,
  leader_position VARCHAR(255) NULL,
  description TEXT NULL,
  duties_title VARCHAR(255) NULL,
  duties_text LONGTEXT NULL,
  secondary_title VARCHAR(255) NULL,
  secondary_duties_text LONGTEXT NULL,
  color_theme VARCHAR(40) NOT NULL DEFAULT 'blue',
  icon_name VARCHAR(40) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_administrative_structure_unit_key (unit_key),
  KEY idx_administrative_structure_year (academic_year),
  KEY idx_administrative_structure_type (unit_type),
  KEY idx_administrative_structure_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO administrative_structure_units
  (academic_year, unit_key, unit_type, title, leader_name, leader_position, description, duties_title, duties_text, secondary_title, secondary_duties_text, color_theme, icon_name, sort_order, status, created_at, updated_at)
SELECT seed.academic_year, seed.unit_key, seed.unit_type, seed.title, seed.leader_name, seed.leader_position, seed.description, seed.duties_title, seed.duties_text, seed.secondary_title, seed.secondary_duties_text, seed.color_theme, seed.icon_name, seed.sort_order, 'active', NOW(), NOW()
FROM (
  SELECT
    '2569' AS academic_year,
    'director' AS unit_key,
    'director' AS unit_type,
    'ผู้อำนวยการวิทยาลัย' AS title,
    'นายอภิชาติ กุลรานี' AS leader_name,
    'ผู้อำนวยการวิทยาลัยสารพัดช่างสุรินทร์' AS leader_position,
    'กำกับดูแลการบริหารสถานศึกษาและการจัดการอาชีวศึกษา' AS description,
    NULL AS duties_title,
    NULL AS duties_text,
    NULL AS secondary_title,
    NULL AS secondary_duties_text,
    'blue' AS color_theme,
    'user' AS icon_name,
    0 AS sort_order
  UNION ALL SELECT
    '2569',
    'college-board',
    'committee',
    'คณะกรรมการวิทยาลัย',
    NULL,
    'กำกับ ติดตาม และให้ข้อเสนอแนะการบริหารสถานศึกษา',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'purple',
    'users',
    5
  UNION ALL SELECT
    '2569',
    'resource',
    'division',
    'ฝ่ายบริหารทรัพยากร',
    'นายเทอดศักดิ์ ผลพูน',
    NULL,
    'ดูแลงานสนับสนุน ทรัพยากร และระบบบริการภายในวิทยาลัย',
    'งานในกำกับ',
    'งานบริหารงานทั่วไป
งานบริหารและพัฒนาทรัพยากรบุคคล
งานการเงิน
งานการบัญชี
งานพัสดุ
งานอาคารสถานที่
งานทะเบียน',
    NULL,
    NULL,
    'blue',
    'building',
    10
  UNION ALL SELECT
    '2569',
    'planning',
    'division',
    'ฝ่ายยุทธศาสตร์และแผนงาน',
    'กำกับดูแลร่วม',
    NULL,
    'ขับเคลื่อนแผน งานคุณภาพ งานความร่วมมือ วิจัย และนวัตกรรม',
    'งานในกำกับ',
    'งานพัฒนายุทธศาสตร์ แผนงานและงบประมาณ
งานมาตรฐานและการประกันคุณภาพการศึกษา
งานศูนย์ดิจิทัลและสื่อสารองค์กร
งานส่งเสริมการวิจัย นวัตกรรมและสิ่งประดิษฐ์
งานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ
งานติดตามและประเมินผลการอาชีวศึกษา',
    NULL,
    NULL,
    'teal',
    'target',
    20
  UNION ALL SELECT
    '2569',
    'student-affairs',
    'division',
    'ฝ่ายกิจการนักเรียน นักศึกษา',
    'นางสุนีย์ ปรีชานนทกุล',
    NULL,
    'ดูแลกิจกรรมนักเรียน นักศึกษา งานแนะแนว สวัสดิการ และบริการชุมชน',
    'งานในกำกับ',
    'งานกิจกรรมนักเรียน นักศึกษา
งานครูที่ปรึกษาและการแนะแนว
งานปกครองและความปลอดภัยนักเรียน นักศึกษา
งานสวัสดิการนักเรียน นักศึกษา
งานโครงการพิเศษและบริการชุมชน',
    NULL,
    NULL,
    'violet',
    'users',
    30
  UNION ALL SELECT
    '2569',
    'academic',
    'division',
    'ฝ่ายวิชาการ',
    'นางปาลิดา ศรีตุลานุกูล',
    NULL,
    'บริหารหลักสูตร การจัดการเรียนรู้ การวัดผล และแผนกวิชา',
    'A) งานสนับสนุนฝ่ายวิชาการ',
    'งานพัฒนาหลักสูตรและการจัดการเรียนรู้
งานวัดผลประเมินผล
งานอาชีวศึกษาระบบทวิภาคีและความร่วมมือ
งานวิทยบริการและเทคโนโลยีการศึกษา
งานการศึกษาพิเศษและความเสมอภาคทางการศึกษา',
    'B) แผนกวิชา / สาขาวิชา',
    'แผนกวิชาสามัญสัมพันธ์
แผนกวิชาเทคนิคพื้นฐาน
สาขาวิชาช่างยนต์
สาขาวิชาช่างกลโรงงาน
สาขาวิชาช่างไฟฟ้ากำลัง
สาขาวิชาช่างอิเล็กทรอนิกส์
สาขาวิชาการบัญชี
สาขาวิชาคอมพิวเตอร์
สาขาวิชาอาหารและโภชนาการ
สาขาวิชาเทคนิคเครื่องกล
สาขาวิชาการจัดการงานบริการสถานพยาบาล
สาขาวิชาการท่องเที่ยว',
    'orange',
    'book',
    40
) AS seed
WHERE NOT EXISTS (
  SELECT 1
  FROM administrative_structure_units AS existing
  WHERE existing.unit_key = seed.unit_key
);

UPDATE content_pages
SET summary = 'แผนผังโครงสร้างการบริหารและการมอบหมายงานของวิทยาลัย ประจำปีการศึกษา 2569',
    body = '<p>แสดงโครงสร้างการบริหาร ฝ่ายหลัก งานย่อย และผู้รับผิดชอบของวิทยาลัยในรูปแบบแผนผัง โดยสามารถปรับปรุงข้อมูลได้จากระบบหลังบ้าน</p>',
    updated_at = NOW()
WHERE slug = 'administrative-structure';
