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

CALL srpoly_add_column_if_missing('news', 'is_featured', 'is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER view_count');
CALL srpoly_add_column_if_missing('news', 'featured_sort_order', 'featured_sort_order INT NOT NULL DEFAULT 0 AFTER is_featured');
CALL srpoly_add_column_if_missing('news', 'cover_display_mode', 'cover_display_mode VARCHAR(20) NOT NULL DEFAULT ''cover'' AFTER cover_image');

DROP PROCEDURE IF EXISTS srpoly_add_column_if_missing;

INSERT INTO categories (name, slug, type, description, sort_order, status)
SELECT 'ประชาสัมพันธ์ทั่วไป', 'general', 'news', 'ข่าวประชาสัมพันธ์ทั่วไปของวิทยาลัย', 0, 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'general' AND type = 'news');

UPDATE categories
SET name = 'งานกิจกรรม', description = COALESCE(description, 'ข่าวกิจกรรมของวิทยาลัย')
WHERE slug = 'activities' AND type = 'news';

INSERT INTO categories (name, slug, type, description, sort_order, status)
SELECT 'งานกิจกรรม', 'activities', 'news', 'ข่าวกิจกรรมของวิทยาลัย', 1, 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'activities' AND type = 'news');

INSERT INTO categories (name, slug, type, description, sort_order, status)
SELECT 'จัดซื้อจัดจ้าง', 'procurement-news', 'news', 'ข่าวและประกาศที่เกี่ยวข้องกับจัดซื้อจัดจ้าง', 2, 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'procurement-news' AND type = 'news');

INSERT INTO categories (name, slug, type, description, sort_order, status)
SELECT 'ประกาศ', 'announcements-news', 'news', 'ประกาศสำคัญของวิทยาลัย', 3, 'active'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'announcements-news' AND type = 'news');

UPDATE news
SET is_featured = 1, featured_sort_order = 1
WHERE id = (SELECT id FROM (SELECT id FROM news WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC, id DESC LIMIT 1) latest_news);
