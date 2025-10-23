import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware para verificar token JWT
 */
export const verificarToken = async (req, res, next) => {
  try {
    console.log(' Verificando token de autenticación...');

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log(' No se proporcionó header de autorización');
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        codigo: 'TOKEN_REQUERIDO'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log(' Formato de header Authorization inválido');
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
        codigo: 'FORMATO_TOKEN_INVALIDO'
      });
    }

    const token = authHeader.substring(7);

    if (!token) {
      console.log(' Token vacío');
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        codigo: 'TOKEN_VACIO'
      });
    }

    console.log(' Verificando token JWT...');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.log(' Error verificando JWT:', jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado',
          codigo: 'TOKEN_EXPIRADO'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido',
          codigo: 'TOKEN_INVALIDO'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Error al verificar token',
        codigo: 'ERROR_VERIFICACION_TOKEN'
      });
    }

    console.log(' Buscando usuario en la base de datos...');

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        tipoUsuario: true,
        estado: true,
        fechaRegistro: true
      }
    });

    if (!usuario) {
      console.log(' Usuario no encontrado en la base de datos');
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
        codigo: 'USUARIO_NO_ENCONTRADO'
      });
    }

    if (usuario.estado !== 'Activo') {
      console.log(' Usuario inactivo:', usuario.estado);
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo',
        codigo: 'USUARIO_INACTIVO',
        estado: usuario.estado
      });
    }

    req.user = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
      estado: usuario.estado
    };

    console.log(' Token verificado exitosamente para:', usuario.email);
    next();

  } catch (error) {
    console.error(' Error en middleware de autenticación:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno de autenticación',
      codigo: 'ERROR_INTERNO_AUTH',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware para verificar rol de usuario
 */
export const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        console.log(' No hay usuario autenticado para verificar rol');
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          codigo: 'USUARIO_NO_AUTENTICADO'
        });
      }

      const tipoUsuario = req.user.tipoUsuario;

      if (!rolesPermitidos.includes(tipoUsuario)) {
        console.log(` Rol no autorizado. Usuario: ${tipoUsuario}, Permitidos:`, rolesPermitidos);
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso',
          codigo: 'ACCESO_DENEGADO',
          rolRequerido: rolesPermitidos,
          rolActual: tipoUsuario
        });
      }

      console.log(` Rol verificado: ${tipoUsuario}`);
      next();

    } catch (error) {
      console.error(' Error verificando rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        codigo: 'ERROR_VERIFICACION_ROL',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Middleware opcional para verificar token (no falla si no hay token)
 */
export const verificarTokenOpcional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const usuario = await prisma.usuario.findUnique({
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

      if (usuario && usuario.estado === 'Activo') {
        req.user = {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          tipoUsuario: usuario.tipoUsuario,
          estado: usuario.estado
        };
      } else {
        req.user = null;
      }

    } catch (jwtError) {
      req.user = null;
    }

    next();

  } catch (error) {
    console.error(' Error en verificación opcional de token:', error);
    req.user = null;
    next();
  }
};

/**
 * Middleware para logging de acceso
 */
export const logAccess = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  const usuario = req.user ? `${req.user.nombre} (${req.user.email})` : 'Anónimo';

  console.log(` [${timestamp}] ${method} ${url} - Usuario: ${usuario} - IP: ${ip}`);

  next();
};

/**
 * Middleware para verificar que el usuario sea propietario del recurso o tenga rol admin
 */
export const verificarPropietarioOAdmin = (idParam = 'id') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          codigo: 'USUARIO_NO_AUTENTICADO'
        });
      }

      const recursoId = parseInt(req.params[idParam]);
      const usuarioId = req.user.id;
      const esAdmin = req.user.tipoUsuario === 'Administrador';

      if (recursoId !== usuarioId && !esAdmin) {
        console.log(` Acceso denegado. Usuario ${usuarioId} intentó acceder al recurso ${recursoId}`);
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso',
          codigo: 'ACCESO_DENEGADO'
        });
      }

      next();

    } catch (error) {
      console.error(' Error verificando propietario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        codigo: 'ERROR_VERIFICACION_PROPIETARIO'
      });
    }
  };
};