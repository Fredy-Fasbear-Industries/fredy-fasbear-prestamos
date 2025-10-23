import prisma from '../config/prisma.js';

async function executeWithRetry(fn, maxRetries = 3) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise(r => setTimeout(r, 1000 * i));
    }
  }
}

export const getAdminStats = async (req, res) => {
  try {
    console.log('Obteniendo estadísticas del dashboard...');


    const [
      totalUsuarios,
      usuariosActivos,
      totalPrestamos,
      prestamosActivos,
      totalSolicitudes,
      solicitudesPendientes
    ] = await Promise.all([
      executeWithRetry(() => prisma.usuario.count()),
      executeWithRetry(() => prisma.usuario.count({ where: { activo: true } })),
      executeWithRetry(() => prisma.prestamo.count()),
      executeWithRetry(() => prisma.prestamo.count({ where: { estado: 'ACTIVO' } })),
      executeWithRetry(() => prisma.solicitud.count()),
      executeWithRetry(() => prisma.solicitud.count({ where: { estado: 'PENDIENTE' } }))
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsuarios,
        usuariosActivos,
        totalPrestamos,
        prestamosActivos,
        totalSolicitudes,
        solicitudesPendientes,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error en getAdminStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
};