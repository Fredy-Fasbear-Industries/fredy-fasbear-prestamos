import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const validarPrestamo = async (req, res, next) => {
  try {
    const { prestamoId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    console.log('[VALIDADOR] Validando préstamo:', { prestamoId, userId, user: req.user });

    if (!prestamoId) {
      return res.status(400).json({
        success: false,
        message: 'ID de préstamo no proporcionado'
      });
    }

    const prestamoIdInt = parseInt(prestamoId);
    
    if (isNaN(prestamoIdInt)) {
      return res.status(400).json({
        success: false,
        message: 'ID de préstamo no válido'
      });
    }

    if (!userId) {
      console.error('[VALIDADOR] userId no encontrado en req.user:', req.user);
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado correctamente'
      });
    }

    const prestamo = await prisma.prestamo.findFirst({
      where: {
        id: prestamoIdInt,
        contrato: {
          solicitud: {
            usuarioId: userId
          }
        }
      },
      include: {
        contrato: {
          include: {
            solicitud: {
              include: {
                articulos: true
              }
            }
          }
        },
        pagos: {
          orderBy: { fechaPago: 'desc' }
        }
      }
    });

    if (!prestamo) {
      console.log('[VALIDADOR] Préstamo no encontrado:', { prestamoIdInt, userId });
      
      const error = new Error('Préstamo no encontrado');
      error.code = 'PRESTAMO_NO_ENCONTRADO';
      error.status = 404;
      return next(error);
    }

    console.log('[VALIDADOR] Préstamo validado correctamente:', prestamo.numeroPrestamo);

    req.prestamo = prestamo;
    next();

  } catch (error) {
    console.error('[VALIDADOR] Error validando préstamo:', error);
    
    const validationError = new Error('Error validando préstamo');
    validationError.code = 'PRESTAMO_VALIDATION_ERROR';
    validationError.status = 500;
    next(validationError);
  }
};

export const validarSolicitud = async (req, res, next) => {
  try {
    const { solicitudId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    if (!solicitudId) {
      return res.status(400).json({
        success: false,
        message: 'ID de solicitud no proporcionado'
      });
    }

    const solicitudIdInt = parseInt(solicitudId);
    
    if (isNaN(solicitudIdInt)) {
      return res.status(400).json({
        success: false,
        message: 'ID de solicitud no válido'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado correctamente'
      });
    }

    const solicitud = await prisma.solicitudEmpeno.findFirst({
      where: {
        id: solicitudIdInt,
        usuarioId: userId
      }
    });

    if (!solicitud) {
      const error = new Error('Solicitud no encontrada');
      error.code = 'SOLICITUD_NO_ENCONTRADA';
      error.status = 404;
      return next(error);
    }

    req.solicitud = solicitud;
    next();

  } catch (error) {
    console.error('Error validando solicitud:', error);
    
    const validationError = new Error('Error validando solicitud');
    validationError.code = 'SOLICITUD_VALIDATION_ERROR';
    validationError.status = 500;
    next(validationError);
  }
};

export const validarArchivos = (req, res, next) => {
  try {
    const { files } = req;

    if (!files) {
      return res.status(400).json({
        success: false,
        message: 'No se encontraron archivos'
      });
    }

    if (files.fotos) {
      const fotos = Array.isArray(files.fotos) ? files.fotos : [files.fotos];
      
      if (fotos.length < 2 || fotos.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Debe subir entre 2 y 10 fotos del artículo'
        });
      }
      
      for (const foto of fotos) {
        if (!foto.mimetype.startsWith('image/')) {
          return res.status(400).json({
            success: false,
            message: 'Solo se permiten archivos de imagen'
          });
        }
        
        if (foto.size > 10 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: 'Las imágenes no pueden superar 10MB'
          });
        }
      }
    }

    next();

  } catch (error) {
    console.error('Error validando archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando archivos'
    });
  }
};
export const validarDatosPago = (req, res, next) => {
  try {
    const { monto, metodoPago, fechaDeposito, nombreBanco, numeroTransaccion } = req.body;

    console.log('Validando datos de pago:', { monto, metodoPago, fechaDeposito, nombreBanco, numeroTransaccion });

    if (!monto || isNaN(parseFloat(monto))) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser un número válido'
      });
    }

    const montoNum = parseFloat(monto);
    if (montoNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      });
    }

    const metodosPermitidos = ['deposito', 'transferencia'];
    const metodoPagoLower = metodoPago ? metodoPago.toLowerCase().trim() : '';
    
    if (!metodoPago || !metodosPermitidos.includes(metodoPagoLower)) {
      console.log('Método de pago inválido:', metodoPago);
      return res.status(400).json({
        success: false,
        message: 'Método de pago no válido. Solo se permite: Depósito o Transferencia'
      });
    }

    if (!fechaDeposito) {
      return res.status(400).json({
        success: false,
        message: 'La fecha del depósito es requerida'
      });
    }

    const fechaDepositoDate = new Date(fechaDeposito);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    if (isNaN(fechaDepositoDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de depósito no válida'
      });
    }

    if (fechaDepositoDate > fechaActual) {
      return res.status(400).json({
        success: false,
        message: 'La fecha del depósito no puede ser futura'
      });
    }

    if (!nombreBanco || nombreBanco.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del banco es requerido y debe tener al menos 3 caracteres'
      });
    }

    if (!numeroTransaccion || numeroTransaccion.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'El número de transacción es requerido y debe tener al menos 3 caracteres'
      });
    }

    if (!req.files || !req.files.imagenComprobante) {
      return res.status(400).json({
        success: false,
        message: 'La imagen del comprobante es requerida'
      });
    }

    const imagenFile = req.files.imagenComprobante;
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!tiposPermitidos.includes(imagenFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de imagen no permitido. Use JPG, PNG o WebP'
      });
    }

    const maxSize = 10 * 1024 * 1024;
    if (imagenFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'La imagen del comprobante no puede superar 10MB'
      });
    }

    req.body.monto = parseFloat(monto);
    req.body.metodoPago = metodoPagoLower;
    req.body.nombreBanco = nombreBanco.trim();
    req.body.numeroTransaccion = numeroTransaccion.trim();
    
    console.log('Datos de pago validados correctamente');
    next();

  } catch (error) {
    console.error('Error validando datos de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando datos de pago'
    });
  }
};

export const validarDatosRenovacion = (req, res, next) => {
  try {
    const { nuevosPlazoMeses, pagoInicialRenovacion } = req.body;

    if (!nuevosPlazoMeses || isNaN(parseInt(nuevosPlazoMeses))) {
      return res.status(400).json({
        success: false,
        message: 'El plazo debe ser un número válido'
      });
    }

    const plazo = parseInt(nuevosPlazoMeses);
    if (plazo < 1 || plazo > 12) {
      return res.status(400).json({
        success: false,
        message: 'El plazo debe ser entre 1 y 12 meses'
      });
    }

    if (pagoInicialRenovacion !== undefined && pagoInicialRenovacion !== '') {
      const pagoInicial = parseFloat(pagoInicialRenovacion);
      if (isNaN(pagoInicial) || pagoInicial < 0) {
        return res.status(400).json({
          success: false,
          message: 'El pago inicial debe ser un número mayor o igual a 0'
        });
      }
      req.body.pagoInicialRenovacion = pagoInicial;
    } else {
      req.body.pagoInicialRenovacion = 0;
    }

    req.body.nuevosPlazoMeses = plazo;

    next();

  } catch (error) {
    console.error('Error validando datos de renovación:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando datos de renovación'
    });
  }
};

export const validarParametrosConsulta = (req, res, next) => {
  try {
    let { limite, pagina, estado } = req.query;

    if (limite) {
      limite = parseInt(limite);
      if (isNaN(limite) || limite < 1 || limite > 100) {
        return res.status(400).json({
          success: false,
          message: 'El límite debe ser un número entre 1 y 100'
        });
      }
    } else {
      limite = 10;
    }

    if (pagina) {
      pagina = parseInt(pagina);
      if (isNaN(pagina) || pagina < 1) {
        return res.status(400).json({
          success: false,
          message: 'La página debe ser un número mayor a 0'
        });
      }
    } else {
      pagina = 1;
    }

    if (estado) {
      const estadosPrestamoPermitidos = ['activo', 'vencido', 'completado', 'renovado', 'cancelado', 'todos'];
      const estadosSolicitudPermitidos = ['pendiente', 'en_evaluacion', 'aprobada', 'rechazada', 'cancelada', 'expirada', 'convertida', 'todas'];
      
      const esRutaPrestamos = req.originalUrl.includes('/prestamos');
      const estadosPermitidos = esRutaPrestamos ? estadosPrestamoPermitidos : estadosSolicitudPermitidos;
      
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: `Estado no válido. Estados permitidos: ${estadosPermitidos.join(', ')}`
        });
      }
    }

    req.query.limite = limite;
    req.query.pagina = pagina;
    req.query.estado = estado;

    next();

  } catch (error) {
    console.error('Error validando parámetros de consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando parámetros de consulta'
    });
  }
};

export const validarFechas = (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      if (isNaN(inicio.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fecha de inicio no válida. Use formato ISO (YYYY-MM-DD)'
        });
      }
      req.query.fechaInicio = inicio;
    }

    if (fechaFin) {
      const fin = new Date(fechaFin);
      if (isNaN(fin.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fecha de fin no válida. Use formato ISO (YYYY-MM-DD)'
        });
      }
      req.query.fechaFin = fin;
    }

    if (req.query.fechaInicio && req.query.fechaFin && req.query.fechaInicio > req.query.fechaFin) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio debe ser menor que la fecha de fin'
      });
    }

    next();

  } catch (error) {
    console.error('Error validando fechas:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando fechas'
    });
  }
};

export const validarSimulacion = (req, res, next) => {
  try {
    const { valorArticulo, porcentajePrestamo, plazoMeses } = req.query;

    if (!valorArticulo || isNaN(parseFloat(valorArticulo)) || parseFloat(valorArticulo) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El valor del artículo es requerido y debe ser mayor a 0'
      });
    }

    if (porcentajePrestamo) {
      const porcentaje = parseFloat(porcentajePrestamo);
      if (isNaN(porcentaje) || porcentaje < 10 || porcentaje > 80) {
        return res.status(400).json({
          success: false,
          message: 'El porcentaje de préstamo debe ser entre 10% y 80%'
        });
      }
      req.query.porcentajePrestamo = porcentaje;
    } else {
      req.query.porcentajePrestamo = 50;
    }

    if (plazoMeses) {
      const plazo = parseInt(plazoMeses);
      if (isNaN(plazo) || plazo < 1 || plazo > 12) {
        return res.status(400).json({
          success: false,
          message: 'El plazo debe ser entre 1 y 12 meses'
        });
      }
      req.query.plazoMeses = plazo;
    } else {
      req.query.plazoMeses = 1;
    }

    req.query.valorArticulo = parseFloat(valorArticulo);

    next();

  } catch (error) {
    console.error('Error validando simulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando parámetros de simulación'
    });
  }
};

export const validacionesPrestamoCompleta = [
  validarParametrosConsulta,
  validarFechas
];

export const validacionesSolicitudCompleta = [
  validarParametrosConsulta,
  validarFechas
];