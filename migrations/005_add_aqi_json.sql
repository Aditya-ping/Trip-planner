-- 005_add_aqi_json.sql: Add aqi_json column to trips table

ALTER TABLE trips ADD COLUMN aqi_json TEXT;
