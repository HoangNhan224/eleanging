-- Run this to add lesson-level download toggle support.
-- The column is idempotent and defaults to disabled.

SET @schema_name = DATABASE();

SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'lessions'
    AND COLUMN_NAME = 'allow_download'
);

SET @ddl = IF(
  @col_exists = 0,
  'ALTER TABLE lessions ADD COLUMN allow_download TINYINT(1) NOT NULL DEFAULT 0 AFTER locationPath',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Keep data consistent: only PDF lessons can keep download enabled.
UPDATE lessions
SET allow_download = 0
WHERE UPPER(COALESCE(type, '')) <> 'PDF'
  AND allow_download <> 0;
