import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
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

let initPromise: Promise<void> | undefined;

function initialize(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await initializeDatabase();
      if (isProduction) {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@barbearia.com';
        const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(8).toString('hex');
        await seedIfEmpty(adminEmail, adminPassword);
      }
    })();
  }
  return initPromise;
}

app.use(cors({
  origin: isProduction
    ? process.env.FRONTEND_URL || '*'
    : '*',
}));
app.use(express.json());

app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await initialize();
    next();
  } catch (err) {
    next(err);
  }
});

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

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
  });
}

export default app;