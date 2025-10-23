// Archivo: BACKEND/src/routes/personal.routes.js
// Rutas para gestión de personal interno

import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const empleadoId = parseInt(id);

    console.log('[PERSONAL] Cambiando estado del empleado:', empleadoId);

    if (isNaN(empleadoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de empleado inválido'
      });
    }

    const empleado = await prisma.usuario.findFirst({
      where: {
        id: empleadoId,
        tipoUsuario: {
          in: ['Administrador', 'Evaluador', 'Cobrador']
        }
      }
    });

    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    if (empleado.tipoUsuario === 'Administrador' && 
        empleado.id === req.user.id && 
        empleado.estado === 'Activo') {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta de administrador'
      });
    }

    const nuevoEstado = empleado.estado === 'Activo' ? 'Inactivo' : 'Activo';

    const empleadoActualizado = await prisma.usuario.update({
      where: { id: empleadoId },
      data: { estado: nuevoEstado },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        tipoUsuario: true,
        estado: true
      }
    });

    console.log('[PERSONAL] Estado cambiado a:', nuevoEstado);

    res.status(200).json({
      success: true,
      message: `Empleado ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} exitosamente`,
      data: { empleado: empleadoActualizado }
    });

  } catch (error) {
    console.error('[PERSONAL] Error cambiando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del empleado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
// Middleware para logging específico de personal
router.use((req, res, next) => {
  console.log(`👥 Personal API: ${req.method} ${req.path}`);
  next();
});

// Middleware para proteger todas las rutas
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/personal/stats
 * Obtiene estadísticas del personal interno
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('[PERSONAL] Obteniendo estadísticas del personal...');

    const [
      totalStaff,
      administradores,
      evaluadores,
      cobradores,
      activeStaff,
      inactiveStaff,
      newThisMonth
    ] = await Promise.all([
      // Total de personal interno (excluyendo clientes)
      prisma.usuario.count({
        where: {
          tipoUsuario: {
            in: ['Administrador', 'Evaluador', 'Cobrador']
          }
        }
      }),
      
      // Administradores
      prisma.usuario.count({
        where: { tipoUsuario: 'Administrador' }
      }),
      
      // Evaluadores
      prisma.usuario.count({
        where: { tipoUsuario: 'Evaluador' }
      }),
      
      // Cobradores
      prisma.usuario.count({
        where: { tipoUsuario: 'Cobrador' }
      }),
      
      // Personal activo
      prisma.usuario.count({
        where: {
          tipoUsuario: {
            in: ['Administrador', 'Evaluador', 'Cobrador']
          },
          estado: 'Activo'
        }
      }),
      
      // Personal inactivo
      prisma.usuario.count({
        where: {
          tipoUsuario: {
            in: ['Administrador', 'Evaluador', 'Cobrador']
          },
          estado: 'Inactivo'
        }
      }),
      
      // Nuevo personal este mes
      prisma.usuario.count({
        where: {
          tipoUsuario: {
            in: ['Administrador', 'Evaluador', 'Cobrador']
          },
          fechaRegistro: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    const stats = {
      totalStaff,
      administradores,
      evaluadores,
      cobradores,
      activeStaff,
      inactiveStaff,
      newThisMonth,
      staffByType: {
        Administrador: administradores,
        Evaluador: evaluadores,
        Cobrador: cobradores
      },
      staffByStatus: {
        Activo: activeStaff,
        Inactivo: inactiveStaff
      }
    };

    console.log('[PERSONAL] Estadísticas obtenidas:', stats);

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo estadísticas de personal:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de personal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/personal
 * Obtiene lista completa del personal interno con filtros
 */
router.get('/', async (req, res) => {
  try {
    const { 
      tipo, 
      estado, 
      busqueda, 
      page = 1, 
      limit = 50,
      sortBy = 'fechaRegistro',
      sortOrder = 'desc'
    } = req.query;

    console.log('[PERSONAL] Obteniendo lista de personal con filtros:', { tipo, estado, busqueda, page, limit, sortBy, sortOrder });

    // Construir filtros
    const where = {
      tipoUsuario: {
        in: ['Administrador', 'Evaluador', 'Cobrador']
      }
    };

    if (tipo) {
      where.tipoUsuario = tipo;
    }

    if (estado) {
      where.estado = estado;
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { apellido: { contains: busqueda, mode: 'insensitive' } },
        { email: { contains: busqueda, mode: 'insensitive' } },
        { cedula: { contains: busqueda } }
      ];
    }

    // Calcular paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener personal y total
    const [personal, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          direccion: true,
          tipoUsuario: true,
          estado: true,
          cedula: true,
          fechaRegistro: true,
          fechaNacimiento: true
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: parseInt(limit)
      }),
      
      prisma.usuario.count({ where })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    console.log(`[PERSONAL] Se encontraron ${total} empleados, mostrando página ${page}`);

    res.status(200).json({
      success: true,
      data: {
        personal,
        pagination
      }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo personal:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo lista de personal'
    });
  }
});

/**
 * GET /api/personal/:id
 * Obtiene detalle completo de un empleado
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`[PERSONAL] Obteniendo detalle del empleado ID: ${id}`);

    const empleado = await prisma.usuario.findFirst({
      where: {
        id: parseInt(id),
        tipoUsuario: {
          in: ['Administrador', 'Evaluador', 'Cobrador']
        }
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        tipoUsuario: true,
        estado: true,
        cedula: true,
        fechaRegistro: true,
        fechaNacimiento: true
      }
    });

    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    console.log(`[PERSONAL] Detalle obtenido para: ${empleado.nombre} ${empleado.apellido}`);

    res.status(200).json({
      success: true,
      data: { empleado }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo detalle de empleado:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo detalle del empleado'
    });
  }
});

/**
 * POST /api/personal
 * Crea un nuevo empleado
 */
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      tipoUsuario,
      cedula,
      password,
      estado = 'Activo',
      fechaNacimiento
    } = req.body;

    console.log('[PERSONAL] Creando nuevo empleado:', { nombre, apellido, email, tipoUsuario });

    // Validaciones básicas
    if (!nombre || !apellido || !email || !telefono || !direccion || !tipoUsuario || !cedula || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser proporcionados'
      });
    }

    // Validar tipo de usuario
    if (!['Administrador', 'Evaluador', 'Cobrador'].includes(tipoUsuario)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de usuario no válido para personal interno'
      });
    }

    // Verificar que email y DPI no existan
    const existeUsuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: email },
          { cedula: cedula }
        ]
      }
    });

    if (existeUsuario) {
      return res.status(400).json({
        success: false,
        message: existeUsuario.email === email 
          ? 'Ya existe un usuario con este email'
          : 'Ya existe un usuario con esta DPI'
      });
    }

    // Hashear contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear empleado
    const nuevoEmpleado = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        tipoUsuario,
        cedula,
        passwordHash,
        estado,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        tipoUsuario: true,
        estado: true,
        cedula: true,
        fechaRegistro: true,
        fechaNacimiento: true
      }
    });

    console.log(`[PERSONAL] Empleado creado exitosamente: ${nuevoEmpleado.nombre} ${nuevoEmpleado.apellido}`);

    res.status(201).json({
      success: true,
      message: 'Empleado creado exitosamente',
      data: { empleado: nuevoEmpleado }
    });

  } catch (error) {
    console.error('[ERROR] Error creando empleado:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email o DPI'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creando empleado'
    });
  }
});

/**
 * PUT /api/personal/:id
 * Actualiza información de un empleado
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      tipoUsuario,
      cedula,
      estado,
      fechaNacimiento
    } = req.body;

    console.log(`[PERSONAL] Actualizando empleado ID: ${id}`);

    // Verificar que el empleado existe y es personal interno
    const empleadoExistente = await prisma.usuario.findFirst({
      where: {
        id: parseInt(id),
        tipoUsuario: {
          in: ['Administrador', 'Evaluador', 'Cobrador']
        }
      }
    });

    if (!empleadoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    // Validar tipo de usuario si se está cambiando
    if (tipoUsuario && !['Administrador', 'Evaluador', 'Cobrador'].includes(tipoUsuario)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de usuario no válido para personal interno'
      });
    }

    // Verificar unicidad de email y DPI (excluyendo el registro actual)
    if (email || cedula) {
      const conflictUsuario = await prisma.usuario.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(id) } },
            {
              OR: [
                email ? { email: email } : {},
                cedula ? { cedula: cedula } : {}
              ].filter(obj => Object.keys(obj).length > 0)
            }
          ]
        }
      });

      if (conflictUsuario) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro usuario con este email o DPI'
        });
      }
    }

    // Actualizar empleado
    const empleadoActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: {
        ...(nombre && { nombre }),
        ...(apellido && { apellido }),
        ...(email && { email }),
        ...(telefono && { telefono }),
        ...(direccion && { direccion }),
        ...(tipoUsuario && { tipoUsuario }),
        ...(cedula && { cedula }),
        ...(estado && { estado }),
        ...(fechaNacimiento && { fechaNacimiento: new Date(fechaNacimiento) })
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        tipoUsuario: true,
        estado: true,
        cedula: true,
        fechaRegistro: true,
        fechaNacimiento: true
      }
    });

    console.log(`[PERSONAL] Empleado actualizado: ${empleadoActualizado.nombre} ${empleadoActualizado.apellido}`);

    res.status(200).json({
      success: true,
      message: 'Empleado actualizado exitosamente',
      data: { empleado: empleadoActualizado }
    });

  } catch (error) {
    console.error('[ERROR] Error actualizando empleado:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email o DPI'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error actualizando empleado'
    });
  }
});

/**
 * PUT /api/personal/:id/estado
 * Cambia el estado de un empleado (Activo/Inactivo)
 */
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    console.log(`[PERSONAL] Cambiando estado del empleado ID: ${id} a: ${estado}`);

    if (!['Activo', 'Inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido. Debe ser Activo o Inactivo'
      });
    }

    // Verificar que el empleado existe y es personal interno
    const empleado = await prisma.usuario.findFirst({
      where: {
        id: parseInt(id),
        tipoUsuario: {
          in: ['Administrador', 'Evaluador', 'Cobrador']
        }
      }
    });

    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    // Prevenir auto-desactivación de administradores
    if (empleado.tipoUsuario === 'Administrador' && 
        empleado.id === req.user.id && 
        estado === 'Inactivo') {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta de administrador'
      });
    }

    // Actualizar estado
    const empleadoActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { estado },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        tipoUsuario: true,
        estado: true
      }
    });

    console.log(`[PERSONAL] Estado cambiado para: ${empleadoActualizado.nombre} ${empleadoActualizado.apellido} -> ${estado}`);

    res.status(200).json({
      success: true,
      message: `Estado cambiado a ${estado} exitosamente`,
      data: { empleado: empleadoActualizado }
    });

  } catch (error) {
    console.error('[ERROR] Error cambiando estado del empleado:', error);
    res.status(500).json({
      success: false,
      message: 'Error cambiando estado del empleado'
    });
  }
});

/**
 * PUT /api/personal/:id/password
 * Cambia la contraseña de un empleado
 */
router.put('/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, confirmPassword } = req.body;

    console.log(`[PERSONAL] Cambiando contraseña del empleado ID: ${id}`);

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Nueva contraseña y confirmación son requeridas'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar que el empleado existe y es personal interno
    const empleado = await prisma.usuario.findFirst({
      where: {
        id: parseInt(id),
        tipoUsuario: {
          in: ['Administrador', 'Evaluador', 'Cobrador']
        }
      }
    });

    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    // Hashear nueva contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { passwordHash }
    });

    console.log(`[PERSONAL] Contraseña actualizada para: ${empleado.nombre} ${empleado.apellido}`);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('[ERROR] Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error cambiando contraseña'
    });
  }
});

/**
 * GET /api/personal/recent-activity/:id
 * Obtiene actividad reciente de un empleado
 */
router.get('/recent-activity/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    console.log(`[PERSONAL] Obteniendo actividad reciente del empleado ID: ${id}`);

    // Verificar que el empleado existe
    const empleado = await prisma.usuario.findFirst({
      where: {
        id: parseInt(id),
        tipoUsuario: {
          in: ['Administrador', 'Evaluador', 'Cobrador']
        }
      }
    });

    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }

    // Obtener sesiones recientes
    const sesionesRecientes = await prisma.sesionUsuario.findMany({
      where: { idUsuario: parseInt(id) },
      orderBy: { fechaInicio: 'desc' },
      take: parseInt(limit),
      select: {
        id: true,
        ipInicio: true,
        userAgent: true,
        fechaInicio: true,
        fechaFin: true,
        tipoSesion: true
      }
    });

    res.status(200).json({
      success: true,
      data: {
        empleado: {
          id: empleado.id,
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          tipoUsuario: empleado.tipoUsuario
        },
        sesionesRecientes
      }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo actividad reciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo actividad reciente'
    });
  }
});

// ===== MIDDLEWARE DE ERROR ESPECÍFICO =====
router.use((error, req, res, next) => {
  console.error(' Error en rutas de personal:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en gestión de personal',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;