import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { categoria, estado, precioMin, precioMax } = req.query;

    const where = {};

    if (categoria) {
      where.categoria = categoria;
    }

    if (estado) {
      where.estado = estado;
    } else {
      where.estado = 'Disponible';
    }

    if (precioMin || precioMax) {
      where.precioVenta = {};
      if (precioMin) where.precioVenta.gte = parseFloat(precioMin);
      if (precioMax) where.precioVenta.lte = parseFloat(precioMax);
    }

    const productos = await prisma.productoTienda.findMany({
      where,
      include: {
        articulo: {
          include: {
            tipoArticulo: true,
            solicitud: {
              select: {
                fechaSolicitud: true
              }
            },
            avaluo: true
          }
        }
      },
      orderBy: {
        fechaPublicacion: 'desc'
      }
    });

    const articulosIds = productos.map(p => p.articuloId);
    
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

    const productosFormateados = productos.map(p => ({
      id_producto: p.id,
      id_articulo: p.articuloId,
      precio_venta: parseFloat(p.precioVenta),
      estado: p.estado,
      categoria: p.categoria,
      descuento_aplicado: parseFloat(p.descuentoAplicado || 0),
      dias_en_inventario: p.diasEnInventario,
      valoracion_promedio: parseFloat(p.valoracionPromedio || 0),
      articulo: {
        descripcion: p.articulo.descripcion,
        descripcion_detallada: p.articulo.especificacionesTecnicas,
        marca: p.articulo.marca,
        modelo: p.articulo.modelo,
        serie: p.articulo.serie,
        color: p.articulo.color,
        condicion: p.articulo.estadoFisico,
        valor_estimado: parseFloat(p.articulo.valorEstimadoCliente || p.articulo.avaluo?.valorComercial || 0),
        especificaciones_tecnicas: p.articulo.especificacionesTecnicas,
        imagenes: documentosPorArticulo[p.articuloId] || [],
        solicitud: p.articulo.solicitud
      }
    }));

    res.status(200).json({
      success: true,
      data: productosFormateados
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await prisma.productoTienda.findUnique({
      where: { id: parseInt(id) },
      include: {
        articulo: {
          include: {
            tipoArticulo: true,
            solicitud: {
              select: {
                fechaSolicitud: true
              }
            },
            avaluo: true
          }
        },
        comentarios: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          },
          orderBy: {
            fechaComentario: 'desc'
          }
        }
      }
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const documentos = await prisma.documento.findMany({
      where: {
        idRelacionado: producto.articuloId,
        tipoRelacion: 'Solicitud',
        tipoDocumento: 'Foto_Prenda'
      },
      orderBy: {
        fechaSubida: 'asc'
      }
    });

    const productoFormateado = {
      id_producto: producto.id,
      id_articulo: producto.articuloId,
      precio_venta: parseFloat(producto.precioVenta),
      estado: producto.estado,
      categoria: producto.categoria,
      descuento_aplicado: parseFloat(producto.descuentoAplicado || 0),
      dias_en_inventario: producto.diasEnInventario,
      valoracion_promedio: parseFloat(producto.valoracionPromedio || 0),
      articulo: {
        descripcion: producto.articulo.descripcion,
        descripcion_detallada: producto.articulo.especificacionesTecnicas,
        marca: producto.articulo.marca,
        modelo: producto.articulo.modelo,
        serie: producto.articulo.serie,
        color: producto.articulo.color,
        estado_fisico: producto.articulo.estadoFisico,
        condicion: producto.articulo.estadoFisico,
        valor_estimado: parseFloat(producto.articulo.valorEstimadoCliente || producto.articulo.avaluo?.valorComercial || 0),
        especificaciones_tecnicas: producto.articulo.especificacionesTecnicas,
        imagenes: documentos.map(d => d.rutaArchivo),
        solicitud: producto.articulo.solicitud
      },
      comentarios: producto.comentarios.map(c => ({
        id: c.id,
        usuario: `${c.usuario.nombre} ${c.usuario.apellido}`,
        calificacion: c.calificacion,
        comentario: c.comentario,
        fecha: c.fechaComentario
      }))
    };

    res.status(200).json({
      success: true,
      data: productoFormateado
    });

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId, calificacion, comentario } = req.body;

    if (!usuarioId || !calificacion || !comentario) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }

    const nuevoComentario = await prisma.comentarioProducto.create({
      data: {
        productoId: parseInt(id),
        usuarioId: parseInt(usuarioId),
        calificacion: parseInt(calificacion),
        comentario
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    });

    const comentarios = await prisma.comentarioProducto.findMany({
      where: { productoId: parseInt(id) }
    });

    const promedioCalificacion = comentarios.reduce((sum, c) => sum + c.calificacion, 0) / comentarios.length;

    await prisma.productoTienda.update({
      where: { id: parseInt(id) },
      data: {
        valoracionPromedio: promedioCalificacion
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: nuevoComentario.id,
        calificacion: nuevoComentario.calificacion,
        comentario: nuevoComentario.comentario,
        fecha_comentario: nuevoComentario.fechaComentario,
        usuario: {
          nombre: `${nuevoComentario.usuario.nombre} ${nuevoComentario.usuario.apellido}`
        }
      }
    });

  } catch (error) {
    console.error('Error creando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear comentario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;