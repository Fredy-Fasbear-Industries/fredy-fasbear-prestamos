import express from 'express';
import rateLimit from 'express-rate-limit';
import ecommerceController from '../controllers/ecommerce.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const configLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Demasiadas peticiones de configuración. Intenta en unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const writeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Demasiadas operaciones de escritura. Intenta en unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.use((req, res, next) => {
  console.log(`E-commerce Config API: ${req.method} ${req.path}`);
  next();
});

router.get('/public', configLimiter, async (req, res) => {
  try {
    console.log('[PUBLIC] Obteniendo configuración pública de ecommerce');
    
    const configuraciones = await prisma.parametrosSistema.findMany({
      where: {
        nombreParametro: {
          startsWith: 'ECOMMERCE_'
        }
      },
      select: {
        nombreParametro: true,
        valorParametro: true
      },
      orderBy: {
        nombreParametro: 'asc'
      }
    });

    console.log(`[PUBLIC] ${configuraciones.length} configuraciones encontradas`);

    return res.status(200).json({
      success: true,
      data: configuraciones
    });
  } catch (error) {
    console.error('[PUBLIC] Error obteniendo configuración:', error);
    return res.status(500).json({
      success: false,
      message: 'Error obteniendo configuración'
    });
  }
});

router.use(authenticateToken);
router.use(requireAdmin);
router.use(configLimiter);

router.get('/', ecommerceController.getEcommerceConfig);

router.get('/categories', ecommerceController.getConfigByCategories);

router.get('/payment-methods', async (req, res) => {
  try {
    req.query.categoria = 'pagos';
    return ecommerceController.getEcommerceConfig(req, res);
  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuraciones de métodos de pago'
    });
  }
});

router.get('/shipping', async (req, res) => {
  try {
    req.query.categoria = 'envios';
    return ecommerceController.getEcommerceConfig(req, res);
  } catch (error) {
    console.error('Error obteniendo configuraciones de envíos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuraciones de envíos'
    });
  }
});

router.get('/promotions', async (req, res) => {
  try {
    req.query.categoria = 'promociones';
    return ecommerceController.getEcommerceConfig(req, res);
  } catch (error) {
    console.error('Error obteniendo configuraciones de promociones:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuraciones de promociones'
    });
  }
});

const validarConfiguracionCritica = (req, res, next) => {
  const { configId } = req.params;
  const { valor } = req.body;
  
  const validacionesEspeciales = {
    'ECOMMERCE_GENERAL_PRODUCTOS_POR_PAGINA': (valor) => {
      const num = parseInt(valor);
      return num >= 1 && num <= 50;
    },
    'ECOMMERCE_ENVIOS_COSTO_BASE': (valor) => {
      const num = parseFloat(valor);
      return num >= 0 && num <= 1000;
    },
    'ECOMMERCE_PROMOCIONES_PORCENTAJE_DESCUENTO': (valor) => {
      const num = parseFloat(valor);
      return num >= 0 && num <= 100;
    },
    'ECOMMERCE_POLITICAS_DEVOLUCION': (valor) => {
      const num = parseInt(valor);
      return num >= 0 && num <= 365;
    }
  };
  
  if (validacionesEspeciales[configId]) {
    if (!validacionesEspeciales[configId](valor)) {
      return res.status(400).json({
        success: false,
        message: `Valor inválido para la configuración ${configId}`
      });
    }
  }
  
  next();
};

router.put('/:configId', 
  writeLimiter,
  [
    (req, res, next) => {
      const { valor } = req.body;
      
      if (valor === undefined || valor === null) {
        return res.status(400).json({
          success: false,
          message: 'El campo "valor" es requerido'
        });
      }
      
      next();
    }
  ],
  validarConfiguracionCritica,
  ecommerceController.updateEcommerceConfig
);

router.post('/', 
  writeLimiter,
  [
    (req, res, next) => {
      const { nombre, tipo, valor } = req.body;
      
      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'El campo "nombre" es requerido'
        });
      }
      
      if (!tipo) {
        return res.status(400).json({
          success: false,
          message: 'El campo "tipo" es requerido'
        });
      }
      
      const tiposValidos = ['STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'TEXT'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: `Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}`
        });
      }
      
      if (valor === undefined || valor === null) {
        return res.status(400).json({
          success: false,
          message: 'El campo "valor" es requerido'
        });
      }
      
      next();
    }
  ],
  ecommerceController.createEcommerceConfig
);

router.delete('/:configId', 
  writeLimiter,
  ecommerceController.deleteEcommerceConfig
);

router.post('/reset', 
  writeLimiter,
  [
    (req, res, next) => {
      const { confirmacion } = req.body;
      
      if (confirmacion !== 'RESET_CONFIGURACIONES') {
        return res.status(400).json({
          success: false,
          message: 'Para restaurar las configuraciones, debes enviar confirmacion: "RESET_CONFIGURACIONES"'
        });
      }
      
      next();
    }
  ],
  ecommerceController.resetToDefaults
);

router.use((error, req, res, next) => {
  console.error('Error en rutas de e-commerce config:', error);
  
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe una configuración con ese nombre'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Configuración no encontrada'
    });
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de configuración e-commerce',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

if (process.env.NODE_ENV === 'development') {
  router.get('/docs', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Documentación de API E-commerce Config',
      version: '1.0.0',
      endpoints: {
        'GET /public': 'Obtiene todas las configuraciones (público, sin autenticación)',
        'GET /': 'Obtiene todas las configuraciones (requiere admin)',
        'GET /categories': 'Obtiene configuraciones agrupadas por categorías',
        'GET /payment-methods': 'Obtiene configuraciones de métodos de pago',
        'GET /shipping': 'Obtiene configuraciones de envíos',
        'GET /promotions': 'Obtiene configuraciones de promociones',
        'PUT /:configId': 'Actualiza una configuración específica',
        'POST /': 'Crea una nueva configuración',
        'DELETE /:configId': 'Elimina una configuración',
        'POST /reset': 'Restaura configuraciones predeterminadas'
      },
      rateLimits: {
        general: '30 requests per 15 minutes',
        write: '10 requests per 5 minutes'
      },
      authentication: 'Bearer Token required + Admin role (excepto /public)',
      dataTypes: ['STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'TEXT'],
      categories: ['general', 'pagos', 'envios', 'promociones', 'politicas', 'apariencia']
    });
  });
}

export default router;