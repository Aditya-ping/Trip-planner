-- 004_add_image_attribution.sql: Add image attribution columns to places table

ALTER TABLE places ADD COLUMN image_attribution TEXT;
ALTER TABLE places ADD COLUMN image_attribution_link TEXT;
