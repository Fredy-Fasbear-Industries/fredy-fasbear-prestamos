import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ===== FUNCIONES DE UTILIDAD =====

const validarTipoDato = (valor, tipo) => {
  try {
    switch (tipo) {
      case 'STRING':
      case 'TEXT':
        return String(valor);
      
      case 'INTEGER':
        const intValue = parseInt(valor);
        if (isNaN(intValue)) throw new Error('Valor no es un entero válido');
        return intValue;
      
      case 'DECIMAL':
        const floatValue = parseFloat(valor);
        if (isNaN(floatValue)) throw new Error('Valor no es un decimal válido');
        return floatValue;
      
      case 'BOOLEAN':
        if (typeof valor === 'boolean') return valor;
        if (typeof valor === 'string') {
          return valor.toLowerCase() === 'true' || valor === '1';
        }
        return Boolean(valor);
      
      case 'DATE':
        const dateValue = new Date(valor);
        if (isNaN(dateValue.getTime())) throw new Error('Valor no es una fecha válida');
        return dateValue.toISOString();
      
      default:
        return String(valor);
    }
  } catch (error) {
    console.error(`Error validando tipo ${tipo} con valor ${valor}:`, error);
    return null;
  }
};

const transformarConfiguracion = (config) => {
  if (!config) return null;
  
  // Extraer categoria del nombreParametro (ej: ECOMMERCE_GENERAL_NOMBRE -> general)
  let categoria = 'general';
  if (config.nombreParametro && config.nombreParametro.startsWith('ECOMMERCE_')) {
    const partes = config.nombreParametro.split('_');
    if (partes.length >= 2) {
      categoria = partes[1].toLowerCase();
    }
  }

  // Crear nombre amigable del nombreParametro
  let nombreAmigable = config.nombreParametro || 'Sin nombre';
  if (nombreAmigable.startsWith('ECOMMERCE_')) {
    nombreAmigable = nombreAmigable
      .replace('ECOMMERCE_', '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  return {
    id: config.id,
    nombre: nombreAmigable,
    nombreParametro: config.nombreParametro,
    valor: config.valorParametro,
    descripcion: config.descripcion || '',
    tipo: config.tipoDato || 'STRING',
    categoria: categoria,
    fechaCreacion: config.fechaCreacion,
    fechaModificacion: config.fechaModificacion,
    usuarioCreo: config.usuarioCreo,
    usuarioModifico: config.usuarioModifico
  };
};

// ===== CONTROLADORES =====

const ecommerceController = {
  
  async getEcommerceConfig(req, res) {
    try {
      console.log(' [ECOMMERCE] Iniciando getEcommerceConfig...');
      
      const { categoria, tipo, busqueda } = req.query;

      let whereClause = {
        nombreParametro: {
          startsWith: 'ECOMMERCE_'
        }
      };

      // Filtro por categoría
      if (categoria) {
        whereClause.nombreParametro = {
          startsWith: `ECOMMERCE_${categoria.toUpperCase()}_`
        };
      }

      // Filtro por tipo
      if (tipo) {
        whereClause.tipoDato = tipo;
      }

      // Filtro por búsqueda
      if (busqueda) {
        whereClause.OR = [
          {
            nombreParametro: {
              contains: busqueda,
              mode: 'insensitive'
            }
          },
          {
            descripcion: {
              contains: busqueda,
              mode: 'insensitive'
            }
          }
        ];
      }

      const configuraciones = await prisma.parametrosSistema.findMany({
        where: whereClause,
        orderBy: [
          { nombreParametro: 'asc' }
        ]
      });

      const configuracionesTransformadas = configuraciones
        .map(transformarConfiguracion)
        .filter(config => config !== null);

      console.log(` Se encontraron ${configuracionesTransformadas.length} configuraciones`);

      return res.status(200).json({
        success: true,
        data: configuracionesTransformadas,
        total: configuracionesTransformadas.length,
        message: 'Configuraciones obtenidas exitosamente'
      });

    } catch (error) {
      console.error(' [ERROR] Error en getEcommerceConfig:', error);
      
      let statusCode = 500;
      let message = 'Error obteniendo configuraciones de e-commerce';
      let errorCode = 'UNKNOWN_ERROR';

      if (error.code === 'P1001') {
        statusCode = 503;
        message = 'No se puede conectar a la base de datos';
        errorCode = 'DATABASE_CONNECTION_ERROR';
      } else if (error.code === 'P2021') {
        statusCode = 500;
        message = 'La tabla no existe en la base de datos';
        errorCode = 'TABLE_NOT_FOUND';
      }

      const errorResponse = {
        success: false,
        message,
        code: errorCode,
        timestamp: new Date().toISOString()
      };

      if (process.env.NODE_ENV === 'development') {
        errorResponse.debug = {
          originalError: error.message,
          code: error.code,
          stack: error.stack
        };
      }

      return res.status(statusCode).json(errorResponse);
    }
  },

  async updateEcommerceConfig(req, res) {
    try {
      console.log(' [ECOMMERCE] Iniciando updateEcommerceConfig...');
      
      const { configId } = req.params;
      const { valor, descripcion } = req.body;
      const usuarioId = req.user?.id;

      console.log(` Actualizando configuración: ${configId}`);
      console.log(` Datos recibidos:`, { valor, descripcion, tipo: typeof valor });

      // Validar entrada
      if (valor === undefined || valor === null) {
        return res.status(400).json({
          success: false,
          message: 'El campo "valor" es requerido',
          code: 'MISSING_VALUE'
        });
      }

      // Buscar configuración existente - mejorado para manejar tanto ID numérico como nombre
      let whereCondition;
      if (!isNaN(parseInt(configId))) {
        // Es un ID numérico
        whereCondition = { id: parseInt(configId) };
      } else {
        // Es un nombre de parámetro
        whereCondition = { nombreParametro: configId };
      }

      // Agregar filtro para que solo sean configuraciones de ecommerce
      const configExistente = await prisma.parametrosSistema.findFirst({
        where: {
          ...whereCondition,
          nombreParametro: {
            startsWith: 'ECOMMERCE_'
          }
        }
      });

      if (!configExistente) {
        console.log(` Configuración no encontrada: ${configId}`);
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
          code: 'CONFIG_NOT_FOUND'
        });
      }

      console.log(` Configuración encontrada:`, { id: configExistente.id, nombre: configExistente.nombreParametro, tipo: configExistente.tipoDato, valorActual: configExistente.valorParametro });

      // Validar el tipo de dato
      const valorValidado = validarTipoDato(valor, configExistente.tipoDato);
      if (valorValidado === null) {
        return res.status(400).json({
          success: false,
          message: `Valor inválido para el tipo ${configExistente.tipoDato}. Valor recibido: ${valor}`,
          code: 'INVALID_VALUE_TYPE'
        });
      }

      console.log(` Valor validado: ${valorValidado} (tipo: ${configExistente.tipoDato})`);

      // Actualizar la configuración
      const configActualizada = await prisma.parametrosSistema.update({
        where: { id: configExistente.id },
        data: {
          valorParametro: String(valorValidado), // Siempre guardar como string en la DB
          descripcion: descripcion || configExistente.descripcion,
usuarioModificoId: usuarioId && !isNaN(parseInt(usuarioId)) ? parseInt(usuarioId) : null,
          fechaModificacion: new Date()
        }
      });

      console.log(` Configuración actualizada exitosamente: ${configExistente.nombreParametro}`);

      // Transformar la respuesta
      const configTransformada = transformarConfiguracion(configActualizada);

      return res.status(200).json({
        success: true,
        data: configTransformada,
        message: 'Configuración actualizada exitosamente'
      });

    } catch (error) {
      console.error(' [ERROR] Error en updateEcommerceConfig:', error);
      
      // Manejo específico de errores de Prisma
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
          code: 'CONFIG_NOT_FOUND'
        });
      }

      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una configuración con ese nombre',
          code: 'DUPLICATE_CONFIG'
        });
      }

      // Error de validación de datos
      if (error.message.includes('Valor no es')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          code: 'VALIDATION_ERROR'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error actualizando configuración',
        code: 'UPDATE_ERROR',
        ...(process.env.NODE_ENV === 'development' && { 
          debug: {
            message: error.message,
            code: error.code,
            stack: error.stack
          }
        })
      });
    }
  },

  async createEcommerceConfig(req, res) {
    try {
      console.log(' [ECOMMERCE] Iniciando createEcommerceConfig...');
      
      const { nombre, tipo, valor, descripcion, categoria = 'general' } = req.body;
      const usuarioId = req.user?.id;

      // Validaciones
      if (!nombre || !tipo || valor === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, tipo y valor son requeridos',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      // Crear el nombre del parámetro
      const nombreParametro = nombre.startsWith('ECOMMERCE_') ? 
        nombre : 
        `ECOMMERCE_${categoria.toUpperCase()}_${nombre.toUpperCase().replace(/\s+/g, '_')}`;

      // Validar que no exista
      const existente = await prisma.parametrosSistema.findFirst({
        where: { nombreParametro }
      });

      if (existente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una configuración con ese nombre',
          code: 'CONFIG_ALREADY_EXISTS'
        });
      }

      // Validar el tipo de dato
      const tiposValidos = ['STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'TEXT'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: `Tipo de dato inválido. Tipos válidos: ${tiposValidos.join(', ')}`,
          code: 'INVALID_DATA_TYPE'
        });
      }

      const valorValidado = validarTipoDato(valor, tipo);
      if (valorValidado === null) {
        return res.status(400).json({
          success: false,
          message: `Valor inválido para el tipo ${tipo}`,
          code: 'INVALID_VALUE_TYPE'
        });
      }

      // Crear la configuración
      const nuevaConfig = await prisma.parametrosSistema.create({
        data: {
          nombreParametro,
          valorParametro: String(valorValidado),
          tipoDato: tipo,
          descripcion: descripcion || '',
          usuarioCreo: usuarioId ? `usuario_${usuarioId}` : 'admin@system',
usuarioModificoId: usuarioId && !isNaN(parseInt(usuarioId)) ? parseInt(usuarioId) : null,
          fechaCreacion: new Date(),
          fechaModificacion: new Date()
        }
      });

      console.log(` Nueva configuración creada: ${nombreParametro}`);

      const configTransformada = transformarConfiguracion(nuevaConfig);

      return res.status(201).json({
        success: true,
        data: configTransformada,
        message: 'Configuración creada exitosamente'
      });

    } catch (error) {
      console.error(' [ERROR] Error en createEcommerceConfig:', error);
      
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una configuración con ese nombre',
          code: 'DUPLICATE_CONFIG'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error creando configuración',
        code: 'CREATE_ERROR',
        ...(process.env.NODE_ENV === 'development' && { debug: error.message })
      });
    }
  },

  async deleteEcommerceConfig(req, res) {
    try {
      console.log(' [ECOMMERCE] Iniciando deleteEcommerceConfig...');
      
      const { configId } = req.params;

      // Buscar configuración existente
      const configExistente = await prisma.parametrosSistema.findFirst({
        where: {
          OR: [
            { id: !isNaN(parseInt(configId)) ? parseInt(configId) : undefined },
            { nombreParametro: configId }
          ],
          nombreParametro: {
            startsWith: 'ECOMMERCE_'
          }
        }
      });

      if (!configExistente) {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
          code: 'CONFIG_NOT_FOUND'
        });
      }

      // Verificar si es crítica
      const configuracionesCriticas = [
        'ECOMMERCE_GENERAL_NOMBRE_TIENDA',
        'ECOMMERCE_GENERAL_MONEDA',
        'ECOMMERCE_PAGOS_EFECTIVO'
      ];

      if (configuracionesCriticas.includes(configExistente.nombreParametro)) {
        return res.status(400).json({
          success: false,
          message: 'Esta configuración es crítica y no puede ser eliminada',
          code: 'CRITICAL_CONFIG_CANNOT_DELETE'
        });
      }

      await prisma.parametrosSistema.delete({
        where: { id: configExistente.id }
      });

      console.log(` Configuración eliminada: ${configExistente.nombreParametro}`);

      return res.status(200).json({
        success: true,
        message: 'Configuración eliminada exitosamente'
      });

    } catch (error) {
      console.error(' [ERROR] Error en deleteEcommerceConfig:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
          code: 'CONFIG_NOT_FOUND'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error eliminando configuración',
        code: 'DELETE_ERROR'
      });
    }
  },

  async getConfigByCategories(req, res) {
    try {
      console.log(' [ECOMMERCE] Iniciando getConfigByCategories...');

      const configuraciones = await prisma.parametrosSistema.findMany({
        where: {
          nombreParametro: {
            startsWith: 'ECOMMERCE_'
          }
        },
        orderBy: [
          { nombreParametro: 'asc' }
        ]
      });

      const configsPorCategoria = {};

      configuraciones.forEach(config => {
        const configTransformada = transformarConfiguracion(config);
        if (configTransformada) {
          const categoria = configTransformada.categoria;
          
          if (!configsPorCategoria[categoria]) {
            configsPorCategoria[categoria] = {
              nombre: categoria,
              titulo: categoria.charAt(0).toUpperCase() + categoria.slice(1),
              configuraciones: []
            };
          }
          
          configsPorCategoria[categoria].configuraciones.push(configTransformada);
        }
      });

      console.log(` Configuraciones agrupadas en ${Object.keys(configsPorCategoria).length} categorías`);

      return res.status(200).json({
        success: true,
        data: configsPorCategoria,
        message: 'Configuraciones agrupadas por categorías'
      });

    } catch (error) {
      console.error(' [ERROR] Error en getConfigByCategories:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo configuraciones por categorías',
        code: 'CATEGORIES_ERROR'
      });
    }
  },

  async resetToDefaults(req, res) {
    try {
      console.log(' [ECOMMERCE] Iniciando resetToDefaults...');
      
      const { confirmacion } = req.body;
      
      if (confirmacion !== 'RESET_CONFIGURACIONES') {
        return res.status(400).json({
          success: false,
          message: 'Para restaurar las configuraciones, debes enviar confirmacion: "RESET_CONFIGURACIONES"',
          code: 'MISSING_CONFIRMATION'
        });
      }

      // Eliminar todas las configuraciones de ecommerce existentes
      await prisma.parametrosSistema.deleteMany({
        where: {
          nombreParametro: {
            startsWith: 'ECOMMERCE_'
          }
        }
      });

      // Configuraciones predeterminadas
      const configsDefault = [
        {
          nombreParametro: 'ECOMMERCE_GENERAL_NOMBRE_TIENDA',
          valorParametro: 'Mi Tienda Online',
          tipoDato: 'STRING',
          descripcion: 'Nombre de la tienda que aparecerá en el sitio web'
        },
        {
          nombreParametro: 'ECOMMERCE_GENERAL_MONEDA',
          valorParametro: 'GTQ',
          tipoDato: 'STRING',
          descripcion: 'Moneda predeterminada para los precios'
        },
        {
          nombreParametro: 'ECOMMERCE_GENERAL_IVA',
          valorParametro: '12',
          tipoDato: 'DECIMAL',
          descripcion: 'Porcentaje de IVA aplicado a los productos'
        },
        {
          nombreParametro: 'ECOMMERCE_PAGOS_EFECTIVO',
          valorParametro: 'true',
          tipoDato: 'BOOLEAN',
          descripcion: 'Permitir pagos en efectivo'
        },
        {
          nombreParametro: 'ECOMMERCE_PAGOS_TARJETA',
          valorParametro: 'false',
          tipoDato: 'BOOLEAN',
          descripcion: 'Permitir pagos con tarjeta de crédito'
        },
        {
          nombreParametro: 'ECOMMERCE_ENVIOS_COSTO_BASE',
          valorParametro: '25.00',
          tipoDato: 'DECIMAL',
          descripcion: 'Costo base de envío'
        },
        {
          nombreParametro: 'ECOMMERCE_ENVIOS_GRATIS_DESDE',
          valorParametro: '300.00',
          tipoDato: 'DECIMAL',
          descripcion: 'Monto mínimo para envío gratis'
        },
        {
          nombreParametro: 'ECOMMERCE_PROMOCIONES_ACTIVAS',
          valorParametro: 'true',
          tipoDato: 'BOOLEAN',
          descripcion: 'Activar sistema de promociones'
        }
      ];

      // Crear las configuraciones predeterminadas
      for (const config of configsDefault) {
        await prisma.parametrosSistema.create({
          data: {
            ...config,
            usuarioCreo: 'system@reset',
            usuarioModifico: 'system@reset',
            fechaCreacion: new Date(),
            fechaModificacion: new Date()
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: `Se restauraron ${configsDefault.length} configuraciones predeterminadas`,
        data: { configuracionesCreadas: configsDefault.length }
      });

    } catch (error) {

      
      return res.status(500).json({
        success: false,
        message: 'Error restaurando configuraciones predeterminadas',
        code: 'RESET_ERROR'
      });
    }
  }
};

export default ecommerceController;