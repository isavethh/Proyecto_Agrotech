# 🌱 AgroBolivia - Sistema de Gestión Agrícola Inteligente

![AgroBolivia](https://img.shields.io/badge/AgroBolivia-v1.0-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

Sistema integral de gestión agrícola diseñado específicamente para pequeños agricultores bolivianos, con énfasis en seguridad, monitoreo IoT e inteligencia artificial.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura de Seguridad](#-arquitectura-de-seguridad)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [API Reference](#-api-reference)
- [Contribución](#-contribución)

## ✨ Características

### 🏡 Gestión Agrícola
- **Parcelas**: Administración completa de terrenos con geolocalización
- **Cultivos**: Seguimiento del ciclo de vida de cultivos
- **Inventario**: Control de insumos, semillas, herramientas y cosechas
- **Finanzas**: Registro de ingresos/gastos con análisis de rentabilidad

### 📡 IoT & Monitoreo
- Integración con sensores de humedad, temperatura, pH y más
- Dashboard en tiempo real con histórico de datos
- Alertas automáticas por condiciones anormales
- API de ingesta para dispositivos IoT

### 🤖 Inteligencia Artificial
- Análisis financiero predictivo
- Recomendaciones de cultivo basadas en condiciones
- Alertas de cosecha óptima
- Pronósticos meteorológicos integrados

### 🔒 Seguridad Avanzada
- Autenticación JWT con tokens de refresco
- Autenticación de dos factores (2FA/TOTP)
- Rate limiting y protección contra brute force
- Encriptación AES-256 para datos sensibles
- Auditoría completa de acciones

## 🛡️ Arquitectura de Seguridad

### Capas de Protección

```
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                     │
│  - HTTPS obligatorio en producción                          │
│  - CSP (Content Security Policy)                            │
│  - Headers de seguridad (Helmet.js)                         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE TRANSPORTE                       │
│  - Rate Limiting (100 req/15min general)                    │
│  - Rate Limiting Auth (5 intentos/15min)                    │
│  - Rate Limiting Sensitivo (10 req/hora)                    │
│  - Detección de actividad sospechosa                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE AUTENTICACIÓN                    │
│  - JWT con firma RS256/HS256                                │
│  - Refresh Tokens con rotación                              │
│  - 2FA TOTP (Google Authenticator compatible)               │
│  - Blacklist de tokens revocados                            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE AUTORIZACIÓN                     │
│  - RBAC (Role-Based Access Control)                         │
│  - Verificación de propiedad de recursos                    │
│  - Permisos granulares por módulo                           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE DATOS                            │
│  - Encriptación AES-256 para datos sensibles                │
│  - Hashing bcrypt (12 rounds) para contraseñas              │
│  - Sanitización de inputs (XSS prevention)                  │
│  - Validación con Zod schemas                               │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE AUDITORÍA                        │
│  - Log de todas las acciones CRUD                           │
│  - Registro de intentos de login                            │
│  - Tracking de sesiones activas                             │
│  - Alertas de seguridad                                     │
└─────────────────────────────────────────────────────────────┘
```

### Características de Seguridad Implementadas

| Característica | Descripción | Implementación |
|----------------|-------------|----------------|
| **Autenticación JWT** | Tokens de acceso de corta vida | 15 minutos de expiración |
| **Refresh Tokens** | Renovación segura de sesión | 7 días, rotación en cada uso |
| **2FA/TOTP** | Segundo factor de autenticación | speakeasy + QRCode |
| **Rate Limiting** | Protección contra DoS/brute force | express-rate-limit |
| **Password Hashing** | Almacenamiento seguro | bcrypt (12 rounds) |
| **Data Encryption** | Protección de datos sensibles | AES-256-CBC |
| **Input Validation** | Prevención de inyección | Zod schemas |
| **XSS Prevention** | Sanitización de entradas | express-validator |
| **CORS** | Control de origen | Lista blanca configurable |
| **Security Headers** | Protección HTTP | Helmet.js |
| **Audit Logging** | Trazabilidad | Winston + PostgreSQL |
| **Session Management** | Control de sesiones | Blacklist + tracking |

## 🛠️ Tecnologías

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Lenguaje**: TypeScript 5.x
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL 15

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Estilos**: TailwindCSS
- **Estado**: Zustand
- **Charts**: Chart.js
- **Formularios**: React Hook Form

### Seguridad
- **JWT**: jsonwebtoken
- **2FA**: speakeasy + qrcode
- **Hashing**: bcrypt
- **Encryption**: crypto-js
- **Headers**: helmet
- **Rate Limit**: express-rate-limit
- **Validation**: zod

### DevOps
- **Containers**: Docker & Docker Compose
- **Logs**: Winston
- **IoT Simulator**: Python

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (opcional)
- Python 3.11+ (para simulador IoT)

### Opción 1: Docker (Recomendado)

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/agrobolivia.git
cd agrobolivia

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Opción 2: Instalación Manual

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev

# IoT Simulator (opcional)
cd iot-simulator
pip install -r requirements.txt
python simulator.py
```

## ⚙️ Configuración

### Variables de Entorno (Backend)

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/agrobolivia"

# JWT
JWT_SECRET="tu-secreto-jwt-muy-seguro"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="tu-secreto-refresh-muy-seguro"
JWT_REFRESH_EXPIRES_IN="7d"

# Encriptación
ENCRYPTION_KEY="clave-aes-256-bits-muy-segura"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX="100"

# IoT
IOT_API_KEY="tu-api-key-para-iot"
```

### Usuarios de Demostración

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Juan Mamani | juan.mamani@agrobolivia.bo | JuanMamani2024! | USUARIO |
| Admin | admin@agrobolivia.bo | Admin2024!@# | ADMIN |

## 📚 API Reference

### Autenticación

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/2fa/setup
POST /api/v1/auth/2fa/enable
POST /api/v1/auth/verify-2fa
```

### Recursos Protegidos

```http
GET  /api/v1/dashboard
GET  /api/v1/parcelas
POST /api/v1/parcelas
GET  /api/v1/finanzas/transacciones
POST /api/v1/finanzas/transacciones
GET  /api/v1/finanzas/analisis-ia
GET  /api/v1/inventario
POST /api/v1/inventario/:id/movimiento
GET  /api/v1/iot/sensores
GET  /api/v1/iot/dashboard
POST /api/v1/iot/ingest
GET  /api/v1/alertas
PATCH /api/v1/alertas/:id/resolver
```

### Seguridad (Solo Admin)

```http
GET  /api/v1/security/stats
GET  /api/v1/security/login-attempts
GET  /api/v1/security/sessions
GET  /api/v1/security/audit-logs
POST /api/v1/security/block-user/:id
POST /api/v1/security/unblock-user/:id
```

## 📊 Métricas de Seguridad

El sistema registra y monitorea:

- ✅ Intentos de login (exitosos/fallidos)
- ✅ Sesiones activas por usuario
- ✅ IPs sospechosas
- ✅ Rate limiting hits
- ✅ Acciones CRUD por usuario
- ✅ Cambios de configuración
- ✅ Intentos de acceso no autorizado

## 🔐 Recomendaciones de Seguridad para Producción

1. **HTTPS Obligatorio**: Usar certificados SSL/TLS válidos
2. **Variables de Entorno**: Nunca commitear secrets
3. **Backup**: Implementar respaldos automáticos de BD
4. **Monitoreo**: Configurar alertas para eventos críticos
5. **Actualizaciones**: Mantener dependencias actualizadas
6. **WAF**: Considerar un Web Application Firewall
7. **Logs**: Centralizar logs con ELK Stack o similar

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**🌱 AgroBolivia** - Hecho con ❤️ en Bolivia

*Tecnología al servicio de la agricultura*

</div>
