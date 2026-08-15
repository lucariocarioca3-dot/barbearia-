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
      const row = await get<{ id: number }>(
        'INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?) RETURNING id',
        [data.barber_id, data.day_of_week, data.start_time, data.end_time]
      );
      return { ...data, id: Number(row?.id) };
    }
  },

  async setForBarber(barberId: number, hours: Omit<WorkingHours, 'id' | 'barber_id'>[]): Promise<void> {
    await getDb().begin(async (tx) => {
      await tx.unsafe('DELETE FROM working_hours WHERE barber_id = $1', [barberId]);
      for (const h of hours) {
        await tx.unsafe(
          'INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
          [barberId, h.day_of_week, h.start_time, h.end_time]
        );
      }
    });
  }
};