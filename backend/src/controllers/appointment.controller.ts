import { Request, Response } from 'express';
import { AppointmentModel } from '../models/appointment.model';
import { WorkingHoursModel } from '../models/workingHours.model';
import { ServiceModel } from '../models/service.model';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const AppointmentController = {
  list(req: Request, res: Response): void {
    const { date, barber_id, status } = req.query;
    const filters: any = {};
    if (date) filters.date = date as string;
    if (barber_id) filters.barber_id = Number(barber_id);
    if (status) filters.status = status as string;
    const appointments = AppointmentModel.findAll(filters);
    res.json(appointments);
  },

  getById(req: Request, res: Response): void {
    const appointment = AppointmentModel.findById(Number(req.params.id));
    if (!appointment) { res.status(404).json({ error: 'Agendamento não encontrado' }); return; }
    res.json(appointment);
  },

  create(req: Request, res: Response): void {
    const { barber_id, service_id, client_name, client_phone, client_email, date, time } = req.body;

    if (!barber_id || !service_id || !client_name || !client_phone || !date || !time) {
      res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      return;
    }

    const service = ServiceModel.findById(service_id);
    if (!service) { res.status(404).json({ error: 'Serviço não encontrado' }); return; }

    const occupied = AppointmentModel.getOccupiedSlots(barber_id, date);
    const newStart = timeToMinutes(time);
    const newEnd = newStart + service.duration;

    for (const occ of occupied) {
      const occStart = timeToMinutes(occ.time);
      const occEnd = occStart + occ.duration;
      if (newStart < occEnd && newEnd > occStart) {
        res.status(409).json({ error: 'Horário indisponível' });
        return;
      }
    }

    const appointment = AppointmentModel.create({
      barber_id, service_id, client_name, client_phone, client_email: client_email ?? null, date, time
    });

    res.status(201).json(appointment);
  },

  updateStatus(req: Request, res: Response): void {
    const { status } = req.body;
    const validStatuses = ['scheduled', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }
    const appointment = AppointmentModel.updateStatus(Number(req.params.id), status);
    if (!appointment) { res.status(404).json({ error: 'Agendamento não encontrado' }); return; }
    res.json(appointment);
  },

  update(req: Request, res: Response): void {
    const appointment = AppointmentModel.update(Number(req.params.id), req.body);
    if (!appointment) { res.status(404).json({ error: 'Agendamento não encontrado' }); return; }
    res.json(appointment);
  },

  remove(req: Request, res: Response): void {
    const removed = AppointmentModel.remove(Number(req.params.id));
    if (!removed) { res.status(404).json({ error: 'Agendamento não encontrado' }); return; }
    res.status(204).send();
  },

  availableSlots(req: Request, res: Response): void {
    const { barber_id, date, service_id } = req.query;

    if (!barber_id || !date || !service_id) {
      res.status(400).json({ error: 'barber_id, date e service_id são obrigatórios' });
      return;
    }

    const bId = Number(barber_id);
    const sId = Number(service_id);

    const service = ServiceModel.findById(sId);
    if (!service) { res.status(404).json({ error: 'Serviço não encontrado' }); return; }

    const dateObj = new Date(date as string);
    const dayOfWeek = dateObj.getUTCDay();

    const workingHours = WorkingHoursModel.findByBarberAndDay(bId, dayOfWeek);
    if (!workingHours) {
      res.json({ slots: [] });
      return;
    }

    const startMinutes = timeToMinutes(workingHours.start_time);
    const endMinutes = timeToMinutes(workingHours.end_time);
    const slotDuration = service.duration;
    const interval = 15;

    const occupied = AppointmentModel.getOccupiedSlots(bId, date as string);

    const slots: string[] = [];
    let current = startMinutes;

    while (current + slotDuration <= endMinutes) {
      const slotEnd = current + slotDuration;

      let isOccupied = false;
      for (const occ of occupied) {
        const occStart = timeToMinutes(occ.time);
        const occEnd = occStart + occ.duration;
        if (current < occEnd && slotEnd > occStart) {
          isOccupied = true;
          current = occEnd;
          break;
        }
      }

      if (!isOccupied) {
        slots.push(minutesToTime(current));
        current += interval;
      } else {
        current += interval;
      }
    }

    // Check if slot is in the past (for today)
    const today = new Date();
    const isToday = date === today.toISOString().split('T')[0];
    const filteredSlots = isToday
      ? slots.filter(s => timeToMinutes(s) > timeToMinutes(`${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`))
      : slots;

    res.json({ slots: filteredSlots });
  },

  dashboard(_req: Request, res: Response): void {
    const todayCount = AppointmentModel.getTodayCount();
    const pendingCount = AppointmentModel.getPendingCount();
    const upcoming = AppointmentModel.getUpcomingAppointments(5);
    res.json({ todayCount, pendingCount, upcoming });
  }
};
