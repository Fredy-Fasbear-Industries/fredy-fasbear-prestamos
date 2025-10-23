// BACKEND/src/middleware/errorHandler.middleware.js
import fs from 'fs/promises';
import path from 'path';

/**
 * Middleware principal para manejo de errores
 */
export const errorHandler = (error, req, res, next) => {
  console.error(' Error capturado por errorHandler:', { message: error.message, stack: error.stack, url: req.originalUrl, method: req.method, user: req.user?.email || 'Anónimo', timestamp: new Date().toISOString()
  });

  // Log detallado en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error(' Detalles del error:', error);
  }

  // Si ya se envió una respuesta, delegar al manejador por defecto de Express
  if (res.headersSent) {
    console.log(' Headers ya enviados, delegando a Express');
    return next(error);
  }

  // Determinar código de estado y mensaje
  let statusCode = 500;
  let message = 'Error interno del servidor';
  let codigo = 'ERROR_INTERNO';
  let details = null;

  // Manejar diferentes tipos de errores
  if (error.name === 'ValidationError') {
    // Errores de validación de Mongoose o similar
    statusCode = 400;
    message = 'Error de validación';
    codigo = 'VALIDACION_ERROR';
    details = error.errors;
  } else if (error.name === 'CastError') {
    // Errores de cast (IDs inválidos, etc.)
    statusCode = 400;
    message = 'Formato de datos inválido';
    codigo = 'FORMATO_INVALIDO';
  } else if (error.code === 'P2002') {
    // Error de Prisma - constraint único violado
    statusCode = 400;
    message = 'Datos duplicados';
    codigo = 'DATOS_DUPLICADOS';
    details = { field: error.meta?.target };
  } else if (error.code === 'P2025') {
    // Error de Prisma - registro no encontrado
    statusCode = 404;
    message = 'Registro no encontrado';
    codigo = 'REGISTRO_NO_ENCONTRADO';
  } else if (error.code === 'P2003') {
    // Error de Prisma - violación de foreign key
    statusCode = 400;
    message = 'Referencia inválida';
    codigo = 'REFERENCIA_INVALIDA';
  } else if (error.code === 'P1001') {
    // Error de Prisma - no se puede conectar a la base de datos
    statusCode = 503;
    message = 'Servicio de base de datos no disponible';
    codigo = 'DB_NO_DISPONIBLE';
  } else if (error.name === 'JsonWebTokenError') {
    // Error de JWT
    statusCode = 401;
    message = 'Token inválido';
    codigo = 'TOKEN_INVALIDO';
  } else if (error.name === 'TokenExpiredError') {
    // Token JWT expirado
    statusCode = 401;
    message = 'Token expirado';
    codigo = 'TOKEN_EXPIRADO';
  } else if (error.code === 'ENOENT') {
    // Archivo no encontrado
    statusCode = 404;
    message = 'Archivo no encontrado';
    codigo = 'ARCHIVO_NO_ENCONTRADO';
  } else if (error.code === 'EACCES') {
    // Sin permisos de archivo
    statusCode = 403;
    message = 'Sin permisos para acceder al archivo';
    codigo = 'SIN_PERMISOS_ARCHIVO';
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    // Archivo muy grande
    statusCode = 413;
    message = 'Archivo muy grande';
    codigo = 'ARCHIVO_MUY_GRANDE';
  } else if (error.code === 'LIMIT_FILE_COUNT') {
    // Demasiados archivos
    statusCode = 413;
    message = 'Demasiados archivos';
    codigo = 'DEMASIADOS_ARCHIVOS';
  } else if (error.code === 'LIMIT_FIELD_KEY') {
    // Nombre de campo muy largo
    statusCode = 400;
    message = 'Nombre de campo inválido';
    codigo = 'CAMPO_INVALIDO';
  } else if (error.code === 'LIMIT_FIELD_VALUE') {
    // Valor de campo muy largo
    statusCode = 400;
    message = 'Valor de campo muy largo';
    codigo = 'VALOR_MUY_LARGO';
  } else if (error.code === 'LIMIT_FIELD_COUNT') {
    // Demasiados campos
    statusCode = 400;
    message = 'Demasiados campos';
    codigo = 'DEMASIADOS_CAMPOS';
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    // Archivo inesperado
    statusCode = 400;
    message = 'Archivo inesperado';
    codigo = 'ARCHIVO_INESPERADO';
  } else if (error.status || error.statusCode) {
    // Error con código de estado explícito
    statusCode = error.status || error.statusCode;
    message = error.message || message;
    codigo = error.codigo || 'ERROR_HTTP';
  } else if (error.message) {
    // Error con mensaje personalizado
    message = error.message;
  }

  // Construir respuesta de error
  const errorResponse = {
    success: false,
    message,
    codigo,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Agregar detalles en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = details;
    errorResponse.originalError = {
      name: error.name,
      code: error.code,
      message: error.message
    };
  }

  // Agregar detalles específicos si existen
  if (details) {
    errorResponse.details = details;
  }

  // Log del error para monitoreo
  logError(error, req, errorResponse);

  // Enviar respuesta
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFoundHandler = (req, res, next) => {
  console.log(' Ruta no encontrada:', { method: req.method, url: req.originalUrl, ip: req.ip, userAgent: req.get('User-Agent')
  });

  const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  error.codigo = 'RUTA_NO_ENCONTRADA';

  next(error);
};

/**
 * Logging de errores para monitoreo
 */
const logError = async (error, req, errorResponse) => {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: errorResponse.codigo,
      request: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        user: req.user ? {
          id: req.user.id,
          email: req.user.email,
          tipoUsuario: req.user.tipoUsuario
        } : null
      },
      environment: process.env.NODE_ENV
    };

    // En producción, aquí podrías enviar a un servicio de logging como Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Ejemplo: await sendToLoggingService(logEntry);
      console.error('🚨 ERROR EN PRODUCCIÓN:', JSON.stringify(logEntry, null, 2));
    }

    // Log a archivo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      await logToFile(logEntry);
    }

  } catch (logError) {
    console.error(' Error al hacer log del error:', logError);
  }
};

/**
 * Guardar log en archivo (solo desarrollo)
 */
const logToFile = async (logEntry) => {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Crear directorio de logs si no existe
    try {
      await fs.mkdir(logsDir, { recursive: true });
    } catch (err) {
      // El directorio ya existe o no se puede crear
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = path.join(logsDir, `error-${today}.log`);
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    await fs.appendFile(logFile, logLine, 'utf8');
    
  } catch (fileError) {
    console.error(' Error escribiendo log a archivo:', fileError);
  }
};

/**
 * Middleware para capturar errores asíncronos
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para validar JSON
 */
export const validateJSON = (error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.log(' JSON inválido recibido');
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la petición',
      codigo: 'JSON_INVALIDO'
    });
  }
  next(error);
};

/**
 * Middleware para timeout de requests
 */
export const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.log('⏰ Request timeout:', req.originalUrl);
        res.status(408).json({
          success: false,
          message: 'La petición excedió el tiempo límite',
          codigo: 'REQUEST_TIMEOUT',
          timeout: timeoutMs
        });
      }
    }, timeoutMs);

    // Limpiar timeout cuando la respuesta termine
    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

/**
 * Middleware para sanitizar errores en producción
 */
export const sanitizeErrors = (req, res, next) => {
  // Solo aplicar en producción
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Interceptar el método json de res para sanitizar errores
  const originalJson = res.json;
  
  res.json = function(data) {
    if (data && !data.success && data.stack) {
      // Remover stack trace en producción
      delete data.stack;
      delete data.details;
      delete data.originalError;
    }
    
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Crear un error personalizado
 */
export const createError = (message, statusCode = 500, codigo = 'ERROR_PERSONALIZADO', details = null) => {
  const error = new Error(message);
  error.status = statusCode;
  error.codigo = codigo;
  if (details) {
    error.details = details;
  }
  return error;
};

/**
 * Middleware para manejar errores de CORS
 */
export const corsErrorHandler = (error, req, res, next) => {
  if (error.message && error.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Error de CORS: Origen no permitido',
      codigo: 'CORS_ERROR'
    });
  }
  next(error);
};

/**
 * Middleware para manejar errores de rate limiting
 */
export const rateLimitErrorHandler = (error, req, res, next) => {
  if (error.statusCode === 429 || error.message.includes('rate limit')) {
    return res.status(429).json({
      success: false,
      message: 'Demasiadas peticiones. Intenta nuevamente más tarde.',
      codigo: 'RATE_LIMIT_EXCEDIDO',
      retryAfter: error.retryAfter || 60
    });
  }
  next(error);
};

/**
 * Configurar manejo global de promesas rechazadas
 */
export const setupGlobalErrorHandlers = () => {
  // Manejar promesas rechazadas no capturadas
  process.on('unhandledRejection', (reason, promise) => {
    console.error(' Unhandled Rejection at:', promise, 'reason:', reason);
    
    // En producción, podrías querer terminar el proceso
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Terminando proceso por unhandled rejection');
      process.exit(1);
    }
  });

  // Manejar excepciones no capturadas
  process.on('uncaughtException', (error) => {
    console.error(' Uncaught Exception:', error);
    
    // En producción, terminar el proceso después de limpiar
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Terminando proceso por uncaught exception');
      process.exit(1);
    }
  });

  console.log('🛡 Manejadores globales de errores configurados');
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateJSON,
  requestTimeout,
  sanitizeErrors,
  createError,
  corsErrorHandler,
  rateLimitErrorHandler,
  setupGlobalErrorHandlers
};