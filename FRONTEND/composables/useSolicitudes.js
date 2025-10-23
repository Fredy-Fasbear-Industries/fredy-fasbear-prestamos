// FRONTEND/composables/useSolicitudes.js
import { ref } from 'vue'
import { useApi } from './useApi'
import { useAuth } from './useAuth'

export const useSolicitudes = () => {
  const { api } = useApi()
  const { getToken } = useAuth()
  
  // ===== ESTADO REACTIVO =====
  const loading = ref(false)
  const error = ref(null)

  // ===== FUNCIONES PRINCIPALES =====

  /**
   * Aceptar oferta de préstamo - CORREGIDA
   * @param {Number} solicitudId - ID de la solicitud
   * @param {Object} datosAceptacion - Datos para la aceptación
   * @returns {Object} Respuesta del servidor
   */
  const aceptarOferta = async (solicitudId, datosAceptacion = {}) => {
    try {
      loading.value = true
      error.value = null

      console.log(' Iniciando aceptación de oferta:', { solicitudId, datosPresentes: !!datosAceptacion.datosUsuario, confirmacion: datosAceptacion.confirmarAceptacion })

      // Validaciones básicas
      if (!solicitudId) {
        throw new Error('ID de solicitud es requerido')
      }

      if (!datosAceptacion.datosUsuario) {
        throw new Error('Los datos del usuario son requeridos')
      }

      if (!datosAceptacion.confirmarAceptacion) {
        throw new Error('Debe confirmar la aceptación de la oferta')
      }

      // Validar datos obligatorios del usuario
      const { datosUsuario } = datosAceptacion
      const camposRequeridos = ['nombre', 'apellido', 'cedula', 'telefono', 'email', 'direccion']
      
      for (const campo of camposRequeridos) {
        if (!datosUsuario[campo] || datosUsuario[campo].trim() === '') {
          throw new Error(`El campo ${campo} es obligatorio`)
        }
      }

      // Preparar payload
      const payload = {
        datosUsuario: {
          nombre: datosUsuario.nombre.trim(),
          apellido: datosUsuario.apellido.trim(),
          cedula: datosUsuario.cedula.trim(),
          telefono: datosUsuario.telefono.trim(),
          email: datosUsuario.email.trim(),
          direccion: datosUsuario.direccion.trim()
        },
        confirmarAceptacion: true,
        timestamp: new Date().toISOString()
      }

      console.log(' Enviando datos de aceptación:', { solicitudId, datosUsuario: 'presente', confirmarAceptacion: payload.confirmarAceptacion })

      // Realizar petición al backend
      const response = await api(`/solicitudes/${solicitudId}/aceptar-oferta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      })

      console.log(' Respuesta del servidor:', { success: response.success, codigo: response.codigo, message: response.message })

      if (!response.success) {
        // Manejo específico de códigos de error
        switch (response.codigo) {
          case 'CONFIRMACION_REQUERIDA':
            throw new Error('Debe confirmar que desea aceptar la oferta')
          
          case 'DATOS_INCOMPLETOS':
            throw new Error('Complete todos los campos obligatorios antes de continuar')
          
          case 'SOLICITUD_NO_ENCONTRADA':
            throw new Error('La solicitud no fue encontrada o no tienes permisos para acceder a ella')
          
          case 'ESTADO_INCORRECTO':
            throw new Error(`No se puede aceptar esta solicitud. Estado actual: ${response.estadoActual || 'desconocido'}`)
          
          case 'SIN_AVALUO':
            throw new Error('La solicitud no tiene un avalúo asociado. Contacta al evaluador.')
          
          case 'PRESTAMO_EXISTENTE':
            throw new Error('Ya existe un préstamo activo para esta solicitud')
          
          case 'DPI_INCOMPLETO':
            throw new Error('Debe subir ambas fotos del DPI antes de aceptar la oferta')
          
          case 'PRESTAMO_DUPLICADO':
            throw new Error('Ya existe un préstamo para esta solicitud')
          
          default:
            throw new Error(response.message || 'Error desconocido al procesar la aceptación')
        }
      }

      console.log(' Oferta aceptada exitosamente')

      return {
        success: true,
        message: response.message || '¡Préstamo aceptado exitosamente!',
        data: response.data,
        codigo: response.codigo
      }

    } catch (err) {
      console.error(' Error en aceptarOferta:', err)
      
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al aceptar la oferta',
        error: err
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener detalle de solicitud - MEJORADA
   * @param {Number} solicitudId - ID de la solicitud
   * @returns {Object} Datos de la solicitud
   */
  const obtenerDetalleSolicitud = async (solicitudId) => {
    try {
      loading.value = true
      error.value = null

      console.log(' Obteniendo detalle de solicitud:', solicitudId)

      if (!solicitudId) {
        throw new Error('ID de solicitud es requerido')
      }

      const response = await api(`/solicitudes/${solicitudId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener la solicitud')
      }

      console.log(' Detalle de solicitud obtenido:', { numero: response.data.numero, estado: response.data.estado })

      return {
        success: true,
        data: response.data
      }

    } catch (err) {
      console.error(' Error obteniendo detalle de solicitud:', err)
      
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al obtener la solicitud',
        error: err
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Listar solicitudes del usuario
   * @param {Object} filtros - Filtros para la consulta
   * @returns {Object} Lista de solicitudes
   */
  const obtenerSolicitudes = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null

      console.log(' Obteniendo lista de solicitudes con filtros:', filtros)

      // Construir query params
      const queryParams = new URLSearchParams()
      
      if (filtros.estado) {
        queryParams.append('estado', filtros.estado)
      }
      if (filtros.page) {
        queryParams.append('page', filtros.page)
      }
      if (filtros.limit) {
        queryParams.append('limit', filtros.limit)
      }

      const queryString = queryParams.toString()
      const endpoint = `/solicitudes${queryString ? `?${queryString}` : ''}`

      const response = await api(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener las solicitudes')
      }

      console.log(' Lista de solicitudes obtenida:', { total: response.data.pagination?.total || 0, solicitudes: response.data.solicitudes?.length || 0 })

      return {
        success: true,
        data: response.data
      }

    } catch (err) {
      console.error(' Error obteniendo solicitudes:', err)
      
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al obtener las solicitudes',
        error: err
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear nueva solicitud de empeño
   * @param {Object} datosSolicitud - Datos de la solicitud
   * @returns {Object} Respuesta del servidor
   */
  const crearSolicitudEmpeno = async (datosSolicitud) => {
    try {
      loading.value = true
      error.value = null

      console.log(' Creando nueva solicitud de empeño')

      // Validar datos básicos
      const validacion = validarDatosSolicitud(datosSolicitud)
      if (!validacion.esValido) {
        throw new Error(validacion.errores.join(', '))
      }

      // Preparar FormData para archivos
      const formData = new FormData()
      
      // Agregar datos básicos
      formData.append('tipoArticulo', datosSolicitud.tipoArticulo)
      formData.append('nombreArticulo', datosSolicitud.nombreArticulo)
      formData.append('descripcion', datosSolicitud.descripcion)
      formData.append('valorEstimado', datosSolicitud.valorEstimado)
      formData.append('montoSolicitado', datosSolicitud.montoSolicitado)
      formData.append('plazoMeses', datosSolicitud.plazoMeses)
      formData.append('modalidadPago', datosSolicitud.modalidadPago)
      formData.append('aceptaTerminos', datosSolicitud.aceptaTerminos)

      // Agregar fotos
      if (datosSolicitud.fotos && datosSolicitud.fotos.length > 0) {
        datosSolicitud.fotos.forEach((foto, index) => {
          formData.append(`fotos`, foto)
        })
      }

      // Agregar documentos técnicos si existen
      if (datosSolicitud.documentoTecnico) {
        formData.append('documentoTecnico', datosSolicitud.documentoTecnico)
      }

      const response = await api('/solicitudes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
          // No incluir Content-Type para FormData
        },
        body: formData
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al crear la solicitud')
      }

      console.log(' Solicitud creada exitosamente:', response.data.numero)

      return {
        success: true,
        data: response.data,
        message: response.message || 'Solicitud creada exitosamente'
      }

    } catch (err) {
      console.error(' Error creando solicitud:', err)
      
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al crear la solicitud',
        error: err
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancelar solicitud
   * @param {Number} solicitudId - ID de la solicitud
   * @param {String} motivo - Motivo de cancelación
   * @returns {Object} Respuesta del servidor
   */
  const cancelarSolicitud = async (solicitudId, motivo = '') => {
    try {
      loading.value = true
      error.value = null

      console.log(' Cancelando solicitud:', solicitudId)

      const response = await api(`/solicitudes/${solicitudId}/cancelar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ motivo })
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al cancelar la solicitud')
      }

      console.log(' Solicitud cancelada exitosamente')

      return {
        success: true,
        message: response.message || 'Solicitud cancelada exitosamente'
      }

    } catch (err) {
      console.error(' Error cancelando solicitud:', err)
      
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al cancelar la solicitud',
        error: err
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Rechazar oferta (para futuras implementaciones)
   * @param {Number} solicitudId - ID de la solicitud
   * @param {String} motivo - Motivo del rechazo
   * @returns {Object} Respuesta del servidor
   */
  const rechazarOferta = async (solicitudId, motivo = '') => {
    try {
      loading.value = true
      error.value = null

      console.log(' Rechazando oferta:', solicitudId)

      const response = await api(`/solicitudes/${solicitudId}/rechazar-oferta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ motivo })
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al rechazar la oferta')
      }

      console.log(' Oferta rechazada exitosamente')

      return {
        success: true,
        message: response.message || 'Oferta rechazada exitosamente'
      }

    } catch (err) {
      console.error(' Error rechazando oferta:', err)
      
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al rechazar la oferta',
        error: err
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener categorías de artículos
   * @returns {Array} Lista de categorías
   */
  const obtenerCategoriasArticulos = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await api('/solicitudes/categorias', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener las categorías')
      }

      return {
        success: true,
        data: response.data
      }

    } catch (err) {
      console.error(' Error obteniendo categorías:', err)
      
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al obtener las categorías',
        error: err
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener archivos adjuntos de una solicitud
   * @param {Number} solicitudId - ID de la solicitud
   * @returns {Object} Lista de archivos
   */
  const obtenerArchivosAdjuntos = async (solicitudId) => {
    try {
      loading.value = true
      error.value = null

      const response = await api(`/solicitudes/${solicitudId}/archivos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener los archivos')
      }

      return {
        success: true,
        data: response.data
      }

    } catch (err) {
      console.error(' Error obteniendo archivos:', err)
      
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al obtener los archivos',
        error: err
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Descargar archivo adjunto
   * @param {Number} solicitudId - ID de la solicitud
   * @param {Number} archivoId - ID del archivo
   * @returns {String} URL de descarga
   */
  const descargarArchivo = async (solicitudId, archivoId) => {
    try {
      const config = useRuntimeConfig()
      const token = getToken()
      
      // Construir URL de descarga con token de autenticación
      const url = `${config.public.apiBase}/solicitudes/${solicitudId}/archivos/${archivoId}/descargar?token=${token}`
      
      return {
        success: true,
        url
      }

    } catch (err) {
      console.error(' Error construyendo URL de descarga:', err)
      
      return {
        success: false,
        message: 'Error al construir la URL de descarga',
        error: err
      }
    }
  }

  /**
   * Obtener estadísticas de solicitudes
   * @returns {Object} Estadísticas
   */
  const obtenerEstadisticasSolicitudes = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await api('/solicitudes/estadisticas', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener las estadísticas')
      }

      return {
        success: true,
        data: response.data
      }

    } catch (err) {
      console.error(' Error obteniendo estadísticas:', err)
      
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al obtener las estadísticas',
        error: err
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener historial de estados de una solicitud
   * @param {Number} solicitudId - ID de la solicitud
   * @returns {Object} Historial
   */
  const obtenerHistorialEstados = async (solicitudId) => {
    try {
      loading.value = true
      error.value = null

      const response = await api(`/solicitudes/${solicitudId}/historial`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener el historial')
      }

      return {
        success: true,
        data: response.data
      }

    } catch (err) {
      console.error(' Error obteniendo historial:', err)
      
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al obtener el historial',
        error: err
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Validar datos de solicitud
   * @param {Object} datos - Datos a validar
   * @returns {Object} Resultado de validación
   */
  const validarDatosSolicitud = (datos) => {
    const errores = []

    if (!datos.tipoArticulo) {
      errores.push('Debe seleccionar un tipo de artículo')
    }

    if (!datos.nombreArticulo || datos.nombreArticulo.trim() === '') {
      errores.push('Debe especificar el nombre del artículo')
    }

    if (!datos.descripcion || datos.descripcion.trim() === '') {
      errores.push('Debe proporcionar una descripción del artículo')
    }

    if (!datos.valorEstimado || datos.valorEstimado <= 0) {
      errores.push('Debe especificar un valor estimado válido')
    }

    if (!datos.montoSolicitado || datos.montoSolicitado <= 0) {
      errores.push('Debe especificar un monto solicitado válido')
    }

    if (!datos.plazoMeses || datos.plazoMeses < 1 || datos.plazoMeses > 24) {
      errores.push('El plazo debe estar entre 1 y 24 meses')
    }

    if (!datos.modalidadPago) {
      errores.push('Debe seleccionar una modalidad de pago')
    }

    if (!datos.fotos || datos.fotos.length === 0) {
      errores.push('Debe subir al menos una foto del artículo')
    }

    if (!datos.aceptaTerminos) {
      errores.push('Debe aceptar los términos y condiciones')
    }

    return {
      esValido: errores.length === 0,
      errores
    }
  }

  /**
   * Formatear estado de solicitud para mostrar al usuario
   * @param {String} estado - Estado de la solicitud
   * @returns {String} Estado formateado
   */
  const formatearEstado = (estado) => {
    const estados = {
      'Pendiente': 'Pendiente de Revisión',
      'En_Revision': 'En Revisión',
      'Evaluando': 'En Evaluación',
      'Aprobada': 'Aprobada',
      'Rechazada': 'Rechazada',
      'Completada': 'Completada',
      'Cancelada': 'Cancelada'
    }
    return estados[estado] || estado
  }

  /**
   * Obtener color del estado para UI
   * @param {String} estado - Estado de la solicitud
   * @returns {String} Clase CSS o color
   */
  const obtenerColorEstado = (estado) => {
    const colores = {
      'Pendiente': 'warning',
      'En_Revision': 'info',
      'Evaluando': 'info',
      'Aprobada': 'success',
      'Rechazada': 'danger',
      'Completada': 'success',
      'Cancelada': 'secondary'
    }
    return colores[estado] || 'secondary'
  }

  // ===== RETURN DEL COMPOSABLE =====
  return {
    // Estados reactivos
    loading,
    error,

    // Funciones principales
    obtenerSolicitudes,
    obtenerCategoriasArticulos,
    crearSolicitudEmpeno,
    obtenerDetalleSolicitud,
    cancelarSolicitud,
    aceptarOferta, //  CORREGIDA
    rechazarOferta,

    // Funciones para archivos adjuntos
    obtenerArchivosAdjuntos,
    descargarArchivo,

    // Funciones adicionales
    obtenerEstadisticasSolicitudes,
    obtenerHistorialEstados,

    // Funciones utilitarias
    validarDatosSolicitud,
    formatearEstado,
    obtenerColorEstado
  }
}