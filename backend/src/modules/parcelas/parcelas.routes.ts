import { Router } from 'express';
import { authenticate, requireAgricultor } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { successResponse, errorResponse, paginatedResponse, createdResponse } from '../../utils/response.js';
import { validate, parcelaSchema, paginationSchema } from '../../utils/validators.js';
import { prisma } from '../../database/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// ============================================
// LISTAR PARCELAS DEL USUARIO
// ============================================
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder } = validate(paginationSchema, req.query).data || {
      page: 1,
      limit: 10,
      sortOrder: 'desc' as const,
    };
    
    const where = { userId: req.user!.userId };
    
    const [parcelas, total] = await Promise.all([
      prisma.parcela.findMany({
        where,
        include: {
          cultivos: {
            where: { estado: { not: 'COSECHADO' } },
            select: {
              id: true,
              nombre: true,
              variedad: true,
              estado: true,
              areaCultivada: true,
            },
          },
          sensores: {
            where: { activo: true },
            select: {
              id: true,
              tipo: true,
              nombre: true,
              ultimaLectura: true,
            },
          },
          _count: {
            select: {
              cultivos: true,
              alertas: { where: { activa: true } },
            },
          },
        },
        orderBy: { [sortBy || 'createdAt']: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.parcela.count({ where }),
    ]);
    
    return paginatedResponse(res, parcelas, page, limit, total);
  })
);

// ============================================
// OBTENER PARCELA POR ID
// ============================================
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const parcela = await prisma.parcela.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
      include: {
        cultivos: {
          orderBy: { createdAt: 'desc' },
        },
        sensores: {
          include: {
            lecturas: {
              orderBy: { timestamp: 'desc' },
              take: 10,
            },
          },
        },
        alertas: {
          where: { activa: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    
    if (!parcela) {
      return errorResponse(res, 'Parcela no encontrada', 404);
    }
    
    return successResponse(res, parcela);
  })
);

// ============================================
// CREAR PARCELA
// ============================================
router.post(
  '/',
  requireAgricultor,
  asyncHandler(async (req, res) => {
    const validation = validate(parcelaSchema, req.body);
    
    if (!validation.success) {
      return errorResponse(res, 'Error de validación', 400, 'VALIDATION_ERROR', validation.errors);
    }
    
    const data = validation.data!;
    
    const parcela = await prisma.parcela.create({
      data: {
        id: uuidv4(),
        userId: req.user!.userId,
        nombre: data.nombre,
        ubicacion: data.ubicacion,
        tamanioHectareas: data.tamanioHectareas,
        tipoSuelo: data.tipoSuelo,
        latitud: data.coordenadas?.latitud,
        longitud: data.coordenadas?.longitud,
        altitudMsnm: data.altitudMsnm,
      },
    });
    
    return createdResponse(res, parcela, 'Parcela creada exitosamente');
  })
);

// ============================================
// ACTUALIZAR PARCELA
// ============================================
router.patch(
  '/:id',
  requireAgricultor,
  asyncHandler(async (req, res) => {
    // Verificar propiedad
    const existing = await prisma.parcela.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });
    
    if (!existing) {
      return errorResponse(res, 'Parcela no encontrada', 404);
    }
    
    const { nombre, ubicacion, tamanioHectareas, tipoSuelo, coordenadas, altitudMsnm, activa } = req.body;
    
    const parcela = await prisma.parcela.update({
      where: { id: req.params.id },
      data: {
        ...(nombre && { nombre }),
        ...(ubicacion !== undefined && { ubicacion }),
        ...(tamanioHectareas && { tamanioHectareas }),
        ...(tipoSuelo !== undefined && { tipoSuelo }),
        ...(coordenadas?.latitud && { latitud: coordenadas.latitud }),
        ...(coordenadas?.longitud && { longitud: coordenadas.longitud }),
        ...(altitudMsnm !== undefined && { altitudMsnm }),
        ...(activa !== undefined && { activa }),
      },
    });
    
    return successResponse(res, parcela, 'Parcela actualizada');
  })
);

// ============================================
// ELIMINAR PARCELA
// ============================================
router.delete(
  '/:id',
  requireAgricultor,
  asyncHandler(async (req, res) => {
    const existing = await prisma.parcela.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });
    
    if (!existing) {
      return errorResponse(res, 'Parcela no encontrada', 404);
    }
    
    await prisma.parcela.delete({
      where: { id: req.params.id },
    });
    
    return successResponse(res, null, 'Parcela eliminada');
  })
);

// ============================================
// OBTENER RESUMEN DE PARCELA
// ============================================
router.get(
  '/:id/resumen',
  asyncHandler(async (req, res) => {
    const parcela = await prisma.parcela.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
      include: {
        cultivos: true,
        sensores: {
          include: {
            lecturas: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
        },
        alertas: {
          where: { activa: true },
        },
      },
    });
    
    if (!parcela) {
      return errorResponse(res, 'Parcela no encontrada', 404);
    }
    
    // Calcular estadísticas
    const cultivosActivos = parcela.cultivos.filter(c => c.estado !== 'COSECHADO' && c.estado !== 'PERDIDO');
    const areaTotal = parcela.tamanioHectareas;
    const areaCultivada = cultivosActivos.reduce((sum, c) => sum + c.areaCultivada, 0);
    
    // Últimas lecturas de sensores
    const ultimasLecturas = parcela.sensores.map(s => ({
      tipo: s.tipo,
      nombre: s.nombre,
      valor: s.lecturas[0]?.valor,
      unidad: s.lecturas[0]?.unidad,
      timestamp: s.lecturas[0]?.timestamp,
    }));
    
    const resumen = {
      parcela: {
        id: parcela.id,
        nombre: parcela.nombre,
        tamanio: areaTotal,
        areaCultivada,
        areaDisponible: areaTotal - areaCultivada,
      },
      cultivos: {
        total: parcela.cultivos.length,
        activos: cultivosActivos.length,
        porEstado: cultivosActivos.reduce((acc, c) => {
          acc[c.estado] = (acc[c.estado] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      sensores: {
        total: parcela.sensores.length,
        activos: parcela.sensores.filter(s => s.activo).length,
        ultimasLecturas,
      },
      alertas: {
        activas: parcela.alertas.length,
        criticas: parcela.alertas.filter(a => a.prioridad === 'CRITICA' || a.prioridad === 'ALTA').length,
      },
    };
    
    return successResponse(res, resumen);
  })
);

export default router;
