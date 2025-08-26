import { Request, Response, NextFunction } from 'express';

export function createValidator(schema: any): Function {
  return (req: Request, res: Response, next: NextFunction) => {
    // Basic implementation - would be expanded with full validation
    const errors: any[] = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      
      if ((rules as any).required && !value) {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    }
    
    if (errors.length > 0) {
      return res.status(422).json({
        error: {
          status: 422,
          message: 'Validation failed',
          details: errors
        }
      });
    }
    
    next();
  };
}