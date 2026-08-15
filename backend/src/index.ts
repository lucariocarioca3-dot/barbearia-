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
    // Rotas de navegação da SPA (HTML) vêm PRIMEIRO, antes do express.static.
    // Assim o index.html é sempre servido por este handler (e nunca pelo
    // express.static, que adicionaria Cache-Control: public, max-age=0). O
    // índice HTML nunca fica preso em cache: cada recarregamento valida com o
    // servidor (no-cache, must-revalidate), evitando index.html stale que
    // aponta para hashes de bundles de builds antigos — a causa da tela branca
    // com o erro "Failed to load module script ... MIME type text/html".
    app.get(/^\/(?!api\/)[^.]*$/, (_req, res) => {
      // no-store: o index.html é baixado inteiro a cada acesso, SEM revalidação
      // por ETag. Isso é essencial porque o ETag gerado por res.sendFile
      // (tamanho + mtime) é idêntico entre builds na Vercel (o mtime do
      // arquivo dentro da função serverless é constante), então um
      // "must-revalidate" resultaria em 304 eterno com o HTML stale — a causa
      // da tela branca com 404 em bundles de builds antigos.
      res.setHeader('Cache-Control', 'no-store');
      res.sendFile(path.join(distDir, 'index.html'), { cacheControl: false });
    });

    // Assets estáticos do build do frontend (bundles com hash, imagens,
    // favicon etc.). Se um asset não existir (hash de build antigo), o
    // express.static deixa passar e o Express responde 404 nativo — nunca
    // devolvemos HTML no lugar de um .js/.css, o que eliminaria o erro de
    // MIME type.
    app.use(express.static(distDir));
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