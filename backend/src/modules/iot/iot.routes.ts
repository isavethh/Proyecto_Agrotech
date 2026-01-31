import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { sensitiveRateLimiter } from '../../middleware/security.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { successResponse, errorResponse, createdResponse } from '../../utils/response.js';
import { prisma } from '../../database/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authenticate);

// ============================================
// LISTAR SENSORES DEL USUARIO
// ============================================
router.get(
  '/sensores',
  asyncHandler(async (req, res) => {
    const parcelas = await prisma.parcela.findMany({
      where: { userId: req.user!.userId },
      select: { id: true },
    });
    
    const parcelaIds = parcelas.map(p => p.id);
    
    const sensores = await prisma.sensor.findMany({
      where: {
        parcelaId: { in: parcelaIds },
      },
      include: {
        parcela: {
          select: { id: true, nombre: true },
        },
        lecturas: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
    
    const sensoresConEstado = sensores.map(s => ({
      ...s,
      ultimoValor: s.lecturas[0]?.valor,
      ultimaUnidad: s.lecturas[0]?.unidad,
      ultimaLecturaTimestamp: s.lecturas[0]?.timestamp,
      estado: s.activo
        ? (s.ultimaLectura && new Date().getTime() - new Date(s.ultimaLectura).getTime() < 3600000
          ? 'ONLINE'
          : 'OFFLINE')
        : 'DESACTIVADO',
    }));
    
    return successResponse(res, sensoresConEstado);
  })
);

// ============================================
// OBTENER LECTURAS DE UN SENSOR
// ============================================
router.get(
  '/sensores/:id/lecturas',
  asyncHandler(async (req, res) => {
    const { horas = '24' } = req.query;
    
    const fechaInicio = new Date();
    fechaInicio.setHours(fechaInicio.getHours() - parseInt(horas as string));
    
    // Verificar que el sensor pertenece al usuario
    const sensor = await prisma.sensor.findFirst({
      where: {
        id: req.params.id,
        parcela: {
          userId: req.user!.userId,
        },
      },
    });
    
    if (!sensor) {
      return errorResponse(res, 'Sensor no encontrado', 404);
    }
    
    const lecturas = await prisma.lecturaIoT.findMany({
      where: {
        sensorId: req.params.id,
        timestamp: { gte: fechaInicio },
      },
      orderBy: { timestamp: 'asc' },
    });
    
    // Calcular estadísticas
    const valores = lecturas.map(l => l.valor);
    const stats = {
      min: Math.min(...valores),
      max: Math.max(...valores),
      promedio: valores.reduce((a, b) => a + b, 0) / valores.length,
      total: lecturas.length,
    };
    
    return successResponse(res, {
      sensor,
      lecturas,
      stats,
    });
  })
);

// ============================================
// DASHBOARD IoT - RESUMEN
// ============================================
router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const parcelas = await prisma.parcela.findMany({
      where: { userId: req.user!.userId },
      include: {
        sensores: {
          where: { activo: true },
          include: {
            lecturas: {
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
        },
      },
    });
    
    const dashboard = parcelas.map(parcela => {
      const sensoresData = parcela.sensores.map(s => ({
        id: s.id,
        tipo: s.tipo,
        nombre: s.nombre,
        valor: s.lecturas[0]?.valor,
        unidad: s.lecturas[0]?.unidad,
        timestamp: s.lecturas[0]?.timestamp,
        alerta: s.lecturas[0] && (
          (s.umbralMinimo && s.lecturas[0].valor < s.umbralMinimo) ||
          (s.umbralMaximo && s.lecturas[0].valor > s.umbralMaximo)
        ),
      }));
      
      return {
        parcela: {
          id: parcela.id,
          nombre: parcela.nombre,
        },
        sensores: sensoresData,
        alertasActivas: sensoresData.filter(s => s.alerta).length,
      };
    });
    
    // Resumen general
    const totalSensores = parcelas.reduce((sum, p) => sum + p.sensores.length, 0);
    const sensoresConAlerta = dashboard.reduce((sum, d) => sum + d.alertasActivas, 0);
    
    return successResponse(res, {
      resumen: {
        parcelas: parcelas.length,
        sensores: totalSensores,
        alertas: sensoresConAlerta,
      },
      parcelas: dashboard,
    });
  })
);

// ============================================
// RECIBIR DATOS DE SENSOR (API para IoT)
// ============================================
router.post(
  '/datos',
  sensitiveRateLimiter,
  asyncHandler(async (req, res) => {
    const { codigoSensor, valor, unidad, bateria, senal } = req.body;
    
    if (!codigoSensor || valor === undefined) {
      return errorResponse(res, 'codigoSensor y valor son requeridos', 400);
    }
    
    // Buscar sensor por código
    const sensor = await prisma.sensor.findUnique({
      where: { codigo: codigoSensor },
      include: {
        parcela: {
          select: { userId: true },
        },
      },
    });
    
    if (!sensor) {
      return errorResponse(res, 'Sensor no encontrado', 404);
    }
    
    if (!sensor.activo) {
      return errorResponse(res, 'Sensor desactivado', 400);
    }
    
    // Crear lectura
    const lectura = await prisma.lecturaIoT.create({
      data: {
        id: uuidv4(),
        sensorId: sensor.id,
        valor,
        unidad: unidad || getDefaultUnit(sensor.tipo),
        bateria,
        senal,
      },
    });
    
    // Actualizar última lectura del sensor
    await prisma.sensor.update({
      where: { id: sensor.id },
      data: { ultimaLectura: new Date() },
    });
    
    // Verificar umbrales y crear alerta si es necesario
    if (
      (sensor.umbralMinimo && valor < sensor.umbralMinimo) ||
      (sensor.umbralMaximo && valor > sensor.umbralMaximo)
    ) {
      await prisma.alerta.create({
        data: {
          id: uuidv4(),
          userId: sensor.parcela.userId,
          parcelaId: sensor.parcelaId,
          tipo: getAlertType(sensor.tipo),
          prioridad: 'ALTA',
          titulo: `${sensor.nombre || sensor.tipo}: Valor fuera de rango`,
          mensaje: `El sensor ${sensor.nombre || sensor.codigo} registró ${valor}${unidad || ''}, fuera del rango permitido (${sensor.umbralMinimo || '-'} - ${sensor.umbralMaximo || '-'})`,
        },
      });
    }
    
    return createdResponse(res, lectura, 'Lectura registrada');
  })
);

// ============================================
// CREAR SENSOR
// ============================================
router.post(
  '/sensores',
  asyncHandler(async (req, res) => {
    const { parcelaId, tipo, nombre, ubicacion, umbralMinimo, umbralMaximo } = req.body;
    
    // Verificar que la parcela pertenece al usuario
    const parcela = await prisma.parcela.findFirst({
      where: {
        id: parcelaId,
        userId: req.user!.userId,
      },
    });
    
    if (!parcela) {
      return errorResponse(res, 'Parcela no encontrada', 404);
    }
    
    // Generar código único
    const codigo = `${tipo}-${Date.now().toString(36).toUpperCase()}`;
    
    const sensor = await prisma.sensor.create({
      data: {
        id: uuidv4(),
        parcelaId,
        tipo,
        nombre,
        codigo,
        ubicacion,
        umbralMinimo,
        umbralMaximo,
      },
    });
    
    return createdResponse(res, sensor, 'Sensor creado');
  })
);

// ============================================
// ACTUALIZAR SENSOR
// ============================================
router.patch(
  '/sensores/:id',
  asyncHandler(async (req, res) => {
    const sensor = await prisma.sensor.findFirst({
      where: {
        id: req.params.id,
        parcela: {
          userId: req.user!.userId,
        },
      },
    });
    
    if (!sensor) {
      return errorResponse(res, 'Sensor no encontrado', 404);
    }
    
    const { nombre, ubicacion, activo, umbralMinimo, umbralMaximo, intervaloLectura } = req.body;
    
    const updated = await prisma.sensor.update({
      where: { id: req.params.id },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(ubicacion !== undefined && { ubicacion }),
        ...(activo !== undefined && { activo }),
        ...(umbralMinimo !== undefined && { umbralMinimo }),
        ...(umbralMaximo !== undefined && { umbralMaximo }),
        ...(intervaloLectura !== undefined && { intervaloLectura }),
      },
    });
    
    return successResponse(res, updated, 'Sensor actualizado');
  })
);

// Funciones auxiliares
function getDefaultUnit(tipo: string): string {
  const units: Record<string, string> = {
    TEMPERATURA_SUELO: '°C',
    TEMPERATURA_AMBIENTE: '°C',
    HUMEDAD_SUELO: '%',
    HUMEDAD_AMBIENTE: '%',
    PH_SUELO: 'pH',
    LLUVIA: 'mm',
    VIENTO: 'km/h',
    RADIACION_SOLAR: 'W/m²',
  };
  return units[tipo] || '';
}

function getAlertType(sensorTipo: string): 'CLIMA' | 'RIEGO' | 'SISTEMA' {
  if (sensorTipo.includes('TEMPERATURA') || sensorTipo.includes('LLUVIA') || sensorTipo.includes('VIENTO')) {
    return 'CLIMA';
  }
  if (sensorTipo.includes('HUMEDAD') || sensorTipo.includes('PH')) {
    return 'RIEGO';
  }
  return 'SISTEMA';
}

export default router;
