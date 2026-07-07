CREATE TABLE IF NOT EXISTS personnel_position_options (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  group_name VARCHAR(160) NOT NULL,
  position_name VARCHAR(190) NOT NULL,
  description TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_personnel_position_group_status (group_name, status, sort_order, id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO personnel_position_options (group_name, position_name, description, sort_order, status)
SELECT seed.group_name, seed.position_name, seed.description, seed.sort_order, seed.status
FROM (
  SELECT 'ผู้บริหาร' AS group_name, 'ผู้อำนวยการ' AS position_name, 'ตำแหน่งผู้บริหารสถานศึกษา' AS description, 1 AS sort_order, 'active' AS status
  UNION ALL SELECT 'ผู้บริหาร', 'รองผู้อำนวยการ', 'ตำแหน่งผู้บริหารสถานศึกษา', 2, 'active'
  UNION ALL SELECT 'ผู้บริหาร', 'หัวหน้างาน', 'ตำแหน่งหัวหน้างานหรือผู้รับผิดชอบหลัก', 3, 'active'
  UNION ALL SELECT 'ผู้บริหาร', 'ผู้ช่วยหัวหน้างาน', 'ตำแหน่งผู้ช่วยหัวหน้างาน', 4, 'active'
  UNION ALL SELECT 'ข้าราชการครู', 'ผู้อำนวยการ', 'ระดับตำแหน่งข้าราชการครูและบุคลากรทางการศึกษา', 1, 'active'
  UNION ALL SELECT 'ข้าราชการครู', 'รองผู้อำนวยการ', 'ระดับตำแหน่งข้าราชการครูและบุคลากรทางการศึกษา', 2, 'active'
  UNION ALL SELECT 'ข้าราชการครู', 'ครูผู้ช่วย', 'ระดับตำแหน่งข้าราชการครูและบุคลากรทางการศึกษา', 3, 'active'
  UNION ALL SELECT 'ข้าราชการครู', 'ครู คศ.1', 'ระดับตำแหน่งข้าราชการครูและบุคลากรทางการศึกษา', 4, 'active'
  UNION ALL SELECT 'ข้าราชการครู', 'ครูชำนาญการ', 'ระดับตำแหน่งข้าราชการครูและบุคลากรทางการศึกษา', 5, 'active'
  UNION ALL SELECT 'ข้าราชการครู', 'ครูชำนาญการพิเศษ', 'ระดับตำแหน่งข้าราชการครูและบุคลากรทางการศึกษา', 6, 'active'
  UNION ALL SELECT 'ข้าราชการครู', 'ครูเชี่ยวชาญ', 'ระดับตำแหน่งข้าราชการครูและบุคลากรทางการศึกษา', 7, 'active'
  UNION ALL SELECT 'พนักงานราชการ', 'พนักงานราชการ (ครู)', 'กลุ่มพนักงานราชการสายการสอน', 1, 'active'
  UNION ALL SELECT 'พนักงานราชการ', 'พนักงานราชการทั่วไป', 'กลุ่มพนักงานราชการทั่วไป', 2, 'active'
  UNION ALL SELECT 'พนักงานราชการ', 'เจ้าหน้าที่สนับสนุน', 'กลุ่มสนับสนุนภารกิจสถานศึกษา', 3, 'active'
  UNION ALL SELECT 'ครูจ้างสอน/ผู้ชำนาญการ', 'ครูจ้างสอน', 'บุคลากรจ้างสอนตามรายวิชาหรือภารกิจ', 1, 'active'
  UNION ALL SELECT 'ครูจ้างสอน/ผู้ชำนาญการ', 'ผู้ชำนาญการ', 'ผู้มีความชำนาญเฉพาะด้าน', 2, 'active'
  UNION ALL SELECT 'ครูจ้างสอน/ผู้ชำนาญการ', 'ผู้เชี่ยวชาญเฉพาะทาง', 'ผู้เชี่ยวชาญสนับสนุนการเรียนการสอน', 3, 'active'
  UNION ALL SELECT 'ครูจ้างสอน/ผู้ชำนาญการ', 'วิทยากรพิเศษ', 'วิทยากรหรือผู้สอนพิเศษ', 4, 'active'
  UNION ALL SELECT 'เจ้าหน้าที่/ลูกจ้าง', 'เจ้าหน้าที่ธุรการ', 'เจ้าหน้าที่สนับสนุนงานธุรการ', 1, 'active'
  UNION ALL SELECT 'เจ้าหน้าที่/ลูกจ้าง', 'นักการภารโรง', 'บุคลากรสนับสนุนด้านอาคารสถานที่', 2, 'active'
  UNION ALL SELECT 'เจ้าหน้าที่/ลูกจ้าง', 'พนักงานขับรถ', 'บุคลากรสนับสนุนด้านยานพาหนะ', 3, 'active'
  UNION ALL SELECT 'เจ้าหน้าที่/ลูกจ้าง', 'เจ้าหน้าที่รักษาความปลอดภัย', 'บุคลากรสนับสนุนด้านความปลอดภัย', 4, 'active'
  UNION ALL SELECT 'เจ้าหน้าที่/ลูกจ้าง', 'ลูกจ้างประจำ', 'ลูกจ้างประจำของสถานศึกษา', 5, 'active'
  UNION ALL SELECT 'เจ้าหน้าที่/ลูกจ้าง', 'ลูกจ้างชั่วคราว', 'ลูกจ้างชั่วคราวของสถานศึกษา', 6, 'active'
) AS seed
WHERE NOT EXISTS (
  SELECT 1
  FROM personnel_position_options existing
  WHERE existing.group_name = seed.group_name
    AND existing.position_name = seed.position_name
);
