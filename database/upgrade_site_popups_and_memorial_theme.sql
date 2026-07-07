CREATE TABLE IF NOT EXISTS site_popups (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(190) NOT NULL,
  eyebrow VARCHAR(160) NULL,
  body TEXT NULL,
  image_path VARCHAR(500) NULL,
  image_alt VARCHAR(190) NULL,
  primary_label VARCHAR(120) NULL,
  primary_href VARCHAR(500) NULL,
  primary_target VARCHAR(30) NOT NULL DEFAULT 'self',
  secondary_label VARCHAR(120) NOT NULL DEFAULT 'เข้าสู่เว็บไซต์',
  display_scope VARCHAR(30) NOT NULL DEFAULT 'all',
  show_frequency VARCHAR(30) NOT NULL DEFAULT 'once_per_session',
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_site_popups_status_scope (status, display_scope, starts_at, ends_at, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_popups (
  title,
  eyebrow,
  body,
  primary_label,
  primary_href,
  primary_target,
  secondary_label,
  display_scope,
  show_frequency,
  sort_order,
  status
)
SELECT
  'ป๊อปอัปวาระพิเศษ',
  'ประกาศสำคัญ',
  'ใช้สำหรับแสดงประกาศ ภาพ ข้อความ หรือลิงก์ในวาระพิเศษ สามารถเปิดใช้งานเมื่อพร้อมเผยแพร่',
  'ดูรายละเอียด',
  '/',
  'self',
  'เข้าสู่เว็บไซต์',
  'all',
  'once_per_session',
  0,
  'inactive'
WHERE NOT EXISTS (SELECT 1 FROM site_popups LIMIT 1);
