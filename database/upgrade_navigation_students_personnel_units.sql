ALTER TABLE content_pages
  ADD COLUMN IF NOT EXISTS content_type VARCHAR(60) NOT NULL DEFAULT 'general' AFTER body,
  ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500) NULL AFTER content_type,
  ADD COLUMN IF NOT EXISTS attachment_path VARCHAR(500) NULL AFTER cover_image,
  ADD COLUMN IF NOT EXISTS source_url VARCHAR(500) NULL AFTER attachment_path;

ALTER TABLE personnel_profiles
  ADD COLUMN IF NOT EXISTS committee_role VARCHAR(255) NULL AFTER department,
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(100) NULL AFTER committee_role,
  ADD COLUMN IF NOT EXISTS contact_email VARCHAR(190) NULL AFTER contact_phone,
  ADD COLUMN IF NOT EXISTS contact_channel VARCHAR(255) NULL AFTER contact_email,
  ADD COLUMN IF NOT EXISTS term_period VARCHAR(255) NULL AFTER contact_channel,
  ADD COLUMN IF NOT EXISTS appointment_file VARCHAR(500) NULL AFTER photo_path,
  ADD COLUMN IF NOT EXISTS profile_note TEXT NULL AFTER appointment_file;

UPDATE navigation_items
SET url = '/departments', updated_at = NOW()
WHERE item_key = 'departments';

UPDATE navigation_items
SET url = '/students#student-data', sort_order = 60, updated_at = NOW()
WHERE item_key = 'about-student-data';

UPDATE navigation_items
SET url = '/content/personnel-data', sort_order = 70, updated_at = NOW()
WHERE item_key = 'about-personnel-data';

UPDATE navigation_items SET sort_order = 10, updated_at = NOW() WHERE item_key = 'about-structure';
UPDATE navigation_items SET sort_order = 20, updated_at = NOW() WHERE item_key = 'about-administrators';
UPDATE navigation_items SET sort_order = 30, updated_at = NOW() WHERE item_key = 'about-management-board';
UPDATE navigation_items SET sort_order = 40, updated_at = NOW() WHERE item_key = 'about-board';
UPDATE navigation_items SET sort_order = 50, updated_at = NOW() WHERE item_key = 'about-authority';
UPDATE navigation_items SET sort_order = 80, updated_at = NOW() WHERE item_key = 'about-laws';
UPDATE navigation_items SET sort_order = 90, updated_at = NOW() WHERE item_key = 'about-vision';
UPDATE navigation_items SET sort_order = 100, updated_at = NOW() WHERE item_key = 'about-song';

INSERT INTO navigation_items (item_key, parent_id, label, url, sort_order, is_active, created_at, updated_at)
SELECT 'about-student-data', about_parent.id, 'ข้อมูลผู้เรียน', '/students#student-data', 60, 1, NOW(), NOW()
FROM (SELECT id FROM navigation_items WHERE item_key = 'about' LIMIT 1) AS about_parent
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE item_key = 'about-student-data');

INSERT INTO navigation_items (item_key, parent_id, label, url, sort_order, is_active, created_at, updated_at)
SELECT 'about-personnel-data', about_parent.id, 'ข้อมูลบุคลากร', '/content/personnel-data', 70, 1, NOW(), NOW()
FROM (SELECT id FROM navigation_items WHERE item_key = 'about' LIMIT 1) AS about_parent
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE item_key = 'about-personnel-data');

INSERT INTO content_pages
  (slug, title, summary, body, content_type, cover_image, attachment_path, source_url, nav_key, status, created_at, updated_at)
SELECT
  'personnel-data',
  'ข้อมูลบุคลากร',
  'รายชื่อบุคลากรของวิทยาลัย แสดงตำแหน่ง หน้าที่ ฝ่ายงาน และช่องทางติดต่อ',
  '<p>หน้านี้แสดงข้อมูลบุคลากรของวิทยาลัย โดยจัดการรายชื่อ รูปภาพ ตำแหน่ง ฝ่ายงาน เบอร์โทร อีเมล และรายละเอียดหน้าที่ได้จากเมนูบุคลากรในระบบหลังบ้าน</p>',
  'people',
  NULL,
  NULL,
  NULL,
  'about',
  'published',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM content_pages WHERE slug = 'personnel-data');

UPDATE content_pages
SET
  title = 'ข้อมูลบุคลากร',
  summary = 'รายชื่อบุคลากรของวิทยาลัย แสดงตำแหน่ง หน้าที่ ฝ่ายงาน และช่องทางติดต่อ',
  body = '<p>หน้านี้แสดงข้อมูลบุคลากรของวิทยาลัย โดยจัดการรายชื่อ รูปภาพ ตำแหน่ง ฝ่ายงาน เบอร์โทร อีเมล และรายละเอียดหน้าที่ได้จากเมนูบุคลากรในระบบหลังบ้าน</p>',
  content_type = 'people',
  nav_key = 'about',
  status = 'published',
  updated_at = NOW()
WHERE slug = 'personnel-data';

INSERT INTO personnel_page_layouts
  (page_slug, eyebrow, heading, summary, columns_desktop, card_style, image_shape, show_section_title, show_department, status, created_at, updated_at)
SELECT
  'personnel-data',
  'ข้อมูลจัดการโดยงานบุคลากร',
  'ข้อมูลบุคลากร',
  'แสดงรายชื่อบุคลากรตามฝ่ายงาน พร้อมตำแหน่ง หน้าที่ และช่องทางติดต่อ',
  3,
  'standard',
  'circle',
  1,
  1,
  'active',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM personnel_page_layouts WHERE page_slug = 'personnel-data');

UPDATE personnel_page_layouts
SET
  eyebrow = 'ข้อมูลจัดการโดยงานบุคลากร',
  heading = 'ข้อมูลบุคลากร',
  summary = 'แสดงรายชื่อบุคลากรตามฝ่ายงาน พร้อมตำแหน่ง หน้าที่ และช่องทางติดต่อ',
  columns_desktop = 3,
  card_style = 'standard',
  image_shape = 'circle',
  show_section_title = 1,
  show_department = 1,
  status = 'active',
  updated_at = NOW()
WHERE page_slug = 'personnel-data';

INSERT INTO personnel_profiles
  (page_slug, section_title, full_name, position_title, department, committee_role, contact_phone, contact_email, contact_channel, term_period, photo_path, appointment_file, profile_note, sort_order, status, created_at, updated_at)
SELECT
  'personnel-data',
  CASE
    WHEN src.department LIKE 'ฝ่าย%' THEN src.department
    WHEN src.page_slug = 'administrators' THEN 'คณะผู้บริหาร'
    ELSE COALESCE(src.section_title, 'บุคลากร')
  END,
  src.full_name,
  REPLACE(src.position_title, ' กรรมการ', ''),
  src.department,
  NULL,
  CASE WHEN src.page_slug = 'administrators' THEN COALESCE(src.contact_phone, '044-514414') ELSE src.contact_phone END,
  src.contact_email,
  src.contact_channel,
  src.term_period,
  src.photo_path,
  src.appointment_file,
  src.profile_note,
  src.sort_order + CASE WHEN src.page_slug = 'administrators' THEN 0 ELSE 100 END,
  'active',
  NOW(),
  NOW()
FROM personnel_profiles AS src
WHERE src.full_name <> '- ว่าง -'
  AND (
    src.page_slug = 'administrators'
    OR (src.page_slug = 'school-management-board' AND src.position_title LIKE '%ผู้แทนฝ่าย%')
  )
  AND NOT EXISTS (
    SELECT 1
    FROM personnel_profiles AS dst
    WHERE dst.page_slug = 'personnel-data'
      AND dst.full_name = src.full_name
  );

DELETE FROM personnel_profiles
WHERE page_slug = 'personnel-data'
  AND full_name = '- ว่าง -';

UPDATE personnel_profiles
SET section_title = 'คณะผู้บริหาร', updated_at = NOW()
WHERE page_slug = 'personnel-data'
  AND sort_order < 100;

UPDATE personnel_profiles
SET section_title = department, updated_at = NOW()
WHERE page_slug = 'personnel-data'
  AND department LIKE 'ฝ่าย%';
