import { Request, Response } from 'express';
import { BarberModel } from '../models/barber.model';
import { WorkingHoursModel } from '../models/workingHours.model';

export const BarberController = {
  async list(_req: Request, res: Response): Promise<void> {
    const barbers = await BarberModel.findAll();
    res.json(barbers);
  },

  async listAll(_req: Request, res: Response): Promise<void> {
    const barbers = await BarberModel.findAllWithInactive();
    res.json(barbers);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const barber = await BarberModel.findById(Number(req.params.id));
    if (!barber) { res.status(404).json({ error: 'Barbeiro não encontrado' }); return; }
    res.json(barber);
  },

  async create(req: Request, res: Response): Promise<void> {
    const { name, photo } = req.body;
    if (!name) { res.status(400).json({ error: 'Nome é obrigatório' }); return; }
    const barber = await BarberModel.create({ name, photo: photo ?? null });
    res.status(201).json(barber);
  },

  async update(req: Request, res: Response): Promise<void> {
    const barber = await BarberModel.update(Number(req.params.id), req.body);
    if (!barber) { res.status(404).json({ error: 'Barbeiro não encontrado' }); return; }
    res.json(barber);
  },

  async remove(req: Request, res: Response): Promise<void> {
    const removed = await BarberModel.remove(Number(req.params.id));
    if (!removed) { res.status(404).json({ error: 'Barbeiro não encontrado' }); return; }
    res.status(204).send();
  },

  async getHours(req: Request, res: Response): Promise<void> {
    const hours = await WorkingHoursModel.findByBarberId(Number(req.params.id));
    res.json(hours);
  },

  async setHours(req: Request, res: Response): Promise<void> {
    const { hours } = req.body;
    if (!Array.isArray(hours)) { res.status(400).json({ error: 'hours deve ser um array' }); return; }
    await WorkingHoursModel.setForBarber(Number(req.params.id), hours);
    const updated = await WorkingHoursModel.findByBarberId(Number(req.params.id));
    res.json(updated);
  }
};