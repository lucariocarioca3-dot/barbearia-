import { Request, Response } from 'express';
import { ServiceModel } from '../models/service.model';

export const ServiceController = {
  async list(_req: Request, res: Response): Promise<void> {
    const services = await ServiceModel.findAll();
    res.json(services);
  },

  async listAll(_req: Request, res: Response): Promise<void> {
    const services = await ServiceModel.findAllWithInactive();
    res.json(services);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const service = await ServiceModel.findById(Number(req.params.id));
    if (!service) { res.status(404).json({ error: 'Serviço não encontrado' }); return; }
    res.json(service);
  },

  async create(req: Request, res: Response): Promise<void> {
    const { name, description, duration, price } = req.body;
    if (!name || !duration || !price) {
      res.status(400).json({ error: 'Nome, duração e preço são obrigatórios' });
      return;
    }
    const service = await ServiceModel.create({ name, description: description ?? null, duration, price });
    res.status(201).json(service);
  },

  async update(req: Request, res: Response): Promise<void> {
    const service = await ServiceModel.update(Number(req.params.id), req.body);
    if (!service) { res.status(404).json({ error: 'Serviço não encontrado' }); return; }
    res.json(service);
  },

  async remove(req: Request, res: Response): Promise<void> {
    const removed = await ServiceModel.remove(Number(req.params.id));
    if (!removed) { res.status(404).json({ error: 'Serviço não encontrado' }); return; }
    res.status(204).send();
  }
};