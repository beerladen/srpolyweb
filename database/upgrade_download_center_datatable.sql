CREATE INDEX IF NOT EXISTS idx_documents_download_center
  ON documents (public_status, is_featured, sort_order, download_count, published_at, id);

CREATE INDEX IF NOT EXISTS idx_documents_download_filters
  ON documents (public_status, category_id, department, file_type);

CREATE INDEX IF NOT EXISTS idx_categories_document_center
  ON categories (type, status, sort_order, id);

CREATE INDEX IF NOT EXISTS idx_document_download_logs_document_date
  ON document_download_logs (document_id, created_at);
