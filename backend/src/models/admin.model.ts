import { all, get, run } from '../database/connection';

export interface Admin {
  id?: number;
  name: string;
  email: string;
  password: string;
  created_at?: string;
}

export const AdminModel = {
  async findByEmail(email: string): Promise<Admin | undefined> {
    return get<Admin>('SELECT * FROM admins WHERE email = ?', [email]);
  },

  async findById(id: number): Promise<Admin | undefined> {
    return get<Admin>('SELECT id, name, email, created_at FROM admins WHERE id = ?', [id]);
  }
};