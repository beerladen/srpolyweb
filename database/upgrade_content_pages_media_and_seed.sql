ALTER TABLE content_pages
  ADD COLUMN IF NOT EXISTS content_type VARCHAR(60) NOT NULL DEFAULT 'general' AFTER body,
  ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500) NULL AFTER content_type,
  ADD COLUMN IF NOT EXISTS attachment_path VARCHAR(500) NULL AFTER cover_image,
  ADD COLUMN IF NOT EXISTS source_url VARCHAR(500) NULL AFTER nav_key;

INSERT INTO content_pages
  (slug, title, summary, body, content_type, cover_image, attachment_path, nav_key, source_url, status, created_at, updated_at)
VALUES
  ('administrative-structure', 'โครงสร้างการบริหาร', 'แผนผังโครงสร้างการบริหารและการมอบหมายงานของวิทยาลัย', '<p>แสดงโครงสร้างการบริหารของวิทยาลัย พร้อมรองรับการอัปโหลดภาพผังโครงสร้างและเอกสารคำสั่งแต่งตั้งผ่านปุ่มจัดการหน้าเนื้อหา</p>', 'structure', NULL, NULL, 'about', 'https://www.srpoly.ac.th/?page_id=446', 'published', NOW(), NOW()),
  ('administrators', 'คณะผู้บริหาร', 'ข้อมูลผู้บริหาร รูปภาพ ตำแหน่ง ฝ่ายงาน และช่องทางติดต่อ', '<p>ข้อมูลผู้บริหารถูกจัดการผ่านเมนูบุคลากร โดยสามารถเพิ่มรูป ตำแหน่ง ฝ่ายงาน เบอร์โทร อีเมล และรายละเอียดหน้าที่ได้</p>', 'people', NULL, NULL, 'about', 'https://www.srpoly.ac.th/?page_id=123', 'published', NOW(), NOW()),
  ('school-management-board', 'คณะกรรมการบริหารสถานศึกษา', 'รายชื่อคณะกรรมการบริหารสถานศึกษาและบทบาทหน้าที่', '<p>แสดงรายชื่อคณะกรรมการบริหารสถานศึกษา พร้อมบทบาท วาระ และเอกสารแต่งตั้งที่สามารถอัปโหลดเพิ่มเติมได้</p>', 'committee', NULL, NULL, 'about', 'https://www.srpoly.ac.th/?page_id=518', 'published', NOW(), NOW()),
  ('college-board', 'คณะกรรมการวิทยาลัย', 'รายชื่อคณะกรรมการวิทยาลัยและผู้แทนจากภาคส่วนต่าง ๆ', '<p>แสดงรายชื่อคณะกรรมการวิทยาลัย ผู้ทรงคุณวุฒิ ผู้แทนสถานประกอบการ ผู้แทนครู และผู้แทนชุมชน</p>', 'committee', NULL, NULL, 'about', 'https://www.srpoly.ac.th/?page_id=509', 'published', NOW(), NOW()),
  ('authority', 'อำนาจหน้าที่', 'อำนาจหน้าที่และภารกิจหลักของวิทยาลัย', '<p>นำเสนออำนาจหน้าที่ ภารกิจหลัก และขอบเขตการให้บริการของสถานศึกษา เพื่อให้ประชาชนและผู้มีส่วนเกี่ยวข้องเข้าถึงข้อมูลได้ชัดเจน</p>', 'document', NULL, NULL, 'about', 'https://www.srpoly.ac.th/?page_id=1260', 'published', NOW(), NOW()),
  ('college-song', 'เพลงวิทยาลัย', 'เพลงประจำวิทยาลัยและสื่อที่เกี่ยวข้อง', '<p>รวบรวมเพลงประจำวิทยาลัย สื่อเสียง หรือวิดีโอที่เกี่ยวข้อง สามารถแนบลิงก์หรือไฟล์ประกอบได้จากหน้าแก้ไขเนื้อหา</p>', 'general', NULL, NULL, 'about', 'https://www.srpoly.ac.th/?page_id=710', 'published', NOW(), NOW()),
  ('ita-assessment', 'ระบบประเมินคุณธรรมและความโปร่งใส ITA', 'ข้อมูลและลิงก์เกี่ยวกับ IIT, EIT และ OIT สำหรับสถานศึกษา', '<p>รวบรวมข้อมูลสำหรับการประเมินคุณธรรมและความโปร่งใสของสถานศึกษา ทั้ง IIT, EIT และ OIT พร้อมลิงก์หลักฐานที่เกี่ยวข้อง</p>', 'ita', NULL, NULL, 'ita', 'http://www.ovecita.in.th/', 'published', NOW(), NOW()),
  ('laws', 'กฎหมายและระเบียบที่เกี่ยวข้อง', 'กฎหมาย ระเบียบ ประกาศ และแนวปฏิบัติที่เกี่ยวข้องกับการดำเนินงานของวิทยาลัย', '<p>จัดเก็บไฟล์กฎหมาย ระเบียบ ประกาศ และแนวปฏิบัติที่เกี่ยวข้องกับสถานศึกษา โดยสามารถอัปโหลดไฟล์ PDF หรือเอกสารแนบได้จาก modal จัดการเนื้อหา</p>', 'document', NULL, NULL, 'about', NULL, 'published', NOW(), NOW()),
  ('vision-mission', 'วิสัยทัศน์ พันธกิจ และอัตลักษณ์', 'ข้อมูลทิศทางการพัฒนาวิทยาลัย วิสัยทัศน์ พันธกิจ เอกลักษณ์ และอัตลักษณ์', '<p>นำเสนอวิสัยทัศน์ พันธกิจ เป้าประสงค์ เอกลักษณ์ อัตลักษณ์ และแนวทางการพัฒนาของวิทยาลัย</p>', 'general', NULL, NULL, 'about', NULL, 'published', NOW(), NOW()),
  ('faq', 'FAQs', 'คำถามที่พบบ่อยของวิทยาลัย', '<p>รวบรวมคำถามที่พบบ่อยเกี่ยวกับการสมัครเรียน เอกสารการศึกษา การติดต่อ และบริการออนไลน์</p>', 'faq', NULL, NULL, 'contact', 'https://www.srpoly.ac.th/?page_id=1218', 'published', NOW(), NOW()),
  ('oit', 'การเปิดเผยข้อมูลสาธารณะ OIT 2569', 'ศูนย์รวมรายการ OIT ตามเกณฑ์ ITA สถานศึกษาอาชีวศึกษา', '<p>รวบรวมข้อมูลเปิดเผยต่อสาธารณะตามเกณฑ์ OIT ของสถานศึกษา สามารถเชื่อมโยงไปยังข่าว เอกสาร แผน รายงาน จัดซื้อจัดจ้าง และข้อมูลบุคลากรได้</p>', 'ita', NULL, NULL, 'ita', 'http://www.ovecita.in.th/', 'published', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  content_type = IF(content_type IS NULL OR content_type = '', VALUES(content_type), content_type),
  source_url = IF(source_url IS NULL OR source_url = '', VALUES(source_url), source_url),
  status = IF(status IS NULL OR status = '', VALUES(status), status);

UPDATE content_pages
SET content_type = CASE slug
  WHEN 'administrative-structure' THEN 'structure'
  WHEN 'administrators' THEN 'people'
  WHEN 'school-management-board' THEN 'committee'
  WHEN 'college-board' THEN 'committee'
  WHEN 'authority' THEN 'document'
  WHEN 'laws' THEN 'document'
  WHEN 'ita-assessment' THEN 'ita'
  WHEN 'oit' THEN 'ita'
  WHEN 'faq' THEN 'faq'
  ELSE content_type
END
WHERE slug IN (
  'administrative-structure',
  'administrators',
  'school-management-board',
  'college-board',
  'authority',
  'laws',
  'ita-assessment',
  'oit',
  'faq'
);

INSERT INTO navigation_items (item_key, parent_id, label, url, sort_order, is_active, created_at, updated_at)
SELECT item_key, parent_id, label, url, sort_order, 1, NOW(), NOW()
FROM (
  SELECT 'about-structure' AS item_key, (SELECT id FROM navigation_items WHERE item_key = 'about' LIMIT 1) AS parent_id, 'โครงสร้างการบริหาร' AS label, '/content/administrative-structure' AS url, 10 AS sort_order
  UNION ALL SELECT 'about-administrators', (SELECT id FROM navigation_items WHERE item_key = 'about' LIMIT 1), 'คณะผู้บริหาร', '/content/administrators', 20
  UNION ALL SELECT 'about-management-board', (SELECT id FROM navigation_items WHERE item_key = 'about' LIMIT 1), 'คณะกรรมการบริหารสถานศึกษา', '/content/school-management-board', 30
  UNION ALL SELECT 'about-board', (SELECT id FROM navigation_items WHERE item_key = 'about' LIMIT 1), 'คณะกรรมการวิทยาลัย', '/content/college-board', 40
  UNION ALL SELECT 'about-authority', (SELECT id FROM navigation_items WHERE item_key = 'about' LIMIT 1), 'อำนาจหน้าที่', '/content/authority', 50
  UNION ALL SELECT 'about-laws', (SELECT id FROM navigation_items WHERE item_key = 'about' LIMIT 1), 'กฎหมายและระเบียบ', '/content/laws', 60
  UNION ALL SELECT 'about-vision', (SELECT id FROM navigation_items WHERE item_key = 'about' LIMIT 1), 'วิสัยทัศน์ / พันธกิจ', '/content/vision-mission', 70
  UNION ALL SELECT 'about-song', (SELECT id FROM navigation_items WHERE item_key = 'about' LIMIT 1), 'เพลงวิทยาลัย', '/content/college-song', 80
  UNION ALL SELECT 'ita-eit', (SELECT id FROM navigation_items WHERE item_key = 'ita' LIMIT 1), 'ระบบประเมิน ITA', '/content/ita-assessment', 10
  UNION ALL SELECT 'ita-oit', (SELECT id FROM navigation_items WHERE item_key = 'ita' LIMIT 1), 'การเปิดเผยข้อมูล OIT', '/content/oit', 20
  UNION ALL SELECT 'contact-faq', (SELECT id FROM navigation_items WHERE item_key = 'contact' LIMIT 1), 'FAQs', '/content/faq', 10
) seed
WHERE parent_id IS NOT NULL
ON DUPLICATE KEY UPDATE
  parent_id = VALUES(parent_id),
  label = VALUES(label),
  url = VALUES(url),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active),
  updated_at = NOW();
