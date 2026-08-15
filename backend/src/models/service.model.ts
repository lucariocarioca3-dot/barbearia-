import { all, get, run } from '../database/connection';
import type { InValue } from '@libsql/client';

export interface Service {
  id?: number;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  active: number;
  created_at?: string;
}

export const ServiceModel = {
  async findAll(): Promise<Service[]> {
    return all<Service>('SELECT * FROM services WHERE active = 1 ORDER BY name');
  },

  async findAllWithInactive(): Promise<Service[]> {
    return all<Service>('SELECT * FROM services ORDER BY name');
  },

  async findById(id: number): Promise<Service | undefined> {
    return get<Service>('SELECT * FROM services WHERE id = ?', [id]);
  },

  async create(data: Omit<Service, 'id' | 'active' | 'created_at'>): Promise<Service> {
    const result = await run(
      'INSERT INTO services (name, description, duration, price) VALUES (?, ?, ?, ?)',
      [data.name, data.description ?? null, data.duration, data.price]
    );
    return this.findById(Number(result.lastInsertRowid)) as Promise<Service>;
  },

  async update(id: number, data: Partial<Service>): Promise<Service | undefined> {
    const fields: string[] = [];
    const values: InValue[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.duration !== undefined) { fields.push('duration = ?'); values.push(data.duration); }
    if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
    if (data.active !== undefined) { fields.push('active = ?'); values.push(data.active); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await run(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  },

  async remove(id: number): Promise<boolean> {
    const result = await run('DELETE FROM services WHERE id = ?', [id]);
    return result.changes > 0;
  }
};