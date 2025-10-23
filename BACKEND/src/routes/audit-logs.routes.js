import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para logging y autenticación
router.use((req, res, next) => {
  console.log(` Audit Logs API: ${req.method} ${req.path}`);
  next();
});

router.use(authenticateToken);
router.use(requireAdmin);

// ===== FUNCIÓN AUXILIAR PARA VERIFICAR CONEXIÓN =====
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error(' Database connection failed:', error.message);
    return false;
  }
}

// ===== RUTAS DE AUDIT LOGS =====

/**
 * GET /api/audit-logs
 * Obtiene logs de auditoría con filtros opcionales
 */
router.get('/', async (req, res) => {
  try {
    console.log(' Obteniendo logs de auditoría...');

    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Base de datos temporalmente no disponible'
      });
    }

    // Extraer parámetros de consulta
    const {
      page = 1,
      limit = 20,
      search = '',
      accion = '',
      entidad = '',
      usuarioId = '',
      fechaDesde = '',
      fechaHasta = ''
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where = {};

    if (search) {
      where.OR = [
        { accion: { contains: search, mode: 'insensitive' } },
        { entidad: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search } },
        { usuario: { nombre: { contains: search, mode: 'insensitive' } } },
        { usuario: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (accion) {
      where.accion = accion;
    }

    if (entidad) {
      where.entidad = entidad;
    }

    if (usuarioId) {
      where.usuarioId = parseInt(usuarioId);
    }

    if (fechaDesde || fechaHasta) {
      where.fechaHora = {};
      
      if (fechaDesde) {
        where.fechaHora.gte = new Date(fechaDesde);
      }
      
      if (fechaHasta) {
        // Agregar 1 día para incluir todo el día
        const endDate = new Date(fechaHasta);
        endDate.setDate(endDate.getDate() + 1);
        where.fechaHora.lt = endDate;
      }
    }

    // Verificar si la tabla existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'log_actividad'
      );
    `;

    if (!tableExists[0]?.exists) {
      return res.status(404).json({
        success: false,
        message: 'Tabla de logs no encontrada'
      });
    }

    // Obtener logs con paginación
    const [logs, total] = await Promise.all([
      prisma.logActividad.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          fechaHora: 'desc'
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              tipoUsuario: true
            }
          }
        }
      }),
      prisma.logActividad.count({ where })
    ]);

    console.log(` Se encontraron ${total} logs (página ${pageNum})`);

    res.status(200).json({
      success: true,
      data: {
        logs,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error(' Error obteniendo logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los logs de auditoría',
      error: error.message
    });
  }
});

/**
 * GET /api/audit-logs/:id
 * Obtiene detalles de un log específico
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(` Obteniendo detalles del log ${id}...`);

    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Base de datos temporalmente no disponible'
      });
    }

    const log = await prisma.logActividad.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            tipoUsuario: true
          }
        }
      }
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log no encontrado'
      });
    }

    console.log(' Detalles del log obtenidos');

    res.status(200).json({
      success: true,
      data: {
        log
      }
    });

  } catch (error) {
    console.error(' Error obteniendo detalles del log:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del log',
      error: error.message
    });
  }
});

/**
 * GET /api/audit-logs/stats
 * Obtiene estadísticas de los logs
 */
router.get('/stats', async (req, res) => {
  try {
    console.log(' Obteniendo estadísticas de logs...');

    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Base de datos temporalmente no disponible'
      });
    }

    const { fechaDesde, fechaHasta } = req.query;

    const where = {};

    if (fechaDesde || fechaHasta) {
      where.fechaHora = {};
      
      if (fechaDesde) {
        where.fechaHora.gte = new Date(fechaDesde);
      }
      
      if (fechaHasta) {
        const endDate = new Date(fechaHasta);
        endDate.setDate(endDate.getDate() + 1);
        where.fechaHora.lt = endDate;
      }
    }

    // Obtener estadísticas
    const [
      totalLogs,
      logsToday,
      uniqueUsers,
      actionsByType
    ] = await Promise.all([
      prisma.logActividad.count({ where }),
      prisma.logActividad.count({
        where: {
          ...where,
          fechaHora: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.logActividad.groupBy({
        by: ['usuarioId'],
        where,
        _count: true
      }),
      prisma.logActividad.groupBy({
        by: ['accion'],
        where,
        _count: true,
        orderBy: {
          _count: {
            accion: 'desc'
          }
        }
      })
    ]);

    console.log(' Estadísticas obtenidas');

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        logsToday,
        uniqueUsers: uniqueUsers.length,
        actionsByType: actionsByType.map(item => ({
          accion: item.accion,
          count: item._count
        }))
      }
    });

  } catch (error) {
    console.error(' Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

/**
 * GET /api/audit-logs/export
 * Exporta logs a formato CSV
 */
router.get('/export', async (req, res) => {
  try {
    console.log(' Exportando logs a CSV...');

    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Base de datos temporalmente no disponible'
      });
    }

    // Extraer filtros de consulta
    const {
      search = '',
      accion = '',
      entidad = '',
      usuarioId = '',
      fechaDesde = '',
      fechaHasta = ''
    } = req.query;

    // Construir filtros
    const where = {};

    if (search) {
      where.OR = [
        { accion: { contains: search, mode: 'insensitive' } },
        { entidad: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search } }
      ];
    }

    if (accion) where.accion = accion;
    if (entidad) where.entidad = entidad;
    if (usuarioId) where.usuarioId = parseInt(usuarioId);

    if (fechaDesde || fechaHasta) {
      where.fechaHora = {};
      if (fechaDesde) where.fechaHora.gte = new Date(fechaDesde);
      if (fechaHasta) {
        const endDate = new Date(fechaHasta);
        endDate.setDate(endDate.getDate() + 1);
        where.fechaHora.lt = endDate;
      }
    }

    // Obtener todos los logs que cumplan con los filtros
    const logs = await prisma.logActividad.findMany({
      where,
      orderBy: {
        fechaHora: 'desc'
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true
          }
        }
      }
    });

    // Crear contenido CSV
    let csvContent = 'ID,Fecha y Hora,Usuario,Email,Acción,Entidad,Entidad ID,IP Address,User Agent\n';

    logs.forEach(log => {
      const userName = log.usuario 
        ? `${log.usuario.nombre || ''} ${log.usuario.apellido || ''}`.trim() 
        : 'Sistema';
      const userEmail = log.usuario?.email || 'N/A';
      const fechaHora = new Date(log.fechaHora).toLocaleString('es-GT');
      const entidadId = log.entidadId || 'N/A';
      const userAgent = (log.userAgent || 'N/A').replace(/"/g, '""'); // Escapar comillas

      csvContent += `${log.id},"${fechaHora}","${userName}","${userEmail}",${log.accion},${log.entidad || 'N/A'},"${entidadId}",${log.ipAddress},"${userAgent}"\n`;
    });

    // Nombre del archivo
    const fecha = new Date().toISOString().split('T')[0];
    const fileName = `audit-logs-${fecha}.csv`;

    console.log(` CSV generado: ${logs.length} registros`);

    res.status(200).json({
      success: true,
      data: {
        csvContent,
        fileName,
        totalRecords: logs.length
      }
    });

  } catch (error) {
    console.error(' Error exportando logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar logs',
      error: error.message
    });
  }
});

/**
 * POST /api/audit-logs/cleanup
 * Limpia logs antiguos (solo administrador)
 */
router.post('/cleanup', async (req, res) => {
  try {
    console.log('🧹 Limpiando logs antiguos...');

    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Base de datos temporalmente no disponible'
      });
    }

    const { daysToKeep = 90 } = req.body;

    // Calcular fecha límite
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Eliminar logs antiguos
    const result = await prisma.logActividad.deleteMany({
      where: {
        fechaHora: {
          lt: cutoffDate
        }
      }
    });

    console.log(` ${result.count} logs eliminados`);

    res.status(200).json({
      success: true,
      message: `Se eliminaron ${result.count} logs anteriores a ${cutoffDate.toLocaleDateString('es-GT')}`,
      data: {
        deletedCount: result.count,
        cutoffDate
      }
    });

  } catch (error) {
    console.error(' Error limpiando logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar logs',
      error: error.message
    });
  }
});

export default router;