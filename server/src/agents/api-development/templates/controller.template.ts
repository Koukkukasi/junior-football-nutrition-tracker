export function generateController(template: string, params: any): string {
  const templates: Record<string, string> = {
    crud: `
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';

export class ${params.name}Controller {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await prisma.${params.model}.findMany();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await prisma.${params.model}.findUnique({ where: { id } });
      
      if (!data) {
        return res.status(404).json({ error: 'Not found' });
      }
      
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await prisma.${params.model}.create({ data: req.body });
      res.status(201).json({ data });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await prisma.${params.model}.update({
        where: { id },
        data: req.body
      });
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.${params.model}.delete({ where: { id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ${params.name}Controller();
`
  };

  return templates[template] || '';
}