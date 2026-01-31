import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { validate, paginationSchema } from '../../utils/validators.js';
import { prisma } from '../../database/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authenticate);

// ============================================
// LISTAR ALERTAS
// ============================================
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pagination = validate(paginationSchema, req.query).data || {
      page: 1,
      limit: 20,
      sortOrder: 'desc' as const,
    };
    
    const { tipo, prioridad, activa } = req.query;
    
    const where: any = { userId: req.user!.userId };
    
    if (tipo) where.tipo = tipo;
    if (prioridad) where.prioridad = prioridad;
    if (activa !== undefined) where.activa = activa === 'true';
    
    const [alertas, total] = await Promise.all([
      prisma.alerta.findMany({
        where,
        include: {
          parcela: { select: { id: true, nombre: true } },
          cultivo: { select: { id: true, nombre: true, variedad: true } },
        },
        orderBy: [
          { prioridad: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.alerta.count({ where }),
    ]);
    
    return paginatedResponse(res, alertas, pagination.page, pagination.limit, total);
  })
);

// ============================================
// RESUMEN DE ALERTAS
// ============================================
router.get(
  '/resumen',
  asyncHandler(async (req, res) => {
    const alertas = await prisma.alerta.findMany({
      where: {
        userId: req.user!.userId,
        activa: true,
      },
    });
    
    const porTipo = alertas.reduce((acc, a) => {
      acc[a.tipo] = (acc[a.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const porPrioridad = alertas.reduce((acc, a) => {
      acc[a.prioridad] = (acc[a.prioridad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const resumen = {
      total: alertas.length,
      criticas: alertas.filter(a => a.prioridad === 'CRITICA').length,
      altas: alertas.filter(a => a.prioridad === 'ALTA').length,
      porTipo,
      porPrioridad,
      recientes: alertas
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
    };
    
    return successResponse(res, resumen);
  })
);

// ============================================
// MARCAR ALERTA COMO LEÍDA
// ============================================
router.patch(
  '/:id/leer',
  asyncHandler(async (req, res) => {
    const alerta = await prisma.alerta.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });
    
    if (!alerta) {
      return errorResponse(res, 'Alerta no encontrada', 404);
    }
    
    const updated = await prisma.alerta.update({
      where: { id: req.params.id },
      data: {
        leida: true,
        fechaLeida: new Date(),
      },
    });
    
    return successResponse(res, updated);
  })
);

// ============================================
// TOMAR ACCIÓN EN ALERTA
// ============================================
router.patch(
  '/:id/accion',
  asyncHandler(async (req, res) => {
    const { accion } = req.body;
    
    if (!accion) {
      return errorResponse(res, 'Se requiere la acción tomada', 400);
    }
    
    const alerta = await prisma.alerta.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });
    
    if (!alerta) {
      return errorResponse(res, 'Alerta no encontrada', 404);
    }
    
    const updated = await prisma.alerta.update({
      where: { id: req.params.id },
      data: {
        activa: false,
        accionTomada: accion,
        fechaAccion: new Date(),
      },
    });
    
    return successResponse(res, updated, 'Acción registrada');
  })
);

// ============================================
// DESCARTAR ALERTA
// ============================================
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const alerta = await prisma.alerta.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });
    
    if (!alerta) {
      return errorResponse(res, 'Alerta no encontrada', 404);
    }
    
    await prisma.alerta.update({
      where: { id: req.params.id },
      data: { activa: false },
    });
    
    return successResponse(res, null, 'Alerta descartada');
  })
);

// ============================================
// MARCAR TODAS COMO LEÍDAS
// ============================================
router.post(
  '/leer-todas',
  asyncHandler(async (req, res) => {
    const updated = await prisma.alerta.updateMany({
      where: {
        userId: req.user!.userId,
        leida: false,
      },
      data: {
        leida: true,
        fechaLeida: new Date(),
      },
    });
    
    return successResponse(res, { actualizadas: updated.count }, 'Alertas marcadas como leídas');
  })
);

export default router;
