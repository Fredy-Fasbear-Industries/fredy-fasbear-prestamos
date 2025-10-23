// FRONTEND/composables/useTiposArticulo.js
export const useTiposArticulo = () => {
  const { api } = useApi()

  // Estado reactivo para tipos de artículo
  const tiposArticuloState = ref({
    loading: false,
    error: null,
    tipos: [],
    tipoActual: null
  })

  // ===== FUNCIONES PRINCIPALES =====

  // Obtener todos los tipos de artículo disponibles
  const getTiposArticulo = async (forceRefresh = false) => {
    try {
      // Si ya tenemos datos y no se fuerza el refresh, usar cache
      if (tiposArticuloState.value.tipos.length > 0 && !forceRefresh) {
        console.log(' Usando tipos de artículo desde caché')
        return tiposArticuloState.value.tipos
      }

      console.log(' Cargando tipos de artículo...')
      tiposArticuloState.value.loading = true
      tiposArticuloState.value.error = null

      const response = await api('/solicitudes/tipos-articulo')

      if (response.success && response.data.tiposArticulo) {
        tiposArticuloState.value.tipos = response.data.tiposArticulo
        console.log(' Tipos de artículo cargados:', response.data.tiposArticulo.length)
        return response.data.tiposArticulo
      } else {
        throw new Error(response.message || 'Error cargando tipos de artículo')
      }

    } catch (error) {
      console.error(' Error cargando tipos de artículo:', error)
      tiposArticuloState.value.error = error.message
      throw error
    } finally {
      tiposArticuloState.value.loading = false
    }
  }

  // Obtener un tipo de artículo específico por ID
  const getTipoArticuloById = async (id) => {
    try {
      console.log(' Buscando tipo de artículo ID:', id)

      // Primero buscar en la lista cargada
      let tipo = tiposArticuloState.value.tipos.find(t => t.id === parseInt(id))
      
      if (!tipo) {
        // Si no está en la lista, cargar todos los tipos
        await getTiposArticulo(true)
        tipo = tiposArticuloState.value.tipos.find(t => t.id === parseInt(id))
      }

      if (!tipo) {
        throw new Error('Tipo de artículo no encontrado')
      }

      tiposArticuloState.value.tipoActual = tipo
      console.log(' Tipo de artículo encontrado:', tipo.nombre)
      return tipo

    } catch (error) {
      console.error(' Error obteniendo tipo de artículo:', error)
      throw error
    }
  }

  // Buscar tipos de artículo por nombre
  const buscarTiposPorNombre = (termino) => {
    if (!termino || termino.length < 2) {
      return tiposArticuloState.value.tipos
    }

    const terminoLower = termino.toLowerCase()
    return tiposArticuloState.value.tipos.filter(tipo => 
      tipo.nombre.toLowerCase().includes(terminoLower)
    )
  }

  // Obtener tipos que requieren especificaciones electrónicas
  const getTiposElectronicos = () => {
    return tiposArticuloState.value.tipos.filter(tipo => tipo.requiereElectronico)
  }

  // Obtener tipos por rango de porcentaje de avalúo
  const getTiposPorRangoAvaluo = (porcentajeMin = 0, porcentajeMax = 100) => {
    return tiposArticuloState.value.tipos.filter(tipo => {
      const minAvaluo = parseFloat(tipo.porcentajeMinAvaluo)
      const maxAvaluo = parseFloat(tipo.porcentajeMaxAvaluo)
      
      return minAvaluo >= porcentajeMin && maxAvaluo <= porcentajeMax
    })
  }

  // ===== FUNCIONES DE VALIDACIÓN =====

  // Validar si un artículo cumple con los requisitos del tipo
  const validarArticuloParaTipo = (articulo, tipoId) => {
    const tipo = tiposArticuloState.value.tipos.find(t => t.id === parseInt(tipoId))
    
    if (!tipo) {
      return {
        valido: false,
        errores: ['Tipo de artículo no válido']
      }
    }

    const errores = []

    // Validar campos obligatorios básicos
    if (!articulo.descripcion || articulo.descripcion.trim().length < 10) {
      errores.push('La descripción debe tener al menos 10 caracteres')
    }

    if (!articulo.estadoFisico) {
      errores.push('El estado físico es obligatorio')
    }

    // Validar especificaciones técnicas para electrónicos
    if (tipo.requiereElectronico && 
        (!articulo.especificacionesTecnicas || articulo.especificacionesTecnicas.trim().length < 20)) {
      errores.push('Los artículos electrónicos requieren especificaciones técnicas detalladas (mín. 20 caracteres)')
    }

    // Validar marca y modelo para ciertos tipos
    if (tipo.requiereElectronico && !articulo.marca) {
      errores.push('La marca es obligatoria para artículos electrónicos')
    }

    // Validar valor estimado si se proporciona
    if (articulo.valorEstimadoCliente) {
      const valor = parseFloat(articulo.valorEstimadoCliente)
      if (isNaN(valor) || valor <= 0) {
        errores.push('El valor estimado debe ser un número mayor a 0')
      }
    }

    return {
      valido: errores.length === 0,
      errores,
      tipo
    }
  }

  // ===== FUNCIONES DE UTILIDAD =====

  // Calcular rango de avalúo estimado
  const calcularRangoAvaluo = (valorEstimado, tipoId) => {
    const tipo = tiposArticuloState.value.tipos.find(t => t.id === parseInt(tipoId))
    
    if (!tipo || !valorEstimado) {
      return { min: 0, max: 0 }
    }

    const valor = parseFloat(valorEstimado)
    const porcentajeMin = parseFloat(tipo.porcentajeMinAvaluo) / 100
    const porcentajeMax = parseFloat(tipo.porcentajeMaxAvaluo) / 100

    return {
      min: Math.round(valor * porcentajeMin),
      max: Math.round(valor * porcentajeMax),
      tipo: tipo.nombre
    }
  }

  // Formatear información del tipo para mostrar
  const formatearTipoInfo = (tipo) => {
    if (!tipo) return null

    return {
      id: tipo.id,
      nombre: tipo.nombre,
      requiereElectronico: tipo.requiereElectronico,
      rangoAvaluo: `${tipo.porcentajeMinAvaluo}% - ${tipo.porcentajeMaxAvaluo}%`,
      descripcionRango: `Entre ${tipo.porcentajeMinAvaluo}% y ${tipo.porcentajeMaxAvaluo}% del valor estimado`,
      icono: getIconoTipo(tipo.nombre),
      categoria: getCategoriaTipo(tipo.nombre)
    }
  }

  // Obtener ícono según el tipo
  const getIconoTipo = (nombreTipo) => {
    const iconos = {
      'Joyería': '💎',
      'Oro': '🟨',
      'Plata': '⚪',
      'Electrónicos': '📱',
      'Computadoras': '',
      'Celulares': '📱',
      'Tablets': '📱',
      'Televisores': '📺',
      'Electrodomésticos': '🏠',
      'Vehículos': '🚗',
      'Motos': '🏍️',
      'Herramientas': '',
      'Instrumentos Musicales': '🎵',
      'Relojes': '⌚',
      'Antigüedades': '🏺',
      'Arte': '',
      'Deportes': '⚽',
      'Cámaras': '📷'
    }

    // Buscar coincidencia exacta o parcial
    for (const [clave, icono] of Object.entries(iconos)) {
      if (nombreTipo.toLowerCase().includes(clave.toLowerCase()) ||
          clave.toLowerCase().includes(nombreTipo.toLowerCase())) {
        return icono
      }
    }

    return '' // Ícono por defecto
  }

  // Obtener categoría del tipo
  const getCategoriaTipo = (nombreTipo) => {
    const categorias = {
      'Joyería': ['Joyería', 'Oro', 'Plata', 'Relojes', 'Diamantes'],
      'Electrónicos': ['Electrónicos', 'Computadoras', 'Celulares', 'Tablets', 'Televisores', 'Cámaras'],
      'Hogar': ['Electrodomésticos', 'Muebles', 'Decoración'],
      'Vehículos': ['Vehículos', 'Motos', 'Bicicletas'],
      'Otros': ['Herramientas', 'Instrumentos Musicales', 'Antigüedades', 'Arte', 'Deportes']
    }

    for (const [categoria, tipos] of Object.entries(categorias)) {
      if (tipos.some(tipo => nombreTipo.toLowerCase().includes(tipo.toLowerCase()))) {
        return categoria
      }
    }

    return 'Otros'
  }

  // Agrupar tipos por categoría
  const getTiposAgrupados = () => {
    const grupos = {}
    
    tiposArticuloState.value.tipos.forEach(tipo => {
      const categoria = getCategoriaTipo(tipo.nombre)
      
      if (!grupos[categoria]) {
        grupos[categoria] = []
      }
      
      grupos[categoria].push({
        ...tipo,
        icono: getIconoTipo(tipo.nombre)
      })
    })

    // Ordenar cada grupo alfabéticamente
    Object.keys(grupos).forEach(categoria => {
      grupos[categoria].sort((a, b) => a.nombre.localeCompare(b.nombre))
    })

    return grupos
  }

  // Obtener sugerencias para un artículo
  const getSugerenciasPorDescripcion = (descripcion) => {
    if (!descripcion || descripcion.length < 3) {
      return []
    }

    const descripcionLower = descripcion.toLowerCase()
    const sugerencias = []

    tiposArticuloState.value.tipos.forEach(tipo => {
      let puntuacion = 0
      
      // Coincidencia exacta en nombre
      if (tipo.nombre.toLowerCase().includes(descripcionLower)) {
        puntuacion += 10
      }

      // Palabras clave específicas
      const palabrasClave = {
        'celular': ['Celulares', 'Electrónicos'],
        'computadora': ['Computadoras', 'Electrónicos'],
        'laptop': ['Computadoras', 'Electrónicos'],
        'tv': ['Televisores', 'Electrónicos'],
        'televisor': ['Televisores', 'Electrónicos'],
        'anillo': ['Joyería', 'Oro', 'Plata'],
        'cadena': ['Joyería', 'Oro', 'Plata'],
        'reloj': ['Relojes', 'Joyería'],
        'carro': ['Vehículos'],
        'moto': ['Motos', 'Vehículos'],
        'guitarra': ['Instrumentos Musicales'],
        'piano': ['Instrumentos Musicales'],
        'taladro': ['Herramientas'],
        'nevera': ['Electrodomésticos'],
        'lavadora': ['Electrodomésticos']
      }

      for (const [palabra, tipos] of Object.entries(palabrasClave)) {
        if (descripcionLower.includes(palabra) && tipos.includes(tipo.nombre)) {
          puntuacion += 5
        }
      }

      if (puntuacion > 0) {
        sugerencias.push({
          tipo,
          puntuacion,
          razon: puntuacion >= 10 ? 'Coincidencia exacta' : 'Palabra clave relacionada'
        })
      }
    })

    return sugerencias
      .sort((a, b) => b.puntuacion - a.puntuacion)
      .slice(0, 3)
      .map(s => ({
        ...s.tipo,
        icono: getIconoTipo(s.tipo.nombre),
        razon: s.razon
      }))
  }

  // Limpiar estado
  const clearState = () => {
    tiposArticuloState.value = {
      loading: false,
      error: null,
      tipos: [],
      tipoActual: null
    }
  }

  // ===== COMPUTED PROPERTIES =====

  // Tipos ordenados alfabéticamente
  const tiposOrdenados = computed(() => {
    return [...tiposArticuloState.value.tipos].sort((a, b) => a.nombre.localeCompare(b.nombre))
  })

  // Tipos más populares (simulado - se podría obtener de estadísticas)
  const tiposPopulares = computed(() => {
    const populares = ['Celulares', 'Joyería', 'Computadoras', 'Relojes', 'Electrónicos']
    return tiposArticuloState.value.tipos
      .filter(tipo => populares.includes(tipo.nombre))
      .sort((a, b) => populares.indexOf(a.nombre) - populares.indexOf(b.nombre))
  })

  // Estadísticas de tipos
  const estadisticasTipos = computed(() => {
    const total = tiposArticuloState.value.tipos.length
    const electronicos = tiposArticuloState.value.tipos.filter(t => t.requiereElectronico).length
    const grupos = getTiposAgrupados()

    return {
      total,
      electronicos,
      noElectronicos: total - electronicos,
      categorias: Object.keys(grupos).length,
      grupos
    }
  })

  return {
    // Estado
    tiposArticuloState: readonly(tiposArticuloState),
    
    // Funciones principales
    getTiposArticulo,
    getTipoArticuloById,
    buscarTiposPorNombre,
    getTiposElectronicos,
    getTiposPorRangoAvaluo,
    
    // Validación
    validarArticuloParaTipo,
    
    // Utilidades
    calcularRangoAvaluo,
    formatearTipoInfo,
    getIconoTipo,
    getCategoriaTipo,
    getTiposAgrupados,
    getSugerenciasPorDescripcion,
    
    // Estado y limpieza
    clearState,
    
    // Computed
    tiposOrdenados,
    tiposPopulares,
    estadisticasTipos
  }
}