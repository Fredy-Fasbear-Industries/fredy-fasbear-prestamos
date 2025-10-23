// BACKEND/src/services/pdf.service.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {
  constructor() {
    this.empresa = {
      nombre: 'Fredy Fasbear Préstamos',
      eslogan: 'Tu aliado financiero de confianza',
      telefono: process.env.EMPRESA_TELEFONO || '+502 0000-0000',
      email: process.env.EMPRESA_EMAIL || 'info@fredyfasbear.com',
      direccion: process.env.EMPRESA_DIRECCION || 'Guatemala, Guatemala'
    };
  }

  /**
   * Genera un recibo de pago en PDF
   * @param {Object} pago - Datos del pago
   * @param {Object} prestamo - Datos del préstamo
   * @param {Object} cliente - Datos del cliente
   * @returns {Promise<Buffer>} - Buffer del PDF generado
   */
  async generarReciboPago(pago, prestamo, cliente) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header - Título de la empresa
        doc.fontSize(24)
           .fillColor('#D4AF37')
           .font('Helvetica-Bold')
           .text(this.empresa.nombre, { align: 'center' });

        doc.fontSize(10)
           .fillColor('#666666')
           .font('Helvetica')
           .text(this.empresa.eslogan, { align: 'center' });

        doc.moveDown(0.5);

        // Línea divisoria dorada
        doc.strokeColor('#D4AF37')
           .lineWidth(2)
           .moveTo(50, doc.y)
           .lineTo(562, doc.y)
           .stroke();

        doc.moveDown(1);

        // Título del documento
        doc.fontSize(18)
           .fillColor('#1A1A1A')
           .font('Helvetica-Bold')
           .text('RECIBO DE PAGO', { align: 'center' });

        doc.moveDown(0.5);

        // Información del recibo
        const infoY = doc.y;
        doc.fontSize(9)
           .fillColor('#666666')
           .font('Helvetica');

        doc.text(`No. Recibo: ${pago.id}`, 50, infoY);
        doc.text(`Fecha de Emisión: ${this.formatearFecha(new Date())}`, 400, infoY, { align: 'right' });
        doc.text(`No. Préstamo: ${prestamo.numeroPrestamo}`, 50, infoY + 15);
        doc.text(`Estado: ${pago.estadoValidacion}`, 400, infoY + 15, { align: 'right' });

        doc.moveDown(2);

        // Sección de información del cliente
        const clienteY = doc.y;
        doc.fontSize(11)
           .fillColor('#1A1A1A')
           .font('Helvetica-Bold')
           .text('INFORMACIÓN DEL CLIENTE', 50, clienteY);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#333333')
           .text(`Nombre: ${cliente.nombre} ${cliente.apellido}`, 50, clienteY + 20)
           .text(`Email: ${cliente.email}`, 50, clienteY + 35);

        doc.moveDown(2);

        // Sección de detalles del pago
        const pagoY = doc.y;
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#1A1A1A')
           .text('DETALLES DEL PAGO', 50, pagoY);

        doc.moveDown(0.5);

        // Tabla de detalles
        const tableTop = doc.y;
        const col1X = 50;
        const col2X = 300;

        // Header de la tabla
        doc.fontSize(9)
           .fillColor('#FFFFFF')
           .rect(col1X, tableTop, 512, 25)
           .fill('#D4AF37');

        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .text('Concepto', col1X + 10, tableTop + 8)
           .text('Detalle', col2X + 10, tableTop + 8);

        let currentY = tableTop + 25;

        // Filas de la tabla
        const filas = [
          { concepto: 'Monto Pagado', detalle: `Q ${this.formatearMonto(pago.montoPago)}` },
          { concepto: 'Método de Pago', detalle: pago.tipoPago },
          { concepto: 'Fecha de Pago', detalle: this.formatearFecha(pago.fechaPago) },
          { concepto: 'Fecha de Depósito', detalle: this.formatearFecha(pago.fechaDeposito) },
          { concepto: 'Banco', detalle: pago.nombreBanco || 'N/A' },
          { concepto: 'No. Transacción', detalle: pago.numeroTransaccion || 'N/A' }
        ];

        doc.fillColor('#333333').font('Helvetica');

        filas.forEach((fila, index) => {
          const bgColor = index % 2 === 0 ? '#F5F5F5' : '#FFFFFF';
          doc.rect(col1X, currentY, 512, 20).fill(bgColor);

          doc.fillColor('#333333')
             .fontSize(9)
             .text(fila.concepto, col1X + 10, currentY + 5)
             .text(fila.detalle, col2X + 10, currentY + 5);

          currentY += 20;
        });

        // Borde de la tabla
        doc.rect(col1X, tableTop, 512, currentY - tableTop)
           .strokeColor('#D4AF37')
           .stroke();

        // Observaciones (si existen)
        if (pago.observaciones) {
          doc.moveDown(2);
          doc.fontSize(11)
             .font('Helvetica-Bold')
             .fillColor('#1A1A1A')
             .text('OBSERVACIONES');

          doc.fontSize(9)
             .font('Helvetica')
             .fillColor('#333333')
             .text(pago.observaciones, {
               width: 512,
               align: 'justify'
             });
        }

        // Información del préstamo
        doc.moveDown(2);
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#1A1A1A')
           .text('INFORMACIÓN DEL PRÉSTAMO');

        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#333333')
           .text(`Saldo Actual: Q ${this.formatearMonto(prestamo.saldoPendiente)}`, 50, doc.y + 10);

        // Nota importante
        doc.moveDown(2);
        doc.fontSize(8)
           .fillColor('#666666')
           .font('Helvetica-Oblique')
           .text('* Este recibo es un comprobante de su pago. El saldo del préstamo se actualizará una vez validado el pago.', {
             width: 512,
             align: 'center'
           });

        // Footer
        doc.moveDown(2);

        // Línea divisoria
        doc.strokeColor('#D4AF37')
           .lineWidth(1)
           .moveTo(50, doc.y)
           .lineTo(562, doc.y)
           .stroke();

        doc.moveDown(0.5);

        doc.fontSize(8)
           .fillColor('#666666')
           .font('Helvetica')
           .text(this.empresa.nombre, { align: 'center' });

        doc.text(`${this.empresa.telefono} | ${this.empresa.email}`, { align: 'center' });
        doc.text(this.empresa.direccion, { align: 'center' });

        doc.moveDown(0.5);

        doc.fontSize(7)
           .fillColor('#999999')
           .text(`Documento generado el ${this.formatearFechaHora(new Date())}`, { align: 'center' });

        doc.end();

      } catch (error) {
        console.error('[PDF Service] Error generando recibo:', error);
        reject(error);
      }
    });
  }

  /**
   * Formatea un monto a formato de moneda
   */
  formatearMonto(monto) {
    return new Intl.NumberFormat('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(monto || 0);
  }

  /**
   * Formatea una fecha a formato legible
   */
  formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  /**
   * Formatea una fecha con hora
   */
  formatearFechaHora(fecha) {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Guarda un PDF en el filesystem
   */
  async guardarPDF(buffer, carpeta, nombreArchivo) {
    try {
      const uploadsDir = path.join(__dirname, '../../uploads', carpeta);

      // Crear directorio si no existe
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, nombreArchivo);
      fs.writeFileSync(filePath, buffer);

      // Retornar la ruta relativa para guardar en BD
      return `/uploads/${carpeta}/${nombreArchivo}`;

    } catch (error) {
      console.error('[PDF Service] Error guardando PDF:', error);
      throw error;
    }
  }
}

export default new PDFService();
