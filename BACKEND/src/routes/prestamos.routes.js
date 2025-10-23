import express from 'express';
import { PrismaClient } from '@prisma/client';
import prestamosController from '../controllers/prestamos.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validarPrestamo, validarDatosPago } from '../middleware/validators.js';
import rateLimit from 'express-rate-limit';
import crearPrestamoRoutes from './prestamos.crear.routes.js';

const router = express.Router();
const prisma = new PrismaClient();

const operacionesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Demasiadas operaciones. Intenta en unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.use((req, res, next) => {
  console.log(`[PRESTAMOS] ${req.method} ${req.path}`);
  next();
});

router.use(authenticateToken);

router.use(crearPrestamoRoutes);

router.get('/', prestamosController.getMisPrestamos);
router.get('/estadisticas', prestamosController.getEstadisticas);
router.get('/historial', prestamosController.getHistorial);
router.get('/simulacion', prestamosController.calcularSimulacion);

router.get('/solicitud/:solicitudId', async (req, res) => {
  const { solicitudId } = req.params;

  try {
    console.log(`[PRESTAMOS] Verificando préstamo para solicitud: ${solicitudId}`);

    const prestamo = await prisma.prestamo.findFirst({
      where: {
        contrato: {
          solicitudId: parseInt(solicitudId)
        }
      },
      include: {
        contrato: {
          include: {
            solicitud: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        planPagos: {
          orderBy: { numeroCuota: 'asc' },
          take: 1
        }
      }
    });

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        message: 'No existe préstamo para esta solicitud',
        codigo: 'PRESTAMO_NO_ENCONTRADO'
      });
    }

    console.log(`[PRESTAMOS] Préstamo encontrado: ${prestamo.numeroPrestamo}`);

    res.status(200).json({
      success: true,
      message: 'Préstamo encontrado',
      data: {
        id: prestamo.id,
        numeroPrestamo: prestamo.numeroPrestamo,
        montoPrestado: parseFloat(prestamo.montoPrestado),
        tasaInteres: parseFloat(prestamo.tasaInteres),
        plazoMeses: prestamo.plazoMeses,
        saldoPendiente: parseFloat(prestamo.saldoPendiente),
        estado: prestamo.estado,
        fechaInicio: prestamo.fechaInicio,
        fechaVencimiento: prestamo.fechaVencimiento,
        totalCuotas: prestamo.planPagos?.length || 0,
        cliente: {
          id: prestamo.contrato?.solicitud?.usuario?.id,
          nombre: prestamo.contrato?.solicitud?.usuario?.nombre,
          apellido: prestamo.contrato?.solicitud?.usuario?.apellido
        }
      }
    });

  } catch (error) {
    console.error('[PRESTAMOS] Error verificando préstamo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el préstamo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/:prestamoId', validarPrestamo, prestamosController.getDetallePrestamo);

router.post('/:prestamoId/pagar', 
  operacionesLimiter,
  validarPrestamo,
  validarDatosPago,
  prestamosController.procesarPago
);

router.post('/:prestamoId/renovar',
  operacionesLimiter,
  validarPrestamo,
  [
    (req, res, next) => {
      const { nuevosPlazoMeses } = req.body;
      
      if (!nuevosPlazoMeses || nuevosPlazoMeses < 1 || nuevosPlazoMeses > 12) {
        return res.status(400).json({
          success: false,
          message: 'El plazo debe ser entre 1 y 12 meses'
        });
      }
      
      next();
    }
  ],
  prestamosController.renovarPrestamo
);

router.get('/:prestamoId/contrato', validarPrestamo, async (req, res) => {
  try {
    const { prestamoId } = req.params;
    const { userId } = req.user;
    
    console.log(`[PRESTAMOS] Generando contrato para préstamo: ${prestamoId}`);
    
    res.status(200).json({
      success: true,
      message: 'Funcionalidad de contrato en desarrollo',
      data: {
        prestamoId,
        tipo: 'contrato',
        formato: 'pdf'
      }
    });
    
  } catch (error) {
    console.error('[PRESTAMOS] Error generando contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando el contrato'
    });
  }
});

router.get('/:prestamoId/recibo-pago/:pagoId', validarPrestamo, async (req, res) => {
  try {
    const { prestamoId, pagoId } = req.params;
    const { userId } = req.user;
    
    console.log(`[PRESTAMOS] Generando recibo de pago: ${pagoId} para préstamo: ${prestamoId}`);
    
    res.status(200).json({
      success: true,
      message: 'Funcionalidad de recibo en desarrollo',
      data: {
        prestamoId,
        pagoId,
        tipo: 'recibo',
        formato: 'pdf'
      }
    });
    
  } catch (error) {
    console.error('[PRESTAMOS] Error generando recibo:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando el recibo'
    });
  }
});

router.use((error, req, res, next) => {
  console.error('[PRESTAMOS] Error en rutas:', error);
  
  if (error.code === 'PRESTAMO_NO_ENCONTRADO') {
    return res.status(404).json({
      success: false,
      message: 'Préstamo no encontrado'
    });
  }
  
  if (error.code === 'PRESTAMO_NO_AUTORIZADO') {
    return res.status(403).json({
      success: false,
      message: 'No tiene autorización para acceder a este préstamo'
    });
  }
  
  if (error.code === 'OPERACION_NO_PERMITIDA') {
    return res.status(400).json({
      success: false,
      message: 'Operación no permitida en el estado actual del préstamo'
    });
  }
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de préstamos',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;