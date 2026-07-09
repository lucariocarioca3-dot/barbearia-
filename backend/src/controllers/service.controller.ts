import { Request, Response } from 'express';
import { ServiceModel } from '../models/service.model';

export const ServiceController = {
  list(_req: Request, res: Response): void {
    const services = ServiceModel.findAll();
    res.json(services);
  },

  listAll(_req: Request, res: Response): void {
    const services = ServiceModel.findAllWithInactive();
    res.json(services);
  },

  getById(req: Request, res: Response): void {
    const service = ServiceModel.findById(Number(req.params.id));
    if (!service) { res.status(404).json({ error: 'Serviço não encontrado' }); return; }
    res.json(service);
  },

  create(req: Request, res: Response): void {
    const { name, description, duration, price } = req.body;
    if (!name || !duration || !price) {
      res.status(400).json({ error: 'Nome, duração e preço são obrigatórios' });
      return;
    }
    const service = ServiceModel.create({ name, description: description ?? null, duration, price });
    res.status(201).json(service);
  },

  update(req: Request, res: Response): void {
    const service = ServiceModel.update(Number(req.params.id), req.body);
    if (!service) { res.status(404).json({ error: 'Serviço não encontrado' }); return; }
    res.json(service);
  },

  remove(req: Request, res: Response): void {
    const removed = ServiceModel.remove(Number(req.params.id));
    if (!removed) { res.status(404).json({ error: 'Serviço não encontrado' }); return; }
    res.status(204).send();
  }
};
