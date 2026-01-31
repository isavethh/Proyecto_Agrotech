import winston from 'winston';
import path from 'path';
import { config } from '../config/index.js';

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Formato para consola con colores
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  customFormat
);

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');

// Configurar transports
const transports: winston.transport[] = [
  // Consola - siempre activo
  new winston.transports.Console({
    format: consoleFormat,
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
  }),
];

// En producción, agregar archivos de log
if (config.nodeEnv === 'production') {
  transports.push(
    // Archivo de errores
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Archivo combinado
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: customFormat,
      maxsize: 5242880,
      maxFiles: 5,
    })
  );
}

// Crear logger
export const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: customFormat,
  defaultMeta: { service: 'agrobolivia-api' },
  transports,
  // No salir en errores no capturados
  exitOnError: false,
});

// Logger específico para auditoría de seguridad
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'agrobolivia-security' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Archivo de auditoría de seguridad
    ...(config.nodeEnv === 'production'
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, 'security.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 10,
          }),
        ]
      : []),
  ],
});

// Funciones de utilidad para logging
export const logInfo = (message: string, meta?: object) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error | unknown, meta?: object) => {
  if (error instanceof Error) {
    logger.error(message, { error: error.message, stack: error.stack, ...meta });
  } else {
    logger.error(message, { error, ...meta });
  }
};

export const logWarning = (message: string, meta?: object) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: object) => {
  logger.debug(message, meta);
};

export const logSecurity = (event: string, meta?: object) => {
  securityLogger.info(event, meta);
};

export default logger;
