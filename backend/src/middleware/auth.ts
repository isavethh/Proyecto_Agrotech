import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { logSecurity } from '../utils/logger.js';
import { AUDIT_EVENTS, ROLES, type Role } from '../config/constants.js';
import { unauthorizedError, forbiddenError } from '../utils/response.js';

/**
 * MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
 * Implementa JWT con refresh tokens y RBAC
 */

// Interfaz para el payload del token
export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  sessionId: string;
  iat?: number;
  exp?: number;
}

// Extender Request de Express para incluir usuario
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      token?: string;
    }
  }
}

// ============================================
// BLACKLIST DE TOKENS (En producción usar Redis)
// ============================================
const tokenBlacklist = new Set<string>();

export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
  
  // Limpiar tokens expirados cada hora
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 3600000);
}

export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

// ============================================
// VERIFICACIÓN DE TOKEN
// ============================================
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;
    return payload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
    return payload;
  } catch {
    return null;
  }
}

// ============================================
// GENERACIÓN DE TOKENS
// ============================================
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

export function generateTokenPair(payload: Omit<TokenPayload, 'iat' | 'exp'>): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logSecurity(AUDIT_EVENTS.UNAUTHORIZED_ACCESS, {
      ip: req.ip,
      path: req.path,
      reason: 'No token provided',
    });
    return unauthorizedError(res, 'Token de acceso requerido');
  }
  
  const token = authHeader.substring(7);
  
  // Verificar si el token está en la blacklist
  if (isTokenBlacklisted(token)) {
    logSecurity(AUDIT_EVENTS.TOKEN_BLACKLISTED, {
      ip: req.ip,
      path: req.path,
    });
    return unauthorizedError(res, 'Token inválido o expirado');
  }
  
  const payload = verifyAccessToken(token);
  
  if (!payload) {
    logSecurity(AUDIT_EVENTS.UNAUTHORIZED_ACCESS, {
      ip: req.ip,
      path: req.path,
      reason: 'Invalid token',
    });
    return unauthorizedError(res, 'Token inválido o expirado');
  }
  
  // Agregar usuario y token al request
  req.user = payload;
  req.token = token;
  
  next();
};

// ============================================
// MIDDLEWARE DE AUTORIZACIÓN (RBAC)
// ============================================
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return unauthorizedError(res, 'No autenticado');
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logSecurity(AUDIT_EVENTS.UNAUTHORIZED_ACCESS, {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      return forbiddenError(res, 'No tienes permisos para esta acción');
    }
    
    next();
  };
};

// Shortcuts para roles comunes
export const requireAdmin = authorize(ROLES.ADMIN);
export const requireAgricultor = authorize(ROLES.ADMIN, ROLES.AGRICULTOR);
export const requireTecnico = authorize(ROLES.ADMIN, ROLES.TECNICO);
export const requireAny = authorize(ROLES.ADMIN, ROLES.AGRICULTOR, ROLES.TECNICO, ROLES.VIEWER);

// ============================================
// MIDDLEWARE PARA VERIFICAR PROPIEDAD
// ============================================
export const requireOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return unauthorizedError(res);
    }
    
    // Admin puede acceder a todo
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }
    
    // Verificar si el recurso pertenece al usuario
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user.userId) {
      logSecurity(AUDIT_EVENTS.UNAUTHORIZED_ACCESS, {
        userId: req.user.userId,
        attemptedResourceUserId: resourceUserId,
        path: req.path,
      });
      return forbiddenError(res, 'No tienes acceso a este recurso');
    }
    
    next();
  };
};

// ============================================
// MIDDLEWARE OPCIONAL DE AUTENTICACIÓN
// ============================================
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    if (!isTokenBlacklisted(token)) {
      const payload = verifyAccessToken(token);
      if (payload) {
        req.user = payload;
        req.token = token;
      }
    }
  }
  
  next();
};

// ============================================
// VERIFICAR 2FA COMPLETADO
// ============================================
export const require2FA = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return unauthorizedError(res);
  }
  
  // Aquí verificaríamos si el usuario tiene 2FA habilitado
  // y si ya lo completó en esta sesión
  // Por ahora, pasamos directamente
  next();
};

export default {
  authenticate,
  authorize,
  requireAdmin,
  requireAgricultor,
  requireTecnico,
  requireAny,
  requireOwnership,
  optionalAuth,
  require2FA,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  blacklistToken,
  isTokenBlacklisted,
};
