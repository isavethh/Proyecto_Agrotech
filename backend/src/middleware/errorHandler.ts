import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logError, logWarning } from '../utils/logger.js';
import { config } from '../config/index.js';

/**
 * MIDDLEWARE DE MANEJO DE ERRORES
 * Centraliza el manejo de errores y evita filtrar información sensible
 */

// Clase base para errores de la aplicación
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  
  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores específicos
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
  public details?: unknown;
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflicto con el estado actual') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Demasiadas solicitudes') {
    super(message, 429, 'RATE_LIMIT');
  }
}

/**
 * Middleware para rutas no encontradas
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.path}`));
};

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log del error
  logError('Error en request', error, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.userId,
    requestId: req.get('x-request-id'),
  });
  
  // Determinar respuesta según tipo de error
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Error interno del servidor';
  let details: unknown = undefined;
  
  // AppError (errores controlados)
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    if (error instanceof ValidationError) {
      details = error.details;
    }
  }
  // Error de Zod (validación)
  else if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Error de validación';
    details = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }
  // Error de JWT
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Token inválido';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expirado';
  }
  // Error de Prisma
  else if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2002') {
      statusCode = 409;
      code = 'DUPLICATE_ENTRY';
      message = 'Ya existe un registro con estos datos';
    } else if (prismaError.code === 'P2025') {
      statusCode = 404;
      code = 'NOT_FOUND';
      message = 'Registro no encontrado';
    }
  }
  // Error de sintaxis JSON
  else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'JSON inválido en el body';
  }
  
  // En desarrollo, incluir más detalles
  const isDev = config.nodeEnv === 'development';
  
  // Respuesta estandarizada
  const response: {
    success: boolean;
    message: string;
    error: {
      code: string;
      details?: unknown;
      stack?: string;
    };
  } = {
    success: false,
    message,
    error: {
      code,
      ...(details && { details }),
      // Solo incluir stack en desarrollo
      ...(isDev && { stack: error.stack }),
    },
  };
  
  res.status(statusCode).json(response);
};

/**
 * Wrapper para async handlers
 * Captura errores de funciones async automáticamente
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Manejo de errores no capturados
 */
export function setupGlobalErrorHandlers(): void {
  // Promesas no manejadas
  process.on('unhandledRejection', (reason: Error) => {
    logError('Unhandled Promise Rejection', reason);
    // No cerrar el servidor, pero alertar
  });
  
  // Excepciones no capturadas
  process.on('uncaughtException', (error: Error) => {
    logError('Uncaught Exception', error);
    // Cerrar gracefully
    process.exit(1);
  });
  
  // Señales de terminación
  process.on('SIGTERM', () => {
    logWarning('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    logWarning('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  notFoundHandler,
  errorHandler,
  asyncHandler,
  setupGlobalErrorHandlers,
};
