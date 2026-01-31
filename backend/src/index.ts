import express, { Express } from 'express';
import compression from 'compression';
import morgan from 'morgan';
import { config, validateConfig } from './config/index.js';
import { securityMiddlewares } from './middleware/security.js';
import { auditMiddleware } from './middleware/audit.js';
import { notFoundHandler, errorHandler, setupGlobalErrorHandlers } from './middleware/errorHandler.js';
import { connectDatabase } from './database/index.js';
import { logInfo, logError } from './utils/logger.js';

// Importar rutas
import authRoutes from './modules/auth/auth.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import parcelasRoutes from './modules/parcelas/parcelas.routes.js';
import finanzasRoutes from './modules/finanzas/finanzas.routes.js';
import inventarioRoutes from './modules/inventario/inventario.routes.js';
import iotRoutes from './modules/iot/iot.routes.js';
import alertasRoutes from './modules/alertas/alertas.routes.js';
import securityRoutes from './modules/security/security.routes.js';

// Configurar manejo global de errores
setupGlobalErrorHandlers();

// Validar configuración
validateConfig();

const app: Express = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Compresión de respuestas
app.use(compression());

// Logging HTTP
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logInfo(message.trim()),
  },
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middlewares de seguridad
app.use(securityMiddlewares);

// Auditoría
app.use(auditMiddleware);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: config.apiVersion,
  });
});

// ============================================
// RUTAS DE LA API
// ============================================
const apiPrefix = `/api/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/parcelas`, parcelasRoutes);
app.use(`${apiPrefix}/finanzas`, finanzasRoutes);
app.use(`${apiPrefix}/inventario`, inventarioRoutes);
app.use(`${apiPrefix}/iot`, iotRoutes);
app.use(`${apiPrefix}/alertas`, alertasRoutes);
app.use(`${apiPrefix}/security`, securityRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================
async function startServer(): Promise<void> {
  try {
    // Conectar a base de datos
    await connectDatabase();
    
    // Iniciar servidor HTTP
    app.listen(config.port, () => {
      logInfo(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🌱 AGROBOLIVIA API - Sistema Agrícola Integral           ║
║                                                               ║
║     Servidor: http://localhost:${config.port}                        ║
║     API: http://localhost:${config.port}${apiPrefix}                ║
║     Ambiente: ${config.nodeEnv.padEnd(44)}║
║                                                               ║
║     📊 Dashboard: ${apiPrefix}/dashboard                  ║
║     🔐 Auth: ${apiPrefix}/auth                            ║
║     🗺️  Parcelas: ${apiPrefix}/parcelas                   ║
║     💰 Finanzas: ${apiPrefix}/finanzas                    ║
║     📦 Inventario: ${apiPrefix}/inventario                ║
║     📡 IoT: ${apiPrefix}/iot                              ║
║     🚨 Alertas: ${apiPrefix}/alertas                      ║
║     🛡️  Security: ${apiPrefix}/security                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logError('Error al iniciar el servidor', error);
    process.exit(1);
  }
}

startServer();

export default app;
