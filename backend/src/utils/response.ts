import { Response } from 'express';

/**
 * Utilidades para respuestas HTTP estandarizadas
 */

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Respuesta exitosa
 */
export function successResponse<T>(
  res: Response,
  data: T,
  message: string = 'Operación exitosa',
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
}

/**
 * Respuesta exitosa con paginación
 */
export function paginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Datos obtenidos exitosamente'
): Response {
  const totalPages = Math.ceil(total / limit);
  
  const response: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
  return res.status(200).json(response);
}

/**
 * Respuesta de creación exitosa
 */
export function createdResponse<T>(
  res: Response,
  data: T,
  message: string = 'Recurso creado exitosamente'
): Response {
  return successResponse(res, data, message, 201);
}

/**
 * Respuesta sin contenido
 */
export function noContentResponse(res: Response): Response {
  return res.status(204).send();
}

/**
 * Respuesta de error
 */
export function errorResponse(
  res: Response,
  message: string,
  statusCode: number = 400,
  errorCode: string = 'BAD_REQUEST',
  details?: unknown
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code: errorCode,
      details,
    },
  };
  return res.status(statusCode).json(response);
}

/**
 * Error de validación
 */
export function validationError(
  res: Response,
  errors: unknown
): Response {
  return errorResponse(
    res,
    'Error de validación',
    400,
    'VALIDATION_ERROR',
    errors
  );
}

/**
 * Error de autenticación
 */
export function unauthorizedError(
  res: Response,
  message: string = 'No autorizado'
): Response {
  return errorResponse(res, message, 401, 'UNAUTHORIZED');
}

/**
 * Error de permisos
 */
export function forbiddenError(
  res: Response,
  message: string = 'Acceso denegado'
): Response {
  return errorResponse(res, message, 403, 'FORBIDDEN');
}

/**
 * Recurso no encontrado
 */
export function notFoundError(
  res: Response,
  message: string = 'Recurso no encontrado'
): Response {
  return errorResponse(res, message, 404, 'NOT_FOUND');
}

/**
 * Error interno del servidor
 */
export function internalError(
  res: Response,
  message: string = 'Error interno del servidor'
): Response {
  return errorResponse(res, message, 500, 'INTERNAL_ERROR');
}

/**
 * Error de rate limiting
 */
export function rateLimitError(
  res: Response,
  message: string = 'Demasiadas solicitudes. Por favor, espere.'
): Response {
  return errorResponse(res, message, 429, 'RATE_LIMIT_EXCEEDED');
}

export default {
  successResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  validationError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  internalError,
  rateLimitError,
};
