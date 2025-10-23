import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      items, 
      total, 
      metodoPago, 
      direccionEnvio, 
      productos, 
      direccion, 
      notas, 
      metodo_pago,
      subtotal,
      iva,
      envio,
      banco_origen,
      fecha_transferencia,
      numero_transaccion
    } = req.body;

    const usuarioId = req.user.id;
    const totalPedido = parseFloat(total) || 0;
    const metodo = metodo_pago || metodoPago || 'Efectivo';
    const direccionCompleta = direccion || direccionEnvio || '';
    const productosArray = JSON.parse(productos || '[]') || items || [];

    console.log('Creando pedido:', { metodo, total: totalPedido, banco: banco_origen, productos: productosArray.length });

    if (!totalPedido || productosArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }

    let comprobanteRuta = null;

    if (metodo === 'Transferencia') {
      if (!banco_origen || !fecha_transferencia || !numero_transaccion) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos de la transferencia'
        });
      }

      if (req.files && req.files.comprobante) {
        const comprobante = req.files.comprobante;
        const uploadsDir = path.join(process.cwd(), 'uploads', 'comprobantes-pedidos');
        
        await fs.mkdir(uploadsDir, { recursive: true });

        const timestamp = Date.now();
        const extension = path.extname(comprobante.name);
        const nombreArchivo = `pedido_${timestamp}_${usuarioId}${extension}`;
        const rutaCompleta = path.join(uploadsDir, nombreArchivo);

        await comprobante.mv(rutaCompleta);
        comprobanteRuta = `/uploads/comprobantes-pedidos/${nombreArchivo}`;
        console.log('Comprobante guardado:', comprobanteRuta);
      }
    }

    const estadoPedido = metodo === 'Transferencia' ? 'Pendiente' : 'Procesando';

    const pedido = await prisma.$transaction(async (prisma) => {
      console.log('Iniciando transacción...');
      
      const nuevoPedido = await prisma.pedido.create({
        data: {
          usuarioCompradorId: usuarioId,
          totalPedido: totalPedido,
          estadoPedido: estadoPedido,
          direccionEnvio: `${direccionCompleta}${notas ? `\n\nNotas: ${notas}` : ''}`,
          metodoPago: metodo,
          subtotal: subtotal ? parseFloat(subtotal) : null,
          iva: iva ? parseFloat(iva) : null,
          costoEnvio: envio ? parseFloat(envio) : null,
          bancoOrigen: banco_origen || null,
          fechaTransferencia: fecha_transferencia ? new Date(fecha_transferencia) : null,
          numeroTransaccion: numero_transaccion || null,
          comprobanteTransferencia: comprobanteRuta
        },
        include: {
          detalles: true
        }
      });

      console.log('Pedido creado:', nuevoPedido.id);

      for (const item of productosArray) {
        const productoId = item.productoId || item.id;
        const cantidad = item.cantidad || 1;
        const precio = item.precio;

        if (!productoId || !precio || isNaN(parseFloat(precio))) {
          throw new Error(`Datos inválidos en el producto: ${JSON.stringify(item)}`);
        }

        await prisma.detallePedido.create({
          data: {
            pedido: {
              connect: { id: nuevoPedido.id }
            },
            producto: {
              connect: { id: parseInt(productoId) }
            },
            cantidad: cantidad,
            precioUnitario: parseFloat(precio),
            subtotal: parseFloat(precio) * cantidad
          }
        });

        await prisma.productoTienda.update({
          where: { id: parseInt(productoId) },
          data: { estado: estadoPedido === 'Procesando' ? 'Vendido' : 'Disponible' }
        });
      }

      console.log('Detalles de pedido creados');

      if (metodo === 'Transferencia') {
        console.log('Intentando crear pago en tabla pago...');
        console.log('Datos del pago:', { pedidoId: nuevoPedido.id, montoPago: totalPedido, nombreBanco: banco_origen, numeroTransaccion: numero_transaccion });

        try {
          const nuevoPago = await prisma.pago.create({
            data: {
              pedidoId: nuevoPedido.id,
              montoPago: totalPedido,
              fechaPago: new Date(),
              tipoPago: 'Transferencia',
              estadoValidacion: 'Pendiente',
              nombreBanco: banco_origen,
              numeroTransaccion: numero_transaccion,
              fechaDeposito: fecha_transferencia ? new Date(fecha_transferencia) : null,
              imagenComprobante: comprobanteRuta,
              observaciones: `Pago de pedido #${nuevoPedido.id} - En espera de validación`
            }
          });
          console.log('PAGO CREADO EXITOSAMENTE:', nuevoPago.id);
        } catch (pagoError) {
          console.error('ERROR CREANDO PAGO:', pagoError);
          console.error('Detalles del error:', { message: pagoError.message, code: pagoError.code, meta: pagoError.meta });
          throw pagoError;
        }
      } else {
        console.log('No es transferencia, no se crea pago');
      }

      return nuevoPedido;
    });

    console.log('Transacción completada exitosamente');

    res.status(201).json({
      success: true,
      message: metodo === 'Transferencia' 
        ? 'Pedido creado. Pendiente de validación de pago por el cobrador' 
        : 'Pedido creado exitosamente',
      pedido: {
        id_pedido: pedido.id,
        total: parseFloat(pedido.totalPedido),
        estado: pedido.estadoPedido,
        fecha: pedido.fechaPedido
      }
    });

  } catch (error) {
    console.error('ERROR CREANDO PEDIDO:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al crear pedido',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Endpoint para listar TODOS los pedidos (solo para admin/cobrador)
router.get('/admin/todos', authenticateToken, async (req, res) => {
  try {
    // Verificar que el usuario sea admin o cobrador
    if (!['Administrador', 'Cobrador'].includes(req.user.tipoUsuario)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    const { estado, metodo_pago, limite = 100, pagina = 1 } = req.query;

    // Construir filtros - Por defecto excluir pedidos pendientes
    const where = {};
    if (estado) {
      where.estadoPedido = estado;
    } else {
      // Si no se especifica estado, excluir los pendientes (pago no aceptado)
      where.estadoPedido = {
        not: 'Pendiente'
      };
    }
    if (metodo_pago) {
      where.metodoPago = metodo_pago;
    }

    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    const take = parseInt(limite);

    // Obtener pedidos con paginación
    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        include: {
          detalles: {
            include: {
              producto: {
                include: {
                  articulo: true
                }
              }
            }
          },
          usuarioComprador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true
            }
          }
        },
        orderBy: {
          fechaPedido: 'desc'
        },
        skip,
        take
      }),
      prisma.pedido.count({ where })
    ]);

    // Obtener todas las imágenes de los artículos
    const articulosIds = pedidos.flatMap(p =>
      p.detalles.map(d => d.producto.articuloId)
    );

    const documentos = await prisma.documento.findMany({
      where: {
        idRelacionado: { in: articulosIds },
        tipoRelacion: 'Solicitud',
        tipoDocumento: 'Foto_Prenda'
      },
      orderBy: {
        fechaSubida: 'asc'
      }
    });

    const documentosPorArticulo = documentos.reduce((acc, doc) => {
      if (!acc[doc.idRelacionado]) {
        acc[doc.idRelacionado] = [];
      }
      acc[doc.idRelacionado].push(doc.rutaArchivo);
      return acc;
    }, {});

    // Formatear pedidos
    const pedidosFormateados = pedidos.map(p => ({
      id: p.id,
      fecha_pedido: p.fechaPedido,
      total: parseFloat(p.totalPedido),
      estado: p.estadoPedido,
      metodo_pago: p.metodoPago,
      direccion_envio: p.direccionEnvio,
      banco_origen: p.bancoOrigen,
      fecha_transferencia: p.fechaTransferencia,
      numero_transaccion: p.numeroTransaccion,
      comprobante: p.comprobanteTransferencia,
      updatedAt: p.updatedAt,
      cliente: {
        id: p.usuarioComprador.id,
        nombre: `${p.usuarioComprador.nombre} ${p.usuarioComprador.apellido}`,
        email: p.usuarioComprador.email,
        telefono: p.usuarioComprador.telefono
      },
      items: p.detalles.map(d => {
        const imagenes = documentosPorArticulo[d.producto.articuloId] || [];
        return {
          id: d.id,
          producto: d.producto.articulo.descripcion,
          cantidad: d.cantidad,
          precio: parseFloat(d.precioUnitario),
          subtotal: parseFloat(d.subtotal),
          imagen: imagenes[0] || null,
          condicion: d.producto.articulo.estadoFisico
        };
      })
    }));

    res.status(200).json({
      success: true,
      data: pedidosFormateados,
      pagination: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(total / parseInt(limite))
      }
    });

  } catch (error) {
    console.error('Error obteniendo todos los pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/usuario/:usuarioId', authenticateToken, async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const pedidos = await prisma.pedido.findMany({
      where: {
        usuarioCompradorId: parseInt(usuarioId)
      },
      include: {
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
      orderBy: {
        fechaPedido: 'desc'
      }
    });

    const articulosIds = pedidos.flatMap(p => 
      p.detalles.map(d => d.producto.articuloId)
    );

    const documentos = await prisma.documento.findMany({
      where: {
        idRelacionado: { in: articulosIds },
        tipoRelacion: 'Solicitud',
        tipoDocumento: 'Foto_Prenda'
      },
      orderBy: {
        fechaSubida: 'asc'
      }
    });

    const documentosPorArticulo = documentos.reduce((acc, doc) => {
      if (!acc[doc.idRelacionado]) {
        acc[doc.idRelacionado] = [];
      }
      acc[doc.idRelacionado].push(doc.rutaArchivo);
      return acc;
    }, {});

    const pedidosFormateados = pedidos.map(p => ({
      id: p.id,
      fecha_pedido: p.fechaPedido,
      total: parseFloat(p.totalPedido),
      estado: p.estadoPedido,
      metodo_pago: p.metodoPago,
      direccion_envio: p.direccionEnvio,
      updatedAt: p.updatedAt,
      items: p.detalles.map(d => {
        const imagenes = documentosPorArticulo[d.producto.articuloId] || [];
        return {
          id: d.id,
          producto: d.producto.articulo.descripcion,
          cantidad: d.cantidad,
          precio: parseFloat(d.precioUnitario),
          subtotal: parseFloat(d.subtotal),
          imagen: imagenes[0] || null
        };
      })
    }));

    res.status(200).json({
      success: true,
      data: pedidosFormateados
    });

  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        detalles: {
          include: {
            producto: {
              include: {
                articulo: true
              }
            }
          }
        },
        usuarioComprador: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
            telefono: true
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

    const articulosIds = pedido.detalles.map(d => d.producto.articuloId);

    const documentos = await prisma.documento.findMany({
      where: {
        idRelacionado: { in: articulosIds },
        tipoRelacion: 'Solicitud',
        tipoDocumento: 'Foto_Prenda'
      },
      orderBy: {
        fechaSubida: 'asc'
      }
    });

    const documentosPorArticulo = documentos.reduce((acc, doc) => {
      if (!acc[doc.idRelacionado]) {
        acc[doc.idRelacionado] = [];
      }
      acc[doc.idRelacionado].push(doc.rutaArchivo);
      return acc;
    }, {});

    const pedidoFormateado = {
      id: pedido.id,
      fecha_pedido: pedido.fechaPedido,
      total: parseFloat(pedido.totalPedido),
      estado: pedido.estadoPedido,
      metodo_pago: pedido.metodoPago,
      direccion_envio: pedido.direccionEnvio,
      banco_origen: pedido.bancoOrigen,
      fecha_transferencia: pedido.fechaTransferencia,
      numero_transaccion: pedido.numeroTransaccion,
      comprobante: pedido.comprobanteTransferencia,
      updatedAt: pedido.updatedAt,
      cliente: {
        nombre: `${pedido.usuarioComprador.nombre} ${pedido.usuarioComprador.apellido}`,
        email: pedido.usuarioComprador.email,
        telefono: pedido.usuarioComprador.telefono
      },
      items: pedido.detalles.map(d => {
        const imagenes = documentosPorArticulo[d.producto.articuloId] || [];
        return {
          id: d.id,
          producto: d.producto.articulo.descripcion,
          cantidad: d.cantidad,
          precio: parseFloat(d.precioUnitario),
          subtotal: parseFloat(d.subtotal),
          imagen: imagenes[0] || null,
          condicion: d.producto.articulo.estadoFisico
        };
      })
    };

    res.status(200).json({
      success: true,
      data: pedidoFormateado
    });

  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedido',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.patch('/:id/estado', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Verificar permisos
    if (!['Administrador', 'Cobrador'].includes(req.user.tipoUsuario)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para cambiar el estado de pedidos'
      });
    }

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'Estado requerido'
      });
    }

    // Validar que el estado sea válido
    const estadosValidos = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`
      });
    }

    // Verificar que el pedido existe
    const pedidoExistente = await prisma.pedido.findUnique({
      where: { id: parseInt(id) }
    });

    if (!pedidoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Actualizar el pedido
    const pedidoActualizado = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: { estadoPedido: estado }
    });

    console.log(`Pedido #${id} actualizado de ${pedidoExistente.estadoPedido} a ${estado} por usuario ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: `Estado actualizado a ${estado}`,
      data: {
        id: pedidoActualizado.id,
        estado: pedidoActualizado.estadoPedido,
        estadoAnterior: pedidoExistente.estadoPedido
      }
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;