import { createClient, Client, InValue } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import os from 'os';

let db: Client;

function resolveUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  if (process.env.DB_PATH) {
    return `file:${process.env.DB_PATH}`;
  }
  const localPath = process.env.NODE_ENV === 'production'
    ? path.join(os.tmpdir(), 'barbearia', 'barbearia.db')
    : path.resolve(__dirname, '..', '..', 'data', 'barbearia.db');
  const dbDir = path.dirname(localPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  return `file:${localPath}`;
}

export function getDb(): Client {
  if (!db) {
    db = createClient({
      url: resolveUrl(),
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return db;
}

export async function all<T = Record<string, unknown>>(sql: string, params: InValue[] = []): Promise<T[]> {
  const result = await getDb().execute({ sql, args: params });
  return result.rows as unknown as T[];
}

export async function get<T = Record<string, unknown>>(sql: string, params: InValue[] = []): Promise<T | undefined> {
  const result = await getDb().execute({ sql, args: params });
  return result.rows[0] as T | undefined;
}

export interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

export async function run(sql: string, params: InValue[] = []): Promise<RunResult> {
  const result = await getDb().execute({ sql, args: params });
  return {
    changes: Number(result.rowsAffected),
    lastInsertRowid: Number(result.lastInsertRowid),
  };
}

export async function initializeDatabase(): Promise<void> {
  const database = getDb();

  try {
    await getDb().execute('PRAGMA journal_mode = WAL');
    await getDb().execute('PRAGMA foreign_keys = ON');
  } catch {
    // pragmas são ignorados em bancos remotos
  }

  await database.executeMultiple(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS barbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      photo TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL,
      price REAL NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS working_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_email TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_appointments_barber_date ON appointments(barber_id, date);
    CREATE INDEX IF NOT EXISTS idx_working_hours_barber ON working_hours(barber_id);
  `);
}