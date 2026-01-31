import { z } from 'zod';
import { ROLES, ALERT_PRIORITIES, TRANSACTION_TYPES } from '../config/constants.js';

/**
 * Esquemas de validación con Zod
 * Previenen SQL Injection y validan datos de entrada
 */

// ============================================
// VALIDADORES BÁSICOS
// ============================================

export const emailSchema = z
  .string()
  .email('Email inválido')
  .max(255, 'Email muy largo')
  .transform((val) => val.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña es muy larga')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'La contraseña debe tener mayúsculas, minúsculas, números y caracteres especiales'
  );

export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9]{8,15}$/, 'Teléfono inválido')
  .optional();

export const uuidSchema = z.string().uuid('ID inválido');

export const positiveNumberSchema = z.number().positive('Debe ser un número positivo');

export const dateSchema = z.coerce.date();

// ============================================
// AUTENTICACIÓN
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña requerida'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nombre: z.string().min(2, 'Nombre muy corto').max(100, 'Nombre muy largo'),
  apellido: z.string().min(2, 'Apellido muy corto').max(100, 'Apellido muy largo'),
  telefono: phoneSchema,
  departamento: z.string().optional(),
  comunidad: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const twoFactorSchema = z.object({
  token: z.string().length(6, 'El código debe tener 6 dígitos'),
});

// ============================================
// PARCELAS
// ============================================

export const parcelaSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(100),
  ubicacion: z.string().max(255).optional(),
  tamanioHectareas: positiveNumberSchema.max(1000, 'Tamaño máximo excedido'),
  tipoSuelo: z.string().max(100).optional(),
  coordenadas: z.object({
    latitud: z.number().min(-90).max(90),
    longitud: z.number().min(-180).max(180),
  }).optional(),
  altitudMsnm: z.number().min(0).max(6000).optional(),
});

// ============================================
// CULTIVOS
// ============================================

export const cultivoSchema = z.object({
  parcelaId: uuidSchema,
  nombre: z.string().min(1, 'Nombre requerido').max(100),
  variedad: z.string().max(100).optional(),
  fechaSiembra: dateSchema,
  fechaCosechaEstimada: dateSchema.optional(),
  areaCultivada: positiveNumberSchema,
  rendimientoEsperado: positiveNumberSchema.optional(),
  notas: z.string().max(1000).optional(),
});

// ============================================
// INVENTARIO
// ============================================

export const inventarioSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido').max(100),
  tipo: z.enum(['INSUMO', 'PRODUCCION', 'HERRAMIENTA']),
  cantidad: positiveNumberSchema,
  unidad: z.string().max(20),
  precioUnitario: positiveNumberSchema.optional(),
  stockMinimo: positiveNumberSchema.optional(),
  fechaVencimiento: dateSchema.optional(),
  ubicacion: z.string().max(100).optional(),
});

// ============================================
// FINANZAS
// ============================================

export const transaccionSchema = z.object({
  tipo: z.enum([TRANSACTION_TYPES.INGRESO, TRANSACTION_TYPES.GASTO]),
  categoria: z.string().min(1).max(50),
  monto: positiveNumberSchema,
  fecha: dateSchema,
  descripcion: z.string().max(500).optional(),
  cultivoId: uuidSchema.optional(),
  comprobante: z.string().max(100).optional(),
});

// ============================================
// VENTAS
// ============================================

export const ventaSchema = z.object({
  productoId: uuidSchema,
  clienteId: uuidSchema.optional(),
  cantidad: positiveNumberSchema,
  precioUnitario: positiveNumberSchema,
  fecha: dateSchema,
  lugarVenta: z.string().max(100).optional(),
  notas: z.string().max(500).optional(),
});

export const clienteSchema = z.object({
  nombre: z.string().min(1).max(100),
  telefono: phoneSchema,
  direccion: z.string().max(255).optional(),
  tipo: z.enum(['REGULAR', 'MAYORISTA', 'FERIA']).optional(),
});

// ============================================
// TRABAJADORES
// ============================================

export const trabajadorSchema = z.object({
  nombre: z.string().min(1).max(100),
  telefono: phoneSchema,
  especialidad: z.string().max(100).optional(),
  tarifaDiaria: positiveNumberSchema,
});

export const jornadaSchema = z.object({
  trabajadorId: uuidSchema,
  fecha: dateSchema,
  horasTrabajadas: z.number().min(0.5).max(24),
  actividad: z.string().max(200),
  parcelaId: uuidSchema.optional(),
  pagado: z.boolean().default(false),
});

// ============================================
// IOT / SENSORES
// ============================================

export const sensorSchema = z.object({
  parcelaId: uuidSchema,
  tipo: z.string().min(1).max(50),
  nombre: z.string().max(100).optional(),
  ubicacion: z.string().max(100).optional(),
  activo: z.boolean().default(true),
});

export const lecturaIoTSchema = z.object({
  sensorId: uuidSchema,
  valor: z.number(),
  unidad: z.string().max(20),
  timestamp: dateSchema.optional(),
});

// ============================================
// ALERTAS
// ============================================

export const alertaSchema = z.object({
  tipo: z.string().min(1).max(50),
  prioridad: z.enum([
    ALERT_PRIORITIES.BAJA,
    ALERT_PRIORITIES.MEDIA,
    ALERT_PRIORITIES.ALTA,
    ALERT_PRIORITIES.CRITICA,
  ]),
  mensaje: z.string().min(1).max(500),
  parcelaId: uuidSchema.optional(),
  cultivoId: uuidSchema.optional(),
});

// ============================================
// PAGINACIÓN
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Valida un objeto contra un esquema Zod
 * @returns Resultado de validación
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error.errors };
}

/**
 * Sanitiza un string para prevenir XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valida que un ID sea un UUID válido
 */
export function isValidUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success;
}

export default {
  validate,
  sanitizeString,
  isValidUUID,
  loginSchema,
  registerSchema,
  parcelaSchema,
  cultivoSchema,
  inventarioSchema,
  transaccionSchema,
  paginationSchema,
};
