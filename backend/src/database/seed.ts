import bcrypt from 'bcryptjs';
import { initializeDatabase, get, run } from './connection';

export async function seedIfEmpty(adminEmail: string, adminPassword: string): Promise<boolean> {
  await initializeDatabase();

  const adminExists = await get<{ id: number }>('SELECT id FROM admins LIMIT 1');
  if (adminExists) {
    console.log('Banco já populado. Pulando seed.');
    return false;
  }

  const hashedPassword = bcrypt.hashSync(adminPassword, 10);
  try {
    await run('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)', [
      'Administrador', adminEmail, hashedPassword
    ]);
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    if (msg.includes('23505') || msg.toUpperCase().includes('UNIQUE')) {
      console.log('Admin já existe. Pulando seed.');
      return false;
    }
    throw err;
  }

  const barberNames = ['Carlos Silva', 'Rafael Oliveira', 'Thiago Santos'];
  const barberIds: number[] = [];

  for (const name of barberNames) {
    try {
      const row = await get<{ id: number }>('INSERT INTO barbers (name, photo) VALUES (?, ?) RETURNING id', [name, null]);
      barberIds.push(Number(row?.id));
    } catch {
      // barbeiro já existente
    }
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

  for (const s of services) {
    try {
      await run('INSERT INTO services (name, description, duration, price) VALUES (?, ?, ?, ?)', [
        s.name, s.description, s.duration, s.price
      ]);
    } catch {
      // serviço já existente
    }
  }

  const days = [
    { day: 1, start: '09:00', end: '19:00' },
    { day: 2, start: '09:00', end: '19:00' },
    { day: 3, start: '09:00', end: '19:00' },
    { day: 4, start: '09:00', end: '21:00' },
    { day: 5, start: '09:00', end: '21:00' },
    { day: 6, start: '08:00', end: '18:00' },
  ];

  for (const barberId of barberIds) {
    for (const d of days) {
      try {
        await run('INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)', [
          barberId, d.day, d.start, d.end
        ]);
      } catch {
        // horário já existente
      }
    }
  }

  return true;
}

if (require.main === module) {
  seedIfEmpty('admin@barbearia.com', 'admin123')
    .then((seeded) => {
      console.log(seeded ? 'Seed concluído com sucesso!' : 'Nada a fazer.');
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}