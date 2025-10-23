
// Archivo: BACKEND/src/services/calculadora.service.js
// Servicio para cálculos de préstamos - Completamente dinámico desde BD

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache para parámetros del sistema
let parametrosCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene los parámetros del sistema desde la base de datos
 * Sin valores por defecto - todo debe venir de BD
 */
const obtenerParametrosSistema = async () => {
  try {
    // Verificar si el cache es válido
    const ahora = Date.now();
    if (parametrosCache && cacheTimestamp && (ahora - cacheTimestamp) < CACHE_DURATION) {
      return parametrosCache;
    }

    console.log('Cargando parámetros del sistema desde BD');

    // Obtener parámetros desde la base de datos
    const parametrosBD = await prisma.parametrosSistema.findMany({
      select: {
        nombreParametro: true,
        valorParametro: true,
        tipoDato: true
      }
    });

    if (!parametrosBD || parametrosBD.length === 0) {
      throw new Error('No se encontraron parámetros del sistema en la base de datos');
    }

    // Convertir array a objeto con tipos de datos correctos
    const parametros = {};
    for (const param of parametrosBD) {
      let valor = param.valorParametro;
      
      // Convertir según el tipo de dato
      switch (param.tipoDato) {
        case 'INTEGER':
          valor = parseInt(valor);
          if (isNaN(valor)) {
            throw new Error(`Parámetro ${param.nombreParametro} no es un entero válido`);
          }
          break;
        case 'DECIMAL':
          valor = parseFloat(valor);
          if (isNaN(valor)) {
            throw new Error(`Parámetro ${param.nombreParametro} no es un decimal válido`);
          }
          break;
        case 'BOOLEAN':
          valor = valor.toLowerCase() === 'true';
          break;
        case 'STRING':
        default:
          // STRING se mantiene como está
          break;
      }
      
      parametros[param.nombreParametro] = valor;
    }

    // Validar que existan los parámetros mínimos requeridos
    const parametrosRequeridos = [
      'TASA_INTERES_MENSUAL',
      'MONTO_MINIMO_PRESTAMO', 
      'MONTO_MAXIMO_PRESTAMO',
      'PORCENTAJE_MINIMO_AVALUO',
      'PORCENTAJE_MAXIMO_AVALUO',
      'PLAZO_MINIMO_MESES',
      'PLAZO_MAXIMO_MESES'
    ];

    for (const param of parametrosRequeridos) {
      if (parametros[param] === undefined || parametros[param] === null) {
        throw new Error(`Parámetro requerido ${param} no encontrado en la base de datos`);
      }
    }

    // Actualizar cache
    parametrosCache = parametros;
    cacheTimestamp = ahora;

    console.log('Parámetros del sistema cargados correctamente:', Object.keys(parametros).length);
    
    return parametros;

  } catch (error) {
    console.error('Error obteniendo parámetros del sistema:', error.message);
    throw new Error(`No se pudieron cargar los parámetros del sistema: ${error.message}`);
  }
};

/**
 * Invalida el cache de parámetros
 */
const invalidarCacheParametros = () => {
  parametrosCache = null;
  cacheTimestamp = null;
  console.log('Cache de parámetros invalidado');
};

export const calculadoraService = {
  
  /**
   * Calcula el total a pagar para una solicitud de préstamo
   */
  async calcularPrestamo(montoSolicitado, plazoMeses, modalidadPago = 'mensual') {
    // Obtener parámetros dinámicos
    const config = await obtenerParametrosSistema();
    
    const monto = parseFloat(montoSolicitado);
    const plazo = parseInt(plazoMeses);
    
    if (isNaN(monto) || monto <= 0) {
      throw new Error('El monto solicitado debe ser un número mayor a 0');
    }
    
    if (isNaN(plazo) || plazo <= 0) {
      throw new Error('El plazo debe ser un número mayor a 0');
    }
    
    // Validaciones con parámetros dinámicos
    if (monto < config.MONTO_MINIMO_PRESTAMO || monto > config.MONTO_MAXIMO_PRESTAMO) {
      throw new Error(`El monto debe estar entre Q${config.MONTO_MINIMO_PRESTAMO} y Q${config.MONTO_MAXIMO_PRESTAMO}`);
    }
    
    if (plazo < config.PLAZO_MINIMO_MESES || plazo > config.PLAZO_MAXIMO_MESES) {
      throw new Error(`El plazo debe estar entre ${config.PLAZO_MINIMO_MESES} y ${config.PLAZO_MAXIMO_MESES} meses`);
    }
    
    let tasaInteres, numeroPagos, frecuenciaPago;
    
    // Calcular según modalidad de pago con tasas dinámicas
    switch (modalidadPago.toLowerCase()) {
      case 'semanal':
        tasaInteres = (config.TASA_INTERES_SEMANAL || config.TASA_INTERES_MENSUAL / 4) / 100;
        numeroPagos = plazo * 4;
        frecuenciaPago = 'semanal';
        break;
        
      case 'quincenal':
        tasaInteres = (config.TASA_INTERES_QUINCENAL || config.TASA_INTERES_MENSUAL / 2) / 100;
        numeroPagos = plazo * 2;
        frecuenciaPago = 'quincenal';
        break;
        
      case 'mensual':
      default:
        tasaInteres = config.TASA_INTERES_MENSUAL / 100;
        numeroPagos = plazo;
        frecuenciaPago = 'mensual';
        break;
    }
    
    // Calcular comisión de apertura
    const comisionApertura = monto * ((config.COMISION_APERTURA || 0) / 100);
    
    // Calcular interés simple
    const interesTotal = monto * tasaInteres * numeroPagos;
    const totalSinComision = monto + interesTotal;
    const totalAPagar = totalSinComision + comisionApertura;
    const montoPorPago = totalAPagar / numeroPagos;
    
    // Generar plan de pagos
    const planPagos = this.generarPlanPagos({
      monto,
      numeroPagos,
      montoPorPago,
      frecuenciaPago,
      tasaInteres,
      comisionApertura
    });
    
    return {
      montoSolicitado: monto,
      plazoMeses: plazo,
      modalidadPago: frecuenciaPago,
      tasaInteres: tasaInteres * 100,
      numeroPagos,
      interesTotal: parseFloat(interesTotal.toFixed(2)),
      comisionApertura: parseFloat(comisionApertura.toFixed(2)),
      totalAPagar: parseFloat(totalAPagar.toFixed(2)),
      montoPorPago: parseFloat(montoPorPago.toFixed(2)),
      planPagos,
      resumen: {
        capitalPorPago: parseFloat((monto / numeroPagos).toFixed(2)),
        interesPorPago: parseFloat((interesTotal / numeroPagos).toFixed(2)),
        comisionPorPago: parseFloat((comisionApertura / numeroPagos).toFixed(2))
      },
      parametrosUsados: {
        tasaMensual: config.TASA_INTERES_MENSUAL,
        tasaSemanal: config.TASA_INTERES_SEMANAL,
        comisionApertura: config.COMISION_APERTURA,
        fechaConsulta: new Date().toISOString()
      }
    };
  },
  
  /**
   * Genera el plan de pagos detallado
   */
  generarPlanPagos({ monto, numeroPagos, montoPorPago, frecuenciaPago, tasaInteres, comisionApertura }) {
    const planPagos = [];
    const fechaBase = new Date();
    const capitalPorPago = monto / numeroPagos;
    const interesPorPago = (monto * tasaInteres);
    const comisionPorPago = comisionApertura / numeroPagos;
    
    for (let i = 1; i <= numeroPagos; i++) {
      const fechaPago = new Date(fechaBase);
      
      // Calcular fecha según frecuencia
      switch (frecuenciaPago) {
        case 'semanal':
          fechaPago.setDate(fechaPago.getDate() + (i * 7));
          break;
        case 'quincenal':
          fechaPago.setDate(fechaPago.getDate() + (i * 15));
          break;
        case 'mensual':
          fechaPago.setMonth(fechaPago.getMonth() + i);
          break;
      }
      
      const saldoPendiente = monto - (capitalPorPago * i);
      
      planPagos.push({
        numeroPago: i,
        fechaPago: fechaPago.toISOString().split('T')[0],
        montoPago: parseFloat(montoPorPago.toFixed(2)),
        capital: parseFloat(capitalPorPago.toFixed(2)),
        interes: parseFloat(interesPorPago.toFixed(2)),
        comision: i === 1 ? parseFloat(comisionPorPago.toFixed(2)) : 0,
        saldoPendiente: parseFloat(Math.max(saldoPendiente, 0).toFixed(2))
      });
    }
    
    return planPagos;
  },
  
  /**
   * Calcula el porcentaje recomendado basado en el valor del artículo
   */
  async calcularPorcentajeRecomendado(valorArticulo, tipoArticulo) {
    const config = await obtenerParametrosSistema();
    const valor = parseFloat(valorArticulo);
    
    if (isNaN(valor) || valor <= 0) {
      throw new Error('El valor del artículo debe ser un número mayor a 0');
    }
    
    // Porcentajes dinámicos desde la BD
    const porcentajes = {
      min: config.PORCENTAJE_MINIMO_AVALUO,
      max: config.PORCENTAJE_MAXIMO_AVALUO,
      recomendado: config.PORCENTAJE_RECOMENDADO_AVALUO || config.PORCENTAJE_MINIMO_AVALUO
    };
    
    return {
      valorArticulo: valor,
      porcentajeMinimo: porcentajes.min,
      porcentajeMaximo: porcentajes.max,
      porcentajeRecomendado: porcentajes.recomendado,
      montoMinimo: parseFloat((valor * porcentajes.min / 100).toFixed(2)),
      montoMaximo: parseFloat((valor * porcentajes.max / 100).toFixed(2)),
      montoRecomendado: parseFloat((valor * porcentajes.recomendado / 100).toFixed(2))
    };
  },
  
  /**
   * Valida que el monto solicitado esté dentro de los rangos permitidos
   */
  async validarMontoSolicitud(montoSolicitado, valorArticulo) {
    const config = await obtenerParametrosSistema();
    const monto = parseFloat(montoSolicitado);
    const valor = parseFloat(valorArticulo);
    
    if (isNaN(monto) || monto <= 0) {
      return {
        esValido: false,
        mensaje: 'El monto solicitado debe ser un número mayor a 0'
      };
    }
    
    if (isNaN(valor) || valor <= 0) {
      return {
        esValido: false,
        mensaje: 'El valor del artículo debe ser un número mayor a 0'
      };
    }
    
    const porcentajeSolicitado = (monto / valor) * 100;
    
    if (porcentajeSolicitado < config.PORCENTAJE_MINIMO_AVALUO) {
      return {
        esValido: false,
        mensaje: `El monto solicitado es muy bajo. Mínimo ${config.PORCENTAJE_MINIMO_AVALUO}% del valor del artículo.`
      };
    }
    
    if (porcentajeSolicitado > config.PORCENTAJE_MAXIMO_AVALUO) {
      return {
        esValido: false,
        mensaje: `El monto solicitado es muy alto. Máximo ${config.PORCENTAJE_MAXIMO_AVALUO}% del valor del artículo.`
      };
    }
    
    if (monto < config.MONTO_MINIMO_PRESTAMO) {
      return {
        esValido: false,
        mensaje: `El monto mínimo es Q${config.MONTO_MINIMO_PRESTAMO}.`
      };
    }
    
    if (monto > config.MONTO_MAXIMO_PRESTAMO) {
      return {
        esValido: false,
        mensaje: `El monto máximo es Q${config.MONTO_MAXIMO_PRESTAMO}.`
      };
    }
    
    return {
      esValido: true,
      porcentajeSolicitado: parseFloat(porcentajeSolicitado.toFixed(2)),
      mensaje: 'Monto válido'
    };
  },

  /**
   * Obtiene los límites y configuraciones actuales del sistema
   */
  async obtenerLimitesActuales() {
    const config = await obtenerParametrosSistema();
    return {
      montos: {
        minimo: config.MONTO_MINIMO_PRESTAMO,
        maximo: config.MONTO_MAXIMO_PRESTAMO
      },
      plazos: {
        minimo: config.PLAZO_MINIMO_MESES,
        maximo: config.PLAZO_MAXIMO_MESES
      },
      porcentajes: {
        minimo: config.PORCENTAJE_MINIMO_AVALUO,
        maximo: config.PORCENTAJE_MAXIMO_AVALUO,
        recomendado: config.PORCENTAJE_RECOMENDADO_AVALUO || config.PORCENTAJE_MINIMO_AVALUO
      },
      tasas: {
        mensual: config.TASA_INTERES_MENSUAL,
        semanal: config.TASA_INTERES_SEMANAL || (config.TASA_INTERES_MENSUAL / 4),
        quincenal: config.TASA_INTERES_QUINCENAL || (config.TASA_INTERES_MENSUAL / 2)
      },
      limites: {
        prestamosActivos: config.LIMITE_PRESTAMOS_ACTIVOS || 5,
        solicitudesPendientes: config.LIMITE_SOLICITUDES_PENDIENTES || 3
      },
      comisiones: {
        apertura: config.COMISION_APERTURA || 0,
        renovacion: config.COMISION_RENOVACION || 0
      }
    };
  },

  /**
   * Obtiene un parámetro específico del sistema
   */
  async obtenerParametro(nombreParametro) {
    const config = await obtenerParametrosSistema();
    return config[nombreParametro];
  },

  /**
   * Verifica si todos los parámetros requeridos están configurados
   */
  async verificarConfiguracion() {
    try {
      const config = await obtenerParametrosSistema();
      
      const parametrosRequeridos = [
        'TASA_INTERES_MENSUAL',
        'MONTO_MINIMO_PRESTAMO', 
        'MONTO_MAXIMO_PRESTAMO',
        'PORCENTAJE_MINIMO_AVALUO',
        'PORCENTAJE_MAXIMO_AVALUO',
        'PLAZO_MINIMO_MESES',
        'PLAZO_MAXIMO_MESES'
      ];

      const faltantes = [];
      for (const param of parametrosRequeridos) {
        if (config[param] === undefined || config[param] === null) {
          faltantes.push(param);
        }
      }

      return {
        configurado: faltantes.length === 0,
        parametrosFaltantes: faltantes,
        totalParametros: Object.keys(config).length
      };
    } catch (error) {
      return {
        configurado: false,
        error: error.message,
        parametrosFaltantes: [],
        totalParametros: 0
      };
    }
  },

  // Función para invalidar cache
  invalidarCache: invalidarCacheParametros
};

export default calculadoraService;