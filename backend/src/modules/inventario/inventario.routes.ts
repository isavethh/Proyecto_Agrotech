import { Router } from 'express';
import { authenticate, requireAgricultor } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { successResponse, errorResponse, paginatedResponse, createdResponse } from '../../utils/response.js';
import { validate, inventarioSchema, paginationSchema } from '../../utils/validators.js';
import { prisma } from '../../database/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authenticate);

// ============================================
// LISTAR INVENTARIO
// ============================================
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pagination = validate(paginationSchema, req.query).data || {
      page: 1,
      limit: 20,
      sortOrder: 'asc' as const,
    };
    
    const { tipo, stockBajo } = req.query;
    
    const where: any = { userId: req.user!.userId };
    
    if (tipo) where.tipo = tipo;
    
    let items = await prisma.inventario.findMany({
      where,
      include: {
        cultivo: {
          select: { id: true, nombre: true, variedad: true },
        },
        movimientos: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { nombre: pagination.sortOrder },
    });
    
    // Filtrar por stock bajo si se solicita
    if (stockBajo === 'true') {
      items = items.filter(item => 
        item.stockMinimo && item.cantidad <= item.stockMinimo
      );
    }
    
    const total = items.length;
    const paginatedItems = items.slice(
      (pagination.page - 1) * pagination.limit,
      pagination.page * pagination.limit
    );
    
    return paginatedResponse(res, paginatedItems, pagination.page, pagination.limit, total);
  })
);

// ============================================
// RESUMEN DE INVENTARIO
// ============================================
router.get(
  '/resumen',
  asyncHandler(async (req, res) => {
    const items = await prisma.inventario.findMany({
      where: { userId: req.user!.userId },
    });
    
    // Agrupar por tipo
    const porTipo = items.reduce((acc, item) => {
      if (!acc[item.tipo]) {
        acc[item.tipo] = { cantidad: 0, valorTotal: 0, items: 0 };
      }
      acc[item.tipo].items += 1;
      acc[item.tipo].cantidad += item.cantidad;
      acc[item.tipo].valorTotal += (item.precioUnitario || 0) * item.cantidad;
      return acc;
    }, {} as Record<string, { cantidad: number; valorTotal: number; items: number }>);
    
    // Items con stock bajo
    const stockBajo = items.filter(item => 
      item.stockMinimo && item.cantidad <= item.stockMinimo
    );
    
    // Items por vencer (próximos 30 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 30);
    
    const porVencer = items.filter(item => 
      item.fechaVencimiento && item.fechaVencimiento <= fechaLimite
    );
    
    // Valor total del inventario
    const valorTotal = items.reduce((sum, item) => 
      sum + (item.precioUnitario || 0) * item.cantidad, 0
    );
    
    const resumen = {
      totalItems: items.length,
      valorTotal,
      porTipo,
      alertas: {
        stockBajo: stockBajo.map(i => ({
          id: i.id,
          nombre: i.nombre,
          cantidad: i.cantidad,
          stockMinimo: i.stockMinimo,
        })),
        porVencer: porVencer.map(i => ({
          id: i.id,
          nombre: i.nombre,
          fechaVencimiento: i.fechaVencimiento,
        })),
      },
    };
    
    return successResponse(res, resumen);
  })
);

// ============================================
// OBTENER ITEM POR ID
// ============================================
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await prisma.inventario.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
      include: {
        cultivo: true,
        movimientos: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        ventas: {
          orderBy: { fecha: 'desc' },
          take: 10,
          include: {
            cliente: {
              select: { nombre: true },
            },
          },
        },
      },
    });
    
    if (!item) {
      return errorResponse(res, 'Item no encontrado', 404);
    }
    
    return successResponse(res, item);
  })
);

// ============================================
// CREAR ITEM DE INVENTARIO
// ============================================
router.post(
  '/',
  requireAgricultor,
  asyncHandler(async (req, res) => {
    const validation = validate(inventarioSchema, req.body);
    
    if (!validation.success) {
      return errorResponse(res, 'Error de validación', 400, 'VALIDATION_ERROR', validation.errors);
    }
    
    const data = validation.data!;
    
    const item = await prisma.inventario.create({
      data: {
        id: uuidv4(),
        userId: req.user!.userId,
        nombre: data.nombre,
        tipo: data.tipo,
        cantidad: data.cantidad,
        unidad: data.unidad,
        precioUnitario: data.precioUnitario,
        stockMinimo: data.stockMinimo,
        fechaVencimiento: data.fechaVencimiento,
        ubicacion: data.ubicacion,
      },
    });
    
    // Registrar movimiento de entrada
    await prisma.movimientoInventario.create({
      data: {
        id: uuidv4(),
        inventarioId: item.id,
        tipo: 'ENTRADA',
        cantidad: data.cantidad,
        motivo: 'Registro inicial',
      },
    });
    
    return createdResponse(res, item, 'Item creado exitosamente');
  })
);

// ============================================
// ACTUALIZAR ITEM
// ============================================
router.patch(
  '/:id',
  requireAgricultor,
  asyncHandler(async (req, res) => {
    const existing = await prisma.inventario.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });
    
    if (!existing) {
      return errorResponse(res, 'Item no encontrado', 404);
    }
    
    const { nombre, cantidad, unidad, precioUnitario, stockMinimo, fechaVencimiento, ubicacion } = req.body;
    
    // Si cambia la cantidad, registrar movimiento
    if (cantidad !== undefined && cantidad !== existing.cantidad) {
      const diferencia = cantidad - existing.cantidad;
      await prisma.movimientoInventario.create({
        data: {
          id: uuidv4(),
          inventarioId: existing.id,
          tipo: diferencia > 0 ? 'ENTRADA' : 'SALIDA',
          cantidad: Math.abs(diferencia),
          motivo: 'Ajuste manual',
        },
      });
    }
    
    const item = await prisma.inventario.update({
      where: { id: req.params.id },
      data: {
        ...(nombre && { nombre }),
        ...(cantidad !== undefined && { cantidad }),
        ...(unidad && { unidad }),
        ...(precioUnitario !== undefined && { precioUnitario }),
        ...(stockMinimo !== undefined && { stockMinimo }),
        ...(fechaVencimiento !== undefined && { fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null }),
        ...(ubicacion !== undefined && { ubicacion }),
      },
    });
    
    return successResponse(res, item, 'Item actualizado');
  })
);

// ============================================
// REGISTRAR MOVIMIENTO
// ============================================
router.post(
  '/:id/movimiento',
  requireAgricultor,
  asyncHandler(async (req, res) => {
    const { tipo, cantidad, motivo, referencia } = req.body;
    
    if (!tipo || !cantidad) {
      return errorResponse(res, 'Tipo y cantidad son requeridos', 400);
    }
    
    const item = await prisma.inventario.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });
    
    if (!item) {
      return errorResponse(res, 'Item no encontrado', 404);
    }
    
    // Calcular nueva cantidad
    let nuevaCantidad = item.cantidad;
    if (tipo === 'ENTRADA') {
      nuevaCantidad += cantidad;
    } else if (tipo === 'SALIDA') {
      if (cantidad > item.cantidad) {
        return errorResponse(res, 'Stock insuficiente', 400);
      }
      nuevaCantidad -= cantidad;
    } else if (tipo === 'AJUSTE') {
      nuevaCantidad = cantidad;
    }
    
    // Crear movimiento
    const movimiento = await prisma.movimientoInventario.create({
      data: {
        id: uuidv4(),
        inventarioId: item.id,
        tipo,
        cantidad: tipo === 'AJUSTE' ? Math.abs(cantidad - item.cantidad) : cantidad,
        motivo,
        referencia,
      },
    });
    
    // Actualizar cantidad
    await prisma.inventario.update({
      where: { id: item.id },
      data: { cantidad: nuevaCantidad },
    });
    
    return successResponse(res, {
      movimiento,
      nuevaCantidad,
    }, 'Movimiento registrado');
  })
);

// ============================================
// ELIMINAR ITEM
// ============================================
router.delete(
  '/:id',
  requireAgricultor,
  asyncHandler(async (req, res) => {
    const existing = await prisma.inventario.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });
    
    if (!existing) {
      return errorResponse(res, 'Item no encontrado', 404);
    }
    
    await prisma.inventario.delete({
      where: { id: req.params.id },
    });
    
    return successResponse(res, null, 'Item eliminado');
  })
);

export default router;
