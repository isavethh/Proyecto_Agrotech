import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Servidor
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  // Base de datos
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Encriptación
  encryption: {
    key: process.env.ENCRYPTION_KEY || '',
  },

  // 2FA
  twoFactor: {
    appName: process.env.TWO_FACTOR_APP_NAME || 'AgroBolivia',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // Servicios externos
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  weather: {
    apiKey: process.env.WEATHER_API_KEY || '',
  },
} as const;

// Validar configuración crítica
export function validateConfig(): void {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  
  const missing = requiredVars.filter((varName) => !process.env[varName]);
  
  if (missing.length > 0 && config.nodeEnv === 'production') {
    throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
  }
}

export default config;
