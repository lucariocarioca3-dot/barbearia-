import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminModel } from '../models/admin.model';

const JWT_SECRET = process.env.JWT_SECRET || 'barbearia-secret-key';

export const AuthController = {
  login(req: Request, res: Response): void {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' });
      return;
    }

    const admin = AdminModel.findByEmail(email);
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      res.status(401).json({ error: 'Email ou senha inválidos' });
      return;
    }

    const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email }
    });
  },

  me(req: Request, res: Response): void {
    const adminId = (req as any).adminId;
    const admin = AdminModel.findById(adminId);
    if (!admin) {
      res.status(404).json({ error: 'Admin não encontrado' });
      return;
    }
    res.json(admin);
  }
};
