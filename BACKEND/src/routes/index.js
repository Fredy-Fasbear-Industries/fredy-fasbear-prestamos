import express from 'express';
import { PrismaClient } from '@prisma/client';
import homepageRoutes from './homepage.routes.js';
import authRoutes from './auth.routes.js';
import prestamosRoutes from './prestamos.routes.js';  
import solicitudesRoutes from './solicitudes.routes.js';  
import adminRoutes from './admin.routes.js';
import personalRoutes from './personal.routes.js';
import clientsRoutes from './clients.routes.js';
import ecommerceRoutes from './ecommerce.routes.js'; 
import systemReportsRoutes from './system-reports.routes.js';
import auditLogsRoutes from './audit-logs.routes.js';
import backupsRoutes from './backups.routes.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import evaluadorRoutes from './evaluador.routes.js';
import contratosRoutes from './contratos.routes.js';
import cobradorRoutes from './cobrador.routes.js';
import pedidosRoutes from './pedidos.routes.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use((req, res, next) => {
  console.log(` ${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

router.use('/homepage', homepageRoutes);
router.use('/auth', authRoutes);
router.use('/prestamos', prestamosRoutes);     
router.use('/solicitudes', solicitudesRoutes); 
router.use('/personal', personalRoutes);
router.use('/clients', clientsRoutes);  
router.use('/system-reports', systemReportsRoutes);
router.use('/audit-logs', auditLogsRoutes);
router.use('/evaluador', evaluadorRoutes);
router.use('/contratos', contratosRoutes);
router.use('/cobrador', cobradorRoutes);

router.use('/ecommerce-config', ecommerceRoutes);
router.use('/pedidos', pedidosRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/backups', authenticateToken, requireAdmin, backupsRoutes);

router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      success: true,
      message: 'API funcionando correctamente',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      database: 'connected',
      services: {
        auth: 'active',
        admin: 'active',
        personal: 'active',
        clients: 'active',
        ecommerce: 'active',
        systemReports: 'active'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Error de conexión a la base de datos',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Fredy Fasbear Prestamos API',
      version: '1.0.0',
      description: 'API para sistema de empeño y préstamos pignoraticios',
      author: 'Fredy Fasbear Industries',
      endpoints: {
        auth: {
          base: '/api/auth',
          endpoints: [
            'POST /api/auth/register',
            'POST /api/login', 
            'POST /api/auth/logout',
            'GET /api/auth/me',
            'PUT /api/auth/profile',
            'POST /api/auth/change-password'
          ]
        },
        clients: {
          base: '/api/clients',
          endpoints: [
            'GET /api/clients/stats',
            'GET /api/clients',
            'GET /api/clients/:id',
            'POST /api/clients',
            'PUT /api/clients/:id',
            'PUT /api/clients/:id/toggle-status'
          ]
        },
        homepage: {
          base: '/api/homepage',
          endpoints: [
            'GET /api/homepage/data',
            'GET /api/homepage/stats',
            'GET /api/homepage/featured-products',
            'POST /api/homepage/contact',
            'POST /api/homepage/newsletter'
          ]
        },
        prestamos: {
          base: '/api/prestamos',
          endpoints: [
            'GET /api/prestamos',
            'GET /api/prestamos/estadisticas',
            'GET /api/prestamos/historial',
            'GET /api/prestamos/simulacion',
            'GET /api/prestamos/:prestamoId',
            'POST /api/prestamos/:prestamoId/pagar',
            'POST /api/prestamos/:prestamoId/renovar',
            'GET /api/prestamos/:prestamoId/contrato',
            'GET /api/prestamos/:prestamoId/recibo-pago/:pagoId'
          ]
        },
        solicitudes: {
          base: '/api/solicitudes',
          endpoints: [
            'GET /api/solicitudes/categorias',
            'GET /api/solicitudes',
            'GET /api/solicitudes/:solicitudId',
            'POST /api/solicitudes',
            'PUT /api/solicitudes/:solicitudId/cancelar',
            'POST /api/solicitudes/:solicitudId/aceptar-oferta',
            'GET /api/solicitudes/:solicitudId/fotos/:fotoId',
            'GET /api/solicitudes/:solicitudId/documento-tecnico'
          ]
        },
        personal: {
          base: '/api/personal',
          endpoints: [
            'GET /api/personal/stats',
            'GET /api/personal',
            'GET /api/personal/:id',
            'POST /api/personal',
            'PUT /api/personal/:id',
            'PUT /api/personal/:id/toggle-status'
          ]
        },
        admin: {
          base: '/api/admin',
          endpoints: [
            'GET /api/admin/stats',
            'GET /api/admin/recent-activity',
            'PUT /api/admin/system-parameters/:id'
          ]
        },
        ecommerce: {
          base: '/api/ecommerce-config',
          description: 'Configuración del módulo E-commerce',
          endpoints: [
            'GET /api/ecommerce-config/public',
            'GET /api/ecommerce-config',
            'GET /api/ecommerce-config/categories',
            'GET /api/ecommerce-config/payment-methods',
            'GET /api/ecommerce-config/shipping',
            'GET /api/ecommerce-config/promotions',
            'PUT /api/ecommerce-config/:configId',
            'POST /api/ecommerce-config',
            'DELETE /api/ecommerce-config/:configId',
            'POST /api/ecommerce-config/reset'
          ]
        },
        evaluador: {
          base: '/api/evaluador',
          description: 'Gestión del panel de evaluador',
          endpoints: [
            'GET /api/evaluador/stats',
            'GET /api/evaluador/solicitudes',
            'GET /api/evaluador/solicitudes/:id',
            'POST /api/evaluador/solicitudes/:id/evaluar',
            'GET /api/evaluador/recent-activity',
            'GET /api/evaluador/mis-avaluos'
          ]
        },
        auditLogs: {  
          base: '/api/audit-logs',
          description: 'Logs de auditoría y seguridad',
          endpoints: [
            'GET /api/audit-logs',
            'GET /api/audit-logs/:id',
            'GET /api/audit-logs/stats',
            'GET /api/audit-logs/export',
            'POST /api/audit-logs/cleanup'
          ]
        },
        systemReports: {
          base: '/api/system-reports',
          description: 'Reportes y monitoreo del sistema',
          endpoints: [
            'GET /api/system-reports/overview',
            'GET /api/system-reports/database-analysis',
            'GET /api/system-reports/health-monitoring',
            'GET /api/system-reports/recent-activity',
            'POST /api/system-reports/export'
          ]
        },
        system: {
          base: '/api',
          endpoints: [
            'GET /api/health',
            'GET /api/info'
          ]
        }
      },
      authentication: {
        type: 'JWT Bearer Token',
        header: 'Authorization: Bearer <token>',
        expires: process.env.JWT_EXPIRES_IN 
      },
      rateLimit: {
        auth: '5 requests per 15 minutes',
        solicitudes: '5 requests per hour',
        ecommerce_config: '30 requests per 15 minutes', 
        ecommerce_write: '10 requests per 5 minutes',
        general: '100 requests per 15 minutes'
      }
    }
  });
});

if (process.env.NODE_ENV === 'development') {
  router.get('/test', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Endpoint de prueba - Solo disponible en desarrollo',
      data: {
        user: req.user || null,
        headers: req.headers,
        query: req.query,
        body: req.body,
        timestamp: new Date().toISOString()
      }
    });
  });
}

router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    error: {
      method: req.method,
      path: req.originalUrl,
      suggestion: 'Verifica la documentación de la API en /api/info'
    },
    availableEndpoints: [
      '/api/auth/*',
      '/api/homepage/*', 
      '/api/prestamos/*',
      '/api/solicitudes/*', 
      '/api/personal/*',
      '/api/admin/*',
      '/api/clients/*',  
      '/api/ecommerce-config/*',
      '/api/system-reports/*',
      '/api/audit-logs/*',
      '/api/health',
      '/api/info'
    ]
  });
});

router.use((error, req, res, next) => {
  console.error(' Error en API:', error.message);
  
  if (error.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Datos duplicados',
      error: 'Ya existe un registro con estos datos'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado'
    });
  }
  
  if (error.code === 'P1001') {
    return res.status(503).json({
      success: false,
      message: 'Servicio no disponible',
      error: 'Error de conexión a la base de datos'
    });
  }
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      error: error.message
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Archivo muy grande'
    });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Demasiados archivos'
    });
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

export default router;