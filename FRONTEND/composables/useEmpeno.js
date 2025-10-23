// Archivo: FRONTEND/composables/useEmpeno.js
// Composable actualizado para conectar con las APIs reales de empéño

export const useEmpeno = () => {
  const { api } = useApi()
  
  // Estado reactivo
  const loading = ref(false)
  const error = ref(null)
  
  // ===== PRÉSTAMOS =====

  /**
   * Obtener mis préstamos con filtros
   * @param {Object} filtros - Filtros de búsqueda
   * @param {String} filtros.estado - Filtrar por estado (Activo, Vencido, Pagado, En_Mora)
   * @param {Number} filtros.limite - Número máximo de resultados (default: 10)
   * @param {Number} filtros.pagina - Página actual (default: 1)
   * @returns {Promise<Object>} Response con lista de préstamos
   */
  const obtenerMisPrestamos = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Obteniendo préstamos con filtros:', filtros)
      
      const params = new URLSearchParams()
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.limite) params.append('limite', filtros.limite)
      if (filtros.pagina) params.append('pagina', filtros.pagina)
      
      const url = `/prestamos${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await api(url, {
        method: 'GET'
      })
      
      console.log(' Préstamos obtenidos:', response)
      return response
    } catch (err) {
      console.error(' Error obteniendo préstamos:', err)
      error.value = err.message || 'Error obteniendo préstamos'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener estadísticas de préstamos del usuario
   * @returns {Promise<Object>} Estadísticas generales
   */
  const obtenerEstadisticas = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Obteniendo estadísticas de préstamos...')
      
      const response = await api('/prestamos/estadisticas', {
        method: 'GET'
      })
      
      console.log(' Estadísticas obtenidas:', response)
      return response
    } catch (err) {
      console.error(' Error obteniendo estadísticas:', err)
      error.value = err.message || 'Error obteniendo estadísticas'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener detalle completo de un préstamo específico
   * @param {Number} prestamoId - ID del préstamo
   * @returns {Promise<Object>} Detalle del préstamo
   */
  const obtenerDetallePrestamo = async (prestamoId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Obteniendo detalle del préstamo:', prestamoId)
      
      const response = await api(`/prestamos/${prestamoId}`, {
        method: 'GET'
      })
      
      console.log(' Detalle del préstamo obtenido:', response)
      return response
    } catch (err) {
      console.error(' Error obteniendo detalle del préstamo:', err)
      error.value = err.message || 'Error obteniendo detalle del préstamo'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener historial completo de préstamos
   * @param {Object} filtros - Filtros de fecha y paginación
   * @param {String} filtros.fechaInicio - Fecha de inicio (ISO string)
   * @param {String} filtros.fechaFin - Fecha de fin (ISO string)
   * @param {Number} filtros.limite - Número máximo de resultados (default: 20)
   * @param {Number} filtros.pagina - Página actual (default: 1)
   * @returns {Promise<Object>} Historial de préstamos
   */
  const obtenerHistorial = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📚 Obteniendo historial de préstamos:', filtros)
      
      const params = new URLSearchParams()
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
      if (filtros.limite) params.append('limite', filtros.limite)
      if (filtros.pagina) params.append('pagina', filtros.pagina)
      
      const url = `/prestamos/historial${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await api(url, {
        method: 'GET'
      })
      
      console.log(' Historial obtenido:', response)
      return response
    } catch (err) {
      console.error(' Error obteniendo historial:', err)
      error.value = err.message || 'Error obteniendo historial'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Calcular simulación de préstamo
   * @param {Object} datos - Datos para la simulación
   * @param {Number} datos.valorArticulo - Valor del artículo a empeñar (requerido)
   * @param {Number} datos.porcentajePrestamo - Porcentaje del valor a prestar (default: 50)
   * @param {Number} datos.plazoMeses - Plazo en meses (default: 1)
   * @returns {Promise<Object>} Simulación del préstamo
   */
  const obtenerSimulacion = async (datos) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('🧮 Calculando simulación de préstamo:', datos)
      
      if (!datos.valorArticulo || datos.valorArticulo <= 0) {
        throw new Error('El valor del artículo debe ser mayor a 0')
      }
      
      const params = new URLSearchParams()
      params.append('valorArticulo', datos.valorArticulo)
      if (datos.porcentajePrestamo) params.append('porcentajePrestamo', datos.porcentajePrestamo)
      if (datos.plazoMeses) params.append('plazoMeses', datos.plazoMeses)
      
      const response = await api(`/prestamos/simulacion?${params.toString()}`, {
        method: 'GET'
      })
      
      console.log(' Simulación calculada:', response)
      return response
    } catch (err) {
      console.error(' Error calculando simulación:', err)
      error.value = err.message || 'Error calculando simulación'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Procesar pago de un préstamo específico
   * @param {Number} prestamoId - ID del préstamo
   * @param {Object} datosPago - Datos del pago
   * @param {Number} datosPago.monto - Monto del pago (requerido)
   * @param {String} datosPago.metodoPago - Método de pago (efectivo, transferencia, tarjeta)
   * @param {String} datosPago.referencia - Referencia de la transacción (opcional)
   * @param {String} datosPago.notas - Notas adicionales (opcional)
   * @returns {Promise<Object>} Resultado del pago
   */
  const procesarPagoPrestamo = async (prestamoId, datosPago) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Procesando pago del préstamo:', prestamoId, datosPago)
      
      if (!datosPago.monto || datosPago.monto <= 0) {
        throw new Error('El monto debe ser mayor a 0')
      }
      
      if (!datosPago.metodoPago) {
        throw new Error('Debe especificar un método de pago')
      }
      
      const response = await api(`/prestamos/${prestamoId}/pagar`, {
        method: 'POST',
        body: datosPago
      })
      
      console.log(' Pago procesado:', response)
      return response
    } catch (err) {
      console.error(' Error procesando pago:', err)
      error.value = err.message || 'Error procesando pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Renovar un préstamo específico
   * @param {Number} prestamoId - ID del préstamo
   * @param {Object} datosRenovacion - Datos para la renovación
   * @param {Number} datosRenovacion.nuevoPlato - Nuevo plazo en meses (opcional)
   * @param {String} datosRenovacion.observaciones - Observaciones adicionales (opcional)
   * @returns {Promise<Object>} Resultado de la renovación
   */
  const renovarPrestamo = async (prestamoId, datosRenovacion = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Renovando préstamo:', prestamoId, datosRenovacion)
      
      const response = await api(`/prestamos/${prestamoId}/renovar`, {
        method: 'POST',
        body: datosRenovacion
      })
      
      console.log(' Préstamo renovado:', response)
      return response
    } catch (err) {
      console.error(' Error renovando préstamo:', err)
      error.value = err.message || 'Error renovando préstamo'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Descargar contrato de préstamo en PDF
   * @param {Number} prestamoId - ID del préstamo
   * @returns {Promise<Blob>} Archivo PDF del contrato
   */
  const descargarContrato = async (prestamoId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Descargando contrato del préstamo:', prestamoId)
      
      const response = await fetch(`${useRuntimeConfig().public.apiBase}/prestamos/${prestamoId}/contrato`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${useAuth().getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error descargando el contrato')
      }
      
      const blob = await response.blob()
      
      // Crear URL del blob y descargar automáticamente
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `contrato-prestamo-${prestamoId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log(' Contrato descargado exitosamente')
      return blob
    } catch (err) {
      console.error(' Error descargando contrato:', err)
      error.value = err.message || 'Error descargando contrato'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Descargar recibo de pago en PDF
   * @param {Number} prestamoId - ID del préstamo
   * @param {Number} pagoId - ID del pago
   * @returns {Promise<Blob>} Archivo PDF del recibo
   */
  const descargarReciboPago = async (prestamoId, pagoId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('🧾 Descargando recibo de pago:', { prestamoId, pagoId })
      
      const response = await fetch(`${useRuntimeConfig().public.apiBase}/prestamos/${prestamoId}/recibo-pago/${pagoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${useAuth().getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error descargando el recibo')
      }
      
      const blob = await response.blob()
      
      // Crear URL del blob y descargar automáticamente
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `recibo-pago-${pagoId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log(' Recibo descargado exitosamente')
      return blob
    } catch (err) {
      console.error(' Error descargando recibo:', err)
      error.value = err.message || 'Error descargando recibo'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== SOLICITUDES =====

  /**
   * Obtener categorías/tipos de artículos disponibles
   * @returns {Promise<Object>} Lista de categorías de artículos
   */
  const obtenerCategoriasArticulos = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Obteniendo categorías de artículos...')
      
      const response = await api('/solicitudes/categorias', {
        method: 'GET'
      })
      
      console.log(' Categorías obtenidas:', response)
      return response
    } catch (err) {
      console.error(' Error obteniendo categorías:', err)
      error.value = err.message || 'Error obteniendo categorías'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener mis solicitudes de empéño
   * @param {Object} filtros - Filtros de búsqueda
   * @param {String} filtros.estado - Filtrar por estado (Pendiente, Aprobada, Rechazada)
   * @param {Number} filtros.limite - Número máximo de resultados
   * @param {Number} filtros.pagina - Página actual
   * @returns {Promise<Object>} Lista de solicitudes
   */
  const obtenerMisSolicitudes = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Obteniendo mis solicitudes:', filtros)
      
      const params = new URLSearchParams()
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.limite) params.append('limite', filtros.limite)
      if (filtros.pagina) params.append('pagina', filtros.pagina)
      
      const url = `/solicitudes${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await api(url, {
        method: 'GET'
      })
      
      console.log(' Solicitudes obtenidas:', response)
      return response
    } catch (err) {
      console.error(' Error obteniendo solicitudes:', err)
      error.value = err.message || 'Error obteniendo solicitudes'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear nueva solicitud de empéño
   * @param {Object} datosSolicitud - Datos de la solicitud
   * @returns {Promise<Object>} Solicitud creada
   */
  const crearSolicitudEmpeno = async (datosSolicitud) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Creando solicitud de empéño:', datosSolicitud)
      
      // Preparar FormData para envío de archivos
      const formData = new FormData()
      
      // Agregar datos básicos
      for (const [key, value] of Object.entries(datosSolicitud)) {
        if (key === 'fotos' || key === 'documentoTecnico') {
          continue // Los archivos se manejan por separado
        }
        
        if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      }
      
      // Agregar fotos
      if (datosSolicitud.fotos && Array.isArray(datosSolicitud.fotos)) {
        datosSolicitud.fotos.forEach((foto, index) => {
          formData.append(`fotos`, foto)
        })
      }
      
      // Agregar documento técnico
      if (datosSolicitud.documentoTecnico) {
        formData.append('documentoTecnico', datosSolicitud.documentoTecnico)
      }
      
      const response = await api('/solicitudes', {
        method: 'POST',
        body: formData,
        headers: {
          // No incluir Content-Type, el browser lo manejará automáticamente para FormData
          'Authorization': `Bearer ${useAuth().getToken()}`
        }
      })
      
      console.log(' Solicitud creada:', response)
      return response
    } catch (err) {
      console.error(' Error creando solicitud:', err)
      error.value = err.message || 'Error creando solicitud'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener detalle de una solicitud específica
   * @param {Number} solicitudId - ID de la solicitud
   * @returns {Promise<Object>} Detalle de la solicitud
   */
  const obtenerDetalleSolicitud = async (solicitudId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Obteniendo detalle de solicitud:', solicitudId)
      
      const response = await api(`/solicitudes/${solicitudId}`, {
        method: 'GET'
      })
      
      console.log(' Detalle de solicitud obtenido:', response)
      return response
    } catch (err) {
      console.error(' Error obteniendo detalle de solicitud:', err)
      error.value = err.message || 'Error obteniendo detalle de solicitud'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancelar una solicitud pendiente
   * @param {Number} solicitudId - ID de la solicitud
   * @param {String} motivo - Motivo de cancelación (opcional)
   * @returns {Promise<Object>} Resultado de la cancelación
   */
  const cancelarSolicitud = async (solicitudId, motivo = '') => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Cancelando solicitud:', solicitudId, motivo)
      
      const response = await api(`/solicitudes/${solicitudId}/cancelar`, {
        method: 'PUT',
        body: { motivo }
      })
      
      console.log(' Solicitud cancelada:', response)
      return response
    } catch (err) {
      console.error(' Error cancelando solicitud:', err)
      error.value = err.message || 'Error cancelando solicitud'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Aceptar oferta de una solicitud aprobada
   * @param {Number} solicitudId - ID de la solicitud
   * @param {Object} datosAceptacion - Datos de aceptación
   * @returns {Promise<Object>} Resultado de la aceptación
   */
const aceptarOferta = async (solicitudId, datosAceptacion = {}) => {
  try {
    loading.value = true
    error.value = null
    
    console.log(' Aceptando oferta de solicitud:', solicitudId, datosAceptacion)
    
    const response = await api(`/solicitudes/${solicitudId}/aceptar-oferta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosAceptacion)
    })
    
    console.log(' Oferta aceptada:', response)
    return response
  } catch (err) {
    console.error(' Error aceptando oferta:', err)
    error.value = err.message || 'Error aceptando oferta'
    throw err
  } finally {
    loading.value = false
  }
}

  // ===== UTILIDADES =====

  /**
   * Formatear moneda en quetzales
   * @param {Number} amount - Cantidad a formatear
   * @returns {String} Cantidad formateada
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  /**
   * Formatear fecha
   * @param {String|Date} date - Fecha a formatear
   * @param {Object} options - Opciones de formato
   * @returns {String} Fecha formateada
   */
  const formatDate = (date, options = {}) => {
    if (!date) return 'N/A'
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
    
    return new Date(date).toLocaleDateString('es-GT', { ...defaultOptions, ...options })
  }

  /**
   * Calcular días entre fechas
   * @param {String|Date} fechaInicio - Fecha de inicio
   * @param {String|Date} fechaFin - Fecha de fin
   * @returns {Number} Días de diferencia
   */
  const calcularDiasEntre = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    const diferencia = fin - inicio
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
  }

  /**
   * Validar si una fecha está vencida
   * @param {String|Date} fecha - Fecha a validar
   * @returns {Boolean} True si está vencida
   */
  const estaVencido = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date()
  }

  // ===== ESTADO Y RETORNO =====
  return {
    // Estado
    loading: readonly(loading),
    error: readonly(error),
    
    // Métodos de préstamos
    obtenerMisPrestamos,
    obtenerEstadisticas,
    obtenerDetallePrestamo,
    obtenerHistorial,
    obtenerSimulacion,
    procesarPagoPrestamo,
    renovarPrestamo,
    descargarContrato,
    descargarReciboPago,
    
    // Métodos de solicitudes
    obtenerCategoriasArticulos,
    obtenerMisSolicitudes,
    crearSolicitudEmpeno,
    obtenerDetalleSolicitud,
    cancelarSolicitud,
    aceptarOferta,
    
    // Utilidades
    formatCurrency,
    formatDate,
    calcularDiasEntre,
    estaVencido
  }
}