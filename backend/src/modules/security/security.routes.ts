import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { successResponse, paginatedResponse } from '../../utils/response.js';
import { validate, paginationSchema } from '../../utils/validators.js';
import { prisma } from '../../database/index.js';
import { getSecurityLogs } from '../../middleware/audit.js';

const router = Router();

router.use(authenticate);

/**
 * SECURITY DASHBOARD
 * Panel de seguridad para monitorear actividad sospechosa
 * Este módulo es CLAVE para demostrar habilidades en ciberseguridad
 */

// ============================================
// RESUMEN DE SEGURIDAD
// ============================================
router.get(
  '/resumen',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const ahora = new Date();
    const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Logins fallidos últimas 24h
    const loginsFallidos24h = await prisma.auditLog.count({
      where: {
        event: 'LOGIN_FAILED',
        createdAt: { gte: hace24h },
      },
    });
    
    // Logins exitosos últimas 24h
    const loginsExitosos24h = await prisma.auditLog.count({
      where: {
        event: 'LOGIN_SUCCESS',
        createdAt: { gte: hace24h },
      },
    });
    
    // Intentos 2FA fallidos
    const twoFactorFallidos = await prisma.auditLog.count({
      where: {
        event: 'TWO_FACTOR_FAILED',
        createdAt: { gte: hace7dias },
      },
    });
    
    // Actividad sospechosa
    const actividadSospechosa = await prisma.auditLog.count({
      where: {
        event: 'SUSPICIOUS_ACTIVITY',
        createdAt: { gte: hace7dias },
      },
    });
    
    // Rate limits excedidos
    const rateLimitExcedido = await prisma.auditLog.count({
      where: {
        event: 'RATE_LIMIT_EXCEEDED',
        createdAt: { gte: hace24h },
      },
    });
    
    // Usuarios bloqueados actualmente
    const usuariosBloqueados = await prisma.user.count({
      where: {
        bloqueadoHasta: { gt: ahora },
      },
    });
    
    // Sesiones activas
    const sesionesActivas = await prisma.session.count({
      where: {
        expiresAt: { gt: ahora },
      },
    });
    
    // Usuarios con 2FA habilitado
    const usuariosCon2FA = await prisma.user.count({
      where: { twoFactorEnabled: true },
    });
    
    const totalUsuarios = await prisma.user.count();
    
    const resumen = {
      ultimas24h: {
        loginsFallidos: loginsFallidos24h,
        loginsExitosos: loginsExitosos24h,
        rateLimitExcedido,
        tasaFallos: loginsExitosos24h + loginsFallidos24h > 0
          ? (loginsFallidos24h / (loginsExitosos24h + loginsFallidos24h) * 100).toFixed(2)
          : 0,
      },
      ultimos7dias: {
        intentos2FAFallidos: twoFactorFallidos,
        actividadSospechosa,
      },
      estadoActual: {
        usuariosBloqueados,
        sesionesActivas,
        usuariosCon2FA,
        porcentaje2FA: ((usuariosCon2FA / totalUsuarios) * 100).toFixed(2),
      },
      alertas: [],
    };
    
    // Generar alertas basadas en métricas
    const alertas: string[] = [];
    
    if (loginsFallidos24h > 10) {
      alertas.push(`⚠️ ${loginsFallidos24h} intentos de login fallidos en 24h`);
    }
    if (actividadSospechosa > 0) {
      alertas.push(`🚨 ${actividadSospechosa} eventos de actividad sospechosa`);
    }
    if (rateLimitExcedido > 5) {
      alertas.push(`⚡ ${rateLimitExcedido} rate limits excedidos (posible ataque)`);
    }
    if (usuariosBloqueados > 0) {
      alertas.push(`🔒 ${usuariosBloqueados} usuarios bloqueados`);
    }
    
    resumen.alertas = alertas as never[];
    
    return successResponse(res, resumen);
  })
);

// ============================================
// LOGS DE SEGURIDAD
// ============================================
router.get(
  '/logs',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const logs = await getSecurityLogs(100);
    return successResponse(res, logs);
  })
);

// ============================================
// INTENTOS DE LOGIN FALLIDOS
// ============================================
router.get(
  '/login-fallidos',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const pagination = validate(paginationSchema, req.query).data || {
      page: 1,
      limit: 50,
      sortOrder: 'desc' as const,
    };
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { event: 'LOGIN_FAILED' },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.auditLog.count({ where: { event: 'LOGIN_FAILED' } }),
    ]);
    
    // Agrupar por IP para detectar brute force
    const porIP = logs.reduce((acc, log) => {
      const ip = log.ipAddress || 'unknown';
      if (!acc[ip]) acc[ip] = 0;
      acc[ip]++;
      return acc;
    }, {} as Record<string, number>);
    
    const ipsConMuchosFallos = Object.entries(porIP)
      .filter(([_, count]) => count > 3)
      .map(([ip, count]) => ({ ip, intentos: count }));
    
    return paginatedResponse(res, {
      logs,
      ipsSospechosas: ipsConMuchosFallos,
    } as any, pagination.page, pagination.limit, total);
  })
);

// ============================================
// SESIONES ACTIVAS
// ============================================
router.get(
  '/sesiones',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const sesiones = await prisma.session.findMany({
      where: {
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Enriquecer con información
    const sesionesEnriquecidas = sesiones.map(s => ({
      id: s.id,
      usuario: s.user,
      ip: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      tiempoRestante: Math.round((s.expiresAt.getTime() - Date.now()) / 1000 / 60), // minutos
    }));
    
    return successResponse(res, sesionesEnriquecidas);
  })
);

// ============================================
// USUARIOS BLOQUEADOS
// ============================================
router.get(
  '/usuarios-bloqueados',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const usuarios = await prisma.user.findMany({
      where: {
        OR: [
          { bloqueadoHasta: { gt: new Date() } },
          { intentosFallidos: { gte: 3 } },
        ],
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        intentosFallidos: true,
        bloqueadoHasta: true,
        ultimoLogin: true,
      },
    });
    
    return successResponse(res, usuarios);
  })
);

// ============================================
// DESBLOQUEAR USUARIO
// ============================================
router.post(
  '/desbloquear/:userId',
  requireAdmin,
  asyncHandler(async (req, res) => {
    await prisma.user.update({
      where: { id: req.params.userId },
      data: {
        intentosFallidos: 0,
        bloqueadoHasta: null,
      },
    });
    
    return successResponse(res, null, 'Usuario desbloqueado');
  })
);

// ============================================
// REVOCAR SESIONES DE USUARIO
// ============================================
router.post(
  '/revocar-sesiones/:userId',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await prisma.session.deleteMany({
      where: { userId: req.params.userId },
    });
    
    return successResponse(res, { sesionesRevocadas: deleted.count }, 'Sesiones revocadas');
  })
);

// ============================================
// AUDITORÍA DE USUARIO ESPECÍFICO
// ============================================
router.get(
  '/auditoria/:userId',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const pagination = validate(paginationSchema, req.query).data || {
      page: 1,
      limit: 50,
      sortOrder: 'desc' as const,
    };
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId: req.params.userId },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.auditLog.count({ where: { userId: req.params.userId } }),
    ]);
    
    return paginatedResponse(res, logs, pagination.page, pagination.limit, total);
  })
);

// ============================================
// ESTADÍSTICAS DE SEGURIDAD POR PERIODO
// ============================================
router.get(
  '/estadisticas',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { dias = '30' } = req.query;
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - parseInt(dias as string));
    
    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: fechaInicio },
        event: {
          in: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'SUSPICIOUS_ACTIVITY', 'RATE_LIMIT_EXCEEDED'],
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    
    // Agrupar por día y evento
    const porDia = logs.reduce((acc, log) => {
      const dia = log.createdAt.toISOString().split('T')[0];
      if (!acc[dia]) {
        acc[dia] = {
          LOGIN_SUCCESS: 0,
          LOGIN_FAILED: 0,
          SUSPICIOUS_ACTIVITY: 0,
          RATE_LIMIT_EXCEEDED: 0,
        };
      }
      acc[dia][log.event as keyof typeof acc[typeof dia]]++;
      return acc;
    }, {} as Record<string, Record<string, number>>);
    
    const estadisticas = Object.entries(porDia).map(([fecha, datos]) => ({
      fecha,
      ...datos,
    }));
    
    return successResponse(res, estadisticas);
  })
);

// ============================================
// MI ACTIVIDAD (para usuarios normales)
// ============================================
router.get(
  '/mi-actividad',
  asyncHandler(async (req, res) => {
    const logs = await prisma.auditLog.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    // Sesiones del usuario
    const sesiones = await prisma.session.findMany({
      where: {
        userId: req.user!.userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return successResponse(res, {
      actividadReciente: logs,
      sesionesActivas: sesiones.map(s => ({
        id: s.id,
        ip: s.ipAddress,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        actual: s.token === req.token,
      })),
    });
  })
);

// ============================================
// CERRAR OTRAS SESIONES
// ============================================
router.post(
  '/cerrar-otras-sesiones',
  asyncHandler(async (req, res) => {
    const deleted = await prisma.session.deleteMany({
      where: {
        userId: req.user!.userId,
        token: { not: req.token },
      },
    });
    
    return successResponse(res, { sesionesRevocadas: deleted.count }, 'Otras sesiones cerradas');
  })
);

export default router;
