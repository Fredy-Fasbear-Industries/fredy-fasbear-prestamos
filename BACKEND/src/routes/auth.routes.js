import express from 'express';
import authController from '../controllers/auth.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intenta en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Solo cuenta intentos fallidos
});

router.use((req, res, next) => {
  console.log(`Auth API: ${req.method} ${req.path}`);
  next();
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);

router.post('/verificar-email', authController.verificarEmail);
router.post('/reenviar-verificacion', authLimiter, authController.reenviarVerificacion);

router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

router.get('/me', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/change-password', authenticateToken, authController.changePassword);

router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('[AUTH] Obteniendo lista de usuarios...');
    
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        emailVerificado: true,
        tipoUsuario: true,
        estado: true,
        fechaRegistro: true,
        cedula: true,
        telefono: true
      },
      orderBy: { fechaRegistro: 'desc' }
    });

    console.log(`[AUTH] ${users.length} usuarios encontrados`);

    res.status(200).json({
      success: true,
      data: { users }
    });
    
  } catch (error) {
    console.error('[ERROR] Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.use((error, req, res, next) => {
  console.error('Error en rutas de auth:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en autenticación',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;