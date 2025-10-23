import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verificarToken, verificarRol } from '../middleware/auth.middleware.js';
import emailService from '../services/email.service.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use((req, res, next) => {
  console.log(`Evaluador API: ${req.method} ${req.path}`);
  console.log(`Usuario: ${req.user?.nombre || 'No identificado'} (${req.user?.tipoUsuario || 'Sin rol'})`);
  next();
});

router.use(verificarToken);
router.use(verificarRol(['Evaluador', 'Administrador']));

router.get('/stats', async (req, res) => {
  try {
    console.log('[EVALUADOR] Obteniendo estadísticas del panel');

    const [
      solicitudesPendientes,
      solicitudesEvaluando,
      solicitudesAprobadas,
      solicitudesRechazadas,
      totalEvaluadas,
      avaluosHoy
    ] = await Promise.all([
      prisma.solicitudPrestamo.count({
        where: { estado: 'Pendiente' }
      }),
      
      prisma.solicitudPrestamo.count({
        where: { estado: 'Evaluando' }
      }),
      
      prisma.solicitudPrestamo.count({
        where: {
          estado: 'Aprobada',
          fechaEvaluacion: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      prisma.solicitudPrestamo.count({
        where: {
          estado: 'Rechazada',
          fechaEvaluacion: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      req.user.tipoUsuario === 'Evaluador' ?
        prisma.solicitudPrestamo.count({
          where: {
            evaluadorId: req.user.id,
            estado: { in: ['Aprobada', 'Rechazada'] }
          }
        }) : 
        prisma.solicitudPrestamo.count({
          where: {
            estado: { in: ['Aprobada', 'Rechazada'] }
          }
        }),
      
      prisma.avaluo.count({
        where: {
          fechaAvaluo: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    console.log('[EVALUADOR] Estadísticas obtenidas exitosamente');

    res.status(200).json({
      success: true,
      data: {
        solicitudesPendientes,
        solicitudesEvaluando,
        solicitudesAprobadas,
        solicitudesRechazadas,
        totalEvaluadas,
        avaluosHoy,
        tasaAprobacion: totalEvaluadas > 0 ? 
          Math.round((solicitudesAprobadas / totalEvaluadas) * 100) : 0
      }
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/solicitudes', async (req, res) => {
  try {
    const { page = 1, limit = 10, estado, busqueda } = req.query;
    
    console.log('[EVALUADOR] Obteniendo solicitudes con filtros:', { page, limit, estado, busqueda });

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    
    if (estado) {
      const estadosValidos = ['Pendiente', 'Evaluando', 'Aprobada', 'Rechazada', 'Cancelada'];
      if (estadosValidos.includes(estado)) {
        where.estado = estado;
      } else {
        where.estado = { in: ['Pendiente', 'Evaluando'] };
      }
    } else {
      where.estado = { in: ['Pendiente', 'Evaluando'] };
    }

    if (busqueda) {
      where.OR = [
        { usuario: { nombre: { contains: busqueda, mode: 'insensitive' } } },
        { usuario: { apellido: { contains: busqueda, mode: 'insensitive' } } }
      ];
    }

    const [solicitudes, total] = await Promise.all([
      prisma.solicitudPrestamo.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true
            }
          }
        },
        orderBy: { fechaSolicitud: 'desc' },
        skip: offset,
        take: limitNum
      }),
      
      prisma.solicitudPrestamo.count({ where })
    ]);

    const solicitudesFormateadas = solicitudes.map(solicitud => ({
      id: solicitud.id,
      fechaSolicitud: solicitud.fechaSolicitud,
      estado: solicitud.estado,
      montoSolicitado: solicitud.montoSolicitado,
      plazoMeses: solicitud.plazoMeses,
      tasaInteres: solicitud.tasaInteres,
      modalidadPago: solicitud.modalidadPago,
      usuario: solicitud.usuario,
      diasPendiente: Math.floor((new Date() - new Date(solicitud.fechaSolicitud)) / (1000 * 60 * 60 * 24))
    }));

    console.log('[EVALUADOR] Solicitudes obtenidas:', { cantidad: solicitudesFormateadas.length, estado: estado || 'todos', total });

    res.status(200).json({
      success: true,
      data: {
        solicitudes: solicitudesFormateadas,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/solicitudes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('[EVALUADOR] Obteniendo detalle de solicitud:', id);

    const solicitud = await prisma.solicitudPrestamo.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            cedula: true,
            direccion: true,
            fechaNacimiento: true,
            fechaRegistro: true
          }
        },
        articulos: {
          include: {
            tipoArticulo: true
          }
        }
      }
    });

    if (!solicitud) {
      console.log('[EVALUADOR] Solicitud no encontrada:', id);
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    const respuesta = {
      id: solicitud.id,
      fechaSolicitud: solicitud.fechaSolicitud,
      estado: solicitud.estado,
      montoSolicitado: solicitud.montoSolicitado,
      plazoMeses: solicitud.plazoMeses,
      modalidadPago: solicitud.modalidadPago,
      observaciones: solicitud.observaciones,
      usuario: solicitud.usuario,
      articulos: solicitud.articulos,
      diasPendiente: Math.floor((new Date() - new Date(solicitud.fechaSolicitud)) / (1000 * 60 * 60 * 24)),
      requiereAtencionUrgente: solicitud.estado === 'Pendiente' && 
        Math.floor((new Date() - new Date(solicitud.fechaSolicitud)) / (1000 * 60 * 60 * 24)) > 3
    };

    console.log('[EVALUADOR] Detalle de solicitud obtenido exitosamente');

    res.status(200).json({
      success: true,
      data: respuesta
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo detalle de solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/solicitudes/:id/archivos', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('[EVALUADOR] Obteniendo archivos de solicitud:', id);

    const solicitud = await prisma.solicitudPrestamo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    const documentos = await prisma.documento.findMany({
      where: {
        idRelacionado: parseInt(id),
        tipoRelacion: 'Solicitud'
      },
      orderBy: [
        { tipoDocumento: 'asc' },
        { fechaSubida: 'asc' }
      ]
    });

    const archivos = {
      fotos: [],
      documentos: [],
      otros: []
    };

    documentos.forEach(doc => {
      const archivo = {
        id: doc.id,
        tipo: doc.tipoDocumento,
        nombreArchivo: doc.nombreArchivo,
        rutaArchivo: doc.rutaArchivo,
        fechaSubida: doc.fechaSubida,
        tamanoArchivo: doc.tamanoArchivo ? parseInt(doc.tamanoArchivo) : null,
        tipoMime: doc.tipoMime
      };

      if (doc.tipoDocumento === 'Foto_Prenda') {
        archivos.fotos.push(archivo);
      } else if (doc.tipoDocumento === 'Especificaciones') {
        archivos.documentos.push(archivo);
      } else {
        archivos.otros.push(archivo);
      }
    });

    console.log('[EVALUADOR] Archivos obtenidos:', { fotos: archivos.fotos.length, documentos: archivos.documentos.length, otros: archivos.otros.length });

    res.status(200).json({
      success: true,
      data: {
        archivos,
        total: documentos.length,
        resumen: {
          fotos: archivos.fotos.length,
          documentos: archivos.documentos.length,
          otros: archivos.otros.length
        }
      }
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener archivos de la solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/recent-activity', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const limitNum = parseInt(limit);

    console.log('[EVALUADOR] Obteniendo actividad reciente');

    const whereClause = req.user.tipoUsuario === 'Evaluador' 
      ? { evaluadorId: req.user.id }
      : {};

    const actividadReciente = await prisma.solicitudPrestamo.findMany({
      where: {
        ...whereClause,
        estado: { in: ['Aprobada', 'Rechazada', 'Evaluando'] },
        fechaEvaluacion: { not: null }
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true
          }
        },
        evaluador: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: { fechaEvaluacion: 'desc' },
      take: limitNum
    });

    const actividadFormateada = actividadReciente.map(solicitud => ({
      id: solicitud.id,
      tipo: 'evaluacion',
      accion: solicitud.estado === 'Aprobada' ? 'aprobó' : 
              solicitud.estado === 'Rechazada' ? 'rechazó' : 'está evaluando',
      descripcion: `Solicitud ${solicitud.estado.toLowerCase()}`,
      cliente: `${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`,
      evaluador: solicitud.evaluador ? 
        `${solicitud.evaluador.nombre} ${solicitud.evaluador.apellido}` : 
        'Sistema',
      fecha: solicitud.fechaEvaluacion,
      montoSolicitado: solicitud.montoSolicitado,
      estado: solicitud.estado
    }));

    console.log('[EVALUADOR] Actividad reciente obtenida:', actividadFormateada.length);

    res.status(200).json({
      success: true,
      data: actividadFormateada
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo actividad reciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad reciente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/solicitudes/:id/evaluar', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      decision, 
      montoAutorizado, 
      tasaInteres, 
      plazoMeses, 
      modalidadPago, 
      observaciones 
    } = req.body;
    const evaluadorId = req.user.id;
    
    console.log('[EVALUADOR] Iniciando evaluación:', { solicitudId: id, decision, evaluadorId, montoAutorizado });

    if (!decision || !['aprobar', 'rechazar'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decisión inválida. Debe ser "aprobar" o "rechazar"'
      });
    }

    if (decision === 'aprobar') {
      if (!montoAutorizado || montoAutorizado <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto autorizado debe ser mayor a 0'
        });
      }

      if (!tasaInteres || tasaInteres <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La tasa de interés debe ser mayor a 0'
        });
      }

      if (!plazoMeses || plazoMeses <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El plazo debe ser mayor a 0 meses'
        });
      }

      if (!modalidadPago) {
        return res.status(400).json({
          success: false,
          message: 'La modalidad de pago es requerida'
        });
      }
    }

    const solicitud = await prisma.solicitudPrestamo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (solicitud.estado !== 'Pendiente' && solicitud.estado !== 'Evaluando') {
      return res.status(400).json({
        success: false,
        message: `La solicitud ya fue evaluada. Estado actual: ${solicitud.estado}`
      });
    }

    let datosActualizacion = {
      estado: decision === 'aprobar' ? 'Aprobada' : 'Rechazada',
      evaluadorId: evaluadorId,
      fechaEvaluacion: new Date(),
      observaciones: observaciones || (decision === 'rechazar' ? 'Solicitud rechazada' : 'Solicitud aprobada')
    };

    if (decision === 'aprobar') {
      const monto = parseFloat(montoAutorizado);
      const tasa = parseFloat(tasaInteres);
      const plazo = parseInt(plazoMeses);
      
      // USAR EL TOTAL QUE YA VIENE EN LA SOLICITUD si existe
      // Solo recalcular si no existe o si cambió algún parámetro
      let totalAPagar = solicitud.totalAPagar;
      
      // Verificar si cambió algún parámetro
      const cambioParametros = 
        parseFloat(solicitud.montoSolicitado) !== monto ||
        parseFloat(solicitud.tasaInteres) !== tasa ||
        parseInt(solicitud.plazoMeses) !== plazo;
      
      if (cambioParametros || !totalAPagar) {
        // Solo recalcular si cambiaron los parámetros
        const interes = monto * (tasa / 100) * plazo;
        totalAPagar = monto + interes;
        
        console.log('[EVALUADOR] Recalculando total porque cambiaron parámetros:', { montoAnterior: solicitud.montoSolicitado, montoNuevo: monto, tasaAnterior: solicitud.tasaInteres, tasaNueva: tasa, plazoAnterior: solicitud.plazoMeses, plazoNuevo: plazo, interesCalculado: interes, totalCalculado: totalAPagar });
      } else {
        console.log('[EVALUADOR] Manteniendo el total original de la solicitud:', totalAPagar);
      }

      datosActualizacion = {
        ...datosActualizacion,
        montoSolicitado: monto,
        tasaInteres: tasa,
        plazoMeses: plazo,
        modalidadPago: modalidadPago,
        totalAPagar: totalAPagar
      };
    }

    const solicitudActualizada = await prisma.solicitudPrestamo.update({
      where: { id: parseInt(id) },
      data: datosActualizacion,
      include: {
        usuario: true
      }
    });

    console.log('[EVALUADOR] Solicitud evaluada exitosamente:', { id: solicitudActualizada.id, estado: solicitudActualizada.estado, totalAPagar: solicitudActualizada.totalAPagar });

    // Enviar notificación por email
    if (solicitudActualizada.usuario) {
      try {
        console.log('[EVALUADOR] Enviando email de notificación al usuario...');
        await emailService.enviarEmailCambioEstadoSolicitud(
          solicitudActualizada.usuario,
          solicitudActualizada,
          solicitudActualizada.estado
        );
        console.log('[EVALUADOR] Email de notificación enviado exitosamente');
      } catch (emailError) {
        console.error('[EVALUADOR] ❌ Error enviando email de notificación:', emailError);
        console.error('[EVALUADOR] Detalles del error:', {
          message: emailError.message,
          usuario: solicitudActualizada.usuario?.email || 'NO DISPONIBLE',
          solicitudId: solicitudActualizada.id,
          estado: solicitudActualizada.estado
        });
        // No lanzar el error para no bloquear la respuesta
      }
    } else {
      console.warn('[EVALUADOR] ⚠️ No se pudo enviar email: usuario no disponible en solicitud');
    }

    res.status(200).json({
      success: true,
      message: decision === 'aprobar'
        ? 'Solicitud aprobada exitosamente'
        : 'Solicitud rechazada',
      data: {
        id: solicitudActualizada.id,
        estado: solicitudActualizada.estado,
        montoAutorizado: decision === 'aprobar' ? solicitudActualizada.montoSolicitado : null,
        totalAPagar: decision === 'aprobar' ? solicitudActualizada.totalAPagar : null
      }
    });

  } catch (error) {
    console.error('[EVALUADOR] Error evaluando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al evaluar la solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/mis-avaluos', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    console.log('[EVALUADOR] Obteniendo historial de avalúos');

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const whereClause = req.user.tipoUsuario === 'Evaluador'
      ? { evaluadorId: req.user.id }
      : {};

    const [avaluos, total] = await Promise.all([
      prisma.avaluo.findMany({
        where: whereClause,
        include: {
          articulo: {
            include: {
              tipoArticulo: true
            }
          },
          evaluador: {
            select: {
              nombre: true,
              apellido: true
            }
          }
        },
        orderBy: { fechaAvaluo: 'desc' },
        skip: offset,
        take: limitNum
      }),
      
      prisma.avaluo.count({ where: whereClause })
    ]);

    console.log('[EVALUADOR] Avalúos obtenidos:', avaluos.length);

    res.status(200).json({
      success: true,
      data: avaluos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo avalúos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de avalúos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.use((error, req, res, next) => {
  console.error('Error en rutas de evaluador:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en el panel de evaluador',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;