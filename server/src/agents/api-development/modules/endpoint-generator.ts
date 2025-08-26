import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiAgentConfig } from '../config/agent.config';
import { logger } from '../utils/logger';
import { createValidator } from '../validators/request-validator';
import { generateController } from '../templates/controller.template';

export interface EndpointOptions {
  resource: string;
  operations: ('list' | 'get' | 'create' | 'update' | 'delete')[];
  authentication: boolean;
  validation: boolean;
  version: string;
  middleware?: Function[];
  customHandlers?: Record<string, Function>;
}

export class EndpointGenerator {
  private prisma: PrismaClient;
  private config: ApiAgentConfig;

  constructor(prisma: PrismaClient, config: ApiAgentConfig) {
    this.prisma = prisma;
    this.config = config;
  }

  async generateCRUD(options: EndpointOptions): Promise<Router> {
    const router = Router();
    const modelName = this.capitalizeFirst(options.resource);
    
    logger.info(`Generating CRUD endpoints for ${modelName}`);

    // Check if model exists in Prisma schema
    if (!this.prisma[options.resource]) {
      throw new Error(`Model ${options.resource} not found in Prisma schema`);
    }

    // Generate each operation
    for (const operation of options.operations) {
      await this.generateOperation(router, operation, options);
    }

    logger.info(`✅ Generated ${options.operations.length} endpoints for ${modelName}`);
    return router;
  }

  private async generateOperation(
    router: Router,
    operation: 'list' | 'get' | 'create' | 'update' | 'delete',
    options: EndpointOptions
  ): Promise<void> {
    const handlers = this.createHandlers(options.resource, options);
    
    switch (operation) {
      case 'list':
        router.get(
          '/',
          ...this.getMiddleware(options, 'list'),
          handlers.list
        );
        break;
      
      case 'get':
        router.get(
          '/:id',
          ...this.getMiddleware(options, 'get'),
          handlers.get
        );
        break;
      
      case 'create':
        router.post(
          '/',
          ...this.getMiddleware(options, 'create'),
          handlers.create
        );
        break;
      
      case 'update':
        router.put(
          '/:id',
          ...this.getMiddleware(options, 'update'),
          handlers.update
        );
        router.patch(
          '/:id',
          ...this.getMiddleware(options, 'update'),
          handlers.patch
        );
        break;
      
      case 'delete':
        router.delete(
          '/:id',
          ...this.getMiddleware(options, 'delete'),
          handlers.delete
        );
        break;
    }
  }

  private createHandlers(resource: string, options: EndpointOptions): any {
    const model = this.prisma[resource];
    
    return {
      list: options.customHandlers?.list || this.createListHandler(model, resource),
      get: options.customHandlers?.get || this.createGetHandler(model, resource),
      create: options.customHandlers?.create || this.createCreateHandler(model, resource),
      update: options.customHandlers?.update || this.createUpdateHandler(model, resource),
      patch: options.customHandlers?.patch || this.createPatchHandler(model, resource),
      delete: options.customHandlers?.delete || this.createDeleteHandler(model, resource)
    };
  }

  private createListHandler(model: any, resource: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { limit = 20, offset = 0, sort, filter, include } = req.query;
        
        const where = filter ? JSON.parse(filter as string) : {};
        const orderBy = sort ? JSON.parse(sort as string) : { createdAt: 'desc' };
        const includeRelations = include ? JSON.parse(include as string) : undefined;
        
        const [data, total] = await Promise.all([
          model.findMany({
            where,
            orderBy,
            skip: Number(offset),
            take: Number(limit),
            include: includeRelations
          }),
          model.count({ where })
        ]);

        const response = this.formatResponse({
          data,
          meta: {
            total,
            limit: Number(limit),
            offset: Number(offset),
            resource
          }
        });

        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  private createGetHandler(model: any, resource: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { include } = req.query;
        
        const includeRelations = include ? JSON.parse(include as string) : undefined;
        
        const data = await model.findUnique({
          where: { id },
          include: includeRelations
        });

        if (!data) {
          return res.status(404).json(
            this.formatError(404, `${resource} not found`)
          );
        }

        const response = this.formatResponse({ data });
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  private createCreateHandler(model: any, resource: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await model.create({
          data: req.body
        });

        const response = this.formatResponse({ 
          data,
          meta: { message: `${resource} created successfully` }
        });
        
        res.status(201).json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  private createUpdateHandler(model: any, resource: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        
        const exists = await model.findUnique({ where: { id } });
        if (!exists) {
          return res.status(404).json(
            this.formatError(404, `${resource} not found`)
          );
        }

        const data = await model.update({
          where: { id },
          data: req.body
        });

        const response = this.formatResponse({ 
          data,
          meta: { message: `${resource} updated successfully` }
        });
        
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  private createPatchHandler(model: any, resource: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        
        const exists = await model.findUnique({ where: { id } });
        if (!exists) {
          return res.status(404).json(
            this.formatError(404, `${resource} not found`)
          );
        }

        const data = await model.update({
          where: { id },
          data: req.body
        });

        const response = this.formatResponse({ 
          data,
          meta: { message: `${resource} partially updated successfully` }
        });
        
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  private createDeleteHandler(model: any, resource: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        
        const exists = await model.findUnique({ where: { id } });
        if (!exists) {
          return res.status(404).json(
            this.formatError(404, `${resource} not found`)
          );
        }

        await model.delete({ where: { id } });

        const response = this.formatResponse({ 
          data: null,
          meta: { message: `${resource} deleted successfully` }
        });
        
        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  private getMiddleware(options: EndpointOptions, operation: string): Function[] {
    const middleware: Function[] = [...(options.middleware || [])];
    
    // Add validation if enabled
    if (options.validation && ['create', 'update', 'patch'].includes(operation)) {
      const validator = this.createValidationMiddleware(options.resource, operation);
      if (validator) middleware.push(validator);
    }
    
    return middleware;
  }

  private createValidationMiddleware(resource: string, operation: string): Function | null {
    // Get validation schema for the resource
    const schema = this.getValidationSchema(resource, operation);
    if (!schema) return null;
    
    return createValidator(schema);
  }

  private getValidationSchema(resource: string, operation: string): any {
    // This would be loaded from schema definitions
    const schemas: Record<string, any> = {
      user: {
        create: {
          email: { type: 'email', required: true },
          name: { type: 'string', required: true, min: 2, max: 100 },
          age: { type: 'number', required: true, min: 10, max: 100 },
          role: { type: 'enum', values: ['PLAYER', 'COACH', 'ADMIN'], required: true }
        },
        update: {
          email: { type: 'email' },
          name: { type: 'string', min: 2, max: 100 },
          age: { type: 'number', min: 10, max: 100 },
          role: { type: 'enum', values: ['PLAYER', 'COACH', 'ADMIN'] }
        }
      },
      foodEntry: {
        create: {
          mealType: { type: 'enum', values: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'], required: true },
          description: { type: 'string', required: true },
          date: { type: 'date', required: true }
        }
      }
    };
    
    return schemas[resource]?.[operation];
  }

  private formatResponse(data: any): any {
    if (!this.config.responseFormat.envelope) {
      return data.data || data;
    }
    
    const response: any = {
      [this.config.responseFormat.successKey]: data.data,
      [this.config.responseFormat.metaKey]: data.meta || {}
    };
    
    if (this.config.responseFormat.includeTimestamp) {
      response[this.config.responseFormat.metaKey].timestamp = new Date().toISOString();
    }
    
    if (this.config.responseFormat.includeRequestId) {
      response[this.config.responseFormat.metaKey].requestId = this.generateRequestId();
    }
    
    return response;
  }

  private formatError(status: number, message: string): any {
    const error: any = {
      [this.config.responseFormat.errorKey]: {
        status,
        message: this.config.errorHandling.customErrorMessages.get(status) || message
      }
    };
    
    if (this.config.responseFormat.includeTimestamp) {
      error[this.config.responseFormat.errorKey].timestamp = new Date().toISOString();
    }
    
    return error;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async generateFromTemplate(template: string, params: any): Promise<string> {
    return generateController(template, params);
  }
}

export default EndpointGenerator;