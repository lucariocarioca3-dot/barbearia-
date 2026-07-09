import { getDb } from '../database/connection';

export interface Barber {
  id?: number;
  name: string;
  photo: string | null;
  active: number;
  created_at?: string;
}

export const BarberModel = {
  findAll(): Barber[] {
    return getDb().prepare('SELECT * FROM barbers WHERE active = 1 ORDER BY name').all() as Barber[];
  },

  findAllWithInactive(): Barber[] {
    return getDb().prepare('SELECT * FROM barbers ORDER BY name').all() as Barber[];
  },

  findById(id: number): Barber | undefined {
    return getDb().prepare('SELECT * FROM barbers WHERE id = ?').get(id) as Barber | undefined;
  },

  create(data: Omit<Barber, 'id' | 'active' | 'created_at'>): Barber {
    const result = getDb().prepare('INSERT INTO barbers (name, photo) VALUES (?, ?)').run(data.name, data.photo ?? null);
    return this.findById(result.lastInsertRowid as number) as Barber;
  },

  update(id: number, data: Partial<Barber>): Barber | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.photo !== undefined) { fields.push('photo = ?'); values.push(data.photo); }
    if (data.active !== undefined) { fields.push('active = ?'); values.push(data.active); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    getDb().prepare(`UPDATE barbers SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  remove(id: number): boolean {
    const result = getDb().prepare('DELETE FROM barbers WHERE id = ?').run(id);
    return result.changes > 0;
  }
};
