INSERT INTO site_settings (setting_key, setting_value, updated_at)
VALUES ('theme_preset', 'srpoly-blue', NOW())
ON DUPLICATE KEY UPDATE setting_value = COALESCE(setting_value, VALUES(setting_value)), updated_at = NOW();
