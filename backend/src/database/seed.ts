import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { initializeDatabase, getDb } from './connection';

function seed() {
  const dataDir = path.resolve(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  initializeDatabase();
  const db = getDb();

  const adminExists = db.prepare('SELECT id FROM admins LIMIT 1').get();
  if (adminExists) {
    console.log('Banco já populado. Pulando seed.');
    return;
  }

  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)').run(
    'Administrador', 'admin@barbearia.com', hashedPassword
  );

  const barbers = [
    { name: 'Carlos Silva', photo: null },
    { name: 'Rafael Oliveira', photo: null },
    { name: 'Thiago Santos', photo: null },
  ];

  const insertBarber = db.prepare('INSERT INTO barbers (name, photo) VALUES (?, ?)');
  for (const b of barbers) {
    insertBarber.run(b.name, b.photo);
  }

  const services = [
    { name: 'Corte Tradicional', description: 'Corte com tesoura e máquina', duration: 40, price: 45 },
    { name: 'Corte Degradê', description: 'Corte degradê com máquina e tesoura', duration: 50, price: 55 },
    { name: 'Barba', description: 'Aparação e modelagem de barba', duration: 30, price: 35 },
    { name: 'Corte + Barba', description: 'Corte tradicional completo com barba', duration: 60, price: 70 },
    { name: 'Sobrancelha', description: 'Design de sobrancelha', duration: 15, price: 20 },
    { name: 'Hidratação', description: 'Hidratação capilar', duration: 40, price: 50 },
    { name: 'Pigmentação', description: 'Pigmentação capilar', duration: 60, price: 80 },
  ];

  const insertService = db.prepare('INSERT INTO services (name, description, duration, price) VALUES (?, ?, ?, ?)');
  for (const s of services) {
    insertService.run(s.name, s.description, s.duration, s.price);
  }

  const days = [
    { day: 1, start: '09:00', end: '19:00' },
    { day: 2, start: '09:00', end: '19:00' },
    { day: 3, start: '09:00', end: '19:00' },
    { day: 4, start: '09:00', end: '21:00' },
    { day: 5, start: '09:00', end: '21:00' },
    { day: 6, start: '08:00', end: '18:00' },
  ];

  const insertHours = db.prepare(
    'INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)'
  );

  for (let barberId = 1; barberId <= 3; barberId++) {
    for (const d of days) {
      insertHours.run(barberId, d.day, d.start, d.end);
    }
  }

  console.log('Seed concluído com sucesso!');
}

seed();
