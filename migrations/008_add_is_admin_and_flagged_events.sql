-- Migration 008: Add is_admin to users and spam/flag fields to events

ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;

ALTER TABLE events ADD COLUMN is_flagged INTEGER NOT NULL DEFAULT 0;

ALTER TABLE events ADD COLUMN flag_reason TEXT;
