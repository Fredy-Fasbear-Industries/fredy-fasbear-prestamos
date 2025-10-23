import { ref } from 'vue'


const { getToken } = useAuth()
export const useEvaluador = () => {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Realiza una petición a la API del evaluador
   */
  const api = async (endpoint, options = {}) => {
    const config = useRuntimeConfig()
  const { getToken } = useAuth()
  const token = getToken()

    if (!token) {
      throw new Error('No hay sesión activa')
    }

    const response = await fetch(`${config.public.apiBase}/evaluador${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición')
    }

    return data
  }

  /**
   * Obtiene las estadísticas del evaluador
   */
  const obtenerEstadisticas = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log('[EVALUADOR] Obteniendo estadísticas...')
      const response = await api('/stats')
      
      return response.data
    } catch (err) {
      console.error('[EVALUADOR] Error obteniendo estadísticas:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene las solicitudes pendientes de evaluación
   */
  const obtenerSolicitudes = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.limite) params.append('limite', filtros.limite)
      if (filtros.pagina) params.append('pagina', filtros.pagina)
      
      const queryString = params.toString()
      const endpoint = `/solicitudes${queryString ? `?${queryString}` : ''}`
      
      console.log('[EVALUADOR] Obteniendo solicitudes:', endpoint)
      const response = await api(endpoint)
      
      return {
        solicitudes: response.data,
        pagination: response.pagination
      }
    } catch (err) {
      console.error('[EVALUADOR] Error obteniendo solicitudes:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene el detalle de una solicitud específica
   */
  const obtenerDetalleSolicitud = async (solicitudId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('[EVALUADOR] Obteniendo detalle de solicitud:', solicitudId)
      const response = await api(`/solicitudes/${solicitudId}`)
      
      return response.data
    } catch (err) {
      console.error('[EVALUADOR] Error obteniendo detalle:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Evalúa una solicitud (aprobar o rechazar)
   */
  const evaluarSolicitud = async (solicitudId, datosEvaluacion) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('[EVALUADOR] Evaluando solicitud:', solicitudId, datosEvaluacion)
      
      // Validaciones
      if (!datosEvaluacion.valorComercial || datosEvaluacion.valorComercial <= 0) {
        throw new Error('El valor comercial debe ser mayor a 0')
      }
      
      if (!datosEvaluacion.porcentajeAplicado || datosEvaluacion.porcentajeAplicado <= 0) {
        throw new Error('El porcentaje debe ser mayor a 0')
      }
      
      if (!datosEvaluacion.estado || !['Aprobada', 'Rechazada'].includes(datosEvaluacion.estado)) {
        throw new Error('Estado inválido')
      }
      
      const response = await api(`/solicitudes/${solicitudId}/evaluar`, {
        method: 'POST',
        body: JSON.stringify(datosEvaluacion)
      })
      
      console.log('[EVALUADOR] Solicitud evaluada exitosamente')
      return response.data
    } catch (err) {
      console.error('[EVALUADOR] Error evaluando solicitud:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene la actividad reciente del evaluador
   */
  const obtenerActividadReciente = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log('[EVALUADOR] Obteniendo actividad reciente...')
      const response = await api('/recent-activity')
      
      return response.data
    } catch (err) {
      console.error('[EVALUADOR] Error obteniendo actividad:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene el historial de avalúos realizados
   */
  const obtenerMisAvaluos = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      
      if (filtros.limite) params.append('limite', filtros.limite)
      if (filtros.pagina) params.append('pagina', filtros.pagina)
      
      const queryString = params.toString()
      const endpoint = `/mis-avaluos${queryString ? `?${queryString}` : ''}`
      
      console.log('[EVALUADOR] Obteniendo historial de avalúos:', endpoint)
      const response = await api(endpoint)
      
      return {
        avaluos: response.data,
        pagination: response.pagination
      }
    } catch (err) {
      console.error('[EVALUADOR] Error obteniendo avalúos:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Calcula el monto del préstamo
   */
  const calcularMontoPrestamo = (valorComercial, porcentajeAplicado) => {
    if (!valorComercial || !porcentajeAplicado) return 0
    return (parseFloat(valorComercial) * parseFloat(porcentajeAplicado)) / 100
  }

  /**
   * Valida que el porcentaje esté en el rango permitido
   */
  const validarPorcentaje = (porcentaje, porcentajeMin, porcentajeMax) => {
    const valor = parseFloat(porcentaje)
    const min = parseFloat(porcentajeMin) || 25
    const max = parseFloat(porcentajeMax) || 85
    
    return {
      valido: valor >= min && valor <= max,
      mensaje: valor < min 
        ? `El porcentaje debe ser mayor o igual a ${min}%`
        : valor > max 
          ? `El porcentaje debe ser menor o igual a ${max}%`
          : null
    }
  }

  /**
   * Formatea un monto en quetzales
   */
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(monto)
  }

  /**
   * Formatea una fecha
   */
  const formatearFecha = (fecha, opciones = {}) => {
    if (!fecha) return 'N/A'
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    
    return new Date(fecha).toLocaleDateString('es-GT', {
      ...defaultOptions,
      ...opciones
    })
  }

  /**
   * Obtiene el color según el estado de la solicitud
   */
  const getEstadoColor = (estado) => {
    const colores = {
      'Pendiente': '#F59E0B',
      'Aprobada': '#10B981',
      'Rechazada': '#EF4444',
      'Evaluando': '#3B82F6'
    }
    return colores[estado] || '#6B7280'
  }

  /**
   * Obtiene el ícono según el estado físico del artículo
   */
  const getEstadoFisicoInfo = (estadoFisico) => {
    const estados = {
      'Excelente': { color: '#10B981', texto: 'Como nuevo' },
      'Bueno': { color: '#3B82F6', texto: 'Buen estado' },
      'Regular': { color: '#F59E0B', texto: 'Uso normal' },
      'Malo': { color: '#EF4444', texto: 'Desgaste visible' }
    }
    return estados[estadoFisico] || { color: '#6B7280', texto: 'No especificado' }
  }

  return {
    // Estado
    loading,
    error,
    
    // Métodos
    obtenerEstadisticas,
    obtenerSolicitudes,
    obtenerDetalleSolicitud,
    evaluarSolicitud,
    obtenerActividadReciente,
    obtenerMisAvaluos,
    
    // Utilidades
    calcularMontoPrestamo,
    validarPorcentaje,
    formatearMoneda,
    formatearFecha,
    getEstadoColor,
    getEstadoFisicoInfo
  }
}