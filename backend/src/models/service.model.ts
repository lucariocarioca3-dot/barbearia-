import { getDb } from '../database/connection';

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
  findAll(): Service[] {
    return getDb().prepare('SELECT * FROM services WHERE active = 1 ORDER BY name').all() as Service[];
  },

  findAllWithInactive(): Service[] {
    return getDb().prepare('SELECT * FROM services ORDER BY name').all() as Service[];
  },

  findById(id: number): Service | undefined {
    return getDb().prepare('SELECT * FROM services WHERE id = ?').get(id) as Service | undefined;
  },

  create(data: Omit<Service, 'id' | 'active' | 'created_at'>): Service {
    const result = getDb().prepare(
      'INSERT INTO services (name, description, duration, price) VALUES (?, ?, ?, ?)'
    ).run(data.name, data.description ?? null, data.duration, data.price);
    return this.findById(result.lastInsertRowid as number) as Service;
  },

  update(id: number, data: Partial<Service>): Service | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.duration !== undefined) { fields.push('duration = ?'); values.push(data.duration); }
    if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
    if (data.active !== undefined) { fields.push('active = ?'); values.push(data.active); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    getDb().prepare(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  remove(id: number): boolean {
    const result = getDb().prepare('DELETE FROM services WHERE id = ?').run(id);
    return result.changes > 0;
  }
};
