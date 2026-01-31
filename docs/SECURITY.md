# 🔒 Documentación de Seguridad - AgroBolivia

## Índice

1. [Visión General](#visión-general)
2. [Autenticación](#autenticación)
3. [Autorización](#autorización)
4. [Protección de Datos](#protección-de-datos)
5. [Prevención de Ataques](#prevención-de-ataques)
6. [Auditoría y Monitoreo](#auditoría-y-monitoreo)
7. [Configuración de Seguridad](#configuración-de-seguridad)
8. [Guía de Implementación](#guía-de-implementación)

---

## Visión General

AgroBolivia implementa un modelo de seguridad en capas (Defense in Depth) que protege la aplicación en múltiples niveles:

```
Usuario → HTTPS → Rate Limiting → Auth → RBAC → Validation → Encryption → Database
```

### Principios de Seguridad Aplicados

- **Mínimo Privilegio**: Usuarios solo tienen acceso a sus propios recursos
- **Defensa en Profundidad**: Múltiples capas de protección
- **Falla Segura**: En caso de error, el sistema niega acceso
- **Separación de Responsabilidades**: Código modular y auditado

---

## Autenticación

### JWT (JSON Web Tokens)

```typescript
// Estructura del token
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    sub: "user-uuid",
    email: "user@email.com",
    role: "USUARIO",
    iat: 1609459200,
    exp: 1609460100  // 15 minutos
  },
  signature: "..."
}
```

**Características:**
- Expiración corta (15 minutos)
- Firma HMAC-SHA256
- Incluye claims mínimos necesarios

### Refresh Tokens

```typescript
// Almacenamiento en base de datos
{
  id: "uuid",
  token: "hashed-refresh-token",
  userId: "user-uuid",
  expiresAt: "2024-01-07T00:00:00Z",
  createdAt: "2024-01-01T00:00:00Z"
}
```

**Flujo de renovación:**
1. Cliente envía refresh token
2. Servidor valida token en BD
3. Genera nuevo access + refresh token
4. Invalida refresh token anterior (rotación)
5. Retorna nuevos tokens

### Autenticación de Dos Factores (2FA)

```typescript
// Configuración TOTP
{
  algorithm: "sha1",
  digits: 6,
  period: 30,  // segundos
  issuer: "AgroBolivia"
}
```

**Implementación:**
- Librería: `speakeasy`
- Compatible con Google Authenticator, Authy
- Códigos de respaldo disponibles

---

## Autorización

### RBAC (Role-Based Access Control)

```typescript
enum Role {
  ADMIN = 'ADMIN',
  USUARIO = 'USUARIO',
  TECNICO = 'TECNICO',
  AUDITOR = 'AUDITOR'
}

// Permisos por rol
const PERMISOS = {
  ADMIN: ['*'],
  USUARIO: ['parcelas', 'cultivos', 'finanzas', 'inventario', 'iot', 'alertas'],
  TECNICO: ['iot', 'alertas', 'parcelas:read'],
  AUDITOR: ['security:read', 'audit:read']
}
```

### Verificación de Propiedad

```typescript
// Middleware de verificación
async function verificarPropietario(req, res, next) {
  const recurso = await prisma.parcela.findUnique({
    where: { id: req.params.id }
  });
  
  if (recurso.usuarioId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  next();
}
```

---

## Protección de Datos

### Encriptación de Contraseñas

```typescript
// bcrypt con 12 rounds
const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// Tiempo aproximado de hash: ~300ms
// Resistente a ataques de fuerza bruta
```

**Política de contraseñas:**
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial

### Encriptación de Datos Sensibles

```typescript
// AES-256-CBC
import CryptoJS from 'crypto-js';

function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

**Datos encriptados:**
- Números de teléfono
- Direcciones específicas
- Datos financieros sensibles

---

## Prevención de Ataques

### Rate Limiting

```typescript
// Configuración por tipo de endpoint
const rateLimiters = {
  general: {
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: 100,
    message: 'Demasiadas solicitudes'
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5,  // Solo 5 intentos de login
    message: 'Demasiados intentos de login'
  },
  sensitive: {
    windowMs: 60 * 60 * 1000,  // 1 hora
    max: 10,
    message: 'Límite de operaciones sensibles'
  }
}
```

### Prevención de XSS

```typescript
// Sanitización de inputs
import { sanitize } from 'express-validator';

app.use(sanitize('*').trim().escape());

// Headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"]
    }
  }
}));
```

### Prevención de SQL Injection

```typescript
// Prisma ORM con queries parametrizadas
const user = await prisma.user.findUnique({
  where: { email: userInput }  // Escapado automáticamente
});

// NUNCA hacer esto:
// const query = `SELECT * FROM users WHERE email = '${userInput}'`;
```

### Protección CSRF

```typescript
// Para formularios tradicionales
import csrf from 'csurf';
app.use(csrf({ cookie: true }));

// Para SPAs con JWT: el token en header Authorization previene CSRF
```

---

## Auditoría y Monitoreo

### Log de Auditoría

```typescript
// Estructura de log
interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  accion: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'FAILED_LOGIN';
  entidad: string;
  entidadId?: string;
  ip: string;
  userAgent: string;
  detalles?: object;
}

// Ejemplo de registro
await prisma.auditLog.create({
  data: {
    accion: 'CREATE',
    entidad: 'Transaccion',
    entidadId: transaccion.id,
    usuarioId: req.user.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    detalles: { monto: transaccion.monto }
  }
});
```

### Monitoreo de Sesiones

```typescript
// Tracking de sesiones activas
const session = await prisma.session.create({
  data: {
    userId: user.id,
    token: hashedRefreshToken,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
});

// Actualización de última actividad
await prisma.session.update({
  where: { id: session.id },
  data: { lastActivity: new Date() }
});
```

### Detección de Actividad Sospechosa

```typescript
// Patrones monitoreados
const SUSPICIOUS_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,  // SQL Injection
  /<script[^>]*>|javascript:/i,       // XSS
  /\.\.\//,                           // Path Traversal
  /union.*select/i,                   // SQL Union
];

function detectSuspiciousActivity(req) {
  const input = JSON.stringify(req.body) + req.url;
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(input)) {
      logger.warn('Actividad sospechosa detectada', {
        ip: req.ip,
        pattern: pattern.toString(),
        url: req.url
      });
      return true;
    }
  }
  return false;
}
```

---

## Configuración de Seguridad

### Variables de Entorno Requeridas

```bash
# JWT - Mínimo 256 bits de entropía
JWT_SECRET=<random-256-bit-hex>
JWT_REFRESH_SECRET=<different-random-256-bit-hex>

# Encriptación - Exactamente 32 caracteres
ENCRYPTION_KEY=<random-32-character-string>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# 2FA
TWO_FACTOR_APP_NAME=AgroBolivia
```

### Generación de Secrets Seguros

```bash
# Generar JWT secret (Linux/Mac)
openssl rand -hex 64

# Generar encryption key
openssl rand -base64 32 | head -c 32

# En Node.js
require('crypto').randomBytes(64).toString('hex')
```

### Headers de Seguridad (Helmet.js)

```typescript
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));
```

---

## Guía de Implementación

### Checklist de Seguridad para Producción

- [ ] HTTPS configurado con certificados válidos
- [ ] Variables de entorno seguras (no en código)
- [ ] Rate limiting activado
- [ ] Logs de auditoría configurados
- [ ] Backup automático de base de datos
- [ ] Monitoreo de errores configurado
- [ ] 2FA disponible para todos los usuarios
- [ ] Headers de seguridad configurados
- [ ] CORS configurado correctamente
- [ ] Dependencias actualizadas

### Respuesta a Incidentes

1. **Detección de Breach**
   - Revisar logs de auditoría
   - Identificar sesiones comprometidas
   - Bloquear IPs sospechosas

2. **Contención**
   - Invalidar todos los tokens del usuario afectado
   - Bloquear cuenta temporalmente
   - Notificar al usuario

3. **Recuperación**
   - Forzar cambio de contraseña
   - Revisar actividad de la cuenta
   - Habilitar 2FA obligatorio

4. **Post-Incidente**
   - Documentar el incidente
   - Actualizar políticas si es necesario
   - Implementar controles adicionales

---

## Contacto de Seguridad

Para reportar vulnerabilidades de seguridad:
- Email: security@agrobolivia.bo
- No reportar públicamente hasta que sea parcheado
- Tiempo de respuesta esperado: 24-48 horas

---

*Documento actualizado: Enero 2024*
*Versión: 1.0*
