import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

const verificarRol = (req, res, next) => {
  const rolesPermitidos = ['Evaluador', 'Administrador'];
  
  if (!rolesPermitidos.includes(req.user.tipoUsuario)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para realizar esta acción'
    });
  }
  
  next();
};

router.get('/solicitud/:solicitudId', async (req, res) => {
  const { solicitudId } = req.params;

  try {
    const contrato = await prisma.contrato.findFirst({
      where: { solicitudId: parseInt(solicitudId) },
      include: {
        solicitud: {
          include: {
            usuario: true,
            articulos: {
              include: {
                tipoArticulo: true
              }
            }
          }
        },
        prestamo: {
          include: {
            planPagos: {
              orderBy: { numeroCuota: 'asc' }
            }
          }
        }
      }
    });

    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: 'No existe contrato para esta solicitud'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: contrato.id,
        numeroContrato: contrato.numeroContrato,
        estadoFirma: contrato.estadoFirma,
        fechaCreacion: contrato.fechaCreacion,
        fechaFirma: contrato.fechaFirma,
        contenidoContrato: contrato.contenidoContrato,
        solicitud: {
          id: contrato.solicitud.id,
          montoSolicitado: parseFloat(contrato.solicitud.montoSolicitado),
          plazoMeses: contrato.solicitud.plazoMeses,
          tasaInteres: parseFloat(contrato.solicitud.tasaInteres)
        },
        cliente: {
          nombre: `${contrato.solicitud.usuario.nombre} ${contrato.solicitud.usuario.apellido}`,
          cedula: contrato.solicitud.usuario.cedula,
          email: contrato.solicitud.usuario.email,
          telefono: contrato.solicitud.usuario.telefono
        },
        prestamo: contrato.prestamo ? {
          id: contrato.prestamo.id,
          montoPrestado: parseFloat(contrato.prestamo.montoPrestado),
          saldoPendiente: parseFloat(contrato.prestamo.saldoPendiente),
          fechaVencimiento: contrato.prestamo.fechaVencimiento,
          totalCuotas: contrato.prestamo.planPagos.length
        } : null
      }
    });

  } catch (error) {
    console.error('[CONTRATOS] Error obteniendo contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el contrato'
    });
  }
});

router.post('/generar/:solicitudId', verificarRol, async (req, res) => {
  const { solicitudId } = req.params;

  console.log(`[CONTRATOS] Generando contrato para solicitud ${solicitudId}`);

  try {
    const solicitud = await prisma.solicitudPrestamo.findUnique({
      where: { id: parseInt(solicitudId) },
      include: {
        usuario: true,
        articulos: {
          include: {
            tipoArticulo: true,
            avaluo: true
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

    if (solicitud.estado !== 'Aprobada') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden generar contratos para solicitudes aprobadas'
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
        message: 'El cliente debe subir ambas fotos de su DPI antes de generar el contrato',
        codigo: 'DPI_INCOMPLETO'
      });
    }

    if (!solicitud.clienteAceptoOferta) {
      return res.status(400).json({
        success: false,
        message: 'El cliente debe aceptar la oferta antes de generar el contrato',
        codigo: 'OFERTA_NO_ACEPTADA'
      });
    }

    const contratoExistente = await prisma.contrato.findFirst({
      where: { solicitudId: parseInt(solicitudId) }
    });

    if (contratoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un contrato para esta solicitud',
        data: {
          contratoId: contratoExistente.id,
          numeroContrato: contratoExistente.numeroContrato,
          estadoFirma: contratoExistente.estadoFirma
        }
      });
    }

    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    
    const ultimoContrato = await prisma.contrato.findFirst({
      where: {
        numeroContrato: {
          startsWith: `CONT-${año}${mes}`
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let numeroSecuencial = 1;
    if (ultimoContrato) {
      const partes = ultimoContrato.numeroContrato.split('-');
      numeroSecuencial = parseInt(partes[partes.length - 1]) + 1;
    }

    const numeroContrato = `CONT-${año}${mes}-${String(numeroSecuencial).padStart(6, '0')}`;

    const contadorPrestamos = await prisma.prestamo.count({
      where: {
        fechaInicio: {
          gte: new Date(`${año}-01-01`),
          lt: new Date(`${año + 1}-01-01`)
        }
      }
    });
    const numeroPrestamo = `PRE-${año}-${String(contadorPrestamos + 1).padStart(6, '0')}`;

    const fechaInicio = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + parseInt(solicitud.plazoMeses || 3));


const resultado = await prisma.$transaction(async (tx) => {
  const year = fechaActual.getFullYear();
  const contratosCount = await tx.contrato.count({
    where: {
      numeroContrato: {
        startsWith: `CON-${year}-`
      }
    }
  });
  const numeroContrato = `CON-${year}-${String(contratosCount + 1).padStart(6, '0')}`;

  const prestamosCount = await tx.prestamo.count({
    where: {
      numeroPrestamo: {
        startsWith: `PRE-${year}-`
      }
    }
  });
  const numeroPrestamo = `PRE-${year}-${String(prestamosCount + 1).padStart(6, '0')}`;

  const fechaInicio = new Date(fechaActual);
  fechaInicio.setHours(0, 0, 0, 0);
  
  const fechaVencimiento = new Date(fechaInicio);
  fechaVencimiento.setMonth(fechaVencimiento.getMonth() + parseInt(solicitud.plazoMeses || 3));

  const contenidoContrato = generarContenidoContrato(solicitud, numeroContrato, fechaActual);

  const contrato = await tx.contrato.create({
    data: {
      solicitudId: parseInt(solicitudId),
      numeroContrato: numeroContrato,
      contenidoContrato: contenidoContrato,
      estadoFirma: 'Pendiente',
      fechaCreacion: new Date()
    }
  });

  const montoPrestado = parseFloat(solicitud.montoSolicitado);
  const tasaInteres = parseFloat(solicitud.tasaInteres || 5.0);
  const plazoMeses = parseInt(solicitud.plazoMeses || 3);
  
  const interesTotal = montoPrestado * (tasaInteres / 100) * plazoMeses;
  const totalAPagar = montoPrestado + interesTotal;

  console.log(`[CALCULO] Monto: ${montoPrestado}, Tasa: ${tasaInteres}%, Plazo: ${plazoMeses} meses`);
  console.log(`[CALCULO] Interes: ${interesTotal.toFixed(2)}, Total: ${totalAPagar.toFixed(2)}`);

  const prestamo = await tx.prestamo.create({
    data: {
      contratoId: contrato.id,
      montoPrestado: montoPrestado,
      tasaInteres: tasaInteres,
      plazoMeses: plazoMeses,
      modalidadPago: solicitud.modalidadPago || 'Mensual',
      totalAPagar: parseFloat(totalAPagar.toFixed(2)),
      saldoPendiente: parseFloat(totalAPagar.toFixed(2)),
      estado: 'Pendiente_Firma',
      fechaInicio: fechaInicio,
      fechaVencimiento: fechaVencimiento,
      numeroPrestamo: numeroPrestamo
    }
  });

  const montoCuota = totalAPagar / plazoMeses;
  const montoCapital = montoPrestado / plazoMeses;
  const montoInteres = interesTotal / plazoMeses;

  console.log(`[PLAN] Cuota: ${montoCuota.toFixed(2)}, Capital: ${montoCapital.toFixed(2)}, Interes: ${montoInteres.toFixed(2)}`);

  for (let i = 1; i <= plazoMeses; i++) {
    const fechaVencimientoCuota = new Date(fechaInicio);
    fechaVencimientoCuota.setMonth(fechaVencimientoCuota.getMonth() + i);

    await tx.planPagos.create({
      data: {
        prestamoId: prestamo.id,
        numeroCuota: i,
        fechaVencimiento: fechaVencimientoCuota,
        montoCuota: parseFloat(montoCuota.toFixed(2)),
        montoCapital: parseFloat(montoCapital.toFixed(2)),
        montoInteres: parseFloat(montoInteres.toFixed(2)),
        estado: 'Pendiente'
      }
    });
  }

  return { contrato, prestamo };
});

    console.log(`[CONTRATOS] Contrato ${numeroContrato} creado. Préstamo ${numeroPrestamo} en estado Pendiente_Firma`);

    res.status(200).json({
      success: true,
      message: 'Contrato y plan de pagos generados exitosamente. Esperando firma del cliente.',
      data: {
        id: resultado.contrato.id,
        numeroContrato: resultado.contrato.numeroContrato,
        fechaCreacion: resultado.contrato.fechaCreacion,
        estadoFirma: resultado.contrato.estadoFirma,
        prestamo: {
          id: resultado.prestamo.id,
          numeroPrestamo: resultado.prestamo.numeroPrestamo,
          estado: resultado.prestamo.estado
        }
      }
    });

  } catch (error) {
    console.error('[CONTRATOS] Error generando contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el contrato',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/:contratoId/pdf', async (req, res) => {
  const { contratoId } = req.params;

  try {
    const contrato = await prisma.contrato.findUnique({
      where: { id: parseInt(contratoId) },
      include: {
        solicitud: {
          include: {
            usuario: true,
            articulos: {
              include: {
                tipoArticulo: true
              }
            }
          }
        },
        prestamo: {
          include: {
            planPagos: {
              orderBy: { numeroCuota: 'asc' }
            }
          }
        }
      }
    });

    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
    }

    console.log(`[CONTRATOS] Generando PDF para contrato ${contrato.numeroContrato}`);
    console.log(`[CONTRATOS] Estado firma: ${contrato.estadoFirma}`);
    console.log(`[CONTRATOS] Tiene hashFirma: ${contrato.hashFirma ? 'SI' : 'NO'}`);
    if (contrato.hashFirma) {
      console.log(`[CONTRATOS] Longitud hashFirma: ${contrato.hashFirma.length} caracteres`);
    }

    const doc = new PDFDocument({ 
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrato-${contrato.numeroContrato}.pdf`);

    doc.pipe(res);

    generarPDF(doc, contrato);

    doc.end();

  } catch (error) {
    console.error('[CONTRATOS] Error generando PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el PDF'
    });
  }
});

router.post('/:contratoId/firmar', authenticateToken, async (req, res) => {
  const { contratoId } = req.params;
  const userId = req.user.id;
  const { firmaDigital } = req.body;

  console.log(`[CONTRATOS] Cliente ${userId} firmando contrato ${contratoId}`);
  console.log(`[CONTRATOS] Firma digital recibida: ${firmaDigital ? 'SI' : 'NO'}`);
  if (firmaDigital) {
    console.log(`[CONTRATOS] Longitud de firma: ${firmaDigital.length} caracteres`);
    console.log(`[CONTRATOS] Inicio de firma: ${firmaDigital.substring(0, 50)}...`);
  }

  try {
    const contrato = await prisma.contrato.findUnique({
      where: { id: parseInt(contratoId) },
      include: {
        solicitud: {
          include: {
            usuario: true,
            articulos: {
              include: {
                tipoArticulo: true
              }
            }
          }
        },
        prestamo: {
          include: {
            planPagos: {
              orderBy: { numeroCuota: 'asc' }
            }
          }
        }
      }
    });

    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
    }

    if (contrato.solicitud.usuarioId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes autorización para firmar este contrato'
      });
    }

    if (contrato.estadoFirma === 'Firmado') {
      return res.status(400).json({
        success: false,
        message: 'Este contrato ya ha sido firmado',
        codigo: 'CONTRATO_YA_FIRMADO'
      });
    }

    if (!contrato.prestamo) {
      return res.status(400).json({
        success: false,
        message: 'No existe préstamo asociado a este contrato',
        codigo: 'PRESTAMO_NO_EXISTE'
      });
    }

    if (contrato.prestamo.estado === 'Activo') {
      return res.status(400).json({
        success: false,
        message: 'El préstamo ya está activo',
        codigo: 'PRESTAMO_YA_ACTIVO'
      });
    }

    console.log(`[CONTRATOS] Guardando firma en base de datos...`);

    await prisma.$transaction(async (tx) => {
      const contratoActualizado = await tx.contrato.update({
        where: { id: contrato.id },
        data: {
          estadoFirma: 'Firmado',
          fechaFirma: new Date(),
          hashFirma: firmaDigital || null
        }
      });

      console.log(`[CONTRATOS] Contrato actualizado. Hash firma guardado: ${contratoActualizado.hashFirma ? 'SI' : 'NO'}`);

      await tx.prestamo.update({
        where: { id: contrato.prestamo.id },
        data: {
          estado: 'Activo'
        }
      });

      await tx.solicitudPrestamo.update({
        where: { id: contrato.solicitud.id },
        data: {
          estado: 'Aprobada'
        }
      });
    });

    console.log(`[CONTRATOS] Contrato firmado. Préstamo ${contrato.prestamo.numeroPrestamo} activado.`);

    try {
      await prisma.auditLog.create({
        data: {
          usuarioId: userId,
          accion: 'FIRMAR_CONTRATO',
          tabla: 'contrato',
          descripcion: `Cliente firmó contrato ${contrato.numeroContrato} y activó préstamo ${contrato.prestamo.numeroPrestamo}`,
          detalles: JSON.stringify({
            contratoId: contrato.id,
            prestamoId: contrato.prestamo.id,
            numeroPrestamo: contrato.prestamo.numeroPrestamo,
            monto: contrato.prestamo.montoPrestado
          })
        }
      });
    } catch (auditError) {
      console.error('[CONTRATOS] Error creando audit log:', auditError);
    }

    res.status(200).json({
      success: true,
      message: 'Contrato firmado exitosamente. Tu préstamo ha sido activado.',
      data: {
        contrato: {
          id: contrato.id,
          numeroContrato: contrato.numeroContrato,
          estadoFirma: 'Firmado',
          fechaFirma: new Date()
        },
        prestamo: {
          id: contrato.prestamo.id,
          numeroPrestamo: contrato.prestamo.numeroPrestamo,
          monto: parseFloat(contrato.prestamo.montoPrestado),
          estado: 'Activo',
          fechaInicio: contrato.prestamo.fechaInicio,
          fechaVencimiento: contrato.prestamo.fechaVencimiento,
          plazoMeses: contrato.prestamo.plazoMeses,
          tasaInteres: parseFloat(contrato.prestamo.tasaInteres),
          totalAPagar: parseFloat(contrato.prestamo.totalAPagar)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CONTRATOS] Error firmando contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al firmar el contrato',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

function generarContenidoContrato(solicitud, numeroContrato, fechaActual) {
  const cliente = solicitud.usuario;
  const articulos = solicitud.articulos;

  let contenido = `
CONTRATO DE PRÉSTAMO PIGNORATICIO
Número: ${numeroContrato}
Fecha: ${fechaActual.toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}

COMPARECEN:

I. FREDY FASBEAR INDUSTRIES, entidad dedicada al otorgamiento de préstamos pignoraticios.

II. ${cliente.nombre} ${cliente.apellido}, con DPI número ${cliente.cedula || '[No proporcionado]'}, 
con domicilio en ${cliente.direccion || '[No proporcionado]'}.

CLÁUSULAS:

PRIMERA: OBJETO DEL CONTRATO
Se otorga un préstamo por la cantidad de Q ${parseFloat(solicitud.montoSolicitado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}.

SEGUNDA: GARANTÍA
Se entregan en prenda los siguientes artículos:

`;

  articulos.forEach((articulo, index) => {
    contenido += `${index + 1}. ${articulo.descripcion}\n`;
    if (articulo.marca) contenido += `   Marca: ${articulo.marca}\n`;
    if (articulo.modelo) contenido += `   Modelo: ${articulo.modelo}\n`;
    contenido += `   Estado: ${articulo.estadoFisico}\n`;
    contenido += `   Valor Estimado: Q ${parseFloat(articulo.valorEstimadoCliente || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}\n\n`;
  });

  contenido += `
TERCERA: PLAZO Y TASA DE INTERÉS
Plazo: ${solicitud.plazoMeses || 3} meses
Tasa de interés: ${parseFloat(solicitud.tasaInteres || 5.0)}% mensual
Modalidad de pago: ${solicitud.modalidadPago || 'Mensual'}
Monto total a pagar: Q ${parseFloat(solicitud.totalAPagar || solicitud.montoSolicitado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}

CUARTA: OBLIGACIONES DEL PRESTATARIO
a) Realizar los pagos en las fechas acordadas
b) Mantener actualizada su información de contacto
c) No reclamar los artículos hasta saldar el préstamo

QUINTA: VENCIMIENTO
Si no se cumple con los pagos, los artículos empeñados podrán ser vendidos para 
recuperar el monto adeudado después de ${solicitud.plazoMeses || 3} meses.

FIRMA ELECTRÓNICA: ${fechaActual.toISOString()}
`;

  return contenido;
}

function generarPDF(doc, contrato) {
  const solicitud = contrato.solicitud;
  const cliente = solicitud.usuario;
  const prestamo = contrato.prestamo;

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;
 
  doc.moveTo(margin, margin)
     .lineTo(pageWidth - margin, margin)
     .strokeColor('#D4AF37')
     .lineWidth(2)
     .stroke();
  
  const logoY = margin + 15;
  
  try {
    const logoPath = path.join(process.cwd(), 'assets', 'images', 'logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin, logoY, { width: 80, height: 50 });
    } else {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#D4AF37')
         .text('FREDY', margin, logoY, { continued: true })
         .fillColor('#1A1A1A')
         .text(' FASBEAR', { continued: false });
      
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#6B7280')
         .text('INDUSTRIES', margin, logoY + 18);
    }
  } catch (err) {
    console.log('[CONTRATOS] Logo no encontrado, usando texto');
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#D4AF37')
       .text('FREDY', margin, logoY, { continued: true })
       .fillColor('#1A1A1A')
       .text(' FASBEAR', { continued: false });
    
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#6B7280')
       .text('INDUSTRIES', margin, logoY + 18);
  }
 
  const titleX = margin + 150;
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('CONTRATO DE PRÉSTAMO', titleX, logoY, { 
       align: 'left',
       width: pageWidth - titleX - margin
     });
  
  doc.fontSize(20)
     .fillColor('#D4AF37')
     .text('PIGNORATICIO', titleX, logoY + 28, { 
       align: 'left',
       width: pageWidth - titleX - margin
     });

  const boxY = logoY + 70;
  doc.rect(margin, boxY, pageWidth - (margin * 2), 60)
     .fillAndStroke('#F9FAFB', '#E5E7EB');

  doc.fontSize(10)
     .fillColor('#1A1A1A')
     .font('Helvetica-Bold')
     .text(`No. Contrato: ${contrato.numeroContrato}`, margin + 20, boxY + 15, { continued: false });
  
  doc.font('Helvetica')
     .text(`Fecha de Emisión: ${new Date(contrato.fechaCreacion).toLocaleDateString('es-GT', { 
       year: 'numeric', 
       month: 'long', 
       day: 'numeric' 
     })}`, margin + 20, boxY + 30);
  
  doc.text(`Estado: ${contrato.estadoFirma === 'Firmado' ? 'FIRMADO' : 'PENDIENTE DE FIRMA'}`, 
     margin + 20, boxY + 45);

  doc.moveDown(3);
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#1B4332')
     .text('COMPARECEN', margin, boxY + 80);

  doc.moveTo(margin, boxY + 95)
     .lineTo(margin + 150, boxY + 95)
     .strokeColor('#1B4332')
     .lineWidth(1.5)
     .stroke();

  let currentY = boxY + 110;
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('I. EL PRESTAMISTA:', margin, currentY);
  
  doc.font('Helvetica')
     .text('FREDY FASBEAR INDUSTRIES, entidad dedicada al otorgamiento de préstamos pignoraticios, ' +
           'debidamente autorizada para operar en Guatemala.', margin + 20, currentY + 15, {
       width: pageWidth - (margin * 2) - 20,
       align: 'justify'
     });

  currentY = doc.y + 15;
  doc.font('Helvetica-Bold')
     .text('II. EL PRESTATARIO:', margin, currentY);
  
  doc.font('Helvetica')
     .text(`${cliente.nombre} ${cliente.apellido}, de nacionalidad guatemalteca, con DPI número ` +
           `${cliente.cedula || '[No proporcionado]'}, con domicilio en ${cliente.direccion || '[No proporcionado]'}.`, 
           margin + 20, currentY + 15, {
       width: pageWidth - (margin * 2) - 20,
       align: 'justify'
     });

  currentY = doc.y + 20;
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#1B4332')
     .text('CLÁUSULAS DEL CONTRATO', margin, currentY);

  doc.moveTo(margin, currentY + 15)
     .lineTo(margin + 230, currentY + 15)
     .strokeColor('#1B4332')
     .lineWidth(1.5)
     .stroke();

  currentY += 30;
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('PRIMERA: OBJETO DEL CONTRATO', margin, currentY);
  
  doc.fontSize(10)
     .font('Helvetica')
     .text(`EL PRESTAMISTA otorga a EL PRESTATARIO un préstamo por la cantidad de `, 
           margin + 20, currentY + 15, { continued: true })
     .font('Helvetica-Bold')
     .fillColor('#D4AF37')
     .text(`Q ${parseFloat(solicitud.montoSolicitado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, { continued: true })
     .font('Helvetica')
     .fillColor('#1A1A1A')
     .text(' (Quetzales).');

  currentY = doc.y + 20;
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('SEGUNDA: GARANTÍA', margin, currentY);
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('EL PRESTATARIO entrega en prenda los siguientes artículos como garantía del préstamo:', 
           margin + 20, currentY + 15);

  currentY = doc.y + 10;
  
  solicitud.articulos.forEach((articulo, index) => {
    doc.circle(margin + 30, currentY + 5, 8)
       .fillAndStroke('#D4AF37', '#D4AF37');
    doc.fillColor('#FFFFFF')
       .fontSize(8)
       .font('Helvetica-Bold')
       .text(`${index + 1}`, margin + 27, currentY + 2);

    doc.fillColor('#1A1A1A')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text(articulo.descripcion, margin + 50, currentY);
    
    currentY = doc.y + 3;
    doc.font('Helvetica').fontSize(9);
    
    if (articulo.marca) {
      doc.fillColor('#6B7280').text(`Marca: `, margin + 50, currentY, { continued: true })
         .fillColor('#1A1A1A').text(articulo.marca);
      currentY = doc.y + 2;
    }
    
    if (articulo.modelo) {
      doc.fillColor('#6B7280').text(`Modelo: `, margin + 50, currentY, { continued: true })
         .fillColor('#1A1A1A').text(articulo.modelo);
      currentY = doc.y + 2;
    }
    
    doc.fillColor('#6B7280').text(`Estado Físico: `, margin + 50, currentY, { continued: true })
       .fillColor('#1A1A1A').text(articulo.estadoFisico);
    currentY = doc.y + 2;
    
    doc.fillColor('#6B7280').text(`Valor Estimado: `, margin + 50, currentY, { continued: true })
       .fillColor('#D4AF37').font('Helvetica-Bold')
       .text(`Q ${parseFloat(articulo.valorEstimadoCliente || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`);
    
    currentY = doc.y + 15;
  });

  currentY += 5;
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('TERCERA: PLAZO Y CONDICIONES FINANCIERAS', margin, currentY);

  currentY += 15;
  const condicionesHeight = prestamo && prestamo.planPagos ? 130 : 95;
  doc.rect(margin + 20, currentY, pageWidth - (margin * 2) - 20, condicionesHeight)
     .fillAndStroke('#FEF3C7', '#FDE68A');

  doc.fontSize(10).font('Helvetica').fillColor('#1A1A1A');
  let condY = currentY + 10;
  
  doc.text(`Plazo del Préstamo: `, margin + 35, condY, { continued: true })
     .font('Helvetica-Bold').text(`${solicitud.plazoMeses || 3} meses`);
  condY += 18;
  
  doc.font('Helvetica').text(`Tasa de Interés: `, margin + 35, condY, { continued: true })
     .font('Helvetica-Bold').text(`${parseFloat(solicitud.tasaInteres || 5.0)}% mensual`);
  condY += 18;
  
  doc.font('Helvetica').text(`Modalidad de Pago: `, margin + 35, condY, { continued: true })
     .font('Helvetica-Bold').text(`${solicitud.modalidadPago || 'Mensual'}`);
  condY += 18;
  
  doc.font('Helvetica').text(`Monto Total a Pagar: `, margin + 35, condY, { continued: true })
     .font('Helvetica-Bold').fillColor('#D4AF37')
     .text(`Q ${parseFloat(solicitud.totalAPagar || solicitud.montoSolicitado).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`);

  if (prestamo && prestamo.planPagos && prestamo.planPagos.length > 0) {
    condY += 25;
    doc.fillColor('#1A1A1A')
       .font('Helvetica')
       .text(`Número de Cuotas: `, margin + 35, condY, { continued: true })
       .font('Helvetica-Bold')
       .text(`${prestamo.planPagos.length} cuotas`);
    condY += 18;
    
    const montoPorCuota = prestamo.planPagos[0].montoCuota;
    doc.font('Helvetica')
       .text(`Monto por Cuota: `, margin + 35, condY, { continued: true })
       .font('Helvetica-Bold')
       .fillColor('#D4AF37')
       .text(`Q ${parseFloat(montoPorCuota).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`);
  }

  if (doc.y > pageHeight - 200) {
    doc.addPage();
  }

  doc.moveDown(2);
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('CUARTA: OBLIGACIONES DEL PRESTATARIO', margin, doc.y);

  const obligaciones = [
    'Realizar los pagos puntualmente en las fechas establecidas en el plan de pagos.',
    'Mantener actualizada su información de contacto (teléfono, dirección, email).',
    'No reclamar los artículos empeñados hasta saldar completamente el préstamo.',
    'Notificar cualquier cambio en su situación que pueda afectar el cumplimiento del contrato.'
  ];

  doc.fontSize(10).font('Helvetica').fillColor('#1A1A1A');
  obligaciones.forEach((obligacion, index) => {
    doc.moveDown(0.5);
    doc.text(`${String.fromCharCode(97 + index)}) ${obligacion}`, margin + 20, doc.y, {
      width: pageWidth - (margin * 2) - 20,
      align: 'justify'
    });
  });

  doc.moveDown(1.5);
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('QUINTA: VENCIMIENTO Y RECUPERACIÓN', margin, doc.y);
  
  doc.fontSize(10)
     .font('Helvetica')
     .text('En caso de incumplimiento de pago, EL PRESTAMISTA podrá proceder a la venta de los artículos ' +
           `empeñados para recuperar el monto adeudado después de ${solicitud.plazoMeses || 3} meses contados ` +
           'desde la fecha de inicio del préstamo. Los artículos no redimidos pasarán a ser propiedad de ' +
           'EL PRESTAMISTA.', margin + 20, doc.y + 5, {
       width: pageWidth - (margin * 2) - 20,
       align: 'justify'
     });

  if (prestamo && prestamo.planPagos && prestamo.planPagos.length > 0) {
    doc.addPage();
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#2C5544')
       .text('PLAN DE PAGOS', margin, margin + 20, { align: 'left' });

    doc.moveTo(margin, margin + 48)
       .lineTo(margin + 180, margin + 48)
       .strokeColor('#2C5544')
       .lineWidth(2)
       .stroke();

    doc.moveDown(3);

    const tableStartX = margin;
    const tableWidth = pageWidth - (margin * 2);
    const colWidths = {
      cuota: 70,
      fecha: 150,
      capital: 110,
      interes: 110,
      total: tableWidth - 440
    };

    let tableY = doc.y;

    doc.rect(tableStartX, tableY, tableWidth, 35)
       .fillAndStroke('#2C5544', '#2C5544');

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF');

    let currentX = tableStartX + 10;
    
    doc.text('Cuota', currentX, tableY + 11, { 
      width: colWidths.cuota - 10, 
      align: 'left' 
    });
    currentX += colWidths.cuota;

    doc.text('Fecha Vencimiento', currentX, tableY + 11, { 
      width: colWidths.fecha, 
      align: 'left' 
    });
    currentX += colWidths.fecha;

    doc.text('Capital', currentX, tableY + 11, { 
      width: colWidths.capital, 
      align: 'left' 
    });
    currentX += colWidths.capital;

    doc.text('Interés', currentX, tableY + 11, { 
      width: colWidths.interes, 
      align: 'left' 
    });
    currentX += colWidths.interes;

    doc.text('Total', currentX, tableY + 11, { 
      width: colWidths.total, 
      align: 'left' 
    });

    tableY += 35;

    doc.fontSize(10).font('Helvetica').fillColor('#1A1A1A');

    prestamo.planPagos.forEach((cuota, index) => {
      const rowHeight = 40;
      const textY = tableY + 12;

      if (index % 2 === 0) {
        doc.rect(tableStartX, tableY, tableWidth, rowHeight)
           .fillAndStroke('#FFFFFF', '#E5E7EB');
      } else {
        doc.rect(tableStartX, tableY, tableWidth, rowHeight)
           .fillAndStroke('#F9FAFB', '#E5E7EB');
      }

      currentX = tableStartX + 10;

      doc.font('Helvetica')
         .fillColor('#1A1A1A')
         .text(
           `${cuota.numeroCuota}`, 
           currentX, 
           textY, 
           { width: colWidths.cuota - 10, align: 'left' }
         );
      currentX += colWidths.cuota;

      doc.text(
        new Date(cuota.fechaVencimiento).toLocaleDateString('es-GT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }), 
        currentX, 
        textY, 
        { width: colWidths.fecha, align: 'left' }
      );
      currentX += colWidths.fecha;

      doc.text(
        `Q ${parseFloat(cuota.montoCapital).toFixed(2)}`, 
        currentX, 
        textY, 
        { width: colWidths.capital, align: 'left' }
      );
      currentX += colWidths.capital;

      doc.text(
        `Q ${parseFloat(cuota.montoInteres).toFixed(2)}`, 
        currentX, 
        textY, 
        { width: colWidths.interes, align: 'left' }
      );
      currentX += colWidths.interes;

      doc.font('Helvetica-Bold')
         .fillColor('#D4AF37')
         .text(
           `Q ${parseFloat(cuota.montoCuota).toFixed(2)}`, 
           currentX, 
           textY, 
           { width: colWidths.total, align: 'left' }
         );

      tableY += rowHeight;
      doc.font('Helvetica').fillColor('#1A1A1A');
    });

    tableY += 5;
    doc.rect(tableStartX, tableY, tableWidth, 45)
       .fillAndStroke('#FEF3C7', '#D4AF37');

    const totalPrestamo = prestamo.planPagos.reduce((sum, c) => sum + parseFloat(c.montoCuota), 0);
    
    doc.fontSize(13)
       .font('Helvetica-Bold')
       .fillColor('#1A1A1A')
       .text('TOTAL A PAGAR:', tableStartX + 20, tableY + 15, { continued: true })
       .fillColor('#D4AF37')
       .fontSize(14)
       .text(`  Q ${totalPrestamo.toFixed(2)}`);
  }

  doc.addPage();

  doc.moveDown(4);
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text('ACEPTACIÓN Y FIRMA DEL CONTRATO', margin, doc.y, { align: 'center' });

  doc.moveDown(2);
  doc.fontSize(10)
     .font('Helvetica')
     .text('Al firmar este documento, EL PRESTATARIO declara haber leído, comprendido y aceptado ' +
           'todos los términos y condiciones establecidos en el presente contrato.', margin, doc.y, {
       width: pageWidth - (margin * 2),
       align: 'justify'
     });

  doc.moveDown(4);

  const firmaY = doc.y;
  const firmaBoxWidth = 300;
  const firmaBoxHeight = 120;
  const firmaX = (pageWidth - firmaBoxWidth) / 2;

  doc.rect(firmaX, firmaY, firmaBoxWidth, firmaBoxHeight)
     .fillAndStroke('#FFFFFF', '#D4AF37');

  doc.fontSize(9)
     .fillColor('#6B7280')
     .text('FIRMA DEL PRESTATARIO', firmaX + 10, firmaY + 10);

  console.log(`[CONTRATOS PDF] Estado firma: ${contrato.estadoFirma}`);
  console.log(`[CONTRATOS PDF] Tiene hashFirma: ${contrato.hashFirma ? 'SI' : 'NO'}`);
  
  if (contrato.estadoFirma === 'Firmado' && contrato.hashFirma) {
    try {
      console.log(`[CONTRATOS PDF] Intentando insertar firma en PDF...`);
      console.log(`[CONTRATOS PDF] Longitud hashFirma: ${contrato.hashFirma.length}`);
      console.log(`[CONTRATOS PDF] Inicio hashFirma: ${contrato.hashFirma.substring(0, 100)}`);
      
      const base64Data = contrato.hashFirma.replace(/^data:image\/\w+;base64,/, '');
      console.log(`[CONTRATOS PDF] Base64 limpio, longitud: ${base64Data.length}`);
      
      const buffer = Buffer.from(base64Data, 'base64');
      console.log(`[CONTRATOS PDF] Buffer creado, tamaño: ${buffer.length} bytes`);
      
      const firmaImageY = firmaY + 25;
      const firmaImageHeight = 50;
      const firmaImageWidth = 260;
      const firmaImageX = firmaX + (firmaBoxWidth - firmaImageWidth) / 2;
      
      console.log(`[CONTRATOS PDF] Insertando imagen en posición X:${firmaImageX}, Y:${firmaImageY}`);
      
      doc.image(buffer, firmaImageX, firmaImageY, {
        width: firmaImageWidth,
        height: firmaImageHeight,
        align: 'center'
      });
      
      console.log(`[CONTRATOS PDF] Imagen de firma insertada exitosamente`);
    } catch (error) {
      console.error('[CONTRATOS PDF] Error insertando imagen de firma:', error);
      console.error('[CONTRATOS PDF] Stack:', error.stack);
    }
  } else {
    console.log(`[CONTRATOS PDF] No se insertará firma. Razón: EstadoFirma=${contrato.estadoFirma}, TieneHash=${!!contrato.hashFirma}`);
  }

  const lineY = firmaY + firmaBoxHeight - 30;
  doc.moveTo(firmaX + 20, lineY)
     .lineTo(firmaX + firmaBoxWidth - 20, lineY)
     .strokeColor('#1A1A1A')
     .lineWidth(1)
     .stroke();

  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#1A1A1A')
     .text(`${cliente.nombre} ${cliente.apellido}`, firmaX + 20, lineY + 5, {
       width: firmaBoxWidth - 40,
       align: 'center'
     });

  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#6B7280')
     .text(`DPI: ${cliente.cedula || '[No proporcionado]'}`, firmaX + 20, lineY + 22, {
       width: firmaBoxWidth - 40,
       align: 'center'
     });

  doc.moveDown(3);
  if (contrato.estadoFirma === 'Firmado') {
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#1B4332')
       .text(`FIRMADO ELECTRÓNICAMENTE`, margin, doc.y, { align: 'center' });
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#6B7280')
       .text(`Fecha: ${new Date(contrato.fechaFirma).toLocaleDateString('es-GT', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
       })}`, margin, doc.y + 5, { align: 'center' });
  } else {
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#92400E')
       .text('PENDIENTE DE FIRMA ELECTRÓNICA', margin, doc.y, { align: 'center' });
  }

  doc.moveDown(4);
  doc.moveTo(margin, doc.y)
     .lineTo(pageWidth - margin, doc.y)
     .strokeColor('#E5E7EB')
     .lineWidth(1)
     .stroke();

  doc.moveDown(0.5);
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#6B7280')
     .text('FREDY FASBEAR INDUSTRIES', margin, doc.y, { align: 'center' });
  doc.text('Guatemala, C.A.', margin, doc.y + 2, { align: 'center' });
  doc.text(`Documento generado el ${new Date().toLocaleDateString('es-GT')}`, margin, doc.y + 2, { align: 'center' });
}

export default router;