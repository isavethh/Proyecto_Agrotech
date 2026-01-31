import { Router } from 'express';
import { authenticate, authorize, generateTokenPair, blacklistToken } from '../../middleware/auth.js';
import { authRateLimiter } from '../../middleware/security.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { 
  auditLoginSuccess, 
  auditLoginFailed, 
  auditLogout,
  auditPasswordChange,
  audit2FAEnabled,
  audit2FAFailed
} from '../../middleware/audit.js';
import { successResponse, errorResponse, unauthorizedError } from '../../utils/response.js';
import { validate, loginSchema, registerSchema, changePasswordSchema, twoFactorSchema } from '../../utils/validators.js';
import { prisma } from '../../database/index.js';
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/index.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

// ============================================
// REGISTRO DE USUARIO
// ============================================
router.post(
  '/register',
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const validation = validate(registerSchema, req.body);
    
    if (!validation.success) {
      return errorResponse(res, 'Error de validación', 400, 'VALIDATION_ERROR', validation.errors);
    }
    
    const { email, password, nombre, apellido, telefono, departamento, comunidad } = validation.data!;
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return errorResponse(res, 'El email ya está registrado', 409, 'EMAIL_EXISTS');
    }
    
    // Hash de contraseña
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Crear usuario
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        passwordHash,
        nombre,
        apellido,
        telefono,
        departamento,
        comunidad,
        role: ROLES.AGRICULTOR,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        role: true,
        createdAt: true,
      },
    });
    
    // Crear configuración por defecto
    await prisma.configuracionUsuario.create({
      data: {
        userId: user.id,
      },
    });
    
    return successResponse(res, user, 'Usuario registrado exitosamente', 201);
  })
);

// ============================================
// LOGIN
// ============================================
router.post(
  '/login',
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const validation = validate(loginSchema, req.body);
    
    if (!validation.success) {
      return errorResponse(res, 'Error de validación', 400, 'VALIDATION_ERROR', validation.errors);
    }
    
    const { email, password } = validation.data!;
    
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      await auditLoginFailed(email, 'User not found', req.ip, req.get('user-agent'));
      return unauthorizedError(res, 'Credenciales inválidas');
    }
    
    // Verificar si está bloqueado
    if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
      await auditLoginFailed(email, 'Account locked', req.ip, req.get('user-agent'));
      return errorResponse(res, 'Cuenta bloqueada temporalmente. Intente más tarde.', 423, 'ACCOUNT_LOCKED');
    }
    
    // Verificar contraseña
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordValid) {
      // Incrementar intentos fallidos
      const intentos = user.intentosFallidos + 1;
      const updateData: { intentosFallidos: number; bloqueadoHasta?: Date } = {
        intentosFallidos: intentos,
      };
      
      // Bloquear después de 5 intentos
      if (intentos >= 5) {
        updateData.bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
      
      await auditLoginFailed(email, 'Invalid password', req.ip, req.get('user-agent'));
      return unauthorizedError(res, 'Credenciales inválidas');
    }
    
    // Verificar si tiene 2FA habilitado
    if (user.twoFactorEnabled) {
      // Generar token temporal para 2FA
      const tempToken = uuidv4();
      
      await prisma.session.create({
        data: {
          userId: user.id,
          token: tempToken,
          refreshToken: 'pending-2fa',
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos para completar 2FA
        },
      });
      
      return successResponse(res, {
        requires2FA: true,
        tempToken,
      }, '2FA requerido');
    }
    
    // Generar tokens
    const sessionId = uuidv4();
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    });
    
    // Guardar sesión
    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    });
    
    // Actualizar último login y resetear intentos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ultimoLogin: new Date(),
        intentosFallidos: 0,
        bloqueadoHasta: null,
      },
    });
    
    await auditLoginSuccess(user.id, req.ip, req.get('user-agent'));
    
    return successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
      },
      tokens,
    }, 'Login exitoso');
  })
);

// ============================================
// VERIFICAR 2FA
// ============================================
router.post(
  '/verify-2fa',
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const { tempToken, token } = req.body;
    
    const validation = validate(twoFactorSchema, { token });
    if (!validation.success) {
      return errorResponse(res, 'Código inválido', 400, 'INVALID_CODE');
    }
    
    // Buscar sesión temporal
    const session = await prisma.session.findFirst({
      where: {
        token: tempToken,
        refreshToken: 'pending-2fa',
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
    
    if (!session) {
      return errorResponse(res, 'Sesión expirada', 401, 'SESSION_EXPIRED');
    }
    
    // Verificar código 2FA
    const verified = speakeasy.totp.verify({
      secret: session.user.twoFactorSecret!,
      encoding: 'base32',
      token,
      window: 1,
    });
    
    if (!verified) {
      await audit2FAFailed(session.user.id, req.ip);
      return errorResponse(res, 'Código incorrecto', 401, 'INVALID_2FA_CODE');
    }
    
    // Eliminar sesión temporal
    await prisma.session.delete({ where: { id: session.id } });
    
    // Generar tokens reales
    const sessionId = uuidv4();
    const tokens = generateTokenPair({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId,
    });
    
    // Guardar nueva sesión
    await prisma.session.create({
      data: {
        userId: session.user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    await auditLoginSuccess(session.user.id, req.ip, req.get('user-agent'));
    
    return successResponse(res, {
      user: {
        id: session.user.id,
        email: session.user.email,
        nombre: session.user.nombre,
        apellido: session.user.apellido,
        role: session.user.role,
      },
      tokens,
    }, '2FA verificado exitosamente');
  })
);

// ============================================
// HABILITAR 2FA
// ============================================
router.post(
  '/enable-2fa',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    
    if (!user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }
    
    if (user.twoFactorEnabled) {
      return errorResponse(res, '2FA ya está habilitado', 400);
    }
    
    // Generar secreto
    const secret = speakeasy.generateSecret({
      name: `${config.twoFactor.appName} (${user.email})`,
      length: 20,
    });
    
    // Guardar secreto temporalmente (se confirma con verify)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret.base32 },
    });
    
    // Generar QR
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    return successResponse(res, {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    }, 'Escanea el código QR con tu app de autenticación');
  })
);

// ============================================
// CONFIRMAR 2FA
// ============================================
router.post(
  '/confirm-2fa',
  authenticate,
  asyncHandler(async (req, res) => {
    const { token } = req.body;
    
    const validation = validate(twoFactorSchema, { token });
    if (!validation.success) {
      return errorResponse(res, 'Código inválido', 400);
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    
    if (!user || !user.twoFactorSecret) {
      return errorResponse(res, 'Primero debes generar el código QR', 400);
    }
    
    // Verificar código
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
    
    if (!verified) {
      return errorResponse(res, 'Código incorrecto', 401);
    }
    
    // Habilitar 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });
    
    await audit2FAEnabled(user.id, req.ip);
    
    return successResponse(res, null, '2FA habilitado exitosamente');
  })
);

// ============================================
// LOGOUT
// ============================================
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    // Agregar token a blacklist
    if (req.token) {
      blacklistToken(req.token);
    }
    
    // Eliminar sesión de la BD
    await prisma.session.deleteMany({
      where: { userId: req.user!.userId },
    });
    
    await auditLogout(req.user!.userId, req.ip);
    
    return successResponse(res, null, 'Sesión cerrada exitosamente');
  })
);

// ============================================
// CAMBIAR CONTRASEÑA
// ============================================
router.post(
  '/change-password',
  authenticate,
  asyncHandler(async (req, res) => {
    const validation = validate(changePasswordSchema, req.body);
    
    if (!validation.success) {
      return errorResponse(res, 'Error de validación', 400, 'VALIDATION_ERROR', validation.errors);
    }
    
    const { currentPassword, newPassword } = validation.data!;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    
    if (!user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }
    
    // Verificar contraseña actual
    const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!passwordValid) {
      return errorResponse(res, 'Contraseña actual incorrecta', 401);
    }
    
    // Hash nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    
    // Invalidar todas las sesiones
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
    
    await auditPasswordChange(user.id, req.ip);
    
    return successResponse(res, null, 'Contraseña cambiada. Por favor, inicia sesión nuevamente.');
  })
);

// ============================================
// OBTENER PERFIL
// ============================================
router.get(
  '/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        departamento: true,
        comunidad: true,
        role: true,
        twoFactorEnabled: true,
        ultimoLogin: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }
    
    return successResponse(res, user);
  })
);

// ============================================
// ACTUALIZAR PERFIL
// ============================================
router.patch(
  '/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    const { nombre, apellido, telefono, departamento, comunidad } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(nombre && { nombre }),
        ...(apellido && { apellido }),
        ...(telefono && { telefono }),
        ...(departamento && { departamento }),
        ...(comunidad && { comunidad }),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        departamento: true,
        comunidad: true,
        role: true,
      },
    });
    
    return successResponse(res, user, 'Perfil actualizado');
  })
);

export default router;
