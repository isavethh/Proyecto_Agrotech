import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { successResponse } from '../../utils/response.js';
import { prisma } from '../../database/index.js';

const router = Router();

router.use(authenticate);

// ============================================
// DASHBOARD PRINCIPAL
// ============================================
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    
    // Obtener datos en paralelo para mejor rendimiento
    const [
      usuario,
      parcelas,
      cultivosActivos,
      alertasActivas,
      transaccionesMes,
      inventarioStockBajo,
      tareasPendientes,
    ] = await Promise.all([
      // Datos del usuario
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          nombre: true,
          apellido: true,
          ultimoLogin: true,
        },
      }),
      
      // Resumen de parcelas
      prisma.parcela.findMany({
        where: { userId, activa: true },
        include: {
          _count: {
            select: {
              cultivos: { where: { estado: { notIn: ['COSECHADO', 'PERDIDO'] } } },
              sensores: { where: { activo: true } },
            },
          },
        },
      }),
      
      // Cultivos activos
      prisma.cultivo.findMany({
        where: {
          parcela: { userId },
          estado: { notIn: ['COSECHADO', 'PERDIDO'] },
        },
        include: {
          parcela: { select: { nombre: true } },
        },
        orderBy: { fechaCosechaEstimada: 'asc' },
        take: 5,
      }),
      
      // Alertas activas
      prisma.alerta.findMany({
        where: { userId, activa: true },
        orderBy: [
          { prioridad: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 5,
      }),
      
      // Transacciones del mes actual
      prisma.transaccion.findMany({
        where: {
          userId,
          fecha: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      
      // Items con stock bajo
      prisma.inventario.findMany({
        where: {
          userId,
          stockMinimo: { not: null },
        },
      }),
      
      // Tareas pendientes
      prisma.tarea.findMany({
        where: {
          userId,
          completada: false,
        },
        orderBy: [
          { prioridad: 'desc' },
          { fechaLimite: 'asc' },
        ],
        take: 5,
      }),
    ]);
    
    // Calcular finanzas del mes
    const ingresosMes = transaccionesMes
      .filter(t => t.tipo === 'INGRESO')
      .reduce((sum, t) => sum + t.monto, 0);
    
    const gastosMes = transaccionesMes
      .filter(t => t.tipo === 'GASTO')
      .reduce((sum, t) => sum + t.monto, 0);
    
    // Filtrar stock bajo
    const stockBajo = inventarioStockBajo.filter(
      item => item.stockMinimo && item.cantidad <= item.stockMinimo
    );
    
    // Calcular área total y cultivada
    const areaTotal = parcelas.reduce((sum, p) => sum + p.tamanioHectareas, 0);
    
    const dashboard = {
      usuario: {
        nombre: `${usuario?.nombre} ${usuario?.apellido}`,
        ultimoLogin: usuario?.ultimoLogin,
      },
      
      resumen: {
        parcelas: {
          total: parcelas.length,
          areaTotal: areaTotal.toFixed(2),
        },
        cultivos: {
          activos: cultivosActivos.length,
          proximosCosecha: cultivosActivos.filter(c => {
            if (!c.fechaCosechaEstimada) return false;
            const dias = Math.ceil((c.fechaCosechaEstimada.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return dias <= 30 && dias >= 0;
          }).length,
        },
        alertas: {
          total: alertasActivas.length,
          criticas: alertasActivas.filter(a => a.prioridad === 'CRITICA' || a.prioridad === 'ALTA').length,
        },
        inventario: {
          stockBajo: stockBajo.length,
        },
      },
      
      finanzasMes: {
        ingresos: ingresosMes,
        gastos: gastosMes,
        utilidad: ingresosMes - gastosMes,
        margen: ingresosMes > 0 ? ((ingresosMes - gastosMes) / ingresosMes * 100).toFixed(1) : 0,
      },
      
      cultivosActivos: cultivosActivos.map(c => ({
        id: c.id,
        nombre: c.nombre,
        variedad: c.variedad,
        parcela: c.parcela.nombre,
        estado: c.estado,
        fechaCosecha: c.fechaCosechaEstimada,
        diasParaCosecha: c.fechaCosechaEstimada 
          ? Math.ceil((c.fechaCosechaEstimada.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      })),
      
      alertasRecientes: alertasActivas,
      
      tareasPendientes: tareasPendientes.map(t => ({
        id: t.id,
        titulo: t.titulo,
        prioridad: t.prioridad,
        fechaLimite: t.fechaLimite,
        vencida: t.fechaLimite && t.fechaLimite < new Date(),
      })),
      
      stockBajo: stockBajo.map(i => ({
        id: i.id,
        nombre: i.nombre,
        cantidad: i.cantidad,
        unidad: i.unidad,
        stockMinimo: i.stockMinimo,
      })),
    };
    
    return successResponse(res, dashboard);
  })
);

// ============================================
// CLIMA Y PRONÓSTICO (Placeholder)
// ============================================
router.get(
  '/clima',
  asyncHandler(async (req, res) => {
    // En producción, esto se conectaría a una API de clima real
    // Por ahora, retornamos datos de ejemplo
    
    const clima = {
      actual: {
        temperatura: 18,
        humedad: 55,
        condicion: 'Parcialmente nublado',
        viento: 12,
        probabilidadLluvia: 20,
      },
      pronostico: [
        { dia: 'Hoy', tempMax: 22, tempMin: 8, condicion: 'Soleado', lluvia: 0 },
        { dia: 'Mañana', tempMax: 20, tempMin: 6, condicion: 'Parcialmente nublado', lluvia: 10 },
        { dia: 'Pasado', tempMax: 18, tempMin: 4, condicion: 'Nublado', lluvia: 40 },
        { dia: 'Jueves', tempMax: 15, tempMin: 2, condicion: 'Lluvia', lluvia: 80 },
        { dia: 'Viernes', tempMax: 16, tempMin: 5, condicion: 'Parcialmente nublado', lluvia: 20 },
        { dia: 'Sábado', tempMax: 19, tempMin: 7, condicion: 'Soleado', lluvia: 0 },
        { dia: 'Domingo', tempMax: 21, tempMin: 9, condicion: 'Soleado', lluvia: 0 },
      ],
      alertas: [
        {
          tipo: 'HELADA',
          mensaje: 'Posible helada el jueves (mín. 2°C)',
          severidad: 'ALTA',
        },
      ],
    };
    
    return successResponse(res, clima);
  })
);

export default router;
