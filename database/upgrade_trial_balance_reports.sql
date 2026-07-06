CREATE TABLE IF NOT EXISTS trial_balance_download_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id INT UNSIGNED NOT NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_trial_balance_download_logs_report_id (report_id),
  KEY idx_trial_balance_download_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CALL srpoly_add_index_if_missing('procurement', 'idx_procurement_trial_balance', '(status, type, fiscal_year, published_at, id)');
CALL srpoly_add_index_if_missing('trial_balance_download_logs', 'idx_trial_balance_report_date', '(report_id, created_at)');

DROP PROCEDURE IF EXISTS srpoly_add_index_if_missing;

UPDATE navigation_items
SET url = '/trial-balance?year=2568',
    updated_at = NOW()
WHERE item_key = 'service-budget-2568';

UPDATE navigation_items
SET url = '/trial-balance?year=2567',
    updated_at = NOW()
WHERE item_key = 'service-budget-2567';

UPDATE quick_links
SET url = '/trial-balance',
    updated_at = NOW()
WHERE item_key = 'budget-report';

UPDATE procurement
SET department = 'งานการเงิน',
    updated_at = NOW()
WHERE type = 'รายงานงบทดลอง'
  AND (department IS NULL OR department = '');
