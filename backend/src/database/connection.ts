import postgres, { Sql } from 'postgres';

export type SqlValue = string | number | boolean | Date | null | Uint8Array;

let sql: Sql;

export function getDb(): Sql {
  if (!sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) {
      throw new Error('DATABASE_URL não configurado. Defina a connection string do Postgres (ex.: Supabase).');
    }
    sql = postgres(url, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sql;
}

function toDollar(sqlText: string, params: SqlValue[]): { query: string; args: SqlValue[] } {
  let i = 0;
  const query = sqlText.replace(/\?/g, () => `$${++i}`);
  return { query, args: params };
}

export async function all<T = Record<string, unknown>>(sqlText: string, params: SqlValue[] = []): Promise<T[]> {
  const { query, args } = toDollar(sqlText, params);
  const result = await getDb().unsafe(query, args);
  return result as unknown as T[];
}

export async function get<T = Record<string, unknown>>(sqlText: string, params: SqlValue[] = []): Promise<T | undefined> {
  const { query, args } = toDollar(sqlText, params);
  const result = await getDb().unsafe(query, args);
  return result[0] as T | undefined;
}

export interface RunResult {
  changes: number;
  lastInsertRowid: number;
}

export async function run(sqlText: string, params: SqlValue[] = []): Promise<RunResult> {
  const { query, args } = toDollar(sqlText, params);
  const result = await getDb().unsafe(query, args);
  return {
    changes: Number(result.count ?? 0),
    lastInsertRowid: 0,
  };
}

export async function initializeDatabase(): Promise<void> {
  await getDb().unsafe(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS barbers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      photo TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL,
      price REAL NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS working_hours (
      id SERIAL PRIMARY KEY,
      barber_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      barber_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_email TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
      created_at TEXT DEFAULT now(),
      FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_appointments_barber_date ON appointments(barber_id, date);
    CREATE INDEX IF NOT EXISTS idx_working_hours_barber ON working_hours(barber_id);
  `);
}