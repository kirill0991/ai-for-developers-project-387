import Database from 'better-sqlite3';

export type Db = Database.Database;

/**
 * Opens (or creates) the SQLite database and ensures the schema exists.
 * Pass `:memory:` for an in-memory database (used in tests).
 */
export function createDb(filename = 'calendar.db'): Db {
  const db = new Database(filename);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS event_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      duration INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      type_id TEXT NOT NULL REFERENCES event_types(id),
      slot_start TEXT NOT NULL,
      slot_end TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  return db;
}
