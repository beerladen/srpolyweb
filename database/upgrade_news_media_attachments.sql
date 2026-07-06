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

CALL srpoly_add_column_if_missing('news', 'gallery_images', 'gallery_images LONGTEXT NULL AFTER cover_image');
CALL srpoly_add_column_if_missing('news', 'attachment_files', 'attachment_files LONGTEXT NULL AFTER content');
CALL srpoly_add_column_if_missing('news', 'external_links', 'external_links TEXT NULL AFTER attachment_files');
CALL srpoly_add_column_if_missing('news', 'sync_to_downloads', 'sync_to_downloads TINYINT(1) NOT NULL DEFAULT 1 AFTER external_links');

DROP PROCEDURE IF EXISTS srpoly_add_column_if_missing;
