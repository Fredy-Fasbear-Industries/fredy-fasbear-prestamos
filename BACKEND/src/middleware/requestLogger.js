import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getClientIP = (req) => {
  return req.ip ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         'unknown';
};

const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

const determinarTipoAccion = (method, path) => {
  if (path.includes('/login')) return 'LOGIN';
  if (path.includes('/logout')) return 'LOGOUT';
  if (path.includes('/solicitudes') && method === 'POST') return 'CREAR';
  if (path.includes('/prestamos') && path.includes('/pagar')) return 'PAGO';
  if (path.includes('/prestamos') && path.includes('/renovar')) return 'RENOVACION';
  if (path.includes('/avaluos')) return 'AVALUO';
  
  switch (method) {
    case 'POST': return 'CREAR';
    case 'PUT':
    case 'PATCH': return 'ACTUALIZAR';
    case 'DELETE': return 'ELIMINAR';
    case 'GET': return 'CONSULTAR';
    default: return 'CONSULTAR';
  }
};

const extraerEntidadId = (path) => {
  const matches = path.match(/\/api\/\w+\/([a-zA-Z0-9\-_]+)/);
  return matches ? matches[1] : null;
};

const determinarEntidad = (path) => {
  if (path.includes('/prestamos')) return 'prestamo';
  if (path.includes('/solicitudes')) return 'solicitud';
  if (path.includes('/usuarios') || path.includes('/auth') || path.includes('/personal') || path.includes('/clients')) return 'usuario';
  if (path.includes('/avaluos')) return 'avaluo';
  if (path.includes('/articulos')) return 'articulo';
  if (path.includes('/parametro')) return 'parametro';
  if (path.includes('/admin')) return 'admin';
  if (path.includes('/pago')) return 'pago';
  if (path.includes('/producto')) return 'producto';
  if (path.includes('/pedido')) return 'pedido';
  if (path.includes('/ecommerce')) return 'ecommerce';
  return 'sistema';
};

const shouldLogToDatabase = (req) => {
  if (req.path.includes('/health') || req.path.includes('/info') ||
      req.path.includes('/uploads/') || req.path.includes('/static/') ||
      req.path.includes('/audit-logs')) {
    return false;
  }
  
  const importantPaths = [
    '/auth/', '/prestamos/', '/solicitudes/', '/avaluos/', '/pagos/',
    '/admin/', '/personal/', '/clients/', '/parametro', '/ecommerce',
    '/productos/', '/pedidos/', '/system-reports/'
  ];
  
  const isImportantPath = importantPaths.some(path => req.path.includes(path));
  const isModifyAction = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const isImportantGET = req.method === 'GET' && (
    req.path.includes('/stats') || req.path.includes('/dashboard') || 
    req.path.includes('/me') || req.path.match(/\/\d+$/)
  );
  
  return (isImportantPath && (isModifyAction || isImportantGET)) || (req.user && isModifyAction);
};

const saveLogAsync = (logData) => {
  prisma.logActividad.create({ data: logData })
    .then(() => console.log('Log guardado:', logData.accion, logData.entidad))
    .catch(err => console.error('Error guardando log:', err.message));
};

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  }
  
  const oldEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      const statusText = res.statusCode < 400 ? 'OK' : res.statusCode < 500 ? 'WARN' : 'ERROR';
      console.log(`[${statusText}] ${res.statusCode} - ${duration}ms - ${req.method} ${req.originalUrl}`);
    }
    
    if (shouldLogToDatabase(req)) {
      const logData = {
        usuarioId: req.user?.id || req.user?.userId || null,
        accion: determinarTipoAccion(req.method, req.path),
        entidad: determinarEntidad(req.path),
        entidadId: extraerEntidadId(req.path),
        detalles: { method: req.method, url: req.originalUrl, statusCode: res.statusCode },
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        fechaHora: new Date()
      };
      
      saveLogAsync(logData);
    }
    
    oldEnd.apply(res, args);
  };
  
  next();
};


export const logError = (error, req) => {
  console.error('ERROR:', error.message);
};

export const logSecurityEvent = async (eventType, req, details = {}) => {
  console.warn('SECURITY EVENT:', eventType);
  
  try {
    await prisma.logActividad.create({
      data: {
        usuarioId: req.user?.id || req.user?.userId || null,
        accion: 'SECURITY_EVENT',
        entidad: 'security',
        entidadId: eventType,
        detalles: { eventType, details },
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        fechaHora: new Date()
      }
    });
  } catch (error) {
    console.error('Error logging security event:', error.message);
  }
};

export default {
  requestLogger,
  logError,
  logSecurityEvent
};