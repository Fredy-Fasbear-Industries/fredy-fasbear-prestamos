// Archivo: BACKEND/src/services/avaluo.service.js
// Servicio para la lógica de avalúos automáticos y manuales

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuración de avalúos por categoría
const CONFIGURACION_AVALUOS = {
  1: { // Joyería
    porcentajeMin: 30,
    porcentajeMax: 70,
    depreciacionAnual: 0, // No deprecia
    factorEstado: {
      'excelente': 1.0,
      'bueno': 0.85,
      'regular': 0.70,
      'malo': 0.50
    }
  },
  2: { // Oro
    porcentajeMin: 40,
    porcentajeMax: 80,
    depreciacionAnual: 0,
    factorEstado: {
      'excelente': 1.0,
      'bueno': 0.90,
      'regular': 0.75,
      'malo': 0.60
    }
  },
  3: { // Plata
    porcentajeMin: 25,
    porcentajeMax: 60,
    depreciacionAnual: 0,
    factorEstado: {
      'excelente': 1.0,
      'bueno': 0.85,
      'regular': 0.70,
      'malo': 0.55
    }
  },
  4: { // Celulares
    porcentajeMin: 35,
    porcentajeMax: 75,
    depreciacionAnual: 0.25, // 25% anual
    factorEstado: {
      'excelente': 1.0,
      'bueno': 0.80,
      'regular': 0.60,
      'malo': 0.35
    }
  },
  5: { // Computadoras
    porcentajeMin: 30,
    porcentajeMax: 65,
    depreciacionAnual: 0.30, // 30% anual
    factorEstado: {
      'excelente': 1.0,
      'bueno': 0.75,
      'regular': 0.55,
      'malo': 0.30
    }
  },
  6: { // Televisores
    porcentajeMin: 25,
    porcentajeMax: 55,
    depreciacionAnual: 0.20, // 20% anual
    factorEstado: {
      'excelente': 1.0,
      'bueno': 0.80,
      'regular': 0.60,
      'malo': 0.35
    }
  },
  7: { // Relojes
    porcentajeMin: 35,
    porcentajeMax: 75,
    depreciacionAnual: 0.05, // 5% anual
    factorEstado: {
      'excelente': 1.0,
      'bueno': 0.85,
      'regular': 0.70,
      'malo': 0.50
    }
  },
  8: { // Vehículos
    porcentajeMin: 45,
    porcentajeMax: 85,
    depreciacionAnual: 0.15, // 15% anual
    factorEstado: {
      'excelente': 1.0,
      'bueno': 0.85,
      'regular': 0.70,
      'malo': 0.45
    }
  },
  9: { // Herramientas
    porcentajeMin: 20,
    porcentajeMax: 50,
    depreciacionAnual: 0.10, // 10% anual
    factorEstado: {
      'excelente': 1.0,
      'bueno': 0.80,
      'regular': 0.65,
      'malo': 0.40
    }
  },
  10: { // Electrodomésticos
    porcentajeMin: 20,
    porcentajeMax: 45,
    depreciacionAnual: 0.15, // 15% anual
    factorEstado: {
      'excelente': 1.0,
      'bueno': 0.75,
      'regular': 0.55,
      'malo': 0.30
    }
  }
};

export default {
  // Crear avalúo inicial automático
  async crearAvaluoInicial({ articuloId, valorEstimadoCliente, categoriaId, tx = null }) {
    try {
      const db = tx || prisma;
      
      // Obtener configuración de la categoría
      const config = CONFIGURACION_AVALUOS[categoriaId];
      if (!config) {
        throw new Error('Categoría no configurada para avalúo automático');
      }

      // Obtener datos del artículo
      const articulo = await db.articulo.findUnique({
        where: { id: articuloId },
        include: {
          categoria: true
        }
      });

      if (!articulo) {
        throw new Error('Artículo no encontrado');
      }

      // Calcular avalúo automático
      const avaluoCalculado = this.calcularAvaluoAutomatico({
        valorEstimado: valorEstimadoCliente,
        categoriaId,
        estadoFisico: articulo.estadoFisico,
        marca: articulo.marca,
        modelo: articulo.modelo
      });

      // Crear registro de avalúo
      const avaluo = await db.avaluo.create({
        data: {
          articuloId,
          tipoAvaluo: 'automatico',
          valorEstimadoCliente: valorEstimadoCliente,
          valorAvaluado: avaluoCalculado.valorFinal,
          porcentajeMaximoPrestamo: avaluoCalculado.porcentajeMaximo,
          montoMaximoPrestamo: avaluoCalculado.montoMaximo,
          metodologiaAvaluo: JSON.stringify(avaluoCalculado.metodologia),
          fechaAvaluo: new Date(),
          estado: 'pendiente_revision'
        }
      });

      return avaluo;

    } catch (error) {
      console.error('Error creando avalúo inicial:', error);
      throw error;
    }
  },

  // Calcular avalúo automático basado en algoritmos
  calcularAvaluoAutomatico({ valorEstimado, categoriaId, estadoFisico, marca = null, modelo = null }) {
    try {
      const config = CONFIGURACION_AVALUOS[categoriaId];
      if (!config) {
        throw new Error('Categoría no configurada');
      }

      // Valor base
      let valorFinal = valorEstimado;
      const metodologia = {
        valorInicial: valorEstimado,
        factores: []
      };

      // Factor por estado físico
      const factorEstado = config.factorEstado[estadoFisico] || 0.5;
      valorFinal *= factorEstado;
      metodologia.factores.push({
        tipo: 'estado_fisico',
        factor: factorEstado,
        descripcion: `Estado: ${estadoFisico}`
      });

      // Factor por marca (para electrónicos)
      if (marca && categoriaId >= 4 && categoriaId <= 6) {
        const factorMarca = this.obtenerFactorMarca(marca, categoriaId);
        valorFinal *= factorMarca;
        metodologia.factores.push({
          tipo: 'marca',
          factor: factorMarca,
          descripcion: `Marca: ${marca}`
        });
      }

      // Factor de depreciación (para artículos que deprecian)
      if (config.depreciacionAnual > 0) {
        // Asumimos 1 año de antigüedad promedio si no se especifica
        const factorDepreciacion = 1 - config.depreciacionAnual;
        valorFinal *= factorDepreciacion;
        metodologia.factores.push({
          tipo: 'depreciacion',
          factor: factorDepreciacion,
          descripcion: 'Depreciación estimada (1 año)'
        });
      }

      // Factor de mercado (variación aleatoria del ±5%)
      const factorMercado = 0.95 + (Math.random() * 0.1); // Entre 0.95 y 1.05
      valorFinal *= factorMercado;
      metodologia.factores.push({
        tipo: 'mercado',
        factor: factorMercado,
        descripcion: 'Condiciones de mercado'
      });

      // Redondear a enteros
      valorFinal = Math.round(valorFinal);
      metodologia.valorFinal = valorFinal;

      // Calcular porcentaje máximo de préstamo
      const porcentajeMaximo = this.calcularPorcentajeMaximoPrestamo(categoriaId, estadoFisico);
      const montoMaximo = Math.round(valorFinal * (porcentajeMaximo / 100));

      return {
        valorFinal,
        porcentajeMaximo,
        montoMaximo,
        metodologia,
        confianza: this.calcularNivelConfianza(categoriaId, factorEstado)
      };

    } catch (error) {
      console.error('Error calculando avalúo automático:', error);
      throw error;
    }
  },

  // Obtener factor de marca para electrónicos
  obtenerFactorMarca(marca, categoriaId) {
    const factoresMarca = {
      // Celulares
      4: {
        'Apple': 1.15,
        'Samsung': 1.10,
        'Google': 1.05,
        'OnePlus': 1.00,
        'Xiaomi': 0.95,
        'Huawei': 0.90,
        'default': 0.85
      },
      // Computadoras
      5: {
        'Apple': 1.20,
        'Dell': 1.05,
        'HP': 1.00,
        'Lenovo': 1.00,
        'ASUS': 0.95,
        'Acer': 0.90,
        'default': 0.85
      },
      // Televisores
      6: {
        'Samsung': 1.10,
        'LG': 1.05,
        'Sony': 1.05,
        'TCL': 0.95,
        'Hisense': 0.90,
        'default': 0.85
      }
    };

    const factores = factoresMarca[categoriaId];
    if (!factores) return 1.0;

    return factores[marca] || factores['default'];
  },

  // Calcular porcentaje máximo de préstamo
  calcularPorcentajeMaximoPrestamo(categoriaId, estadoFisico) {
    const config = CONFIGURACION_AVALUOS[categoriaId];
    if (!config) return 50;

    // Base según categoría
    let porcentaje = (config.porcentajeMin + config.porcentajeMax) / 2;

    // Ajustar según estado físico
    const ajustesEstado = {
      'excelente': 1.0,
      'bueno': 0.9,
      'regular': 0.8,
      'malo': 0.6
    };

    porcentaje *= (ajustesEstado[estadoFisico] || 0.5);

    // Mantener dentro del rango
    porcentaje = Math.max(config.porcentajeMin, Math.min(config.porcentajeMax, porcentaje));

    return Math.round(porcentaje);
  },

  // Calcular nivel de confianza del avalúo
  calcularNivelConfianza(categoriaId, factorEstado) {
    let confianza = 0.8; // Base 80%

    // Joyería y metales preciosos tienen mayor confianza
    if ([1, 2, 3, 7].includes(categoriaId)) {
      confianza = 0.9;
    }

    // Electrónicos tienen menor confianza por volatilidad
    if ([4, 5, 6].includes(categoriaId)) {
      confianza = 0.7;
    }

    // Ajustar por estado físico
    confianza *= factorEstado;

    return Math.round(confianza * 100);
  },

  // Crear avalúo manual por evaluador profesional
  async crearAvaluoManual({ articuloId, avaluadorId, valorAvaluado, observaciones, fotos = [] }) {
    try {
      // Obtener el artículo y avalúo automático previo
      const articulo = await prisma.articulo.findUnique({
        where: { id: articuloId },
        include: {
          avaluos: {
            where: { tipoAvaluo: 'automatico' },
            orderBy: { fechaAvaluo: 'desc' },
            take: 1
          }
        }
      });

      if (!articulo) {
        throw new Error('Artículo no encontrado');
      }

      const avaluoAutomatico = articulo.avaluos[0];
      const diferenciaPorcentual = avaluoAutomatico ? 
        Math.abs((valorAvaluado - avaluoAutomatico.valorAvaluado) / avaluoAutomatico.valorAvaluado * 100) : 0;

      // Calcular nuevo porcentaje máximo de préstamo
      const porcentajeMaximo = this.calcularPorcentajeMaximoPrestamo(
        articulo.categoriaId, 
        articulo.estadoFisico
      );
      const montoMaximo = Math.round(valorAvaluado * (porcentajeMaximo / 100));

      // Crear avalúo manual
      const avaluoManual = await prisma.avaluo.create({
        data: {
          articuloId,
          avaluadorId,
          tipoAvaluo: 'manual',
          valorEstimadoCliente: avaluoAutomatico?.valorEstimadoCliente || valorAvaluado,
          valorAvaluado,
          porcentajeMaximoPrestamo: porcentajeMaximo,
          montoMaximoPrestamo: montoMaximo,
          observaciones,
          diferenciaPorcentualAutomatico: diferenciaPorcentual,
          metodologiaAvaluo: JSON.stringify({
            tipo: 'evaluacion_profesional',
            avaluador: avaluadorId,
            referencia_automatico: avaluoAutomatico?.id,
            diferencia_porcentual: diferenciaPorcentual
          }),
          fechaAvaluo: new Date(),
          estado: 'completado'
        }
      });

      // Actualizar estado del avalúo automático si existe
      if (avaluoAutomatico) {
        await prisma.avaluo.update({
          where: { id: avaluoAutomatico.id },
          data: { estado: 'reemplazado_manual' }
        });
      }

      return avaluoManual;

    } catch (error) {
      console.error('Error creando avalúo manual:', error);
      throw error;
    }
  },

  // Obtener historial de avalúos de un artículo
  async obtenerHistorialAvaluos(articuloId) {
    try {
      const avaluos = await prisma.avaluo.findMany({
        where: { articuloId },
        include: {
          avaluador: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        },
        orderBy: { fechaAvaluo: 'desc' }
      });

      return avaluos.map(avaluo => ({
        id: avaluo.id,
        tipo: avaluo.tipoAvaluo,
        valorAvaluado: avaluo.valorAvaluado,
        montoMaximoPrestamo: avaluo.montoMaximoPrestamo,
        porcentajeMaximo: avaluo.porcentajeMaximoPrestamo,
        fechaAvaluo: avaluo.fechaAvaluo,
        estado: avaluo.estado,
        observaciones: avaluo.observaciones,
        avaluador: avaluo.avaluador ? {
          nombre: `${avaluo.avaluador.nombre} ${avaluo.avaluador.apellido}`
        } : null,
        metodologia: avaluo.metodologiaAvaluo ? JSON.parse(avaluo.metodologiaAvaluo) : null
      }));

    } catch (error) {
      console.error('Error obteniendo historial de avalúos:', error);
      throw error;
    }
  },

  // Validar si un avalúo necesita revisión manual
  async validarNecesidadRevisionManual(avaluoId) {
    try {
      const avaluo = await prisma.avaluo.findUnique({
        where: { id: avaluoId },
        include: {
          articulo: {
            include: {
              categoria: true
            }
          }
        }
      });

      if (!avaluo) {
        throw new Error('Avalúo no encontrado');
      }

      const criteriosRevision = [];

      // Valores muy altos requieren revisión
      if (avaluo.valorAvaluado > 20000) {
        criteriosRevision.push('Valor alto (>Q20,000)');
      }

      // Artículos únicos o especiales
      if ([1, 2, 7].includes(avaluo.articulo.categoriaId) && avaluo.valorAvaluado > 5000) {
        criteriosRevision.push('Joyería/Reloj de alto valor');
      }

      // Electrónicos muy nuevos o muy caros
      if ([4, 5, 6].includes(avaluo.articulo.categoriaId) && avaluo.valorAvaluado > 15000) {
        criteriosRevision.push('Electrónico de alto valor');
      }

      const requiereRevision = criteriosRevision.length > 0;

      if (requiereRevision) {
        await prisma.avaluo.update({
          where: { id: avaluoId },
          data: { 
            estado: 'requiere_revision_manual',
            observaciones: `Revisión requerida: ${criteriosRevision.join(', ')}`
          }
        });
      }

      return {
        requiereRevision,
        criterios: criteriosRevision
      };

    } catch (error) {
      console.error('Error validando necesidad de revisión:', error);
      throw error;
    }
  },

  // Obtener estadísticas de avalúos
  async obtenerEstadisticasAvaluos(filtros = {}) {
    try {
      const { fechaInicio, fechaFin, categoriaId, avaluadorId } = filtros;

      const whereClause = {
        ...(fechaInicio && fechaFin && {
          fechaAvaluo: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin)
          }
        }),
        ...(categoriaId && {
          articulo: {
            categoriaId: parseInt(categoriaId)
          }
        }),
        ...(avaluadorId && { avaluadorId })
      };

      const [
        totalAvaluos,
        avaluosAutomaticos,
        avaluosManuales,
        valorPromedio,
        distribucionCategorias
      ] = await Promise.all([
        prisma.avaluo.count({ where: whereClause }),
        prisma.avaluo.count({ where: { ...whereClause, tipoAvaluo: 'automatico' } }),
        prisma.avaluo.count({ where: { ...whereClause, tipoAvaluo: 'manual' } }),
        prisma.avaluo.aggregate({
          where: whereClause,
          _avg: { valorAvaluado: true }
        }),
        prisma.avaluo.groupBy({
          by: ['articulo'],
          where: whereClause,
          _count: true
        })
      ]);

      return {
        totalAvaluos,
        avaluosAutomaticos,
        avaluosManuales,
        porcentajeAutomaticos: totalAvaluos > 0 ? (avaluosAutomaticos / totalAvaluos) * 100 : 0,
        valorPromedio: valorPromedio._avg.valorAvaluado || 0,
        distribucionCategorias
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas de avalúos:', error);
      throw error;
    }
  },

  // Recalibrar algoritmo de avalúo automático
  async recalibrarAlgoritmo() {
    try {
      // Obtener avalúos manuales de los últimos 6 meses
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - 6);

      const avaluosManuales = await prisma.avaluo.findMany({
        where: {
          tipoAvaluo: 'manual',
          fechaAvaluo: { gte: fechaLimite }
        },
        include: {
          articulo: {
            include: { categoria: true }
          }
        }
      });

      // Agrupar por categoría y calcular ajustes
      const ajustesPorCategoria = {};

      avaluosManuales.forEach(avaluo => {
        const categoriaId = avaluo.articulo.categoriaId;
        if (!ajustesPorCategoria[categoriaId]) {
          ajustesPorCategoria[categoriaId] = {
            diferencias: [],
            valorPromedio: 0,
            cantidad: 0
          };
        }

        if (avaluo.diferenciaPorcentualAutomatico) {
          ajustesPorCategoria[categoriaId].diferencias.push(avaluo.diferenciaPorcentualAutomatico);
        }
        ajustesPorCategoria[categoriaId].cantidad++;
      });

      // Calcular ajustes recomendados
      const recomendaciones = {};
      Object.keys(ajustesPorCategoria).forEach(categoriaId => {
        const datos = ajustesPorCategoria[categoriaId];
        if (datos.diferencias.length > 5) { // Mínimo 5 muestras
          const diferenciaProm = datos.diferencias.reduce((a, b) => a + b, 0) / datos.diferencias.length;
          recomendaciones[categoriaId] = {
            ajusteFactor: diferenciaProm > 10 ? 0.9 : (diferenciaProm < -10 ? 1.1 : 1.0),
            diferenciaProm,
            muestras: datos.diferencias.length
          };
        }
      });

      return recomendaciones;

    } catch (error) {
      console.error('Error recalibrando algoritmo:', error);
      throw error;
    }
  }
};