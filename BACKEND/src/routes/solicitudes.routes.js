import express from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

import uploadService from '../services/upload.service.js';
import { validateImageFiles } from '../middleware/upload.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';
import { authenticateToken } from '../middleware/auth.js';
import calculadoraService from '../services/calculadora.service.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use((req, res, next) => {
  console.log(`Solicitudes API: ${req.method} ${req.path}`);
  next();
});

router.use(authenticateToken);

router.get('/categorias', asyncHandler(async (req, res) => {
  console.log('Obteniendo categorías de artículos desde BD');
  
  try {
    const tiposArticulo = await prisma.tipoArticulo.findMany({
      where: { estado: 'Activo' },
      select: {
        id: true,
        nombre: true,
        porcentajeMinAvaluo: true,
        porcentajeMaxAvaluo: true,
        requiereElectronico: true
      },
      orderBy: { nombre: 'asc' }
    });

    const categorias = tiposArticulo.map(tipo => ({
      id: tipo.id,
      nombre: tipo.nombre,
      porcentajeMinAvaluo: parseFloat(tipo.porcentajeMinAvaluo),
      porcentajeMaxAvaluo: parseFloat(tipo.porcentajeMaxAvaluo),
      requiereElectronico: tipo.requiereElectronico
    }));

    console.log('Categorías procesadas:', categorias);

    res.status(200).json({
      success: true,
      data: categorias,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categorías de artículos',
      error: error.message
    });
  }
}));

router.get('/limites', asyncHandler(async (req, res) => {
  console.log('Obteniendo límites del sistema');
  
  try {
    const limites = await calculadoraService.obtenerLimitesActuales();
    
    res.status(200).json({
      success: true,
      data: limites,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error obteniendo límites:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo límites del sistema',
      error: error.message
    });
  }
}));

router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { estado, limite = 10, pagina = 1 } = req.query;
  
  console.log(`Obteniendo solicitudes para usuario: ${userId}`);

  try {
    const whereClause = {
      usuarioId: userId
    };

    if (estado && estado !== 'todos') {
      whereClause.estado = estado.charAt(0).toUpperCase() + estado.slice(1);
    }

    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    const [solicitudes, total] = await Promise.all([
      prisma.solicitudPrestamo.findMany({
        where: whereClause,
        include: {
          articulos: {
            include: {
              tipoArticulo: {
                select: {
                  nombre: true
                }
              }
            }
          }
        },
        orderBy: {
          fechaSolicitud: 'desc'
        },
        skip,
        take: parseInt(limite)
      }),
      prisma.solicitudPrestamo.count({ where: whereClause })
    ]);

    const solicitudesFormateadas = solicitudes.map(solicitud => {
      const articulo = solicitud.articulos?.[0];
      return {
        id: solicitud.id,
        numero: `SOL-2025-${String(solicitud.id).padStart(6, '0')}`,
        estado: solicitud.estado,
        fechaSolicitud: solicitud.fechaSolicitud,
        fechaEvaluacion: solicitud.fechaEvaluacion,
        observaciones: solicitud.observaciones,
        montoSolicitado: solicitud.montoSolicitado ? parseFloat(solicitud.montoSolicitado) : null,
        plazoMeses: solicitud.plazoMeses,
        modalidadPago: solicitud.modalidadPago,
        totalAPagar: solicitud.totalAPagar ? parseFloat(solicitud.totalAPagar) : null,
        articulos: solicitud.articulos.map(art => ({
          id: art.id,
          descripcion: art.descripcion,
          marca: art.marca,
          modelo: art.modelo,
          estadoFisico: art.estadoFisico,
          valorEstimadoCliente: art.valorEstimadoCliente,
          tipoArticulo: art.tipoArticulo?.nombre
        }))
      };
    });

    res.status(200).json({
      success: true,
      data: {
        solicitudes: solicitudesFormateadas,
        paginacion: {
          total,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: Math.ceil(total / parseInt(limite))
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo solicitudes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

router.post('/', 
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
      tipoArticulo,
      descripcion,
      estadoFisico,
      valorEstimado,
      marca,
      modelo,
      especificacionesTecnicas,
      montoSolicitado,    
      plazoMeses,           
      modalidadPago,        
      aceptaTerminos
    } = req.body;

    console.log(`Creando nueva solicitud para usuario: ${userId}`);
    console.log('Datos recibidos:', { tipoArticulo, descripcion: descripcion?.substring(0, 50) + '...',
      valorEstimado,
      montoSolicitado,     
      plazoMeses,
      modalidadPago 
    });

    try {
      if (!tipoArticulo || !descripcion || !valorEstimado || !montoSolicitado) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: tipoArticulo, descripcion, valorEstimado, montoSolicitado'
        });
      }

      if (!aceptaTerminos || aceptaTerminos === 'false') {
        return res.status(400).json({
          success: false,
          message: 'Debe aceptar los términos y condiciones'
        });
      }

      const validacionMonto = await calculadoraService.validarMontoSolicitud(montoSolicitado, valorEstimado);
      if (!validacionMonto.esValido) {
        return res.status(400).json({
          success: false,
          message: validacionMonto.mensaje
        });
      }

      const tipoArticuloExiste = await prisma.tipoArticulo.findUnique({
        where: { id: parseInt(tipoArticulo) }
      });

      if (!tipoArticuloExiste) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de artículo no válido'
        });
      }

      const calculosPrestamo = await calculadoraService.calcularPrestamo(
        montoSolicitado, 
        plazoMeses || 1, 
        modalidadPago || 'mensual'
      );

      console.log('Cálculos del préstamo:', { montoSolicitado: calculosPrestamo.montoSolicitado, totalAPagar: calculosPrestamo.totalAPagar, interesTotal: calculosPrestamo.interesTotal, montoPorPago: calculosPrestamo.montoPorPago, comisionApertura: calculosPrestamo.comisionApertura });

      const fotosGuardadas = [];
      let documentoGuardado = null;

      const uploadDir = path.join(process.cwd(), 'uploads/solicitudes');
      const fotoDir = path.join(uploadDir, 'fotos');
      const docDir = path.join(uploadDir, 'documentos');
      await fs.mkdir(fotoDir, { recursive: true });
      await fs.mkdir(docDir, { recursive: true });

      if (req.files?.fotos) {
        console.log('Procesando fotos...');
        const fotos = Array.isArray(req.files.fotos) ? req.files.fotos : [req.files.fotos];
        
        for (let i = 0; i < fotos.length; i++) {
          const foto = fotos[i];
          const timestamp = Date.now();
          const extension = path.extname(foto.name);
          const nombreArchivo = `foto_${timestamp}_${i + 1}${extension}`;
          const rutaDestino = path.join(fotoDir, nombreArchivo);
          
          await foto.mv(rutaDestino);
          
          fotosGuardadas.push({
            nombre: foto.name,
            nombreArchivo: nombreArchivo,
            ruta: `/uploads/solicitudes/fotos/${nombreArchivo}`,
            tamano: foto.size,
            tipo: foto.mimetype,
            esPrincipal: i === 0
          });
        }
      }

      if (req.files?.documentoTecnico) {
        console.log('Procesando documento técnico...');
        const doc = req.files.documentoTecnico;
        const timestamp = Date.now();
        const extension = path.extname(doc.name);
        const nombreArchivo = `doc_${timestamp}${extension}`;
        const rutaDestino = path.join(docDir, nombreArchivo);
        
        await doc.mv(rutaDestino);
        
        documentoGuardado = {
          nombre: doc.name,
          nombreArchivo: nombreArchivo,
          ruta: `/uploads/solicitudes/documentos/${nombreArchivo}`,
          tamano: doc.size,
          tipo: doc.mimetype
        };
      }

      const resultado = await prisma.$transaction(async (tx) => {
        const solicitudCreada = await tx.solicitudPrestamo.create({
          data: {
            usuarioId: userId,
            fechaSolicitud: new Date(),
            estado: 'Pendiente',
            observaciones: `Solicitud de préstamo por Q${montoSolicitado} a ${plazoMeses} meses (${modalidadPago})`,
            montoSolicitado: calculosPrestamo.montoSolicitado,
            plazoMeses: calculosPrestamo.plazoMeses,
            modalidadPago: calculosPrestamo.modalidadPago,
            totalAPagar: calculosPrestamo.totalAPagar,
            tasaInteres: calculosPrestamo.tasaInteres
          }
        });

        console.log('Solicitud creada con ID:', solicitudCreada.id);

        const articuloCreado = await tx.articulo.create({
          data: {
            solicitudId: solicitudCreada.id,
            tipoArticuloId: parseInt(tipoArticulo),
            descripcion: descripcion,
            marca: marca || null,
            modelo: modelo || null,
            serie: null,
            color: null,
            estadoFisico: estadoFisico || 'Bueno',
            valorEstimadoCliente: parseFloat(valorEstimado),
            especificacionesTecnicas: especificacionesTecnicas || null
          }
        });

        console.log('Artículo creado con ID:', articuloCreado.id);

        const documentosCreados = [];

        for (const foto of fotosGuardadas) {
          const docFoto = await tx.documento.create({
            data: {
              tipoDocumento: 'Foto_Prenda',
              nombreArchivo: foto.nombre,
              rutaArchivo: foto.ruta,
              idRelacionado: solicitudCreada.id,
              tipoRelacion: 'Solicitud',
              tamanoArchivo: BigInt(foto.tamano),
              tipoMime: foto.tipo
            }
          });
          documentosCreados.push(docFoto);
        }

        if (documentoGuardado) {
          const docTecnico = await tx.documento.create({
            data: {
              tipoDocumento: 'Especificaciones',
              nombreArchivo: documentoGuardado.nombre,
              rutaArchivo: documentoGuardado.ruta,
              idRelacionado: solicitudCreada.id,
              tipoRelacion: 'Solicitud',
              tamanoArchivo: BigInt(documentoGuardado.tamano),
              tipoMime: documentoGuardado.tipo
            }
          });
          documentosCreados.push(docTecnico);
        }

        return {
          solicitud: solicitudCreada,
          articulo: articuloCreado,
          documentos: documentosCreados,
          calculosPrestamo
        };
      });

      const numeroSolicitud = `SOL-${new Date().getFullYear()}-${String(resultado.solicitud.id).padStart(6, '0')}`;

      console.log('Solicitud procesada exitosamente:', { numero: numeroSolicitud, solicitudId: resultado.solicitud.id, articuloId: resultado.articulo.id, documentos: resultado.documentos.length, totalAPagar: resultado.calculosPrestamo.totalAPagar });

      res.status(201).json({
        success: true,
        message: 'Solicitud de empéño creada exitosamente',
        data: {
          solicitud: {
            id: resultado.solicitud.id,
            numero: numeroSolicitud,
            estado: resultado.solicitud.estado,
            fechaSolicitud: resultado.solicitud.fechaSolicitud
          },
          articulo: {
            id: resultado.articulo.id,
            tipoArticulo: tipoArticuloExiste.nombre,
            descripcion: resultado.articulo.descripcion,
            estadoFisico: resultado.articulo.estadoFisico,
            valorEstimadoCliente: resultado.articulo.valorEstimadoCliente
          },
          prestamo: {
            montoSolicitado: resultado.calculosPrestamo.montoSolicitado,
            plazoMeses: resultado.calculosPrestamo.plazoMeses,
            modalidadPago: resultado.calculosPrestamo.modalidadPago,
            tasaInteres: resultado.calculosPrestamo.tasaInteres,
            totalAPagar: resultado.calculosPrestamo.totalAPagar,
            montoPorPago: resultado.calculosPrestamo.montoPorPago,
            interesTotal: resultado.calculosPrestamo.interesTotal,
            comisionApertura: resultado.calculosPrestamo.comisionApertura,
            numeroPagos: resultado.calculosPrestamo.numeroPagos
          },
          planPagos: resultado.calculosPrestamo.planPagos,
          archivosSubidos: {
            fotos: fotosGuardadas.length,
            documentoTecnico: documentoGuardado ? 1 : 0,
            totalDocumentos: resultado.documentos.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error creando solicitud:', error);
      
      try {
        for (const foto of fotosGuardadas || []) {
          const rutaCompleta = path.join(process.cwd(), foto.ruta);
          await fs.unlink(rutaCompleta).catch(() => {});
        }
        if (documentoGuardado) {
          const rutaCompleta = path.join(process.cwd(), documentoGuardado.ruta);
          await fs.unlink(rutaCompleta).catch(() => {});
        }
      } catch (cleanupError) {
        console.error('Error limpiando archivos:', cleanupError);
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear la solicitud',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  })
);
 
router.get('/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const solicitudId = parseInt(req.params.id);

  console.log(`Obteniendo solicitud ${solicitudId} para usuario ${userId}`);

  try {
    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: {
        id: solicitudId,
        usuarioId: userId
      },
      include: {
        articulos: {
          include: {
            tipoArticulo: true
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            cedula: true,
            direccion: true,
            fechaNacimiento: true
          }
        },
        contrato: {
          select: {
            id: true,
            numeroContrato: true,
            fechaCreacion: true,
            fechaFirma: true,
            estadoFirma: true
          }
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    let planPagos = null;
    let resumenFinanciero = null;

    if (solicitud.montoSolicitado && solicitud.plazoMeses) {
      try {
        const calculosPrestamo = await calculadoraService.calcularPrestamo(
          parseFloat(solicitud.montoSolicitado),
          solicitud.plazoMeses,
          solicitud.modalidadPago || 'mensual'
        );
        
        planPagos = calculosPrestamo.planPagos;
        resumenFinanciero = {
          montoSolicitado: parseFloat(solicitud.montoSolicitado),
          totalAPagar: parseFloat(solicitud.totalAPagar || calculosPrestamo.totalAPagar),
          interesTotal: calculosPrestamo.interesTotal,
          montoPorPago: calculosPrestamo.montoPorPago,
          tasaInteres: parseFloat(solicitud.tasaInteres || calculosPrestamo.tasaInteres),
          numeroPagos: calculosPrestamo.numeroPagos,
          comisionApertura: calculosPrestamo.comisionApertura
        };
      } catch (calcError) {
        console.warn('Error calculando plan de pagos:', calcError.message);
      }
    }

    const solicitudDetallada = {
      id: solicitud.id,
      numero: `SOL-2025-${String(solicitud.id).padStart(6, '0')}`,
      estado: solicitud.estado,
      fechaSolicitud: solicitud.fechaSolicitud,
      fechaEvaluacion: solicitud.fechaEvaluacion,
      observaciones: solicitud.observaciones,
      
      clienteAceptoOferta: solicitud.clienteAceptoOferta || false,
      fechaAceptacion: solicitud.fechaAceptacion,
      
      tieneContrato: !!solicitud.contrato,
      contrato: solicitud.contrato ? {
        id: solicitud.contrato.id,
        numeroContrato: solicitud.contrato.numeroContrato,
        fechaCreacion: solicitud.contrato.fechaCreacion,
        fechaFirma: solicitud.contrato.fechaFirma,
        estadoFirma: solicitud.contrato.estadoFirma
      } : null,
      
      usuario: solicitud.usuario,
      
      prestamo: {
        montoSolicitado: solicitud.montoSolicitado ? parseFloat(solicitud.montoSolicitado) : null,
        plazoMeses: solicitud.plazoMeses,
        modalidadPago: solicitud.modalidadPago,
        totalAPagar: solicitud.totalAPagar ? parseFloat(solicitud.totalAPagar) : null,
        tasaInteres: solicitud.tasaInteres ? parseFloat(solicitud.tasaInteres) : null,
        resumenFinanciero,
        planPagos
      },
      
      articulos: solicitud.articulos.map(articulo => ({
        id: articulo.id,
        tipo: articulo.tipoArticulo.nombre,
        descripcion: articulo.descripcion,
        marca: articulo.marca,
        modelo: articulo.modelo,
        serie: articulo.serie,
        color: articulo.color,
        estadoFisico: articulo.estadoFisico,
        valorEstimadoCliente: parseFloat(articulo.valorEstimadoCliente || 0),
        especificacionesTecnicas: articulo.especificacionesTecnicas,
        
        analisisValor: solicitud.montoSolicitado ? {
          porcentajeSolicitado: parseFloat(((parseFloat(solicitud.montoSolicitado) / parseFloat(articulo.valorEstimadoCliente || 1)) * 100).toFixed(2)),
          esMontoRazonable: parseFloat(solicitud.montoSolicitado) <= parseFloat(articulo.valorEstimadoCliente || 0) * 0.8
        } : null
      })),
      
      estadisticas: {
        tiempoEspera: solicitud.fechaEvaluacion ? 
          Math.ceil((new Date(solicitud.fechaEvaluacion) - new Date(solicitud.fechaSolicitud)) / (1000 * 60 * 60 * 24)) : 
          Math.ceil((new Date() - new Date(solicitud.fechaSolicitud)) / (1000 * 60 * 60 * 24)),
        esSolicitudReciente: Math.ceil((new Date() - new Date(solicitud.fechaSolicitud)) / (1000 * 60 * 60 * 24)) <= 7,
        requiereEvaluacion: solicitud.estado === 'Pendiente',
        puedeModificar: ['Pendiente'].includes(solicitud.estado)
      }
    };

    res.status(200).json({
      success: true,
      data: solicitudDetallada,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo la solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

router.get('/:solicitudId/archivos', asyncHandler(async (req, res) => {
  const { solicitudId } = req.params;
  const userId = req.user.id;

  console.log(`Obteniendo archivos para solicitud: ${solicitudId}`);

  try {
    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: { 
        id: parseInt(solicitudId),
        usuarioId: userId 
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    const documentos = await prisma.documento.findMany({
      where: {
        idRelacionado: parseInt(solicitudId),
        tipoRelacion: 'Solicitud'
      },
      orderBy: [
        { tipoDocumento: 'asc' },
        { fechaSubida: 'asc' }
      ]
    });

    const archivosFormateados = documentos.map(doc => ({
      id: doc.id,
      tipo: doc.tipoDocumento,
      nombreArchivo: doc.nombreArchivo,
      rutaArchivo: doc.rutaArchivo,
      fechaSubida: doc.fechaSubida,
      tamanoArchivo: doc.tamanoArchivo ? parseInt(doc.tamanoArchivo) : null,
      tipoMime: doc.tipoMime,
      urlDescarga: `/api/solicitudes/${solicitudId}/archivo/${doc.id}`
    }));

    const archivosPorTipo = archivosFormateados.reduce((acc, archivo) => {
      const tipo = archivo.tipo === 'Foto_Prenda' ? 'fotos' : 
                   archivo.tipo === 'Especificaciones' ? 'documentos' : 'otros';
      
      if (!acc[tipo]) acc[tipo] = [];
      acc[tipo].push(archivo);
      
      return acc;
    }, {});

    console.log('Archivos encontrados:', { fotos: archivosPorTipo.fotos?.length || 0, documentos: archivosPorTipo.documentos?.length || 0, total: archivosFormateados.length });

    res.status(200).json({
      success: true,
      data: {
        solicitudId: parseInt(solicitudId),
        archivos: archivosPorTipo,
        resumen: {
          totalArchivos: archivosFormateados.length,
          fotos: archivosPorTipo.fotos?.length || 0,
          documentos: archivosPorTipo.documentos?.length || 0,
          otros: archivosPorTipo.otros?.length || 0
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo archivos adjuntos',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

router.post('/:solicitudId/documentos-dpi', asyncHandler(async (req, res) => {
  const { solicitudId } = req.params;
  const userId = req.user.id;

  console.log('[SOLICITUDES] Subiendo DPI para solicitud:', solicitudId);

  try {
    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: { 
        id: parseInt(solicitudId),
        usuarioId: userId 
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (!req.files || !req.files.dpiFrontal || !req.files.dpiTrasero) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren ambas fotos del DPI'
      });
    }

    const { dpiFrontal, dpiTrasero } = req.files;

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(dpiFrontal.mimetype) || !tiposPermitidos.includes(dpiTrasero.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se permiten imágenes JPG, PNG o WEBP'
      });
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'solicitudes', solicitudId.toString(), 'dpi');
    await fs.mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const extFrontal = path.extname(dpiFrontal.name);
    const extTrasero = path.extname(dpiTrasero.name);
    
    const nombreFrontal = `dpi-frontal-${solicitudId}-${timestamp}${extFrontal}`;
    const nombreTrasero = `dpi-trasero-${solicitudId}-${timestamp}${extTrasero}`;
    
    const rutaFrontal = path.join(uploadDir, nombreFrontal);
    const rutaTrasero = path.join(uploadDir, nombreTrasero);

    await dpiFrontal.mv(rutaFrontal);
    await dpiTrasero.mv(rutaTrasero);

    console.log('[SOLICITUDES] Archivos guardados, creando registros...');

    await prisma.documento.deleteMany({
      where: {
        idRelacionado: parseInt(solicitudId),
        tipoRelacion: 'Solicitud',
        tipoDocumento: 'Identificacion'
      }
    });

    const documentos = await prisma.$transaction([
      prisma.documento.create({
        data: {
          tipoDocumento: 'Identificacion',
          nombreArchivo: nombreFrontal,
          rutaArchivo: `/uploads/solicitudes/${solicitudId}/dpi/${nombreFrontal}`,
          idRelacionado: parseInt(solicitudId),
          tipoRelacion: 'Solicitud',
          tamanoArchivo: BigInt(dpiFrontal.size),
          tipoMime: dpiFrontal.mimetype
        }
      }),
      prisma.documento.create({
        data: {
          tipoDocumento: 'Identificacion',
          nombreArchivo: nombreTrasero,
          rutaArchivo: `/uploads/solicitudes/${solicitudId}/dpi/${nombreTrasero}`,
          idRelacionado: parseInt(solicitudId),
          tipoRelacion: 'Solicitud',
          tamanoArchivo: BigInt(dpiTrasero.size),
          tipoMime: dpiTrasero.mimetype
        }
      })
    ]);

    console.log('[SOLICITUDES] Documentos DPI guardados exitosamente');

    res.status(200).json({
      success: true,
      message: 'Documentos DPI subidos exitosamente',
      data: {
        documentos: documentos.map(doc => ({
          id: doc.id,
          tipo: doc.tipoDocumento,
          nombreArchivo: doc.nombreArchivo
        }))
      }
    });

  } catch (error) {
    console.error('[SOLICITUDES] Error subiendo DPI:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir documentos DPI',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

router.get('/:solicitudId/archivo/:archivoId', asyncHandler(async (req, res) => {
  const { solicitudId, archivoId } = req.params;
  const userId = req.user.id;

  console.log(`Descargando archivo ${archivoId} de solicitud ${solicitudId}`);

  try {
    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: { 
        id: parseInt(solicitudId),
        usuarioId: userId 
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    const documento = await prisma.documento.findFirst({
      where: {
        id: parseInt(archivoId),
        idRelacionado: parseInt(solicitudId),
        tipoRelacion: 'Solicitud'
      }
    });

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }

    let rutaCompleta;
    if (documento.rutaArchivo.startsWith('/uploads/')) {
      rutaCompleta = path.join(process.cwd(), documento.rutaArchivo.substring(1));
    } else if (documento.rutaArchivo.startsWith('uploads/')) {
      rutaCompleta = path.join(process.cwd(), documento.rutaArchivo);
    } else {
      rutaCompleta = path.join(process.cwd(), 'uploads', documento.rutaArchivo);
    }
    
    console.log('Ruta del archivo calculada:', rutaCompleta);
    
    try {
      await fs.access(rutaCompleta);
    } catch (error) {
      console.error('Archivo no encontrado en el sistema:', rutaCompleta);
      
      const rutasAlternativas = [
        path.join(process.cwd(), 'uploads', 'solicitudes', 'fotos', path.basename(documento.rutaArchivo)),
        path.join(process.cwd(), 'uploads', 'solicitudes', 'documentos', path.basename(documento.rutaArchivo)),
        path.join(process.cwd(), 'uploads', path.basename(documento.rutaArchivo))
      ];
      
      let archivoEncontrado = false;
      for (const rutaAlt of rutasAlternativas) {
        try {
          await fs.access(rutaAlt);
          rutaCompleta = rutaAlt;
          archivoEncontrado = true;
          console.log('Archivo encontrado en ruta alternativa:', rutaCompleta);
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!archivoEncontrado) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado en el servidor'
        });
      }
    }

    const esImagen = documento.tipoMime && documento.tipoMime.startsWith('image/');
    
    if (esImagen) {
      res.setHeader('Content-Disposition', `inline; filename="${documento.nombreArchivo}"`);
      res.setHeader('Content-Type', documento.tipoMime);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${documento.nombreArchivo}"`);
      res.setHeader('Content-Type', documento.tipoMime || 'application/octet-stream');
    }

    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    res.sendFile(rutaCompleta, (err) => {
      if (err) {
        console.error('Error enviando archivo:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error enviando el archivo'
          });
        }
      } else {
        console.log(`Archivo enviado exitosamente: ${documento.nombreArchivo}`);
      }
    });
    
  } catch (error) {
    console.error('Error descargando archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

router.put('/:id/cancelar', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const solicitudId = parseInt(req.params.id);
  const { motivo } = req.body;

  console.log(`Cancelando solicitud ${solicitudId} para usuario ${userId}`);

  try {
    const solicitudActualizada = await prisma.solicitudPrestamo.updateMany({
      where: {
        id: solicitudId,
        usuarioId: userId,
        estado: {
          in: ['Pendiente'] 
        }
      },
      data: {
        estado: 'Rechazada',
        observaciones: `Cancelada por el usuario. Motivo: ${motivo || 'No especificado'}`,
        fechaEvaluacion: new Date()
      }
    });

    if (solicitudActualizada.count === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo cancelar la solicitud. Verifica que sea tuya y esté en estado pendiente.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Solicitud cancelada exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error cancelando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelando solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

router.put('/:id/estado', asyncHandler(async (req, res) => {
  const solicitudId = parseInt(req.params.id);
  const { estado, observaciones } = req.body;

  console.log(`Actualizando estado de solicitud ${solicitudId} a: ${estado}`);

  try {
    const estadosValidos = ['Pendiente', 'Evaluando', 'Aprobada', 'Rechazada', 'Completada'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }

    const solicitudActualizada = await prisma.solicitudPrestamo.update({
      where: { id: solicitudId },
      data: {
        estado: estado,
        observaciones: observaciones || null,
        fechaEvaluacion: estado !== 'Pendiente' ? new Date() : null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: {
        solicitud: {
          id: solicitudActualizada.id,
          estado: solicitudActualizada.estado,
          observaciones: solicitudActualizada.observaciones,
          fechaEvaluacion: solicitudActualizada.fechaEvaluacion
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando estado de solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

router.post('/:id/aceptar-oferta', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const solicitudId = parseInt(req.params.id);
  const { datosUsuario } = req.body;

  console.log(`[SOLICITUDES] Cliente ${userId} aceptando oferta de solicitud ${solicitudId}`);

  try {
    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: {
        id: solicitudId,
        usuarioId: userId,
        estado: 'Aprobada'
      },
      include: {
        articulos: {
          include: {
            tipoArticulo: true
          }
        },
        usuario: true
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está en estado aprobada',
        codigo: 'SOLICITUD_NO_ENCONTRADA'
      });
    }

    if (solicitud.clienteAceptoOferta) {
      return res.status(400).json({
        success: false,
        message: 'Ya has aceptado esta oferta previamente',
        codigo: 'OFERTA_YA_ACEPTADA'
      });
    }

    const documentosDPI = await prisma.documento.count({
      where: { 
        idRelacionado: parseInt(solicitudId),
        tipoRelacion: 'Solicitud',
        tipoDocumento: 'Identificacion'
      }
    });

    if (documentosDPI < 2) {
      return res.status(400).json({
        success: false,
        message: 'Debes subir ambas fotos del DPI antes de aceptar la oferta',
        codigo: 'DPI_INCOMPLETO'
      });
    }

    if (datosUsuario) {
      await prisma.usuario.update({
        where: { id: userId },
        data: {
          nombre: datosUsuario.nombre,
          apellido: datosUsuario.apellido,
          cedula: datosUsuario.cedula,
          telefono: datosUsuario.telefono,
          direccion: datosUsuario.direccion,
          fechaNacimiento: datosUsuario.fechaNacimiento ? new Date(datosUsuario.fechaNacimiento) : null
        }
      });
    }

    await prisma.solicitudPrestamo.update({
      where: { id: solicitudId },
      data: {
        clienteAceptoOferta: true,
        fechaAceptacion: new Date()
      }
    });

    console.log(`[SOLICITUDES] Cliente aceptó oferta. Esperando generación de contrato.`);

    try {
      await prisma.auditLog.create({
        data: {
          usuarioId: userId,
          accion: 'ACEPTAR_OFERTA',
          tabla: 'solicitud_prestamo',
          descripcion: `Cliente aceptó oferta de solicitud ${solicitudId}`,
          detalles: JSON.stringify({
            solicitudId,
            monto: solicitud.montoSolicitado,
            plazoMeses: solicitud.plazoMeses
          })
        }
      });
    } catch (auditError) {
      console.error('[SOLICITUDES] Error creando audit log:', auditError);
    }

    res.status(200).json({
      success: true,
      message: 'Oferta aceptada exitosamente. El evaluador generará tu contrato.',
      data: {
        solicitud: {
          id: solicitud.id,
          numero: `SOL-${new Date().getFullYear()}-${String(solicitud.id).padStart(6, '0')}`,
          estado: solicitud.estado,
          clienteAceptoOferta: true,
          fechaAceptacion: new Date(),
          montoSolicitado: parseFloat(solicitud.montoSolicitado),
          plazoMeses: solicitud.plazoMeses,
          tasaInteres: parseFloat(solicitud.tasaInteres),
          totalAPagar: parseFloat(solicitud.totalAPagar)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[SOLICITUDES] Error aceptando oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aceptar la oferta',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
}));

router.get('/:solicitudId/verificar-aceptacion', asyncHandler(async (req, res) => {
  const { solicitudId } = req.params;

  try {
    console.log(`[SOLICITUDES] Verificando aceptación de oferta para solicitud: ${solicitudId}`);

    const solicitud = await prisma.solicitudPrestamo.findUnique({
      where: { id: parseInt(solicitudId) },
      select: {
        id: true,
        estado: true,
        clienteAceptoOferta: true,
        fechaAceptacion: true,
        montoSolicitado: true,
        plazoMeses: true,
        tasaInteres: true,
        usuarioId: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada',
        codigo: 'SOLICITUD_NO_ENCONTRADA'
      });
    }

    if (!solicitud.clienteAceptoOferta) {
      return res.status(404).json({
        success: false,
        message: 'El cliente aún no ha aceptado la oferta',
        codigo: 'OFERTA_NO_ACEPTADA'
      });
    }

    console.log(`[SOLICITUDES] Cliente aceptó oferta el ${solicitud.fechaAceptacion}`);

    const documentosDPI = await prisma.documento.count({
      where: { 
        idRelacionado: parseInt(solicitudId),
        tipoRelacion: 'Solicitud',
        tipoDocumento: 'Identificacion'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Cliente ha aceptado la oferta',
      data: {
        solicitudId: solicitud.id,
        estado: solicitud.estado,
        clienteAceptoOferta: solicitud.clienteAceptoOferta,
        fechaAceptacion: solicitud.fechaAceptacion,
        dpiCompleto: documentosDPI >= 2,
        cantidadDocumentosDPI: documentosDPI,
        montoSolicitado: parseFloat(solicitud.montoSolicitado),
        plazoMeses: solicitud.plazoMeses,
        tasaInteres: parseFloat(solicitud.tasaInteres),
        cliente: {
          id: solicitud.usuario.id,
          nombre: solicitud.usuario.nombre,
          apellido: solicitud.usuario.apellido,
          email: solicitud.usuario.email
        }
      }
    });

  } catch (error) {
    console.error('[SOLICITUDES] Error verificando aceptación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar la aceptación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

export default router;