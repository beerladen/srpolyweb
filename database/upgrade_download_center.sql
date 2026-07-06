ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS file_size INT UNSIGNED NOT NULL DEFAULT 0 AFTER file_type,
  ADD COLUMN IF NOT EXISTS service_target VARCHAR(160) NULL AFTER file_size,
  ADD COLUMN IF NOT EXISTS tags VARCHAR(255) NULL AFTER service_target,
  ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER tags,
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0 AFTER is_featured;

CREATE TABLE IF NOT EXISTS document_download_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  document_id INT UNSIGNED NOT NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_document_download_logs_document_id (document_id),
  KEY idx_document_download_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (name, slug, type, description, sort_order, status)
SELECT 'แบบฟอร์มงานทะเบียน', 'registration-forms', 'document', 'คำร้อง แบบฟอร์ม และเอกสารงานทะเบียนสำหรับผู้เรียน', 10, 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'registration-forms' AND type = 'document');

INSERT INTO categories (name, slug, type, description, sort_order, status)
SELECT 'งานวิชาการ', 'academic-documents', 'document', 'เอกสารเกี่ยวกับหลักสูตร การเรียน การสอน และงานวิชาการ', 20, 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'academic-documents' AND type = 'document');

INSERT INTO categories (name, slug, type, description, sort_order, status)
SELECT 'งานการเงิน', 'finance-documents', 'document', 'แบบฟอร์มและเอกสารประกอบการติดต่อด้านการเงิน', 30, 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'finance-documents' AND type = 'document');

INSERT INTO categories (name, slug, type, description, sort_order, status)
SELECT 'งานกิจกรรมนักเรียน', 'student-affairs-documents', 'document', 'เอกสารกิจกรรม ทุนการศึกษา วินัย และกิจการนักเรียน', 40, 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'student-affairs-documents' AND type = 'document');

INSERT INTO categories (name, slug, type, description, sort_order, status)
SELECT 'งานแนะแนว', 'guidance-documents', 'document', 'แบบฟอร์มและเอกสารบริการแนะแนว', 50, 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'guidance-documents' AND type = 'document');

INSERT INTO categories (name, slug, type, description, sort_order, status)
SELECT 'งานพัสดุ', 'supply-documents', 'document', 'เอกสารงานพัสดุและแบบฟอร์มจัดซื้อจัดจ้าง', 60, 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'supply-documents' AND type = 'document');

UPDATE categories
SET name = 'แบบฟอร์มงานทะเบียน',
    description = 'คำร้อง แบบฟอร์ม และเอกสารงานทะเบียนสำหรับผู้เรียน',
    sort_order = 10,
    status = 'active'
WHERE slug = 'registration-forms' AND type = 'document';

UPDATE categories
SET name = 'งานวิชาการ',
    description = 'เอกสารเกี่ยวกับหลักสูตร การเรียน การสอน และงานวิชาการ',
    sort_order = 20,
    status = 'active'
WHERE slug = 'academic-documents' AND type = 'document';

UPDATE categories
SET name = 'งานการเงิน',
    description = 'แบบฟอร์มและเอกสารประกอบการติดต่อด้านการเงิน',
    sort_order = 30,
    status = 'active'
WHERE slug = 'finance-documents' AND type = 'document';

UPDATE categories
SET name = 'งานกิจกรรมนักเรียน',
    description = 'เอกสารกิจกรรม ทุนการศึกษา วินัย และกิจการนักเรียน',
    sort_order = 40,
    status = 'active'
WHERE slug = 'student-affairs-documents' AND type = 'document';

UPDATE categories
SET name = 'งานแนะแนว',
    description = 'แบบฟอร์มและเอกสารบริการแนะแนว',
    sort_order = 50,
    status = 'active'
WHERE slug = 'guidance-documents' AND type = 'document';

UPDATE categories
SET name = 'งานพัสดุ',
    description = 'เอกสารงานพัสดุและแบบฟอร์มจัดซื้อจัดจ้าง',
    sort_order = 60,
    status = 'active'
WHERE slug = 'supply-documents' AND type = 'document';

UPDATE documents
SET
  is_featured = CASE WHEN id IN (1, 2) THEN 1 ELSE is_featured END,
  sort_order = CASE WHEN sort_order = 0 THEN id ELSE sort_order END,
  service_target = CASE
    WHEN service_target IS NULL OR service_target LIKE '%?%' THEN 'นักเรียน นักศึกษา ผู้ปกครอง และประชาชน'
    ELSE service_target
  END,
  tags = CASE
    WHEN tags IS NULL OR tags LIKE '%?%' THEN CONCAT_WS(', ', department, file_type, fiscal_year)
    ELSE tags
  END
WHERE public_status = 'published';

INSERT INTO navigation_items (parent_id, label, url, item_key, sort_order, is_active, created_at, updated_at)
SELECT NULL, 'ดาวน์โหลดเอกสาร', '/documents', 'documents', 45, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM navigation_items WHERE item_key = 'documents');

UPDATE navigation_items
SET label = 'ดาวน์โหลดเอกสาร', url = '/documents', sort_order = 45, is_active = 1, updated_at = NOW()
WHERE item_key = 'documents';
