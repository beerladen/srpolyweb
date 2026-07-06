ALTER TABLE news
  ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER view_count,
  ADD COLUMN IF NOT EXISTS featured_sort_order INT NOT NULL DEFAULT 0 AFTER is_featured;

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
