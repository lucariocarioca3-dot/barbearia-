import { all, get, run, getDb } from '../database/connection';

export interface WorkingHours {
  id?: number;
  barber_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export const WorkingHoursModel = {
  async findByBarberId(barberId: number): Promise<WorkingHours[]> {
    return all<WorkingHours>(
      'SELECT * FROM working_hours WHERE barber_id = ? ORDER BY day_of_week, start_time',
      [barberId]
    );
  },

  async findByBarberAndDay(barberId: number, dayOfWeek: number): Promise<WorkingHours | undefined> {
    return get<WorkingHours>(
      'SELECT * FROM working_hours WHERE barber_id = ? AND day_of_week = ?',
      [barberId, dayOfWeek]
    );
  },

  async upsert(data: WorkingHours): Promise<WorkingHours> {
    if (data.id) {
      await run(
        'UPDATE working_hours SET barber_id = ?, day_of_week = ?, start_time = ?, end_time = ? WHERE id = ?',
        [data.barber_id, data.day_of_week, data.start_time, data.end_time, data.id]
      );
      return data;
    } else {
      const result = await run(
        'INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [data.barber_id, data.day_of_week, data.start_time, data.end_time]
      );
      return { ...data, id: Number(result.lastInsertRowid) };
    }
  },

  async setForBarber(barberId: number, hours: Omit<WorkingHours, 'id' | 'barber_id'>[]): Promise<void> {
    await getDb().batch([
      { sql: 'DELETE FROM working_hours WHERE barber_id = ?', args: [barberId] },
      ...hours.map(h => ({
        sql: 'INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        args: [barberId, h.day_of_week, h.start_time, h.end_time],
      })),
    ]);
  }
};