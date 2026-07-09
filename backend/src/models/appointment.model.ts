import { getDb } from '../database/connection';

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
  findAll(filters?: { date?: string; barber_id?: number; status?: string }): AppointmentWithRelations[] {
    let sql = `
      SELECT a.*, b.name as barber_name, s.name as service_name,
             s.duration as service_duration, s.price as service_price
      FROM appointments a
      JOIN barbers b ON a.barber_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.date) { sql += ' AND a.date = ?'; params.push(filters.date); }
    if (filters?.barber_id) { sql += ' AND a.barber_id = ?'; params.push(filters.barber_id); }
    if (filters?.status) { sql += ' AND a.status = ?'; params.push(filters.status); }

    sql += ' ORDER BY a.date, a.time';
    return getDb().prepare(sql).all(...params) as AppointmentWithRelations[];
  },

  findById(id: number): AppointmentWithRelations | undefined {
    return getDb().prepare(`
      SELECT a.*, b.name as barber_name, s.name as service_name,
             s.duration as service_duration, s.price as service_price
      FROM appointments a
      JOIN barbers b ON a.barber_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `).get(id) as AppointmentWithRelations | undefined;
  },

  create(data: Omit<Appointment, 'id' | 'status' | 'created_at'>): Appointment {
    const result = getDb().prepare(`
      INSERT INTO appointments (barber_id, service_id, client_name, client_phone, client_email, date, time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(data.barber_id, data.service_id, data.client_name, data.client_phone, data.client_email ?? null, data.date, data.time);
    return this.findById(result.lastInsertRowid as number) as Appointment;
  },

  updateStatus(id: number, status: Appointment['status']): Appointment | undefined {
    getDb().prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);
    return this.findById(id);
  },

  update(id: number, data: Partial<Appointment>): Appointment | undefined {
    const fields: string[] = [];
    const values: any[] = [];

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
    getDb().prepare(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  remove(id: number): boolean {
    const result = getDb().prepare('DELETE FROM appointments WHERE id = ?').run(id);
    return result.changes > 0;
  },

  getOccupiedSlots(barber_id: number, date: string): { time: string; duration: number }[] {
    return getDb().prepare(`
      SELECT a.time, s.duration
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.barber_id = ? AND a.date = ? AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.time
    `).all(barber_id, date) as { time: string; duration: number }[];
  },

  getTodayCount(): number {
    const row = getDb().prepare(`
      SELECT COUNT(*) as count FROM appointments WHERE date = date('now') AND status != 'cancelled'
    `).get() as { count: number };
    return row.count;
  },

  getPendingCount(): number {
    const row = getDb().prepare(`
      SELECT COUNT(*) as count FROM appointments WHERE status = 'scheduled'
    `).get() as { count: number };
    return row.count;
  },

  getUpcomingAppointments(limit: number = 5): AppointmentWithRelations[] {
    return getDb().prepare(`
      SELECT a.*, b.name as barber_name, s.name as service_name,
             s.duration as service_duration, s.price as service_price
      FROM appointments a
      JOIN barbers b ON a.barber_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE a.date >= date('now') AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.date, a.time
      LIMIT ?
    `).all(limit) as AppointmentWithRelations[];
  }
};
