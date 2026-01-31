import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { logSecurity, logWarning } from '../utils/logger.js';
import { AUDIT_EVENTS } from '../config/constants.js';

/**
 * MIDDLEWARE DE SEGURIDAD - CAPA PRINCIPAL
 * Implementa múltiples capas de protección siguiendo OWASP Top 10
 */

// ============================================
// HELMET - Headers de Seguridad HTTP
// ============================================
export const helmetMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Prevenir clickjacking
  frameguard: { action: 'deny' },
  // Ocultar que usamos Express
  hidePoweredBy: true,
  // HSTS - Forzar HTTPS
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
  // Prevenir MIME sniffing
  noSniff: true,
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // XSS Filter
  xssFilter: true,
});

// ============================================
// CORS - Control de Origen Cruzado
// ============================================
const allowedOrigins = [
  config.cors.origin,
  'http://localhost:5173',
  'http://localhost:3000',
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (ej: Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logWarning('CORS bloqueado', { origin });
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400, // 24 horas
});

// ============================================
// RATE LIMITING - Protección contra DoS/Brute Force
// ============================================

// Rate limiter general
export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutos
  max: config.rateLimit.maxRequests, // 100 requests
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Por favor, espere 15 minutos.',
    error: { code: 'RATE_LIMIT_EXCEEDED' },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logSecurity(AUDIT_EVENTS.RATE_LIMIT_EXCEEDED, {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
    });
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes. Por favor, espere.',
      error: { code: 'RATE_LIMIT_EXCEEDED' },
    });
  },
  keyGenerator: (req: Request) => {
    // Usar IP + User-Agent para identificar al cliente
    return `${req.ip}-${req.get('user-agent') || 'unknown'}`;
  },
});

// Rate limiter estricto para autenticación (prevenir brute force)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Cuenta bloqueada temporalmente.',
    error: { code: 'AUTH_RATE_LIMIT' },
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  handler: (req: Request, res: Response) => {
    logSecurity('AUTH_BRUTE_FORCE_DETECTED', {
      ip: req.ip,
      email: req.body?.email,
      userAgent: req.get('user-agent'),
    });
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos fallidos. Intente en 15 minutos.',
      error: { code: 'AUTH_RATE_LIMIT' },
    });
  },
});

// Rate limiter para APIs sensibles
export const sensitiveRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 requests por minuto
  message: {
    success: false,
    message: 'Límite de solicitudes alcanzado para esta operación.',
    error: { code: 'SENSITIVE_RATE_LIMIT' },
  },
});

// ============================================
// REQUEST ID - Trazabilidad
// ============================================
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.get('X-Request-ID') || generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// ============================================
// SANITIZACIÓN DE INPUT
// ============================================
export const sanitizeInput = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitizar query params
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query as Record<string, unknown>) as typeof req.query;
  }
  
  // Sanitizar params
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params) as typeof req.params;
  }
  
  next();
};

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Eliminar caracteres peligrosos para SQL Injection
      sanitized[key] = value
        .replace(/['";\\]/g, '')
        .trim();
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// ============================================
// DETECCIÓN DE ACTIVIDAD SOSPECHOSA
// ============================================
const suspiciousPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
  /(\.\.\/)|(\.\.\\)/g, // Path Traversal
  /(union\s+select|select\s+\*|drop\s+table|insert\s+into)/gi, // SQL Keywords
];

// Rutas excluidas de detección agresiva (auth necesita caracteres especiales en passwords)
const excludedPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/change-password'];

export const detectSuspiciousActivity = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Excluir rutas de autenticación (passwords tienen caracteres especiales)
  if (excludedPaths.some(path => req.path.includes(path))) {
    return next();
  }

  const dataToCheck = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });
  
  let suspiciousCount = 0;
  
  for (const pattern of suspiciousPatterns) {
    const matches = dataToCheck.match(pattern);
    if (matches) {
      suspiciousCount += matches.length;
    }
  }
  
  // Si hay demasiados patrones sospechosos, bloquear
  if (suspiciousCount > 5) {
    logSecurity(AUDIT_EVENTS.SUSPICIOUS_ACTIVITY, {
      ip: req.ip,
      path: req.path,
      method: req.method,
      suspiciousCount,
      userAgent: req.get('user-agent'),
    });
    
    return res.status(400).json({
      success: false,
      message: 'Solicitud rechazada por seguridad',
      error: { code: 'SUSPICIOUS_REQUEST' },
    });
  }
  
  next();
};

// ============================================
// PREVENCIÓN DE ATAQUES DE TIMING
// ============================================
export const timingAttackPrevention = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  // Agregar delay aleatorio pequeño para prevenir timing attacks
  const delay = Math.random() * 50; // 0-50ms
  setTimeout(() => {
    next();
  }, delay);
};

// ============================================
// LOGGING DE SEGURIDAD
// ============================================
export const securityLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log de requests con códigos de error
    if (res.statusCode >= 400) {
      logSecurity('HTTP_ERROR', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.get('x-request-id'),
      });
    }
  });
  
  next();
};

// ============================================
// EXPORTAR TODOS LOS MIDDLEWARES
// ============================================
export const securityMiddlewares = [
  requestIdMiddleware,
  helmetMiddleware,
  corsMiddleware,
  generalRateLimiter,
  sanitizeInput,
  detectSuspiciousActivity,
  securityLoggingMiddleware,
];

export default securityMiddlewares;
