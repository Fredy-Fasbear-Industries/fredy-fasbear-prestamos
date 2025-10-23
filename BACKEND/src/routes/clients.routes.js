import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { verificarToken, verificarRol } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use((req, res, next) => {
  console.log(`Clients API: ${req.method} ${req.path}`);
  console.log(`Usuario: ${req.user?.nombre || 'No identificado'} (${req.user?.tipoUsuario || 'Sin rol'})`);
  next();
});

router.use(verificarToken);

router.get('/stats', async (req, res) => {
  try {
    console.log('[CLIENTS] Obteniendo estadísticas de clientes...');
    
    const [
      totalClientes,
      clientesActivos,
      clientesInactivos,
      nuevosEsteMes
    ] = await Promise.all([
      prisma.usuario.count({
        where: { tipoUsuario: 'Cliente' }
      }),
      
      prisma.usuario.count({
        where: {
          tipoUsuario: 'Cliente',
          estado: 'Activo'
        }
      }),
      
      prisma.usuario.count({
        where: {
          tipoUsuario: 'Cliente',
          estado: 'Inactivo'
        }
      }),
      
      prisma.usuario.count({
        where: {
          tipoUsuario: 'Cliente',
          fechaRegistro: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    const stats = {
      totalClientes,
      clientesActivos,
      clientesInactivos,
      nuevosEsteMes,
      clientsByStatus: {
        Activo: clientesActivos,
        Inactivo: clientesInactivos
      }
    };

    console.log('[CLIENTS] Estadísticas obtenidas:', stats);

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('[CLIENTS] Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de clientes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { 
      estado, 
      busqueda, 
      page = 1, 
      limit = 50,
      sortBy = 'fechaRegistro',
      sortOrder = 'desc'
    } = req.query;

    console.log('[CLIENTS] Obteniendo lista de clientes con filtros:', { estado, busqueda, page, limit, sortBy, sortOrder });

    const where = {
      tipoUsuario: 'Cliente'
    };

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

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [clientes, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          direccion: true,
          cedula: true,
          estado: true,
          fechaRegistro: true,
          tipoUsuario: true
        },
        orderBy: { [sortBy]: sortOrder },
        skip: skip,
        take: parseInt(limit)
      }),
      prisma.usuario.count({ where })
    ]);

    console.log('[CLIENTS] Clientes obtenidos:', clientes.length);

    res.status(200).json({
      success: true,
      data: {
        clientes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('[CLIENTS] Error obteniendo clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = parseInt(id);

    console.log('[CLIENTS] Obteniendo cliente:', clienteId);

    if (isNaN(clienteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const cliente = await prisma.usuario.findUnique({
      where: { id: clienteId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        cedula: true,
        estado: true,
        fechaRegistro: true,
        tipoUsuario: true
      }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    if (cliente.tipoUsuario !== 'Cliente') {
      return res.status(400).json({
        success: false,
        message: 'El usuario especificado no es un cliente'
      });
    }

    const esPropio = req.user.id === clienteId;
    const esAdmin = req.user.tipoUsuario === 'Administrador';

    if (!esPropio && !esAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este cliente'
      });
    }

    console.log('[CLIENTS] Cliente obtenido:', cliente.nombre, cliente.apellido);

    res.status(200).json({
      success: true,
      data: { cliente }
    });

  } catch (error) {
    console.error('[CLIENTS] Error obteniendo cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, direccion, cedula } = req.body;

    console.log('[CLIENTS] Creando nuevo cliente:', email);

    if (!nombre || !apellido || !email || !cedula) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: nombre, apellido, email, cedula'
      });
    }

    const existeEmail = await prisma.usuario.findUnique({
      where: { email }
    });

    if (existeEmail) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const existeCedula = await prisma.usuario.findFirst({
      where: { cedula }
    });

    if (existeCedula) {
      return res.status(400).json({
        success: false,
        message: 'El DPI ya está registrada'
      });
    }

    const cliente = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        telefono: telefono || null,
        direccion: direccion || null,
        cedula,
        tipoUsuario: 'Cliente',
        estado: 'Activo',
        passwordHash: await bcrypt.hash('temporal123', 10)
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        cedula: true,
        estado: true,
        fechaRegistro: true,
        tipoUsuario: true
      }
    });

    console.log('[CLIENTS] Cliente creado:', cliente.id);

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: { cliente }
    });

  } catch (error) {
    console.error('[CLIENTS] Error creando cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = parseInt(id);
    const { nombre, apellido, email, telefono, direccion, cedula } = req.body;

    console.log('[CLIENTS] Actualizando cliente:', clienteId);

    if (isNaN(clienteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const clienteExistente = await prisma.usuario.findUnique({
      where: { id: clienteId }
    });

    if (!clienteExistente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    if (clienteExistente.tipoUsuario !== 'Cliente') {
      return res.status(400).json({
        success: false,
        message: 'El usuario especificado no es un cliente'
      });
    }

    if (email && email !== clienteExistente.email) {
      const existeEmail = await prisma.usuario.findUnique({
        where: { email }
      });
      if (existeEmail) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso'
        });
      }
    }

    if (cedula && cedula !== clienteExistente.cedula) {
      const existeCedula = await prisma.usuario.findFirst({
        where: { cedula }
      });
      if (existeCedula) {
        return res.status(400).json({
          success: false,
          message: 'El DPI ya está registrado'
        });
      }
    }

    const clienteActualizado = await prisma.usuario.update({
      where: { id: clienteId },
      data: {
        nombre: nombre || clienteExistente.nombre,
        apellido: apellido || clienteExistente.apellido,
        email: email || clienteExistente.email,
        telefono: telefono !== undefined ? telefono : clienteExistente.telefono,
        direccion: direccion !== undefined ? direccion : clienteExistente.direccion,
        cedula: cedula || clienteExistente.cedula
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        cedula: true,
        estado: true,
        fechaRegistro: true,
        tipoUsuario: true
      }
    });

    console.log('[CLIENTS] Cliente actualizado:', clienteActualizado.id);

    res.status(200).json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: { cliente: clienteActualizado }
    });

  } catch (error) {
    console.error('[CLIENTS] Error actualizando cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = parseInt(id);

    console.log('[CLIENTS] Cambiando estado del cliente:', clienteId);

    if (isNaN(clienteId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const cliente = await prisma.usuario.findUnique({
      where: { id: clienteId }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    if (cliente.tipoUsuario !== 'Cliente') {
      return res.status(400).json({
        success: false,
        message: 'El usuario especificado no es un cliente'
      });
    }

    const nuevoEstado = cliente.estado === 'Activo' ? 'Inactivo' : 'Activo';

    const clienteActualizado = await prisma.usuario.update({
      where: { id: clienteId },
      data: { estado: nuevoEstado },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        estado: true
      }
    });

    console.log('[CLIENTS] Estado cambiado a:', nuevoEstado);

    res.status(200).json({
      success: true,
      message: `Cliente ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} exitosamente`,
      data: { cliente: clienteActualizado }
    });

  } catch (error) {
    console.error('[CLIENTS] Error cambiando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.use((error, req, res, next) => {
  console.error('Error en rutas de clientes:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de clientes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;