import { getDb } from '../database/connection';

export interface WorkingHours {
  id?: number;
  barber_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export const WorkingHoursModel = {
  findByBarberId(barberId: number): WorkingHours[] {
    return getDb().prepare(
      'SELECT * FROM working_hours WHERE barber_id = ? ORDER BY day_of_week, start_time'
    ).all(barberId) as WorkingHours[];
  },

  findByBarberAndDay(barberId: number, dayOfWeek: number): WorkingHours | undefined {
    return getDb().prepare(
      'SELECT * FROM working_hours WHERE barber_id = ? AND day_of_week = ?'
    ).get(barberId, dayOfWeek) as WorkingHours | undefined;
  },

  upsert(data: WorkingHours): WorkingHours {
    if (data.id) {
      getDb().prepare(
        'UPDATE working_hours SET barber_id = ?, day_of_week = ?, start_time = ?, end_time = ? WHERE id = ?'
      ).run(data.barber_id, data.day_of_week, data.start_time, data.end_time, data.id);
      return data;
    } else {
      const result = getDb().prepare(
        'INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)'
      ).run(data.barber_id, data.day_of_week, data.start_time, data.end_time);
      return { ...data, id: result.lastInsertRowid as number };
    }
  },

  setForBarber(barberId: number, hours: Omit<WorkingHours, 'id' | 'barber_id'>[]): void {
    const db = getDb();
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM working_hours WHERE barber_id = ?').run(barberId);
      const insert = db.prepare(
        'INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)'
      );
      for (const h of hours) {
        insert.run(barberId, h.day_of_week, h.start_time, h.end_time);
      }
    });
    transaction();
  }
};
