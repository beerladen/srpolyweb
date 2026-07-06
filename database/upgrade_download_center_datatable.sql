DROP PROCEDURE IF EXISTS srpoly_add_index_if_missing;
DELIMITER //
CREATE PROCEDURE srpoly_add_index_if_missing(
  IN table_name_value VARCHAR(64),
  IN index_name_value VARCHAR(64),
  IN index_definition_value TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = table_name_value
      AND index_name = index_name_value
  ) THEN
    SET @srpoly_add_index_sql = CONCAT(
      'CREATE INDEX `',
      REPLACE(index_name_value, '`', '``'),
      '` ON `',
      REPLACE(table_name_value, '`', '``'),
      '` ',
      index_definition_value
    );
    PREPARE srpoly_add_index_stmt FROM @srpoly_add_index_sql;
    EXECUTE srpoly_add_index_stmt;
    DEALLOCATE PREPARE srpoly_add_index_stmt;
  END IF;
END//
DELIMITER ;

CALL srpoly_add_index_if_missing('documents', 'idx_documents_download_center', '(public_status, is_featured, sort_order, download_count, published_at, id)');
CALL srpoly_add_index_if_missing('documents', 'idx_documents_download_filters', '(public_status, category_id, department, file_type)');
CALL srpoly_add_index_if_missing('categories', 'idx_categories_document_center', '(type, status, sort_order, id)');
CALL srpoly_add_index_if_missing('document_download_logs', 'idx_document_download_logs_document_date', '(document_id, created_at)');

DROP PROCEDURE IF EXISTS srpoly_add_index_if_missing;
