import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

async function executeWithRetry(fn, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isConnectionError = 
        error.code === 'P1001' || 
        error.code === 'P1008' ||
        error.message?.includes("Can't reach database");

      if (isConnectionError && attempt < maxRetries) {
        console.log(`Intento ${attempt}/${maxRetries} falló, reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      throw error;
    }
  }
}

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await executeWithRetry(async () => {
      return await prisma.usuario.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          tipoUsuario: true,
          estado: true
        }
      });
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (usuario.estado !== 'Activo') {
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    req.user = usuario;
    next();

  } catch (error) {
    console.error('[ERROR] Error en middleware de auth:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    return res.status(503).json({
      success: false,
      message: 'Servicio temporalmente no disponible, reintente en unos segundos'
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.tipoUsuario !== 'Administrador') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: Se requieren permisos de administrador'
    });
  }
  next();
};

export const requireClient = (req, res, next) => {
  if (req.user?.tipoUsuario !== 'Cliente') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: Se requieren permisos de cliente'
    });
  }
  next();
};

// ===== NUEVOS MIDDLEWARE PARA EVALUADOR =====

export const requireEvaluador = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (req.user.tipoUsuario !== 'Evaluador') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: Se requieren permisos de evaluador'
    });
  }

  next();
};

export const requireCobrador = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  if (req.user.tipoUsuario !== 'Cobrador') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: Se requieren permisos de cobrador'
    });
  }

  next();
};

export const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }

  const rolesPermitidos = ['Administrador', 'Evaluador', 'Cobrador'];
  
  if (!rolesPermitidos.includes(req.user.tipoUsuario)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: Se requieren permisos de personal interno'
    });
  }

  next();
};

export const requireRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!rolesPermitidos.includes(req.user.tipoUsuario)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};
export default authenticateToken;