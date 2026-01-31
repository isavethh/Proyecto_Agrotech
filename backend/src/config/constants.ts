// ============================================
// CONSTANTES DEL SISTEMA AGROBOLIVIA
// ============================================

// Roles de usuario
export const ROLES = {
  ADMIN: 'ADMIN',
  AGRICULTOR: 'AGRICULTOR',
  TECNICO: 'TECNICO',
  VIEWER: 'VIEWER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Estados de cultivo
export const CROP_STATUS = {
  PLANIFICADO: 'PLANIFICADO',
  SEMBRADO: 'SEMBRADO',
  EN_CRECIMIENTO: 'EN_CRECIMIENTO',
  FLORECIENDO: 'FLORECIENDO',
  MADURANDO: 'MADURANDO',
  LISTO_COSECHA: 'LISTO_COSECHA',
  COSECHADO: 'COSECHADO',
  PERDIDO: 'PERDIDO',
} as const;

// Tipos de transacción financiera
export const TRANSACTION_TYPES = {
  INGRESO: 'INGRESO',
  GASTO: 'GASTO',
} as const;

// Categorías de gastos
export const EXPENSE_CATEGORIES = {
  SEMILLAS: 'SEMILLAS',
  FERTILIZANTES: 'FERTILIZANTES',
  PESTICIDAS: 'PESTICIDAS',
  HERRAMIENTAS: 'HERRAMIENTAS',
  MANO_OBRA: 'MANO_OBRA',
  TRANSPORTE: 'TRANSPORTE',
  RIEGO: 'RIEGO',
  OTROS: 'OTROS',
} as const;

// Categorías de ingresos
export const INCOME_CATEGORIES = {
  VENTA_COSECHA: 'VENTA_COSECHA',
  SUBSIDIO: 'SUBSIDIO',
  OTROS: 'OTROS',
} as const;

// Tipos de alerta
export const ALERT_TYPES = {
  CLIMA: 'CLIMA',
  RIEGO: 'RIEGO',
  PLAGA: 'PLAGA',
  INVENTARIO: 'INVENTARIO',
  FINANZAS: 'FINANZAS',
  SISTEMA: 'SISTEMA',
  SEGURIDAD: 'SEGURIDAD',
} as const;

// Prioridades de alerta
export const ALERT_PRIORITIES = {
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  CRITICA: 'CRITICA',
} as const;

// Tipos de sensor IoT
export const SENSOR_TYPES = {
  TEMPERATURA_SUELO: 'TEMPERATURA_SUELO',
  HUMEDAD_SUELO: 'HUMEDAD_SUELO',
  PH_SUELO: 'PH_SUELO',
  NUTRIENTES: 'NUTRIENTES',
  TEMPERATURA_AMBIENTE: 'TEMPERATURA_AMBIENTE',
  HUMEDAD_AMBIENTE: 'HUMEDAD_AMBIENTE',
  LLUVIA: 'LLUVIA',
  VIENTO: 'VIENTO',
  RADIACION_SOLAR: 'RADIACION_SOLAR',
} as const;

// Unidades de medida bolivianas
export const UNITS = {
  // Área
  HECTAREA: 'ha',
  METRO_CUADRADO: 'm²',
  
  // Peso
  KILOGRAMO: 'kg',
  QUINTAL: 'qq',      // 100 libras = ~46 kg
  ARROBA: '@',        // 25 libras = ~11.5 kg
  LIBRA: 'lb',
  
  // Volumen
  LITRO: 'L',
  
  // Temperatura
  CELSIUS: '°C',
  
  // Porcentaje
  PORCENTAJE: '%',
  
  // Moneda
  BOLIVIANO: 'Bs',
} as const;

// Cultivos comunes en Bolivia
export const COMMON_CROPS = [
  'Papa',
  'Papa Huaycha',
  'Papa Imilla',
  'Quinua',
  'Haba',
  'Cebolla',
  'Zanahoria',
  'Lechuga',
  'Tomate',
  'Maíz',
  'Trigo',
  'Cebada',
  'Arveja',
  'Ají',
  'Locoto',
  'Chuño',
] as const;

// Departamentos de Bolivia
export const DEPARTAMENTOS = [
  'La Paz',
  'Cochabamba',
  'Santa Cruz',
  'Oruro',
  'Potosí',
  'Chuquisaca',
  'Tarija',
  'Beni',
  'Pando',
] as const;

// Eventos de auditoría
export const AUDIT_EVENTS = {
  // Autenticación
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  TWO_FACTOR_ENABLED: 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED: 'TWO_FACTOR_DISABLED',
  TWO_FACTOR_FAILED: 'TWO_FACTOR_FAILED',
  
  // Datos
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  EXPORT: 'EXPORT',
  
  // Seguridad
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  TOKEN_BLACKLISTED: 'TOKEN_BLACKLISTED',
} as const;

export type AuditEvent = (typeof AUDIT_EVENTS)[keyof typeof AUDIT_EVENTS];
