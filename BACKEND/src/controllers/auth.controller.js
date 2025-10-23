import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import emailService from '../services/email.service.js';

const prisma = new PrismaClient();

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      tipoUsuario: user.tipoUsuario
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const formatUserResponse = (user) => {
  const { passwordHash, tokenVerificacion, ...userWithoutSensitive } = user;
  return userWithoutSensitive;
};

const authController = {
  
  register: async (req, res) => {
    try {
      const {
        nombre,
        apellido,
        email,
        telefono,
        cedula,
        direccion,
        password,
        tipoUsuario = 'Cliente',
        fechaNacimiento
      } = req.body;

      console.log('[AUTH] Iniciando registro de usuario:', email);

      if (!nombre || !apellido || !email || !password || !cedula) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos obligatorios deben ser completados'
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      const existingUser = await prisma.usuario.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { cedula }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email.toLowerCase() 
            ? 'Ya existe una cuenta con este email' 
            : 'Ya existe una cuenta con este DPI'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const verificationToken = emailService.generarTokenVerificacion();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const newUser = await prisma.usuario.create({
        data: {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.toLowerCase().trim(),
          telefono,
          cedula,
          direccion,
          passwordHash: hashedPassword,
          tipoUsuario,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
          emailVerificado: false,
          tokenVerificacion: verificationToken,
          expiraTokenVerif: tokenExpiry,
          estado: 'Activo'
        }
      });

      try {
        await emailService.enviarEmailVerificacion(newUser, verificationToken);
        console.log('[AUTH] Email de verificación enviado a:', newUser.email);
      } catch (emailError) {
        console.error('[AUTH] Error enviando email de verificación:', emailError);
      }

      const token = generateToken(newUser);

      console.log('[AUTH] Usuario registrado exitosamente:', newUser.email);

      res.status(201).json({
        success: true,
        message: 'Cuenta creada exitosamente. Revisa tu email para verificar tu cuenta.',
        data: {
          user: formatUserResponse(newUser),
          token,
          requiresVerification: true
        }
      });

    } catch (error) {
      console.error('[ERROR] Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password, remember = false } = req.body;

      console.log('[AUTH] Intento de login:', email);

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son obligatorios'
        });
      }

      const user = await prisma.usuario.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      if (user.estado !== 'Activo') {
        return res.status(401).json({
          success: false,
          message: 'Cuenta inactiva. Contacta al administrador'
        });
      }

      if (!user.passwordHash) {
        return res.status(401).json({
          success: false,
          message: 'Usuario inválido. Contacta al administrador.'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      if (!user.emailVerificado && user.tipoUsuario === 'Cliente') {
        return res.status(403).json({
          success: false,
          message: 'Debes verificar tu email antes de iniciar sesión',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email
        });
      }

      await prisma.sesionUsuario.create({
        data: {
          usuarioId: user.id,
          ipInicio: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          tipoSesion: 'web'
        }
      });

      const tokenExpiry = remember ? '30d' : '24h';
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          tipoUsuario: user.tipoUsuario
        },
        process.env.JWT_SECRET,
        { expiresIn: tokenExpiry }
      );

      console.log('[AUTH] Login exitoso:', user.email);

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: formatUserResponse(user),
          token
        }
      });

    } catch (error) {
      console.error('[ERROR] Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  verificarEmail: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token de verificación requerido'
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: { tokenVerificacion: token }
      });

      if (!usuario) {
        return res.status(400).json({
          success: false,
          message: 'Token de verificación inválido'
        });
      }

      if (usuario.emailVerificado) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está verificado'
        });
      }

      if (new Date() > usuario.expiraTokenVerif) {
        return res.status(400).json({
          success: false,
          message: 'El token de verificación ha expirado',
          code: 'TOKEN_EXPIRED',
          email: usuario.email
        });
      }

      const usuarioActualizado = await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          emailVerificado: true,
          tokenVerificacion: null,
          expiraTokenVerif: null
        }
      });

      try {
        await emailService.enviarEmailBienvenida(usuarioActualizado);
      } catch (emailError) {
        console.error('[AUTH] Error enviando email de bienvenida:', emailError);
      }

      console.log('[AUTH] Email verificado exitosamente:', usuarioActualizado.email);

      res.status(200).json({
        success: true,
        message: 'Email verificado exitosamente',
        data: {
          user: formatUserResponse(usuarioActualizado)
        }
      });

    } catch (error) {
      console.error('[ERROR] Error verificando email:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  reenviarVerificacion: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email requerido'
        });
      }

      await emailService.reenviarEmailVerificacion(email);

      res.status(200).json({
        success: true,
        message: 'Email de verificación reenviado'
      });

    } catch (error) {
      console.error('[ERROR] Error reenviando verificación:', error);
      
      if (error.message === 'Usuario no encontrado' || error.message === 'Este email ya está verificado') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  logout: async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  },

  getProfile: async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        data: { user: formatUserResponse(req.user) }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo perfil'
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { nombre, apellido, telefono, direccion } = req.body;

      const updatedUser = await prisma.usuario.update({
        where: { id: req.user.id },
        data: { nombre, apellido, telefono, direccion }
      });

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado',
        data: { user: formatUserResponse(updatedUser) }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error actualizando perfil'
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere contraseña actual y nueva'
        });
      }

      const user = await prisma.usuario.findUnique({
        where: { id: req.user.id }
      });

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.usuario.update({
        where: { id: req.user.id },
        data: { passwordHash: hashedPassword }
      });

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error cambiando contraseña'
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      console.log('[AUTH] Solicitud de reset password para:', email);

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email requerido'
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      // Por seguridad, siempre devolvemos éxito aunque el usuario no exista
      // Esto previene enumerar usuarios del sistema
      if (!usuario) {
        console.log('[AUTH] Usuario no encontrado, pero devolviendo éxito por seguridad');
        return res.status(200).json({
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones'
        });
      }

      const resetToken = emailService.generarTokenVerificacion();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires,
          resetPasswordUsed: false
        }
      });

      await emailService.enviarEmailResetPassword(usuario, resetToken);

      console.log('[AUTH] Email de reset enviado exitosamente a:', email);

      res.status(200).json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones'
      });

    } catch (error) {
      console.error('[AUTH] Error en forgot password:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando la solicitud'
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      console.log('[AUTH] Solicitud de reset password con token');

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token y nueva contraseña requeridos'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: { resetPasswordToken: token }
      });

      if (!usuario) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
      }

      if (usuario.resetPasswordExpires < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'El enlace de recuperación ha expirado. Solicita uno nuevo.'
        });
      }

      if (usuario.resetPasswordUsed) {
        return res.status(400).json({
          success: false,
          message: 'Este enlace ya ha sido utilizado. Solicita uno nuevo si aún necesitas cambiar tu contraseña.'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          passwordHash: hashedPassword,
          resetPasswordUsed: true,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      });

      await emailService.enviarEmailConfirmacionCambioPassword(usuario);

      console.log('[AUTH] Contraseña reseteada exitosamente para:', usuario.email);

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
      });

    } catch (error) {
      console.error('[AUTH] Error en reset password:', error);
      res.status(500).json({
        success: false,
        message: 'Error al resetear la contraseña'
      });
    }
  }
};

export default authController;