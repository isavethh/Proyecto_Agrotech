import { PrismaClient } from '@prisma/client';
import { logInfo, logError } from '../utils/logger.js';

/**
 * Cliente Prisma singleton
 * Evita múltiples conexiones en desarrollo con hot-reload
 */

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });
};

export const prisma = globalThis.__prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Eventos de logging
prisma.$on('query' as never, (e: { query: string; duration: number }) => {
  if (process.env.NODE_ENV === 'development') {
    logInfo(`Query: ${e.query} (${e.duration}ms)`);
  }
});

prisma.$on('error' as never, (e: { message: string }) => {
  logError('Prisma Error', new Error(e.message));
});

/**
 * Conectar a la base de datos
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logInfo('✅ Conectado a la base de datos PostgreSQL');
  } catch (error) {
    logError('❌ Error conectando a la base de datos', error);
    throw error;
  }
}

/**
 * Desconectar de la base de datos
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logInfo('🔌 Desconectado de la base de datos');
}

export default prisma;
