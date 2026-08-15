import { all, get, run } from '../database/connection';
import type { SqlValue } from '../database/connection';

export interface Appointment {
  id?: number;
  barber_id: number;
  service_id: number;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  created_at?: string;
}

export interface AppointmentWithRelations extends Appointment {
  barber_name: string;
  service_name: string;
  service_duration: number;
  service_price: number;
}

export const AppointmentModel = {
  async findAll(filters?: { date?: string; barber_id?: number; status?: string }): Promise<AppointmentWithRelations[]> {
    let sql = `
      SELECT a.*, b.name as barber_name, s.name as service_name,
             s.duration as service_duration, s.price as service_price
      FROM appointments a
      JOIN barbers b ON a.barber_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE 1=1
    `;
    const params: SqlValue[] = [];

    if (filters?.date) { sql += ' AND a.date = ?'; params.push(filters.date); }
    if (filters?.barber_id) { sql += ' AND a.barber_id = ?'; params.push(filters.barber_id); }
    if (filters?.status) { sql += ' AND a.status = ?'; params.push(filters.status); }

    sql += ' ORDER BY a.date, a.time';
    return all<AppointmentWithRelations>(sql, params);
  },

  async findById(id: number): Promise<AppointmentWithRelations | undefined> {
    return get<AppointmentWithRelations>(`
      SELECT a.*, b.name as barber_name, s.name as service_name,
             s.duration as service_duration, s.price as service_price
      FROM appointments a
      JOIN barbers b ON a.barber_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `, [id]);
  },

  async create(data: Omit<Appointment, 'id' | 'status' | 'created_at'>): Promise<Appointment> {
    const row = await get<{ id: number }>(`
      INSERT INTO appointments (barber_id, service_id, client_name, client_phone, client_email, date, time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `, [data.barber_id, data.service_id, data.client_name, data.client_phone, data.client_email ?? null, data.date, data.time]);
    return this.findById(Number(row?.id)) as Promise<Appointment>;
  },

  async updateStatus(id: number, status: Appointment['status']): Promise<Appointment | undefined> {
    await run('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async update(id: number, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const fields: string[] = [];
    const values: SqlValue[] = [];

    if (data.barber_id !== undefined) { fields.push('barber_id = ?'); values.push(data.barber_id); }
    if (data.service_id !== undefined) { fields.push('service_id = ?'); values.push(data.service_id); }
    if (data.client_name !== undefined) { fields.push('client_name = ?'); values.push(data.client_name); }
    if (data.client_phone !== undefined) { fields.push('client_phone = ?'); values.push(data.client_phone); }
    if (data.client_email !== undefined) { fields.push('client_email = ?'); values.push(data.client_email); }
    if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
    if (data.time !== undefined) { fields.push('time = ?'); values.push(data.time); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await run(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async remove(id: number): Promise<boolean> {
    const result = await run('DELETE FROM appointments WHERE id = ?', [id]);
    return result.changes > 0;
  },

  async getOccupiedSlots(barber_id: number, date: string): Promise<{ time: string; duration: number }[]> {
    return all<{ time: string; duration: number }>(`
      SELECT a.time, s.duration
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.barber_id = ? AND a.date = ? AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.time
    `, [barber_id, date]);
  },

  async getTodayCount(): Promise<number> {
    const row = await get<{ count: number }>(`
      SELECT COUNT(*) as count FROM appointments WHERE date = CURRENT_DATE::text AND status != 'cancelled'
    `);
    return Number(row?.count ?? 0);
  },

  async getPendingCount(): Promise<number> {
    const row = await get<{ count: number }>(`
      SELECT COUNT(*) as count FROM appointments WHERE status = 'scheduled'
    `);
    return Number(row?.count ?? 0);
  },

  async getUpcomingAppointments(limit: number = 5): Promise<AppointmentWithRelations[]> {
    return all<AppointmentWithRelations>(`
      SELECT a.*, b.name as barber_name, s.name as service_name,
             s.duration as service_duration, s.price as service_price
      FROM appointments a
      JOIN barbers b ON a.barber_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE a.date >= CURRENT_DATE::text AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.date, a.time
      LIMIT ?
    `, [limit]);
  }
};