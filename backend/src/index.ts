import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './database/connection';
import { seedIfEmpty } from './database/seed';
import authRoutes from './routes/auth.routes';
import barberRoutes from './routes/barber.routes';
import serviceRoutes from './routes/service.routes';
import appointmentRoutes from './routes/appointment.routes';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const dataDir = process.env.DB_PATH
  ? path.dirname(process.env.DB_PATH)
  : path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

initializeDatabase();

if (isProduction) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@barbearia.com';
  const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(8).toString('hex');
  if (seedIfEmpty(adminEmail, adminPassword)) {
    console.log(`Admin criado: ${adminEmail} / senha: ${adminPassword}`);
  }
}

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || '*'
    : '*',
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (isProduction) {
  const distDir = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    console.warn(`Diretório do frontend não encontrado: ${distDir}`);
  }
}

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});