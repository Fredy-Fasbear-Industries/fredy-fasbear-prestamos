import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  
  generarTokenVerificacion() {
    return crypto.randomBytes(32).toString('hex');
  }

  async enviarEmailVerificacion(usuario, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verificar-email?token=${token}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verificación de Email</h1>
              <p>Fredy Fasbear Industries</p>
            </div>
            <div class="content">
              <h2>Hola ${usuario.nombre}</h2>
              <p>Gracias por registrarte en Fredy Fasbear Industries.</p>
              <p>Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de email.</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verificar mi Email</a>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <a href="${verificationUrl}" style="color: #D4AF37; word-break: break-all;">${verificationUrl}</a>
              </p>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 13px; color: #999;">
                Este enlace expirará en 24 horas. Si no solicitaste esta verificación, ignora este correo.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Fredy Fasbear Industries. Todos los derechos reservados.</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const response = await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: usuario.email,
        subject: 'Verifica tu email - Fredy Fasbear Industries',
        html: htmlContent
      });

      console.log('[EMAIL] Email de verificación enviado:', response.id);
      return response;
    } catch (error) {
      console.error('[EMAIL] Error enviando email:', error);
      throw new Error('Error al enviar email de verificación');
    }
  }

  async enviarEmailBienvenida(usuario) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { padding: 15px; margin: 10px 0; background: white; border-radius: 5px; border-left: 4px solid #D4AF37; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verificado</h1>
              <p>Fredy Fasbear Industries</p>
            </div>
            <div class="content">
              <h2>Bienvenido ${usuario.nombre}</h2>
              <p>Tu email ha sido verificado exitosamente. Tu cuenta está ahora activa.</p>

              <div class="feature">
                <strong>Solicitar préstamos</strong>
                <p>Empeña tus artículos de valor y obtén efectivo rápido.</p>
              </div>

              <div class="feature">
                <strong>Comprar en tienda</strong>
                <p>Explora nuestro catálogo de productos.</p>
              </div>

              <div class="feature">
                <strong>Gestionar tus préstamos</strong>
                <p>Consulta tus préstamos activos y realiza pagos.</p>
              </div>
              
              <p style="margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Iniciar Sesión</a>
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Fredy Fasbear Industries</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: usuario.email,
        subject: 'Cuenta Verificada - Fredy Fasbear Industries',
        html: htmlContent
      });
    } catch (error) {
      console.error('[EMAIL] Error enviando email de bienvenida:', error);
    }
  }

  async reenviarEmailVerificacion(email) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (usuario.emailVerificado) {
      throw new Error('Este email ya está verificado');
    }

    const nuevoToken = this.generarTokenVerificacion();
    const expiraToken = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tokenVerificacion: nuevoToken,
        expiraTokenVerif: expiraToken
      }
    });

    await this.enviarEmailVerificacion(usuario, nuevoToken);
  }

  async enviarEmailResetPassword(usuario, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Recuperación de Contraseña</h1>
              <p>Fredy Fasbear Industries</p>
            </div>
            <div class="content">
              <h2>Hola ${usuario.nombre}</h2>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
              <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>

              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer mi Contraseña</a>
              </div>

              <div class="warning-box">
                <strong>Información importante:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Este enlace expirará en <strong>1 hora</strong></li>
                  <li>El enlace solo puede ser usado <strong>una vez</strong></li>
                  <li>Si no solicitaste este cambio, ignora este correo</li>
                </ul>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <a href="${resetUrl}" style="color: #D4AF37; word-break: break-all;">${resetUrl}</a>
              </p>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 13px; color: #999;">
                Si no solicitaste el restablecimiento de contraseña, puedes ignorar este correo de forma segura.
                Tu contraseña actual no cambiará.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Fredy Fasbear Industries. Todos los derechos reservados.</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const response = await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: usuario.email,
        subject: 'Recuperación de Contraseña - Fredy Fasbear Industries',
        html: htmlContent
      });

      console.log('[EMAIL] Email de reset password enviado:', response.id);
      return response;
    } catch (error) {
      console.error('[EMAIL] Error enviando email de reset:', error);
      throw new Error('Error al enviar email de recuperación');
    }
  }

  async enviarEmailConfirmacionCambioPassword(usuario) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Contraseña Actualizada</h1>
              <p>Fredy Fasbear Industries</p>
            </div>
            <div class="content">
              <h2>Hola ${usuario.nombre}</h2>
              <p>Tu contraseña ha sido actualizada exitosamente.</p>
              <p><strong>Fecha y hora del cambio:</strong> ${new Date().toLocaleString('es-GT', { timeZone: 'America/Guatemala' })}</p>

              <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <strong>Cambio exitoso</strong>
                <p style="margin: 10px 0 0 0;">Ya puedes iniciar sesión con tu nueva contraseña.</p>
              </div>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 13px; color: #999;">
                <strong>¿No fuiste tú?</strong><br>
                Si no realizaste este cambio, contacta inmediatamente con nuestro soporte para proteger tu cuenta.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Fredy Fasbear Industries. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: usuario.email,
        subject: 'Contraseña Actualizada - Fredy Fasbear Industries',
        html: htmlContent
      });
      console.log('[EMAIL] Email de confirmación de cambio enviado');
    } catch (error) {
      console.error('[EMAIL] Error enviando confirmación:', error);
    }
  }

  async enviarEmailPagoRecibido(usuario, pago, prestamo) {
    try {
      console.log(`[EMAIL] Iniciando envío de notificación de pago recibido...`);
      console.log(`[EMAIL] - Destinatario: ${usuario?.email || 'NO DISPONIBLE'}`);
      console.log(`[EMAIL] - Pago ID: ${pago?.id || 'NO DISPONIBLE'}`);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .monto { font-size: 32px; font-weight: bold; color: #D4AF37; text-align: center; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💰 Pago Recibido</h1>
                <p>Fredy Fasbear Préstamos</p>
              </div>
              <div class="content">
                <h2>¡Hola ${usuario.nombre}!</h2>
                <p>Hemos recibido tu pago exitosamente. Nuestro equipo está verificando la información.</p>

                <div class="monto">
                  Q ${this.formatearMonto(pago.montoPago)}
                </div>

                <div class="info-box">
                  <h3 style="margin-top: 0; color: #1A1A1A;">📋 Detalles del Pago</h3>
                  <p style="margin: 10px 0;"><strong>No. Préstamo:</strong> ${prestamo.numeroPrestamo}</p>
                  <p style="margin: 10px 0;"><strong>Fecha de Pago:</strong> ${this.formatearFecha(pago.fechaPago)}</p>
                  <p style="margin: 10px 0;"><strong>Método de Pago:</strong> ${pago.tipoPago}</p>
                  <p style="margin: 10px 0;"><strong>No. Transacción:</strong> ${pago.numeroTransaccion || 'N/A'}</p>
                  <p style="margin: 10px 0;"><strong>Estado:</strong> <span style="color: #F59E0B;">Pendiente de Validación</span></p>
                </div>

                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
                  <p style="margin: 0; font-size: 14px; color: #333;">
                    <strong>Próximos pasos:</strong><br>
                    Nuestro equipo de cobranza revisará tu pago dentro de las próximas 24-48 horas hábiles.
                    Una vez validado, recibirás un correo con tu recibo oficial en PDF y el saldo actualizado de tu préstamo.
                  </p>
                </div>

                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  Si tienes alguna pregunta sobre este pago, no dudes en contactarnos.
                </p>
              </div>
              <div class="footer">
                <p>Fredy Fasbear Préstamos<br>
                Tu aliado financiero de confianza</p>
                <p style="margin-top: 10px; font-size: 11px; color: #999;">
                  Este es un correo automático, por favor no responder a este mensaje.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: usuario.email,
        subject: `💰 Pago Recibido - Préstamo ${prestamo.numeroPrestamo}`,
        html: htmlContent
      });

      console.log('[EMAIL] Notificación de pago recibido enviada exitosamente');
    } catch (error) {
      console.error('[EMAIL] Error enviando notificación de pago recibido:', error);
      console.error('[EMAIL] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        usuario: usuario?.email,
        pagoId: pago?.id
      });
      throw error;
    }
  }

  async enviarReciboPago(usuario, pago, prestamo, pdfBuffer) {
    try {
      console.log(`[EMAIL] Iniciando envío de recibo oficial de pago...`);
      console.log(`[EMAIL] - Destinatario: ${usuario?.email || 'NO DISPONIBLE'}`);
      console.log(`[EMAIL] - Pago ID: ${pago?.id || 'NO DISPONIBLE'}`);
      console.log(`[EMAIL] - Tiene PDF: ${pdfBuffer ? 'Sí' : 'No'}`);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .monto { font-size: 32px; font-weight: bold; color: #D4AF37; text-align: center; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Recibo Oficial de Pago</h1>
                <p>Fredy Fasbear Préstamos</p>
              </div>
              <div class="content">
                <h2>¡Hola ${usuario.nombre}!</h2>
                <p>Tu pago ha sido <strong>validado exitosamente</strong>. Te compartimos el recibo oficial de tu pago.</p>

                <div class="monto">
                  Q ${this.formatearMonto(pago.montoPago)}
                </div>

                <div class="info-box">
                  <h3 style="margin-top: 0; color: #1A1A1A;">📋 Detalles del Pago</h3>
                  <p style="margin: 10px 0;"><strong>No. Recibo:</strong> ${pago.id}</p>
                  <p style="margin: 10px 0;"><strong>No. Préstamo:</strong> ${prestamo.numeroPrestamo}</p>
                  <p style="margin: 10px 0;"><strong>Fecha de Pago:</strong> ${this.formatearFecha(pago.fechaPago)}</p>
                  <p style="margin: 10px 0;"><strong>Método de Pago:</strong> ${pago.tipoPago}</p>
                  <p style="margin: 10px 0;"><strong>No. Transacción:</strong> ${pago.numeroTransaccion || 'N/A'}</p>
                  <p style="margin: 10px 0;"><strong>Estado:</strong> <span style="color: #10b981;">✅ Validado</span></p>
                </div>

                <div class="info-box">
                  <h3 style="margin-top: 0; color: #1A1A1A;">📊 Estado Actualizado del Préstamo</h3>
                  <p style="margin: 10px 0;"><strong>Saldo Restante:</strong> <span style="font-size: 18px; color: #D4AF37; font-weight: bold;">Q ${this.formatearMonto(prestamo.saldoPendiente)}</span></p>
                  <p style="margin: 10px 0;"><strong>Estado:</strong> ${prestamo.estado}</p>
                  ${prestamo.saldoPendiente <= 0 ? '<p style="margin: 10px 0; color: #10b981; font-weight: bold;">🎉 ¡Felicidades! Has completado el pago de tu préstamo</p>' : ''}
                </div>

                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
                  <p style="margin: 0; font-size: 14px; color: #333;">
                    <strong>✅ Pago Aplicado</strong><br>
                    Tu pago ha sido aplicado exitosamente a tu préstamo. El saldo mostrado arriba está actualizado.
                  </p>
                </div>

                <p style="margin-top: 30px;">
                  Adjunto encontrarás tu <strong>recibo oficial</strong> en formato PDF para tus registros.
                </p>

                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  Si tienes alguna pregunta sobre este pago, no dudes en contactarnos.
                </p>
              </div>
              <div class="footer">
                <p>Fredy Fasbear Préstamos<br>
                Tu aliado financiero de confianza</p>
                <p style="margin-top: 10px; font-size: 11px; color: #999;">
                  Este es un correo automático, por favor no responder a este mensaje.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: usuario.email,
        subject: `💰 Recibo de Pago #${pago.id} - Préstamo ${prestamo.numeroPrestamo}`,
        html: htmlContent,
        attachments: [
          {
            filename: `recibo_pago_${pago.id}.pdf`,
            content: pdfBuffer.toString('base64')
          }
        ]
      });

      console.log('[EMAIL] Recibo de pago enviado exitosamente');
    } catch (error) {
      console.error('[EMAIL] Error enviando recibo de pago:', error);
      console.error('[EMAIL] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        usuario: usuario?.email,
        pagoId: pago?.id
      });
      throw error;
    }
  }

  formatearMonto(monto) {
    return new Intl.NumberFormat('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(monto || 0);
  }

  formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  async enviarEmailPagoValidado(usuario, pago, prestamo, decision) {
    try {
      console.log(`[EMAIL] Enviando notificación de pago ${decision} a: ${usuario.email}`);

      const esAprobado = decision === 'Validado';
      const prestamoUrl = `${process.env.FRONTEND_URL}/empeno/prestamo/${prestamo.id}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header {
                background: linear-gradient(135deg, ${esAprobado ? '#10b981 0%, #059669 100%' : '#ef4444 0%, #dc2626 100%'});
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${esAprobado ? '#10b981' : '#ef4444'}; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .monto { font-size: 32px; font-weight: bold; color: ${esAprobado ? '#10b981' : '#ef4444'}; text-align: center; margin: 20px 0; }
              .button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${esAprobado ? '✅ Pago Aprobado' : '❌ Pago Rechazado'}</h1>
                <p>Fredy Fasbear Préstamos</p>
              </div>
              <div class="content">
                <h2>¡Hola ${usuario.nombre}!</h2>
                <p>${esAprobado
                  ? 'Tu pago ha sido validado y procesado exitosamente. Tu saldo ha sido actualizado.'
                  : 'Lamentamos informarte que tu pago ha sido rechazado.'
                }</p>

                <div class="monto">
                  Q ${this.formatearMonto(pago.montoPago)}
                </div>

                <div class="info-box">
                  <h3 style="margin-top: 0; color: #1A1A1A;">📋 Detalles del Pago</h3>
                  <p style="margin: 10px 0;"><strong>No. Recibo:</strong> ${pago.id}</p>
                  <p style="margin: 10px 0;"><strong>No. Préstamo:</strong> ${prestamo.numeroPrestamo}</p>
                  <p style="margin: 10px 0;"><strong>Fecha de Pago:</strong> ${this.formatearFecha(pago.fechaPago)}</p>
                  <p style="margin: 10px 0;"><strong>Monto:</strong> Q ${this.formatearMonto(pago.montoPago)}</p>
                  <p style="margin: 10px 0;"><strong>Estado:</strong> <span style="color: ${esAprobado ? '#10b981' : '#ef4444'};">${decision}</span></p>
                  ${pago.observaciones ? `<p style="margin: 10px 0;"><strong>Observaciones:</strong> ${pago.observaciones}</p>` : ''}
                </div>

                ${esAprobado ? `
                  <div class="info-box">
                    <h3 style="margin-top: 0; color: #1A1A1A;">📊 Estado Actualizado del Préstamo</h3>
                    <p style="margin: 10px 0;"><strong>Nuevo Saldo:</strong> Q ${this.formatearMonto(prestamo.saldoPendiente)}</p>
                    <p style="margin: 10px 0;"><strong>Estado:</strong> ${prestamo.estado}</p>
                    ${prestamo.saldoPendiente <= 0 ? '<p style="margin: 10px 0; color: #D4AF37; font-weight: bold;">🎉 ¡Felicidades! Has completado el pago de tu préstamo</p>' : ''}
                  </div>

                  <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
                    <p style="margin: 0; font-size: 14px; color: #333;">
                      <strong>✅ Pago confirmado</strong><br>
                      Tu pago ha sido aplicado a tu préstamo. Puedes ver los detalles actualizados en tu panel de préstamos.
                    </p>
                  </div>
                ` : `
                  <div style="background: #FEE2E2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #991B1B;">
                      <strong>Motivo del rechazo:</strong><br>
                      ${pago.observaciones || 'El comprobante de pago no pudo ser validado. Por favor verifica los datos de tu transferencia y vuelve a intentarlo.'}
                    </p>
                  </div>

                  <p style="margin-top: 20px;">
                    Te invitamos a realizar nuevamente tu pago. Si tienes dudas, contacta con nuestro equipo de soporte.
                  </p>
                `}

                <div style="text-align: center;">
                  <a href="${prestamoUrl}" class="button">Ver Detalles del Préstamo</a>
                </div>

                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  Si tienes alguna pregunta, no dudes en contactarnos.
                </p>
              </div>
              <div class="footer">
                <p>Fredy Fasbear Préstamos<br>
                Tu aliado financiero de confianza</p>
                <p style="margin-top: 10px; font-size: 11px; color: #999;">
                  Este es un correo automático, por favor no responder a este mensaje.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: usuario.email,
        subject: `${esAprobado ? '✅' : '❌'} Pago ${decision} - Préstamo ${prestamo.numeroPrestamo}`,
        html: htmlContent
      });

      console.log(`[EMAIL] Notificación de pago ${decision} enviada exitosamente`);
    } catch (error) {
      console.error('[EMAIL] Error enviando notificación de pago:', error);
      throw error;
    }
  }

  async enviarEmailCambioEstadoSolicitud(usuario, solicitud, estado) {
    try {
      console.log(`[EMAIL] Iniciando envío de notificación de cambio de estado...`);
      console.log(`[EMAIL] - Destinatario: ${usuario?.email || 'NO DISPONIBLE'}`);
      console.log(`[EMAIL] - Solicitud ID: ${solicitud?.id || 'NO DISPONIBLE'}`);
      console.log(`[EMAIL] - Nuevo estado: ${estado || 'NO DISPONIBLE'}`);

      const esAprobada = estado === 'Aprobada';
      const solicitudUrl = `${process.env.FRONTEND_URL}/empeno/solicitudes/${solicitud.id}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header {
                background: linear-gradient(135deg, ${esAprobada ? '#2C3E50 0%, #4A4A4A 100%' : '#ef4444 0%, #dc2626 100%'});
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${esAprobada ? '#D4AF37' : '#ef4444'}; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .monto { font-size: 32px; font-weight: bold; color: #D4AF37; text-align: center; margin: 20px 0; }
              .button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${esAprobada ? '✅ Solicitud Aprobada' : '❌ Solicitud Rechazada'}</h1>
                <p>Fredy Fasbear Préstamos</p>
              </div>
              <div class="content">
                <h2>¡Hola ${usuario.nombre}!</h2>
                <p>${esAprobada
                  ? 'Tu solicitud de préstamo ha sido <strong>aprobada</strong> exitosamente. ¡Felicidades!'
                  : 'Lamentamos informarte que tu solicitud de préstamo ha sido <strong>rechazada</strong>.'
                }</p>

                ${esAprobada ? `
                  <div class="monto">
                    Q ${this.formatearMonto(solicitud.montoSolicitado)}
                  </div>
                ` : ''}

                <div class="info-box">
                  <h3 style="margin-top: 0; color: #1A1A1A;">📋 Detalles de la Solicitud</h3>
                  <p style="margin: 10px 0;"><strong>No. Solicitud:</strong> ${solicitud.id}</p>
                  <p style="margin: 10px 0;"><strong>Artículo:</strong> ${solicitud.nombreArticulo}</p>
                  <p style="margin: 10px 0;"><strong>Descripción:</strong> ${solicitud.descripcion}</p>
                  <p style="margin: 10px 0;"><strong>Estado:</strong> <span style="color: ${esAprobada ? '#D4AF37' : '#ef4444'};">${estado}</span></p>
                  <p style="margin: 10px 0;"><strong>Fecha de Evaluación:</strong> ${this.formatearFecha(solicitud.fechaEvaluacion)}</p>
                  ${solicitud.observaciones ? `<p style="margin: 10px 0;"><strong>Observaciones:</strong> ${solicitud.observaciones}</p>` : ''}
                </div>

                ${esAprobada ? `
                  <div class="info-box">
                    <h3 style="margin-top: 0; color: #1A1A1A;">💰 Detalles del Préstamo Aprobado</h3>
                    <p style="margin: 10px 0;"><strong>Monto Aprobado:</strong> Q ${this.formatearMonto(solicitud.montoSolicitado)}</p>
                    <p style="margin: 10px 0;"><strong>Tasa de Interés:</strong> ${solicitud.tasaInteres}% mensual</p>
                    <p style="margin: 10px 0;"><strong>Plazo:</strong> ${solicitud.plazoMeses} meses</p>
                    <p style="margin: 10px 0;"><strong>Modalidad de Pago:</strong> ${solicitud.modalidadPago}</p>
                    <p style="margin: 10px 0;"><strong>Total a Pagar:</strong> Q ${this.formatearMonto(solicitud.totalAPagar)}</p>
                  </div>

                  <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
                    <p style="margin: 0; font-size: 14px; color: #333;">
                      <strong>🎉 ¡Próximos pasos!</strong><br>
                      Tu préstamo ha sido aprobado. Pronto recibirás el contrato para que lo revises y firmes digitalmente.
                      Una vez firmado el contrato, podrás recoger tu dinero en nuestras oficinas.
                    </p>
                  </div>

                  <div style="text-align: center;">
                    <a href="${solicitudUrl}" class="button">Ver Mi Solicitud</a>
                  </div>
                ` : `
                  <div style="background: #FEE2E2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #991B1B;">
                      <strong>Motivo del rechazo:</strong><br>
                      ${solicitud.observaciones || 'Tu solicitud no cumple con los requisitos necesarios en este momento.'}
                    </p>
                  </div>

                  <p style="margin-top: 20px;">
                    No te desanimes, puedes realizar una nueva solicitud en el futuro.
                    Si tienes dudas sobre el motivo del rechazo, no dudes en contactarnos.
                  </p>

                  <div style="text-align: center;">
                    <a href="${solicitudUrl}" class="button">Crear Nueva Solicitud</a>
                  </div>
                `}

                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  Si tienes alguna pregunta, no dudes en contactarnos.
                </p>
              </div>
              <div class="footer">
                <p>Fredy Fasbear Préstamos<br>
                Tu aliado financiero de confianza</p>
                <p style="margin-top: 10px; font-size: 11px; color: #999;">
                  Este es un correo automático, por favor no responder a este mensaje.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: usuario.email,
        subject: `${esAprobada ? '✅' : '❌'} Solicitud ${estado} - Fredy Fasbear Préstamos`,
        html: htmlContent
      });

      console.log(`[EMAIL] Notificación de solicitud ${estado} enviada exitosamente`);
    } catch (error) {
      console.error('[EMAIL] Error enviando notificación de cambio de estado:', error);
      console.error('[EMAIL] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        usuario: usuario?.email,
        solicitudId: solicitud?.id,
        estado: estado
      });
      throw error;
    }
  }

  async enviarEmailConfirmacionPedido(usuario, pedido, productos) {
    try {
      console.log(`[EMAIL] Iniciando envío de confirmación de pedido...`);
      console.log(`[EMAIL] - Destinatario: ${usuario?.email || 'NO DISPONIBLE'}`);
      console.log(`[EMAIL] - Pedido ID: ${pedido?.id || 'NO DISPONIBLE'}`);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .monto { font-size: 32px; font-weight: bold; color: #D4AF37; text-align: center; margin: 20px 0; }
              .button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .producto { padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
              .producto:last-child { border-bottom: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🛍️ Pedido Confirmado</h1>
                <p>Fredy Fasbear Tienda</p>
              </div>
              <div class="content">
                <h2>¡Hola ${usuario.nombre}!</h2>
                <p>Gracias por tu compra. Hemos recibido tu pedido exitosamente.</p>

                <div class="monto">
                  Q ${this.formatearMonto(pedido.total)}
                </div>

                <div class="info-box">
                  <h3 style="margin-top: 0; color: #1A1A1A;">📋 Detalles del Pedido</h3>
                  <p style="margin: 10px 0;"><strong>No. Pedido:</strong> ${pedido.id}</p>
                  <p style="margin: 10px 0;"><strong>Fecha:</strong> ${this.formatearFecha(pedido.fechaPedido)}</p>
                  <p style="margin: 10px 0;"><strong>Estado:</strong> <span style="color: #F59E0B;">${pedido.estadoPedido}</span></p>
                  <p style="margin: 10px 0;"><strong>Método de Envío:</strong> ${pedido.metodoEnvio}</p>
                </div>

                <div class="info-box">
                  <h3 style="margin-top: 0; color: #1A1A1A;">📦 Productos</h3>
                  ${productos.map(p => `
                    <div class="producto">
                      <p style="margin: 5px 0;"><strong>${p.nombre}</strong></p>
                      <p style="margin: 5px 0; color: #666;">Cantidad: ${p.cantidad} × Q ${this.formatearMonto(p.precio)}</p>
                    </div>
                  `).join('')}
                </div>

                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
                  <p style="margin: 0; font-size: 14px; color: #333;">
                    <strong>Próximos pasos:</strong><br>
                    Tu pedido está siendo procesado. Una vez validado tu pago, procederemos con el envío.
                    Te mantendremos informado sobre el estado de tu pedido.
                  </p>
                </div>

                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
                </p>
              </div>
              <div class="footer">
                <p>Fredy Fasbear Tienda<br>
                Tu aliado en productos de calidad</p>
                <p style="margin-top: 10px; font-size: 11px; color: #999;">
                  Este es un correo automático, por favor no responder a este mensaje.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: usuario.email,
        subject: `🛍️ Pedido Confirmado #${pedido.id} - Fredy Fasbear Tienda`,
        html: htmlContent
      });

      console.log('[EMAIL] Confirmación de pedido enviada exitosamente');
    } catch (error) {
      console.error('[EMAIL] Error enviando confirmación de pedido:', error);
      console.error('[EMAIL] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        usuario: usuario?.email,
        pedidoId: pedido?.id
      });
      throw error;
    }
  }

  async enviarEmailCambioEstadoPedido(usuario, pedido, nuevoEstado) {
    try {
      console.log(`[EMAIL] Iniciando envío de cambio de estado de pedido...`);
      console.log(`[EMAIL] - Destinatario: ${usuario?.email || 'NO DISPONIBLE'}`);
      console.log(`[EMAIL] - Pedido ID: ${pedido?.id || 'NO DISPONIBLE'}`);
      console.log(`[EMAIL] - Nuevo estado: ${nuevoEstado || 'NO DISPONIBLE'}`);

      const estadoInfo = {
        'Procesando': { emoji: '⏳', titulo: 'Pedido en Proceso', mensaje: 'Tu pedido está siendo preparado para el envío.' },
        'Enviado': { emoji: '🚚', titulo: 'Pedido Enviado', mensaje: 'Tu pedido ya está en camino.' },
        'Entregado': { emoji: '✅', titulo: 'Pedido Entregado', mensaje: '¡Tu pedido ha sido entregado exitosamente!' },
        'Cancelado': { emoji: '❌', titulo: 'Pedido Cancelado', mensaje: 'Tu pedido ha sido cancelado.' }
      };

      const info = estadoInfo[nuevoEstado] || { emoji: '📦', titulo: 'Actualización de Pedido', mensaje: `Estado actualizado a: ${nuevoEstado}` };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${info.emoji} ${info.titulo}</h1>
                <p>Fredy Fasbear Tienda</p>
              </div>
              <div class="content">
                <h2>¡Hola ${usuario.nombre}!</h2>
                <p>${info.mensaje}</p>

                <div class="info-box">
                  <h3 style="margin-top: 0; color: #1A1A1A;">📋 Detalles del Pedido</h3>
                  <p style="margin: 10px 0;"><strong>No. Pedido:</strong> ${pedido.id}</p>
                  <p style="margin: 10px 0;"><strong>Fecha:</strong> ${this.formatearFecha(pedido.fechaPedido)}</p>
                  <p style="margin: 10px 0;"><strong>Estado:</strong> <span style="color: #D4AF37;">${nuevoEstado}</span></p>
                  <p style="margin: 10px 0;"><strong>Total:</strong> Q ${this.formatearMonto(pedido.total)}</p>
                </div>

                ${nuevoEstado === 'Enviado' ? `
                  <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
                    <p style="margin: 0; font-size: 14px; color: #333;">
                      <strong>🚚 Tu pedido está en camino</strong><br>
                      Recibirás tu pedido pronto según el método de envío seleccionado.
                    </p>
                  </div>
                ` : ''}

                ${nuevoEstado === 'Entregado' ? `
                  <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
                    <p style="margin: 0; font-size: 14px; color: #333;">
                      <strong>✅ ¡Gracias por tu compra!</strong><br>
                      Esperamos que disfrutes tus productos. Si tienes algún problema, contáctanos.
                    </p>
                  </div>
                ` : ''}

                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
                </p>
              </div>
              <div class="footer">
                <p>Fredy Fasbear Tienda<br>
                Tu aliado en productos de calidad</p>
                <p style="margin-top: 10px; font-size: 11px; color: #999;">
                  Este es un correo automático, por favor no responder a este mensaje.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: usuario.email,
        subject: `${info.emoji} ${info.titulo} #${pedido.id} - Fredy Fasbear Tienda`,
        html: htmlContent
      });

      console.log(`[EMAIL] Notificación de cambio de estado de pedido enviada exitosamente`);
    } catch (error) {
      console.error('[EMAIL] Error enviando notificación de cambio de estado de pedido:', error);
      console.error('[EMAIL] Detalles del error:', {
        message: error.message,
        stack: error.stack,
        usuario: usuario?.email,
        pedidoId: pedido?.id,
        nuevoEstado
      });
      throw error;
    }
  }
}

export default new EmailService();