import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logSecurity } from '../utils/logger.js';
import { AUDIT_EVENTS, type AuditEvent } from '../config/constants.js';

/**
 * MIDDLEWARE DE AUDITORÍA
 * Registra todas las acciones críticas para compliance y seguridad
 */

const prisma = new PrismaClient();

// Interfaz para log de auditoría
interface AuditLogEntry {
  userId?: string;
  event: AuditEvent;
  resource?: string;
  resourceId?: string;
  action?: string;
  oldValue?: object;
  newValue?: object;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: object;
}

/**
 * Registra un evento de auditoría en la base de datos
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        event: entry.event,
        resource: entry.resource,
        resourceId: entry.resourceId,
        action: entry.action,
        oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
        newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
        ipAddress: entry.ip,
        userAgent: entry.userAgent,
        requestId: entry.requestId,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    // No fallar si el logging falla, pero registrar en logs
    logSecurity('AUDIT_LOG_FAILED', {
      error: error instanceof Error ? error.message : 'Unknown error',
      entry,
    });
  }
}

/**
 * Middleware para auditar requests automáticamente
 */
export const auditMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  
  // Capturar el body original para comparación
  const originalBody = { ...req.body };
  
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    
    // Solo auditar operaciones de escritura exitosas
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode < 400) {
      const event = getEventFromMethod(req.method);
      
      await createAuditLog({
        userId: req.user?.userId,
        event,
        resource: getResourceFromPath(req.path),
        resourceId: req.params.id,
        action: `${req.method} ${req.path}`,
        newValue: req.method !== 'DELETE' ? originalBody : undefined,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.get('x-request-id'),
        metadata: {
          statusCode: res.statusCode,
          duration,
        },
      });
    }
  });
  
  next();
};

function getEventFromMethod(method: string): AuditEvent {
  switch (method) {
    case 'POST':
      return AUDIT_EVENTS.CREATE;
    case 'PUT':
    case 'PATCH':
      return AUDIT_EVENTS.UPDATE;
    case 'DELETE':
      return AUDIT_EVENTS.DELETE;
    default:
      return AUDIT_EVENTS.CREATE;
  }
}

function getResourceFromPath(path: string): string {
  // Extraer el recurso de la ruta (ej: /api/v1/parcelas -> parcelas)
  const parts = path.split('/').filter(Boolean);
  return parts[2] || 'unknown';
}

/**
 * Auditar login exitoso
 */
export async function auditLoginSuccess(
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    userId,
    event: AUDIT_EVENTS.LOGIN_SUCCESS,
    action: 'User logged in successfully',
    ip,
    userAgent,
  });
}

/**
 * Auditar login fallido
 */
export async function auditLoginFailed(
  email: string,
  reason: string,
  ip?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    event: AUDIT_EVENTS.LOGIN_FAILED,
    action: 'Login attempt failed',
    metadata: {
      email,
      reason,
    },
    ip,
    userAgent,
  });
}

/**
 * Auditar logout
 */
export async function auditLogout(
  userId: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    userId,
    event: AUDIT_EVENTS.LOGOUT,
    action: 'User logged out',
    ip,
  });
}

/**
 * Auditar cambio de contraseña
 */
export async function auditPasswordChange(
  userId: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    userId,
    event: AUDIT_EVENTS.PASSWORD_CHANGE,
    action: 'Password changed',
    ip,
  });
}

/**
 * Auditar habilitación de 2FA
 */
export async function audit2FAEnabled(
  userId: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    userId,
    event: AUDIT_EVENTS.TWO_FACTOR_ENABLED,
    action: '2FA enabled for account',
    ip,
  });
}

/**
 * Auditar intento fallido de 2FA
 */
export async function audit2FAFailed(
  userId: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    userId,
    event: AUDIT_EVENTS.TWO_FACTOR_FAILED,
    action: '2FA verification failed',
    ip,
  });
  
  // También alertar en logs de seguridad
  logSecurity('2FA_VERIFICATION_FAILED', { userId, ip });
}

/**
 * Auditar exportación de datos
 */
export async function auditDataExport(
  userId: string,
  resource: string,
  recordCount: number,
  ip?: string
): Promise<void> {
  await createAuditLog({
    userId,
    event: AUDIT_EVENTS.EXPORT,
    resource,
    action: 'Data exported',
    metadata: {
      recordCount,
    },
    ip,
  });
}

/**
 * Auditar actividad sospechosa
 */
export async function auditSuspiciousActivity(
  description: string,
  metadata: object,
  ip?: string,
  userId?: string
): Promise<void> {
  await createAuditLog({
    userId,
    event: AUDIT_EVENTS.SUSPICIOUS_ACTIVITY,
    action: description,
    metadata,
    ip,
  });
  
  // Alertar inmediatamente
  logSecurity('SUSPICIOUS_ACTIVITY_DETECTED', {
    description,
    metadata,
    ip,
    userId,
  });
}

/**
 * Obtener logs de auditoría para un usuario
 */
export async function getAuditLogsForUser(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Obtener logs de seguridad recientes
 */
export async function getSecurityLogs(
  limit: number = 100
) {
  return prisma.auditLog.findMany({
    where: {
      event: {
        in: [
          AUDIT_EVENTS.LOGIN_FAILED,
          AUDIT_EVENTS.SUSPICIOUS_ACTIVITY,
          AUDIT_EVENTS.UNAUTHORIZED_ACCESS,
          AUDIT_EVENTS.RATE_LIMIT_EXCEEDED,
          AUDIT_EVENTS.TWO_FACTOR_FAILED,
        ],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export default {
  createAuditLog,
  auditMiddleware,
  auditLoginSuccess,
  auditLoginFailed,
  auditLogout,
  auditPasswordChange,
  audit2FAEnabled,
  audit2FAFailed,
  auditDataExport,
  auditSuspiciousActivity,
  getAuditLogsForUser,
  getSecurityLogs,
};
