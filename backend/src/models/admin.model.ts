import { getDb } from '../database/connection';

export interface Admin {
  id?: number;
  name: string;
  email: string;
  password: string;
  created_at?: string;
}

export const AdminModel = {
  findByEmail(email: string): Admin | undefined {
    return getDb().prepare('SELECT * FROM admins WHERE email = ?').get(email) as Admin | undefined;
  },

  findById(id: number): Admin | undefined {
    return getDb().prepare('SELECT id, name, email, created_at FROM admins WHERE id = ?').get(id) as Admin | undefined;
  }
};
