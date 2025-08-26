import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    teamId?: string;
  };
}

/**
 * Authentication middleware
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      res.status(401).json({
        error: {
          status: 401,
          message: 'No authentication token provided'
        }
      });
      return;
    }

    const decoded = jwt.decode(token) as any;
    
    if (!decoded) {
      res.status(401).json({
        error: {
          status: 401,
          message: 'Invalid authentication token'
        }
      });
      return;
    }

    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role || 'PLAYER',
      teamId: decoded.teamId
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: {
        status: 401,
        message: 'Authentication failed'
      }
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          status: 401,
          message: 'Authentication required'
        }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          status: 403,
          message: 'Insufficient permissions for this operation'
        }
      });
      return;
    }

    next();
  };
};

/**
 * Team membership authorization
 */
export const authorizeTeamMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const teamId = req.params.teamId || req.body.teamId;
  
  if (!req.user) {
    res.status(401).json({
      error: {
        status: 401,
        message: 'Authentication required'
      }
    });
    return;
  }

  // Coaches and admins can access any team
  if (req.user.role === 'COACH' || req.user.role === 'ADMIN') {
    next();
    return;
  }

  // Players can only access their own team
  if (req.user.teamId !== teamId) {
    res.status(403).json({
      error: {
        status: 403,
        message: 'You can only access your own team data'
      }
    });
    return;
  }

  next();
};

/**
 * Self-only authorization (users can only access their own data)
 */
export const authorizeSelf = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.params.id || req.params.userId;
  
  if (!req.user) {
    res.status(401).json({
      error: {
        status: 401,
        message: 'Authentication required'
      }
    });
    return;
  }

  // Admins can access any user
  if (req.user.role === 'ADMIN') {
    next();
    return;
  }

  // Coaches can access players in their team
  if (req.user.role === 'COACH') {
    // Would need to check if user is in coach's team
    next();
    return;
  }

  // Users can only access their own data
  if (req.user.id !== userId) {
    res.status(403).json({
      error: {
        status: 403,
        message: 'You can only access your own data'
      }
    });
    return;
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = jwt.decode(token) as any;
      
      if (decoded) {
        req.user = {
          id: decoded.sub || decoded.id,
          email: decoded.email,
          role: decoded.role || 'PLAYER',
          teamId: decoded.teamId
        };
      }
    }
  } catch (error) {
    // Silent fail - optional auth
  }

  next();
};

/**
 * Extract token from request
 */
function extractToken(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  if ((req as any).cookies && (req as any).cookies.token) {
    return (req as any).cookies.token;
  }

  // Check query parameter (for download links, etc.)
  if (req.query.token) {
    return req.query.token as string;
  }

  return null;
}

export default {
  authenticate,
  authorize,
  authorizeTeamMember,
  authorizeSelf,
  optionalAuth
};