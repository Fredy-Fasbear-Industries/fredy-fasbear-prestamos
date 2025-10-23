import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import emailService from '../services/email.service.js';
import pdfService from '../services/pdf.service.js';

const router = express.Router();
const prisma = new PrismaClient();

const cobradorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Demasiadas peticiones. Intenta en unos minutos.'
  }
});

router.use((req, res, next) => {
  console.log(`Cobrador API: ${req.method} ${req.path}`);
  next();
});

router.use(authenticateToken);
router.use(cobradorLimiter);

const requireCobrador = (req, res, next) => {
  if (!['Cobrador', 'Administrador'].includes(req.user.tipoUsuario)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de Cobrador o Administrador'
    });
  }
  next();
};

router.use(requireCobrador);

router.get('/estadisticas', async (req, res) => {
  try {
    console.log('[COBRADOR] Obteniendo estadísticas...');

    const [
      pagosPendientes,
      pagosValidados,
      pagosRechazados,
      totalPendiente
    ] = await Promise.all([
      prisma.pago.count({
        where: { estadoValidacion: 'Pendiente' }
      }),
      prisma.pago.count({
        where: { estadoValidacion: 'Validado' }
      }),
      prisma.pago.count({
        where: { estadoValidacion: 'Rechazado' }
      }),
      prisma.pago.aggregate({
        where: { estadoValidacion: 'Pendiente' },
        _sum: { montoPago: true }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        pagosPendientes,
        pagosValidados,
        pagosRechazados,
        montoTotalPendiente: totalPendiente._sum.montoPago || 0
      }
    });

  } catch (error) {
    console.error('[COBRADOR] Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
});

router.get('/pagos-pendientes', async (req, res) => {
  try {
    const { limite = 50, pagina = 1 } = req.query;
    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    console.log('[COBRADOR] Obteniendo pagos pendientes de validación...');

    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where: { estadoValidacion: 'Pendiente' },
        select: {
          id: true,
          montoPago: true,
          fechaPago: true,
          tipoPago: true,
          imagenComprobante: true,
          observaciones: true,
          nombreBanco: true,
          numeroTransaccion: true,
          prestamoId: true,
          pedidoId: true,
          prestamo: {
            select: {
              id: true,
              numeroPrestamo: true,
              saldoPendiente: true,
              estado: true,
              contrato: {
                select: {
                  solicitud: {
                    select: {
                      usuario: {
                        select: {
                          id: true,
                          nombre: true,
                          apellido: true,
                          email: true,
                          telefono: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          pedido: {
            select: {
              id: true,
              fechaPedido: true,
              totalPedido: true,
              metodoPago: true,
              usuarioComprador: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  email: true,
                  telefono: true
                }
              }
            }
          }
        },
        orderBy: { fechaPago: 'desc' },
        skip,
        take: parseInt(limite)
      }),
      prisma.pago.count({
        where: { estadoValidacion: 'Pendiente' }
      })
    ]);

    const pagosFormateados = pagos.map(pago => {
      const esPrestamo = !!pago.prestamoId;
      
      if (esPrestamo && pago.prestamo) {
        const cliente = pago.prestamo.contrato?.solicitud?.usuario || null;
        
        return {
          id: pago.id,
          monto: parseFloat(pago.montoPago || 0),
          fechaPago: pago.fechaPago,
          tipoPago: pago.tipoPago || 'Efectivo',
          comprobante: pago.imagenComprobante,
          observaciones: pago.observaciones,
          banco: pago.nombreBanco || 'No especificado',
          numeroTransaccion: pago.numeroTransaccion || 'N/A',
          tipo: 'prestamo',
          prestamo: {
            id: pago.prestamo.id,
            numeroPrestamo: pago.prestamo.numeroPrestamo,
            saldoPendiente: parseFloat(pago.prestamo.saldoPendiente || 0),
            estado: pago.prestamo.estado,
            cliente: cliente ? {
              id: cliente.id,
              nombre: cliente.nombre || 'Cliente',
              apellido: cliente.apellido || 'No disponible',
              email: cliente.email || '',
              telefono: cliente.telefono || ''
            } : {
              id: 0,
              nombre: 'Cliente',
              apellido: 'No disponible',
              email: '',
              telefono: ''
            }
          }
        };
      } else if (pago.pedido) {
        return {
          id: pago.id,
          monto: parseFloat(pago.montoPago || 0),
          fechaPago: pago.fechaPago,
          tipoPago: pago.tipoPago || 'Transferencia',
          comprobante: pago.imagenComprobante,
          observaciones: pago.observaciones,
          banco: pago.nombreBanco || 'No especificado',
          numeroTransaccion: pago.numeroTransaccion || 'N/A',
          tipo: 'pedido',
          prestamo: {
            id: pago.pedido.id,
            numeroPrestamo: `PEDIDO-${pago.pedido.id}`,
            saldoPendiente: 0,
            estado: 'Pedido',
            cliente: {
              id: pago.pedido.usuarioComprador?.id || 0,
              nombre: pago.pedido.usuarioComprador?.nombre || 'Cliente',
              apellido: pago.pedido.usuarioComprador?.apellido || 'No disponible',
              email: pago.pedido.usuarioComprador?.email || '',
              telefono: pago.pedido.usuarioComprador?.telefono || ''
            }
          }
        };
      }
      
      return {
        id: pago.id,
        monto: parseFloat(pago.montoPago || 0),
        fechaPago: pago.fechaPago,
        tipoPago: pago.tipoPago || 'Efectivo',
        comprobante: pago.imagenComprobante,
        observaciones: pago.observaciones,
        banco: pago.nombreBanco || 'No especificado',
        numeroTransaccion: pago.numeroTransaccion || 'N/A',
        tipo: 'desconocido',
        prestamo: {
          id: 0,
          numeroPrestamo: 'N/A',
          saldoPendiente: 0,
          estado: 'Desconocido',
          cliente: {
            id: 0,
            nombre: 'Cliente',
            apellido: 'No disponible',
            email: '',
            telefono: ''
          }
        }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        pagos: pagosFormateados,
        paginacion: {
          total,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: Math.ceil(total / parseInt(limite))
        }
      }
    });

  } catch (error) {
    console.error('[COBRADOR] Error obteniendo pagos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pagos pendientes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/comprobante/:pagoId', async (req, res) => {
  try {
    const { pagoId } = req.params;

    console.log('[COBRADOR] Obteniendo comprobante:', pagoId);

    const pago = await prisma.pago.findUnique({
      where: { id: parseInt(pagoId) },
      select: {
        imagenComprobante: true,
        tipoPago: true,
        montoPago: true,
        fechaPago: true,
        numeroTransaccion: true,
        prestamo: {
          select: {
            contrato: {
              select: {
                solicitud: {
                  select: {
                    usuario: {
                      select: {
                        nombre: true,
                        apellido: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        tieneComprobante: !!pago.imagenComprobante,
        url: pago.imagenComprobante || null,
        tipoPago: pago.tipoPago || 'Efectivo',
        monto: parseFloat(pago.montoPago),
        fecha: pago.fechaPago,
        referencia: pago.numeroTransaccion || 'N/A',
        cliente: pago.prestamo?.contrato?.solicitud?.usuario ? 
          `${pago.prestamo.contrato.solicitud.usuario.nombre} ${pago.prestamo.contrato.solicitud.usuario.apellido}` : 
          'Cliente no disponible'
      }
    });

  } catch (error) {
    console.error('[COBRADOR] Error obteniendo comprobante:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo comprobante'
    });
  }
});

router.get('/pagos-validados', async (req, res) => {
  try {
    const { limite = 50, pagina = 1 } = req.query;
    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    console.log('[COBRADOR] Obteniendo pagos validados...');

    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where: { estadoValidacion: 'Validado' },
        select: {
          id: true,
          montoPago: true,
          fechaPago: true,
          tipoPago: true,
          imagenComprobante: true,
          observaciones: true,
          nombreBanco: true,
          numeroTransaccion: true,
          updatedAt: true,
          prestamo: {
            select: {
              id: true,
              numeroPrestamo: true,
              saldoPendiente: true,
              estado: true,
              contrato: {
                select: {
                  solicitud: {
                    select: {
                      usuario: {
                        select: {
                          id: true,
                          nombre: true,
                          apellido: true,
                          email: true,
                          telefono: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          validador: {
            select: {
              nombre: true,
              apellido: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limite)
      }),
      prisma.pago.count({
        where: { estadoValidacion: 'Validado' }
      })
    ]);

    const pagosFormateados = pagos.map(pago => {
      const cliente = pago.prestamo?.contrato?.solicitud?.usuario || null;
      
      return {
        id: pago.id,
        monto: parseFloat(pago.montoPago || 0),
        fechaPago: pago.fechaPago,
        tipoPago: pago.tipoPago || 'Efectivo',
        comprobante: pago.imagenComprobante,
        observaciones: pago.observaciones,
        banco: pago.nombreBanco || 'No especificado',
        numeroTransaccion: pago.numeroTransaccion || 'N/A',
        validadoPor: pago.validador 
          ? `${pago.validador.nombre} ${pago.validador.apellido}` 
          : 'Sistema',
        fechaValidacion: pago.updatedAt,
        prestamo: {
          id: pago.prestamo?.id || 0,
          numeroPrestamo: pago.prestamo?.numeroPrestamo || 'N/A',
          saldoPendiente: parseFloat(pago.prestamo?.saldoPendiente || 0),
          estado: pago.prestamo?.estado || 'Desconocido',
          cliente: cliente ? {
            id: cliente.id,
            nombre: cliente.nombre || 'Cliente',
            apellido: cliente.apellido || 'No disponible',
            email: cliente.email || '',
            telefono: cliente.telefono || ''
          } : {
            id: 0,
            nombre: 'Cliente',
            apellido: 'No disponible',
            email: '',
            telefono: ''
          }
        }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        pagos: pagosFormateados,
        paginacion: {
          total,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: Math.ceil(total / parseInt(limite))
        }
      }
    });

  } catch (error) {
    console.error('[COBRADOR] Error obteniendo pagos validados:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pagos validados',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/pagos-rechazados', async (req, res) => {
  try {
    const { limite = 50, pagina = 1 } = req.query;
    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    console.log('[COBRADOR] Obteniendo pagos rechazados...');

    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where: { estadoValidacion: 'Rechazado' },
        select: {
          id: true,
          montoPago: true,
          fechaPago: true,
          tipoPago: true,
          imagenComprobante: true,
          observaciones: true,
          nombreBanco: true,
          numeroTransaccion: true,
          updatedAt: true,
          prestamo: {
            select: {
              id: true,
              numeroPrestamo: true,
              saldoPendiente: true,
              estado: true,
              contrato: {
                select: {
                  solicitud: {
                    select: {
                      usuario: {
                        select: {
                          id: true,
                          nombre: true,
                          apellido: true,
                          email: true,
                          telefono: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          validador: {
            select: {
              nombre: true,
              apellido: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limite)
      }),
      prisma.pago.count({
        where: { estadoValidacion: 'Rechazado' }
      })
    ]);

    const pagosFormateados = pagos.map(pago => {
      const cliente = pago.prestamo?.contrato?.solicitud?.usuario || null;
      
      return {
        id: pago.id,
        monto: parseFloat(pago.montoPago || 0),
        fechaPago: pago.fechaPago,
        tipoPago: pago.tipoPago || 'Efectivo',
        comprobante: pago.imagenComprobante,
        observaciones: pago.observaciones,
        banco: pago.nombreBanco || 'No especificado',
        numeroTransaccion: pago.numeroTransaccion || 'N/A',
        rechazadoPor: pago.validador 
          ? `${pago.validador.nombre} ${pago.validador.apellido}` 
          : 'Sistema',
        fechaRechazo: pago.updatedAt,
        prestamo: {
          id: pago.prestamo?.id || 0,
          numeroPrestamo: pago.prestamo?.numeroPrestamo || 'N/A',
          saldoPendiente: parseFloat(pago.prestamo?.saldoPendiente || 0),
          estado: pago.prestamo?.estado || 'Desconocido',
          cliente: cliente ? {
            id: cliente.id,
            nombre: cliente.nombre || 'Cliente',
            apellido: cliente.apellido || 'No disponible',
            email: cliente.email || '',
            telefono: cliente.telefono || ''
          } : {
            id: 0,
            nombre: 'Cliente',
            apellido: 'No disponible',
            email: '',
            telefono: ''
          }
        }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        pagos: pagosFormateados,
        paginacion: {
          total,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: Math.ceil(total / parseInt(limite))
        }
      }
    });

  } catch (error) {
    console.error('[COBRADOR] Error obteniendo pagos rechazados:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pagos rechazados',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/pagos/:pagoId/validar', async (req, res) => {
  try {
    const { pagoId } = req.params;
    const { decision, observaciones } = req.body;

    if (!['Validado', 'Rechazado'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decisión no válida. Debe ser "Validado" o "Rechazado"'
      });
    }

    if (decision === 'Rechazado' && !observaciones) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un motivo para rechazar el pago'
      });
    }

    console.log('[COBRADOR] Validando pago:', pagoId, decision);

    const pago = await prisma.pago.findUnique({
      where: { id: parseInt(pagoId) },
      include: {
        prestamo: {
          include: {
            contrato: {
              include: {
                solicitud: {
                  include: {
                    usuario: true
                  }
                }
              }
            }
          }
        },
        pedido: true
      }
    });

    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    if (pago.estadoValidacion !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Este pago ya fue procesado'
      });
    }

    const resultado = await prisma.$transaction(async (prisma) => {
      const pagoActualizado = await prisma.pago.update({
        where: { id: parseInt(pagoId) },
        data: {
          estadoValidacion: decision,
          observaciones: observaciones || pago.observaciones,
          validadorId: req.user.id
        }
      });

      let prestamoActualizado = null;

      if (decision === 'Validado') {
        if (pago.prestamoId) {
          const nuevoSaldo = Number(pago.prestamo.saldoPendiente) - Number(pago.montoPago);
          const nuevoEstado = nuevoSaldo <= 0 ? 'Pagado' : pago.prestamo.estado;

          prestamoActualizado = await prisma.prestamo.update({
            where: { id: pago.prestamoId },
            data: {
              saldoPendiente: Math.max(0, nuevoSaldo),
              estado: nuevoEstado
            }
          });
        } else if (pago.pedidoId) {
          await prisma.pedido.update({
            where: { id: pago.pedidoId },
            data: {
              estadoPedido: 'Procesando'
            }
          });

          const detalles = await prisma.detallePedido.findMany({
            where: { pedidoId: pago.pedidoId }
          });

          for (const detalle of detalles) {
            await prisma.productoTienda.update({
              where: { id: detalle.productoId },
              data: { estado: 'Vendido' }
            });
          }
        }
      } else if (decision === 'Rechazado') {
        if (pago.pedidoId) {
          await prisma.pedido.update({
            where: { id: pago.pedidoId },
            data: {
              estadoPedido: 'Cancelado'
            }
          });

          const detalles = await prisma.detallePedido.findMany({
            where: { pedidoId: pago.pedidoId }
          });

          for (const detalle of detalles) {
            await prisma.productoTienda.update({
              where: { id: detalle.productoId },
              data: { estado: 'Disponible' }
            });
          }
        }
      }

      return { pagoActualizado, prestamoActualizado };
    });

    if (pago.prestamo?.contrato?.solicitud?.usuario) {
      try {
        const prestamoParaEmail = resultado.prestamoActualizado || pago.prestamo;

        // Enviar email de notificación de validación
        await emailService.enviarEmailPagoValidado(
          pago.prestamo.contrato.solicitud.usuario,
          resultado.pagoActualizado,
          prestamoParaEmail,
          decision
        );

        // Si el pago fue validado (aprobado), generar y enviar recibo oficial con PDF
        if (decision === 'Validado') {
          console.log('[COBRADOR] Pago validado, generando recibo oficial con PDF...');

          const cliente = pago.prestamo.contrato.solicitud.usuario;
          const datosPrestamo = {
            numeroPrestamo: prestamoParaEmail.numeroPrestamo,
            saldoPendiente: prestamoParaEmail.saldoPendiente,
            estado: prestamoParaEmail.estado
          };

          // Generar PDF del recibo
          const reciboPDF = await pdfService.generarReciboPago(resultado.pagoActualizado, datosPrestamo, cliente);

          console.log('[COBRADOR] PDF generado, guardando en filesystem...');

          // Guardar el PDF en el filesystem
          const rutaRecibo = await pdfService.guardarPDF(
            reciboPDF,
            `prestamos/${pago.prestamoId}/recibos`,
            `recibo_${resultado.pagoActualizado.id}.pdf`
          );

          // Guardar referencia del recibo en la BD
          await prisma.documento.create({
            data: {
              tipoDocumento: 'Recibo',
              nombreArchivo: `recibo_pago_${resultado.pagoActualizado.id}`,
              rutaArchivo: rutaRecibo,
              idRelacionado: resultado.pagoActualizado.id,
              tipoRelacion: 'Pago',
              tamanoArchivo: reciboPDF.length,
              tipoMime: 'application/pdf'
            }
          });

          console.log('[COBRADOR] Recibo guardado, enviando email con PDF...');

          // Enviar recibo oficial con PDF
          await emailService.enviarReciboPago(cliente, resultado.pagoActualizado, datosPrestamo, reciboPDF);

          console.log('[COBRADOR] Recibo oficial enviado por email exitosamente');
        }
      } catch (emailError) {
        console.error('[COBRADOR] Error enviando email de notificación:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Pago ${decision.toLowerCase()} exitosamente`,
      data: {
        pago: {
          id: resultado.pagoActualizado.id,
          estado: resultado.pagoActualizado.estadoValidacion,
          monto: parseFloat(resultado.pagoActualizado.montoPago),
          tipo: pago.prestamoId ? 'prestamo' : 'pedido'
        }
      }
    });

  } catch (error) {
    console.error('[COBRADOR] Error validando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando el pago'
    });
  }
});

router.use((error, req, res, next) => {
  console.error('Error en rutas de cobrador:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de cobrador',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

router.get('/pedidos-pendientes', async (req, res) => {
  try {
    const { limite = 50, pagina = 1 } = req.query;
    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    console.log('[COBRADOR] Obteniendo pedidos pendientes de validación...');

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where: { 
          estadoPedido: 'Pendiente',
          metodoPago: 'Transferencia'
        },
        include: {
          usuarioComprador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true
            }
          },
          detalles: {
            include: {
              producto: {
                include: {
                  articulo: true
                }
              }
            }
          }
        },
        orderBy: { fechaPedido: 'desc' },
        skip,
        take: parseInt(limite)
      }),
      prisma.pedido.count({
        where: { 
          estadoPedido: 'Pendiente',
          metodoPago: 'Transferencia'
        }
      })
    ]);

    const pedidosFormateados = pedidos.map(pedido => ({
      id: pedido.id,
      fechaPedido: pedido.fechaPedido,
      total: parseFloat(pedido.totalPedido),
      metodoPago: pedido.metodoPago,
      bancoOrigen: pedido.bancoOrigen,
      fechaTransferencia: pedido.fechaTransferencia,
      numeroTransaccion: pedido.numeroTransaccion,
      comprobante: pedido.comprobanteTransferencia,
      direccionEnvio: pedido.direccionEnvio,
      cliente: {
        id: pedido.usuarioComprador.id,
        nombre: `${pedido.usuarioComprador.nombre} ${pedido.usuarioComprador.apellido}`,
        email: pedido.usuarioComprador.email,
        telefono: pedido.usuarioComprador.telefono
      },
      productos: pedido.detalles.map(d => ({
        descripcion: d.producto.articulo.descripcion,
        cantidad: d.cantidad,
        precio: parseFloat(d.precioUnitario),
        subtotal: parseFloat(d.subtotal)
      }))
    }));

    res.status(200).json({
      success: true,
      data: {
        pedidos: pedidosFormateados,
        paginacion: {
          total,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: Math.ceil(total / parseInt(limite))
        }
      }
    });

  } catch (error) {
    console.error('[COBRADOR] Error obteniendo pedidos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo pedidos pendientes'
    });
  }
});

router.post('/pedidos/:pedidoId/validar', async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const { decision, observaciones } = req.body;

    if (!['Procesando', 'Cancelado'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decisión no válida. Debe ser "Procesando" (aprobar) o "Cancelado" (rechazar)'
      });
    }

    if (decision === 'Cancelado' && !observaciones) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un motivo para rechazar el pedido'
      });
    }

    console.log('[COBRADOR] Validando pedido:', pedidoId, decision);

    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(pedidoId) },
      include: {
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    if (pedido.estadoPedido !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Este pedido ya fue procesado'
      });
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.pedido.update({
        where: { id: parseInt(pedidoId) },
        data: {
          estadoPedido: decision,
          observaciones: observaciones || pedido.observaciones
        }
      });

      if (decision === 'Procesando') {
        for (const detalle of pedido.detalles) {
          await prisma.productoTienda.update({
            where: { id: detalle.productoId },
            data: { estado: 'Vendido' }
          });
        }
      } else {
        for (const detalle of pedido.detalles) {
          await prisma.productoTienda.update({
            where: { id: detalle.productoId },
            data: { estado: 'Disponible' }
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      message: decision === 'Procesando' 
        ? 'Pedido aprobado exitosamente' 
        : 'Pedido rechazado',
      data: {
        pedidoId: parseInt(pedidoId),
        nuevoEstado: decision
      }
    });

  } catch (error) {
    console.error('[COBRADOR] Error validando pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando pedido'
    });
  }
});

router.get('/pedidos/:pedidoId/comprobante', async (req, res) => {
  try {
    const { pedidoId } = req.params;

    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(pedidoId) },
      select: {
        comprobanteTransferencia: true,
        bancoOrigen: true,
        numeroTransaccion: true,
        fechaTransferencia: true,
        totalPedido: true,
        usuarioComprador: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        tieneComprobante: !!pedido.comprobanteTransferencia,
        url: pedido.comprobanteTransferencia || null,
        banco: pedido.bancoOrigen || 'No especificado',
        numeroTransaccion: pedido.numeroTransaccion || 'N/A',
        fechaTransferencia: pedido.fechaTransferencia,
        monto: parseFloat(pedido.totalPedido),
        cliente: pedido.usuarioComprador ? 
          `${pedido.usuarioComprador.nombre} ${pedido.usuarioComprador.apellido}` : 
          'Cliente no disponible'
      }
    });

  } catch (error) {
    console.error('[COBRADOR] Error obteniendo comprobante:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo comprobante'
    });
  }
});

export default router;