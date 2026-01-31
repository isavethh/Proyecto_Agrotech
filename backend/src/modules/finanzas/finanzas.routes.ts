import { Router } from 'express';
import { authenticate, requireAgricultor } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { successResponse, errorResponse, paginatedResponse, createdResponse } from '../../utils/response.js';
import { validate, transaccionSchema, paginationSchema } from '../../utils/validators.js';
import { prisma } from '../../database/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authenticate);

// ============================================
// LISTAR TRANSACCIONES
// ============================================
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pagination = validate(paginationSchema, req.query).data || {
      page: 1,
      limit: 10,
      sortOrder: 'desc' as const,
    };
    
    const { tipo, categoria, fechaInicio, fechaFin } = req.query;
    
    const where: any = { userId: req.user!.userId };
    
    if (tipo) where.tipo = tipo;
    if (categoria) where.categoria = categoria;
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio as string);
      if (fechaFin) where.fecha.lte = new Date(fechaFin as string);
    }
    
    const [transacciones, total] = await Promise.all([
      prisma.transaccion.findMany({
        where,
        include: {
          cultivo: {
            select: { id: true, nombre: true, variedad: true },
          },
        },
        orderBy: { fecha: pagination.sortOrder },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.transaccion.count({ where }),
    ]);
    
    return paginatedResponse(res, transacciones, pagination.page, pagination.limit, total);
  })
);

// ============================================
// RESUMEN FINANCIERO
// ============================================
router.get(
  '/resumen',
  asyncHandler(async (req, res) => {
    const { periodo = 'mes' } = req.query;
    
    let fechaInicio: Date;
    const fechaFin = new Date();
    
    switch (periodo) {
      case 'semana':
        fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        break;
      case 'mes':
        fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        break;
      case 'trimestre':
        fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 3);
        break;
      case 'año':
        fechaInicio = new Date();
        fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
        break;
      default:
        fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
    }
    
    const transacciones = await prisma.transaccion.findMany({
      where: {
        userId: req.user!.userId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
    });
    
    // Calcular totales
    const ingresos = transacciones
      .filter(t => t.tipo === 'INGRESO')
      .reduce((sum, t) => sum + t.monto, 0);
    
    const gastos = transacciones
      .filter(t => t.tipo === 'GASTO')
      .reduce((sum, t) => sum + t.monto, 0);
    
    // Agrupar por categoría
    const porCategoria = transacciones.reduce((acc, t) => {
      if (!acc[t.categoria]) {
        acc[t.categoria] = { ingresos: 0, gastos: 0 };
      }
      if (t.tipo === 'INGRESO') {
        acc[t.categoria].ingresos += t.monto;
      } else {
        acc[t.categoria].gastos += t.monto;
      }
      return acc;
    }, {} as Record<string, { ingresos: number; gastos: number }>);
    
    // Transacciones por mes (para gráficos)
    const porMes = transacciones.reduce((acc, t) => {
      const mes = t.fecha.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[mes]) {
        acc[mes] = { ingresos: 0, gastos: 0 };
      }
      if (t.tipo === 'INGRESO') {
        acc[mes].ingresos += t.monto;
      } else {
        acc[mes].gastos += t.monto;
      }
      return acc;
    }, {} as Record<string, { ingresos: number; gastos: number }>);
    
    const resumen = {
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin,
      },
      totales: {
        ingresos,
        gastos,
        utilidad: ingresos - gastos,
        margen: ingresos > 0 ? ((ingresos - gastos) / ingresos) * 100 : 0,
      },
      porCategoria,
      porMes: Object.entries(porMes).map(([mes, datos]) => ({
        mes,
        ...datos,
        utilidad: datos.ingresos - datos.gastos,
      })).sort((a, b) => a.mes.localeCompare(b.mes)),
      transaccionesCount: transacciones.length,
    };
    
    return successResponse(res, resumen);
  })
);

// ============================================
// ANÁLISIS CON IA
// ============================================
router.get(
  '/analisis-ia',
  asyncHandler(async (req, res) => {
    // Obtener transacciones del último año
    const fechaInicio = new Date();
    fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
    
    const transacciones = await prisma.transaccion.findMany({
      where: {
        userId: req.user!.userId,
        fecha: { gte: fechaInicio },
      },
      include: {
        cultivo: true,
      },
      orderBy: { fecha: 'asc' },
    });
    
    // Análisis por cultivo
    const rentabilidadPorCultivo: Record<string, { ingresos: number; gastos: number; cultivo: string }> = {};
    
    for (const t of transacciones) {
      if (t.cultivo) {
        const key = t.cultivo.nombre;
        if (!rentabilidadPorCultivo[key]) {
          rentabilidadPorCultivo[key] = { ingresos: 0, gastos: 0, cultivo: key };
        }
        if (t.tipo === 'INGRESO') {
          rentabilidadPorCultivo[key].ingresos += t.monto;
        } else {
          rentabilidadPorCultivo[key].gastos += t.monto;
        }
      }
    }
    
    // Ordenar por rentabilidad
    const cultivosOrdenados = Object.values(rentabilidadPorCultivo)
      .map(c => ({
        ...c,
        utilidad: c.ingresos - c.gastos,
        margen: c.ingresos > 0 ? ((c.ingresos - c.gastos) / c.ingresos) * 100 : 0,
      }))
      .sort((a, b) => b.utilidad - a.utilidad);
    
    // Detectar gastos inusuales
    const gastosPorCategoria = transacciones
      .filter(t => t.tipo === 'GASTO')
      .reduce((acc, t) => {
        if (!acc[t.categoria]) acc[t.categoria] = [];
        acc[t.categoria].push(t.monto);
        return acc;
      }, {} as Record<string, number[]>);
    
    const alertasGastos: string[] = [];
    
    for (const [categoria, montos] of Object.entries(gastosPorCategoria)) {
      if (montos.length > 1) {
        const promedio = montos.reduce((a, b) => a + b, 0) / montos.length;
        const ultimoGasto = montos[montos.length - 1];
        if (ultimoGasto > promedio * 1.5) {
          alertasGastos.push(`Gasto en ${categoria} 50% mayor al promedio`);
        }
      }
    }
    
    // Calcular tendencia de ingresos
    const ingresosPorMes = transacciones
      .filter(t => t.tipo === 'INGRESO')
      .reduce((acc, t) => {
        const mes = t.fecha.toISOString().substring(0, 7);
        acc[mes] = (acc[mes] || 0) + t.monto;
        return acc;
      }, {} as Record<string, number>);
    
    const meses = Object.keys(ingresosPorMes).sort();
    const tendencia = meses.length >= 2
      ? ingresosPorMes[meses[meses.length - 1]] > ingresosPorMes[meses[0]]
        ? 'CRECIENTE'
        : 'DECRECIENTE'
      : 'ESTABLE';
    
    // Generar recomendaciones
    const recomendaciones: string[] = [];
    
    if (cultivosOrdenados.length > 0) {
      const mejor = cultivosOrdenados[0];
      recomendaciones.push(`Tu cultivo más rentable es ${mejor.cultivo} con ${mejor.margen.toFixed(1)}% de margen. Considera aumentar su área.`);
    }
    
    if (alertasGastos.length > 0) {
      recomendaciones.push('Revisa tus gastos recientes, hay algunos valores inusuales.');
    }
    
    // Mejor época para vender
    const ventasPorMes = transacciones
      .filter(t => t.tipo === 'INGRESO' && t.categoria === 'VENTA_COSECHA')
      .reduce((acc, t) => {
        const mes = t.fecha.getMonth();
        acc[mes] = (acc[mes] || 0) + t.monto;
        return acc;
      }, {} as Record<number, number>);
    
    const mejorMesVenta = Object.entries(ventasPorMes)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (mejorMesVenta) {
      const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      recomendaciones.push(`Tus mejores ventas son en ${nombresMeses[parseInt(mejorMesVenta[0])]}.`);
    }
    
    const analisis = {
      rentabilidadPorCultivo: cultivosOrdenados,
      tendenciaIngresos: tendencia,
      alertasGastos,
      recomendaciones,
      prediccion: {
        ingresoEstimadoProximoMes: meses.length > 0 
          ? Object.values(ingresosPorMes).reduce((a, b) => a + b, 0) / meses.length 
          : 0,
      },
    };
    
    return successResponse(res, analisis);
  })
);

// ============================================
// CREAR TRANSACCIÓN
// ============================================
router.post(
  '/',
  requireAgricultor,
  asyncHandler(async (req, res) => {
    const validation = validate(transaccionSchema, req.body);
    
    if (!validation.success) {
      return errorResponse(res, 'Error de validación', 400, 'VALIDATION_ERROR', validation.errors);
    }
    
    const data = validation.data!;
    
    const transaccion = await prisma.transaccion.create({
      data: {
        id: uuidv4(),
        userId: req.user!.userId,
        tipo: data.tipo,
        categoria: data.categoria,
        monto: data.monto,
        fecha: data.fecha,
        descripcion: data.descripcion,
        cultivoId: data.cultivoId,
        comprobante: data.comprobante,
      },
    });
    
    return createdResponse(res, transaccion, 'Transacción registrada');
  })
);

// ============================================
// ACTUALIZAR TRANSACCIÓN
// ============================================
router.patch(
  '/:id',
  requireAgricultor,
  asyncHandler(async (req, res) => {
    const existing = await prisma.transaccion.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });
    
    if (!existing) {
      return errorResponse(res, 'Transacción no encontrada', 404);
    }
    
    const { tipo, categoria, monto, fecha, descripcion, comprobante } = req.body;
    
    const transaccion = await prisma.transaccion.update({
      where: { id: req.params.id },
      data: {
        ...(tipo && { tipo }),
        ...(categoria && { categoria }),
        ...(monto && { monto }),
        ...(fecha && { fecha: new Date(fecha) }),
        ...(descripcion !== undefined && { descripcion }),
        ...(comprobante !== undefined && { comprobante }),
      },
    });
    
    return successResponse(res, transaccion, 'Transacción actualizada');
  })
);

// ============================================
// ELIMINAR TRANSACCIÓN
// ============================================
router.delete(
  '/:id',
  requireAgricultor,
  asyncHandler(async (req, res) => {
    const existing = await prisma.transaccion.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });
    
    if (!existing) {
      return errorResponse(res, 'Transacción no encontrada', 404);
    }
    
    await prisma.transaccion.delete({
      where: { id: req.params.id },
    });
    
    return successResponse(res, null, 'Transacción eliminada');
  })
);

export default router;
