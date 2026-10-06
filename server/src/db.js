import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openDb(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id         INTEGER PRIMARY KEY CHECK (id = 1),
      height_cm  REAL    NOT NULL,
      weight_kg  REAL    NOT NULL,
      age        INTEGER NOT NULL,
      updated_at TEXT    NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workouts (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      type      TEXT    NOT NULL,
      minutes   INTEGER NOT NULL,
      calories  INTEGER NOT NULL,
      logged_at TEXT    NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_workouts_logged_at ON workouts (logged_at);
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  return db;
}
