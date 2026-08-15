import { all, get, run } from '../database/connection';
import type { SqlValue } from '../database/connection';

export interface Barber {
  id?: number;
  name: string;
  photo: string | null;
  active: number;
  created_at?: string;
}

export const BarberModel = {
  async findAll(): Promise<Barber[]> {
    return all<Barber>('SELECT * FROM barbers WHERE active = 1 ORDER BY name');
  },

  async findAllWithInactive(): Promise<Barber[]> {
    return all<Barber>('SELECT * FROM barbers ORDER BY name');
  },

  async findById(id: number): Promise<Barber | undefined> {
    return get<Barber>('SELECT * FROM barbers WHERE id = ?', [id]);
  },

  async create(data: Omit<Barber, 'id' | 'active' | 'created_at'>): Promise<Barber> {
    const row = await get<{ id: number }>('INSERT INTO barbers (name, photo) VALUES (?, ?) RETURNING id', [data.name, data.photo ?? null]);
    return this.findById(Number(row?.id)) as Promise<Barber>;
  },

  async update(id: number, data: Partial<Barber>): Promise<Barber | undefined> {
    const fields: string[] = [];
    const values: SqlValue[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.photo !== undefined) { fields.push('photo = ?'); values.push(data.photo); }
    if (data.active !== undefined) { fields.push('active = ?'); values.push(data.active); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await run(`UPDATE barbers SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async remove(id: number): Promise<boolean> {
    const result = await run('DELETE FROM barbers WHERE id = ?', [id]);
    return result.changes > 0;
  }
};