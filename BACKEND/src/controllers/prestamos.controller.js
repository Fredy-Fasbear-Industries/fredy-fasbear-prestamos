import { PrismaClient } from '@prisma/client';
import { UploadService } from '../services/upload.service.js';
import pdfService from '../services/pdf.service.js';
import emailService from '../services/email.service.js';

const prisma = new PrismaClient();
const uploadService = new UploadService();

export default {
  async getMisPrestamos(req, res) {
    try {
      const userId = req.user.id;
      const { estado, limite = 10, pagina = 1 } = req.query;

      console.log(`Obteniendo préstamos para usuario: ${userId}`);

      const whereClause = {
        contrato: {
          solicitud: {
            usuarioId: userId
          }
        },
        ...(estado && estado !== 'todos' && { estado })
      };

      const prestamos = await prisma.prestamo.findMany({
        where: whereClause,
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
                  },
                  articulos: {
                    include: {
                      tipoArticulo: true
                    }
                  }
                }
              }
            }
          },
          pagos: {
            orderBy: { fechaPago: 'desc' }
          },
          planPagos: {
            orderBy: { numeroCuota: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limite),
        skip: (parseInt(pagina) - 1) * parseInt(limite)
      });

      const prestamosFormateados = prestamos.map(prestamo => {
        const articulo = prestamo.contrato?.solicitud?.articulos?.[0];
        const hoy = new Date();
        const vencimiento = new Date(prestamo.fechaVencimiento);
        const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
        const inicio = new Date(prestamo.fechaInicio);
        const tiempoTotal = vencimiento - inicio;
        const tiempoTranscurrido = hoy - inicio;
        const porcentajeTiempo = Math.min(100, Math.max(0, (tiempoTranscurrido / tiempoTotal) * 100));

        return {
          id: prestamo.id,
          montoPrestado: prestamo.montoPrestado,
          tasaInteres: prestamo.tasaInteres,
          plazoMeses: prestamo.plazoMeses,
          fechaInicio: prestamo.fechaInicio,
          fechaVencimiento: prestamo.fechaVencimiento,
          estado: prestamo.estado,
          saldoPendiente: prestamo.saldoPendiente,
          costoAlmacenamiento: prestamo.costoAlmacenamiento,
          diasRestantes: Math.max(0, diasRestantes),
          porcentajeTiempo: Math.round(porcentajeTiempo),
          contrato: {
            id: prestamo.contrato?.id,
            fechaFirma: prestamo.contrato?.fechaFirma,
            estadoFirma: prestamo.contrato?.estadoFirma,
            solicitud: {
              id: prestamo.contrato?.solicitud?.id,
              fechaSolicitud: prestamo.contrato?.solicitud?.fechaSolicitud,
              estado: prestamo.contrato?.solicitud?.estado,
              articulos: prestamo.contrato?.solicitud?.articulos?.map(art => ({
                id: art.id,
                descripcion: art.descripcion,
                marca: art.marca,
                modelo: art.modelo,
                estadoFisico: art.estadoFisico,
                valorEstimadoCliente: art.valorEstimadoCliente,
                tipoArticulo: art.tipoArticulo?.nombre
              }))
            }
          },
          ultimoPago: prestamo.pagos?.[0] || null,
          totalPagos: prestamo.pagos?.length || 0,
          planPagos: prestamo.planPagos || []
        };
      });

      const total = await prisma.prestamo.count({ where: whereClause });

      res.status(200).json({
        success: true,
        data: {
          prestamos: prestamosFormateados,
          paginacion: {
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            total
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error obteniendo préstamos:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo préstamos',
        error: process.env.NODE_ENV ? error.message : undefined
      });
    }
  },

  async getEstadisticas(req, res) {
    try {
      const userId = req.user.id;

      console.log(`Obteniendo estadísticas para usuario: ${userId}`);

      const prestamosActivos = await prisma.prestamo.count({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: 'Activo'
        }
      });

      const prestamosVencidos = await prisma.prestamo.count({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: 'Vencido'
        }
      });

      const prestamosEnMora = await prisma.prestamo.count({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: 'En_Mora'
        }
      });

      const prestamosPagados = await prisma.prestamo.count({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: 'Pagado'
        }
      });

      const totales = await prisma.prestamo.aggregate({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: {
            in: ['Activo', 'Vencido', 'En_Mora']
          }
        },
        _sum: {
          montoPrestado: true,
          saldoPendiente: true
        }
      });

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 30);

      const prestamosPendientes = await prisma.prestamo.count({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: {
            in: ['Activo', 'Vencido']
          },
          fechaVencimiento: {
            lte: fechaLimite
          }
        }
      });

      const limiteMaximo = 50000;
      const totalPrestado = Number(totales._sum.montoPrestado) || 0;
      const limiteDisponible = Math.max(0, limiteMaximo - totalPrestado);

      const estadisticas = {
        prestamosActivos,
        prestamosPendientes,
        prestamosVencidos,
        prestamosEnMora,
        prestamosPagados,
        totalPrestado,
        saldoPendienteTotal: Number(totales._sum.saldoPendiente) || 0,
        limiteDisponible,
        limiteMaximo
      };

      res.status(200).json({
        success: true,
        data: estadisticas,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: process.env.NODE_ENV ? error.message : undefined
      });
    }
  },

  async getHistorial(req, res) {
    try {
      const userId = req.user.id;
      const { fechaInicio, fechaFin, limite = 20, pagina = 1 } = req.query;

      console.log(`Obteniendo historial para usuario: ${userId}`);

      const whereClause = {
        contrato: {
          solicitud: {
            usuarioId: userId
          }
        },
        ...(fechaInicio && fechaFin && {
          createdAt: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin)
          }
        })
      };

      const historial = await prisma.prestamo.findMany({
        where: whereClause,
        include: {
          contrato: {
            include: {
              solicitud: {
                include: {
                  articulos: {
                    include: {
                      tipoArticulo: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limite),
        skip: (parseInt(pagina) - 1) * parseInt(limite)
      });

      const total = await prisma.prestamo.count({ where: whereClause });

      const historialFormateado = historial.map(prestamo => {
        const articulo = prestamo.contrato?.solicitud?.articulos?.[0];
        return {
          id: prestamo.id,
          montoPrestado: prestamo.montoPrestado,
          saldoPendiente: prestamo.saldoPendiente,
          estado: prestamo.estado,
          fechaInicio: prestamo.fechaInicio,
          fechaVencimiento: prestamo.fechaVencimiento,
          articulo: {
            descripcion: articulo?.descripcion || 'Sin descripción',
            tipoArticulo: articulo?.tipoArticulo?.nombre || 'Sin tipo',
            marca: articulo?.marca,
            modelo: articulo?.modelo
          }
        };
      });

      res.status(200).json({
        success: true,
        data: {
          historial: historialFormateado,
          paginacion: {
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            total
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo historial',
        error: process.env.NODE_ENV ? error.message : undefined
      });
    }
  },

  async calcularSimulacion(req, res) {
    try {
      const { valorArticulo, porcentajePrestamo = 50, plazoMeses = 1 } = req.query;

      if (!valorArticulo || valorArticulo <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El valor del artículo debe ser mayor a 0'
        });
      }

      const valor = parseFloat(valorArticulo);
      const porcentaje = parseFloat(porcentajePrestamo);
      const plazo = parseInt(plazoMeses);
      const tasaInteresMensual = 5.0;
      const montoPrestamo = valor * (porcentaje / 100);
      const interesTotal = montoPrestamo * (tasaInteresMensual / 100) * plazo;
      const totalPagar = montoPrestamo + interesTotal;

      const simulacion = {
        valorArticulo: valor,
        porcentajePrestamo: porcentaje,
        plazoMeses: plazo,
        tasaInteres: tasaInteresMensual,
        montoPrestamo,
        interesTotal,
        totalPagar,
        cuotaMensual: totalPagar / plazo
      };

      res.status(200).json({
        success: true,
        data: simulacion,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error calculando simulación:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculando simulación',
        error: process.env.NODE_ENV ? error.message : undefined
      });
    }
  },

  async getDetallePrestamo(req, res) {
    try {
      const { prestamoId } = req.params;
      const userId = req.user.id;

      console.log(`Obteniendo detalle del préstamo: ${prestamoId}`);

      const prestamo = await prisma.prestamo.findFirst({
        where: {
          id: parseInt(prestamoId),
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
                  usuario: {
                    select: {
                      id: true,
                      nombre: true,
                      apellido: true,
                      email: true,
                      telefono: true
                    }
                  },
                  articulos: {
                    include: {
                      tipoArticulo: true,
                      avaluo: true
                    }
                  }
                }
              }
            }
          },
          pagos: {
            orderBy: { fechaPago: 'desc' }
          },
          planPagos: {
            orderBy: { numeroCuota: 'asc' }
          }
        }
      });

      if (!prestamo) {
        return res.status(404).json({
          success: false,
          message: 'Préstamo no encontrado'
        });
      }

      const prestamoDetallado = {
        id: prestamo.id,
        numeroPrestamo: prestamo.numeroPrestamo,
        montoPrestado: prestamo.montoPrestado,
        tasaInteres: prestamo.tasaInteres,
        plazoMeses: prestamo.plazoMeses,
        modalidadPago: prestamo.modalidadPago,
        totalAPagar: prestamo.totalAPagar,
        fechaInicio: prestamo.fechaInicio,
        fechaVencimiento: prestamo.fechaVencimiento,
        estado: prestamo.estado,
        saldoPendiente: prestamo.saldoPendiente,
        costoAlmacenamiento: prestamo.costoAlmacenamiento,
        contrato: {
          id: prestamo.contrato?.id,
          numeroContrato: prestamo.contrato?.numeroContrato,
          fechaCreacion: prestamo.contrato?.fechaCreacion,
          fechaFirma: prestamo.contrato?.fechaFirma,
          estadoFirma: prestamo.contrato?.estadoFirma,
          solicitud: {
            id: prestamo.contrato?.solicitud?.id,
            fechaSolicitud: prestamo.contrato?.solicitud?.fechaSolicitud,
            estado: prestamo.contrato?.solicitud?.estado,
            observaciones: prestamo.contrato?.solicitud?.observaciones,
            montoSolicitado: prestamo.contrato?.solicitud?.montoSolicitado,
            plazoMeses: prestamo.contrato?.solicitud?.plazoMeses,
            usuario: prestamo.contrato?.solicitud?.usuario,
            articulos: prestamo.contrato?.solicitud?.articulos?.map(art => ({
              id: art.id,
              descripcion: art.descripcion,
              marca: art.marca,
              modelo: art.modelo,
              serie: art.serie,
              color: art.color,
              estadoFisico: art.estadoFisico,
              valorEstimadoCliente: art.valorEstimadoCliente,
              especificacionesTecnicas: art.especificacionesTecnicas,
              tipoArticulo: {
                id: art.tipoArticulo?.id,
                nombre: art.tipoArticulo?.nombre
              },
              avaluo: art.avaluo ? {
                id: art.avaluo.id,
                valorComercial: art.avaluo.valorComercial,
                porcentajeAplicado: art.avaluo.porcentajeAplicado,
                montoPrestamo: art.avaluo.montoPrestamo,
                fechaAvaluo: art.avaluo.fechaAvaluo,
                observaciones: art.avaluo.observaciones
              } : null
            }))
          }
        },
        pagos: prestamo.pagos?.map(pago => ({
          id: pago.id,
          montoPago: pago.montoPago,
          fechaPago: pago.fechaPago,
          fechaDeposito: pago.fechaDeposito,
          nombreBanco: pago.nombreBanco,
          numeroTransaccion: pago.numeroTransaccion,
          tipoPago: pago.tipoPago,
          comprobante: pago.comprobante,
          imagenComprobante: pago.imagenComprobante,
          estadoValidacion: pago.estadoValidacion,
          observaciones: pago.observaciones
        })) || [],
        planPagos: prestamo.planPagos?.map(cuota => ({
          id: cuota.id,
          numeroCuota: cuota.numeroCuota,
          fechaVencimiento: cuota.fechaVencimiento,
          montoCuota: cuota.montoCuota,
          montoCapital: cuota.montoCapital,
          montoInteres: cuota.montoInteres,
          estado: cuota.estado
        })) || [],
        totalPagado: prestamo.pagos?.reduce((sum, pago) => 
          sum + Number(pago.montoPago), 0) || 0,
        proximaCuota: prestamo.planPagos?.find(cuota => 
          cuota.estado === 'Pendiente') || null
      };

      res.status(200).json({
        success: true,
        data: { prestamo: prestamoDetallado },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error obteniendo detalle del préstamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo detalle del préstamo',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async procesarPago(req, res) {
  try {
    const { prestamoId } = req.params;
    const {
      monto,
      metodoPago,
      fechaDeposito,
      nombreBanco,
      numeroTransaccion,
      observaciones
    } = req.body;
    const userId = req.user.id;

    console.log(`[PAGO] Procesando pago para préstamo: ${prestamoId}, usuario: ${userId}`);

    const prestamo = await prisma.prestamo.findFirst({
      where: {
        id: parseInt(prestamoId),
        contrato: {
          solicitud: {
            usuarioId: userId
          }
        },
        estado: {
          in: ['Activo', 'Vencido', 'En_Mora']
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
        pagos: {
          where: {
            estadoValidacion: 'Pendiente'
          },
          orderBy: {
            fechaPago: 'desc'
          }
        }
      }
    });

    if (!prestamo) {
      console.log(`[PAGO] Préstamo no encontrado: ${prestamoId} para usuario: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado o no disponible para pagos'
      });
    }

    // Verificar si ya existe un pago pendiente de validación
    if (prestamo.pagos && prestamo.pagos.length > 0) {
      const pagoPendiente = prestamo.pagos[0];
      console.log(`[PAGO] Ya existe un pago pendiente:`, pagoPendiente.id);
      return res.status(400).json({
        success: false,
        message: 'Ya existe un pago pendiente de validación. Por favor espera a que sea procesado por nuestro equipo antes de realizar otro pago.',
        data: {
          pagoPendiente: {
            id: pagoPendiente.id,
            monto: pagoPendiente.montoPago,
            fechaPago: pagoPendiente.fechaPago,
            numeroTransaccion: pagoPendiente.numeroTransaccion
          }
        }
      });
    }

    const montoNumerico = parseFloat(monto);
    if (montoNumerico <= 0 || montoNumerico > prestamo.saldoPendiente) {
      return res.status(400).json({
        success: false,
        message: `El monto debe ser mayor a 0 y no exceder Q${prestamo.saldoPendiente.toFixed(2)}`
      });
    }

    console.log(`[PAGO] Validaciones pasadas, creando pago en BD...`);

    let imagenComprobanteUrl = null;
    if (req.files && req.files.imagenComprobante) {
      const imagenFile = req.files.imagenComprobante;
      
      const validation = uploadService.validateFile(imagenFile, 'image');
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: `Imagen del comprobante: ${validation.errors.join(', ')}`
        });
      }

      imagenComprobanteUrl = await uploadService.guardarFoto(
        imagenFile, 
        `prestamos/${prestamoId}/comprobantes`
      );
    }

    const pago = await prisma.pago.create({
      data: {
        prestamoId: prestamo.id,
        montoPago: montoNumerico,
        fechaPago: new Date(),
        tipoPago: metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1).toLowerCase(),
        fechaDeposito: fechaDeposito ? new Date(fechaDeposito) : null,
        nombreBanco: nombreBanco || null,
        numeroTransaccion: numeroTransaccion || null,
        imagenComprobante: imagenComprobanteUrl,
        observaciones: observaciones || null,
        estadoValidacion: 'Pendiente'
      },
      include: {
        prestamo: {
          select: {
            id: true,
            numeroPrestamo: true,
            saldoPendiente: true,
            contrato: {
              select: {
                solicitud: {
                  select: {
                    usuario: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log(`[PAGO] Pago creado exitosamente en BD:`, { id: pago.id, prestamoId: pago.prestamoId, monto: pago.montoPago, estado: pago.estadoValidacion });

    if (imagenComprobanteUrl) {
      await prisma.documento.create({
        data: {
          tipoDocumento: 'Comprobante',
          nombreArchivo: `comprobante_pago_${pago.id}`,
          rutaArchivo: imagenComprobanteUrl,
          idRelacionado: pago.id,
          tipoRelacion: 'Pago',
          tamanoArchivo: req.files.imagenComprobante.size,
          tipoMime: req.files.imagenComprobante.mimetype
        }
      });
      console.log(`[PAGO] Documento del comprobante guardado`);
    }

    // Enviar notificación de pago recibido (sin PDF)
    try {
      console.log(`[PAGO] Enviando notificación de pago recibido...`);

      const cliente = prestamo.contrato.solicitud.usuario;
      const datosPrestamo = {
        numeroPrestamo: prestamo.numeroPrestamo,
        saldoPendiente: prestamo.saldoPendiente
      };

      // Enviar email simple de confirmación (sin PDF)
      await emailService.enviarEmailPagoRecibido(cliente, pago, datosPrestamo);

      console.log(`[PAGO] Notificación de pago recibido enviada exitosamente`);
    } catch (emailError) {
      console.error(`[PAGO] Error enviando notificación de pago recibido:`, emailError);
      console.error(`[PAGO] Detalles del error:`, {
        message: emailError.message,
        cliente: prestamo?.contrato?.solicitud?.usuario?.email || 'NO DISPONIBLE',
        prestamoId,
        pagoId: pago?.id
      });
      // No lanzar el error para no bloquear la respuesta al cliente
    }

    console.log(`[PAGO] Respondiendo al cliente con éxito`);

    res.status(200).json({
      success: true,
      message: 'Pago registrado exitosamente. Pendiente de validación. Recibirás un recibo por correo electrónico.',
      data: {
        pago: {
          id: pago.id,
          monto: pago.montoPago,
          fechaPago: pago.fechaPago,
          fechaDeposito: pago.fechaDeposito,
          banco: pago.nombreBanco,
          numeroTransaccion: pago.numeroTransaccion,
          tipo: pago.tipoPago,
          estado: pago.estadoValidacion,
          imagenComprobante: imagenComprobanteUrl
        },
        prestamo: {
          numero: pago.prestamo.numeroPrestamo,
          saldoActual: pago.prestamo.saldoPendiente
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error procesando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando el pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},

async renovarPrestamo(req, res) {
  try {
    const { prestamoId } = req.params;
    const { nuevosPlazoMeses, motivoRenovacion } = req.body;
    const userId = req.user.id;

    console.log(`Renovando préstamo: ${prestamoId}, nuevo plazo: ${nuevosPlazoMeses} meses`);

    const prestamo = await prisma.prestamo.findFirst({
      where: {
        id: parseInt(prestamoId),
        contrato: {
          solicitud: {
            usuarioId: userId
          }
        },
        estado: 'Activo'
      }
    });

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado o no disponible para renovación'
      });
    }

    const saldoPendiente = parseFloat(prestamo.saldoPendiente);
    const tasaInteresMensual = parseFloat(prestamo.tasaInteres);
    const plazoAnterior = prestamo.plazoMeses;

    const nuevosIntereses = saldoPendiente * (tasaInteresMensual / 100) * nuevosPlazoMeses;
    const nuevoTotalPagar = saldoPendiente + nuevosIntereses;

    const nuevaFechaVencimiento = new Date();
    nuevaFechaVencimiento.setMonth(nuevaFechaVencimiento.getMonth() + nuevosPlazoMeses);

    const resultado = await prisma.$transaction(async (tx) => {
      await tx.planPagos.deleteMany({
        where: {
          prestamoId: prestamo.id,
          estado: 'Pendiente'
        }
      });

      const prestamoRenovado = await tx.prestamo.update({
        where: { id: prestamo.id },
        data: {
          plazoMeses: nuevosPlazoMeses,
          saldoPendiente: nuevoTotalPagar,
          totalAPagar: nuevoTotalPagar,
          fechaVencimiento: nuevaFechaVencimiento,
          updatedAt: new Date()
        }
      });

      const montoPorCuota = nuevoTotalPagar / nuevosPlazoMeses;
      const capitalPorCuota = saldoPendiente / nuevosPlazoMeses;
      const interesPorCuota = nuevosIntereses / nuevosPlazoMeses;

      const nuevosPlanPagos = [];
      const fechaBase = new Date();

      for (let i = 1; i <= nuevosPlazoMeses; i++) {
        const fechaVencimientoCuota = new Date(fechaBase);
        fechaVencimientoCuota.setMonth(fechaVencimientoCuota.getMonth() + i);

        const cuota = await tx.planPagos.create({
          data: {
            prestamoId: prestamo.id,
            numeroCuota: i,
            fechaVencimiento: fechaVencimientoCuota,
            montoCuota: parseFloat(montoPorCuota.toFixed(2)),
            montoCapital: parseFloat(capitalPorCuota.toFixed(2)),
            montoInteres: parseFloat(interesPorCuota.toFixed(2)),
            estado: 'Pendiente'
          }
        });

        nuevosPlanPagos.push(cuota);
      }

      await tx.logActividad.create({
        data: {
          usuarioId: userId,
          accion: 'RENOVACION',
          entidad: 'Prestamo',
          entidadId: prestamo.id.toString(),
          detalles: {
            plazoAnterior,
            plazoNuevo: nuevosPlazoMeses,
            saldoAnterior: saldoPendiente,
            nuevosIntereses,
            nuevoTotal: nuevoTotalPagar,
            motivoRenovacion: motivoRenovacion || null
          },
          ipAddress: req.ip || '0.0.0.0',
          userAgent: req.get('user-agent') || null
        }
      });

      return { prestamoRenovado, nuevosPlanPagos };
    });

    res.status(200).json({
      success: true,
      message: 'Préstamo renovado exitosamente',
      data: {
        plazoAnterior,
        plazoNuevo: nuevosPlazoMeses,
        saldoAnterior: saldoPendiente,
        nuevosIntereses,
        nuevoTotal: nuevoTotalPagar,
        nuevaFechaVencimiento,
        cantidadCuotas: resultado.nuevosPlanPagos.length,
        mensaje: 'Se ha generado un nuevo plan de pagos'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error renovando préstamo:', error);
    res.status(500).json({
      success: false,
      message: 'Error renovando préstamo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
};