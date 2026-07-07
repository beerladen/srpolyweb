CREATE TABLE IF NOT EXISTS password_reset_requests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  identifier VARCHAR(190) NOT NULL,
  requested_email VARCHAR(190) NULL,
  requester_note TEXT NULL,
  user_id INT UNSIGNED NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  handled_by INT UNSIGNED NULL,
  handled_at DATETIME NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_password_reset_status_created (status, created_at, id),
  KEY idx_password_reset_user_status (user_id, status),
  KEY idx_password_reset_identifier (identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
