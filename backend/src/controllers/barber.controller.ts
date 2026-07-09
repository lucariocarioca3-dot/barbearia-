import { Request, Response } from 'express';
import { BarberModel } from '../models/barber.model';
import { WorkingHoursModel } from '../models/workingHours.model';

export const BarberController = {
  list(_req: Request, res: Response): void {
    const barbers = BarberModel.findAll();
    res.json(barbers);
  },

  listAll(_req: Request, res: Response): void {
    const barbers = BarberModel.findAllWithInactive();
    res.json(barbers);
  },

  getById(req: Request, res: Response): void {
    const barber = BarberModel.findById(Number(req.params.id));
    if (!barber) { res.status(404).json({ error: 'Barbeiro não encontrado' }); return; }
    res.json(barber);
  },

  create(req: Request, res: Response): void {
    const { name, photo } = req.body;
    if (!name) { res.status(400).json({ error: 'Nome é obrigatório' }); return; }
    const barber = BarberModel.create({ name, photo: photo ?? null });
    res.status(201).json(barber);
  },

  update(req: Request, res: Response): void {
    const barber = BarberModel.update(Number(req.params.id), req.body);
    if (!barber) { res.status(404).json({ error: 'Barbeiro não encontrado' }); return; }
    res.json(barber);
  },

  remove(req: Request, res: Response): void {
    const removed = BarberModel.remove(Number(req.params.id));
    if (!removed) { res.status(404).json({ error: 'Barbeiro não encontrado' }); return; }
    res.status(204).send();
  },

  getHours(req: Request, res: Response): void {
    const hours = WorkingHoursModel.findByBarberId(Number(req.params.id));
    res.json(hours);
  },

  setHours(req: Request, res: Response): void {
    const { hours } = req.body;
    if (!Array.isArray(hours)) { res.status(400).json({ error: 'hours deve ser um array' }); return; }
    WorkingHoursModel.setForBarber(Number(req.params.id), hours);
    const updated = WorkingHoursModel.findByBarberId(Number(req.params.id));
    res.json(updated);
  }
};
