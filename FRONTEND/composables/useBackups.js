import { ref } from 'vue'

export const useBackups = () => {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Función auxiliar para hacer peticiones a la API
   */
  const api = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem('authToken')
      
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      }

      const response = await fetch(`${process.env.API_URL || 'http://localhost:3000'}/api/admin/backups${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error en la petición')
      }

      return await response.json()
    } catch (err) {
      console.error('Error en petición API:', err)
      throw err
    }
  }

  // ===== OPERACIONES CRUD =====

  /**
   * Obtener todos los respaldos
   * @returns {Promise<Object>} Lista de respaldos y estadísticas
   */
  const obtenerRespaldos = async () => {
    try {
      loading.value = true
      error.value = null
      console.log(' Obteniendo lista de respaldos...')
      
      const response = await api('', {
        method: 'GET'
      })
      
      if (response.success) {
        console.log(' Respaldos obtenidos:', response.data.backups.length, 'respaldos')
        return response.data
      } else {
        throw new Error(response.message || 'Error obteniendo respaldos')
      }
    } catch (err) {
      console.error(' Error obteniendo respaldos:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear un nuevo respaldo
   * @param {String} tipo - Tipo de respaldo: 'database', 'files', 'full'
   * @returns {Promise<Object>} Información del respaldo creado
   */
  const crearRespaldo = async (tipo = 'full') => {
    try {
      loading.value = true
      error.value = null
      console.log(` Creando respaldo de tipo: ${tipo}...`)
      
      const response = await api('', {
        method: 'POST',
        body: JSON.stringify({ tipo })
      })
      
      if (response.success) {
        console.log(' Respaldo creado exitosamente')
        return response.data.backup
      } else {
        throw new Error(response.message || 'Error creando respaldo')
      }
    } catch (err) {
      console.error(' Error creando respaldo:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener detalles de un respaldo específico
   * @param {String} id - ID del respaldo
   * @returns {Promise<Object>} Detalles del respaldo
   */
  const obtenerDetalleRespaldo = async (id) => {
    try {
      loading.value = true
      error.value = null
      console.log(` Obteniendo detalles del respaldo: ${id}`)
      
      const response = await api(`/${id}`, {
        method: 'GET'
      })
      
      if (response.success) {
        console.log(' Detalles obtenidos')
        return response.data.backup
      } else {
        throw new Error(response.message || 'Error obteniendo detalles')
      }
    } catch (err) {
      console.error(' Error obteniendo detalles:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Descargar un respaldo
   * @param {String} id - ID del respaldo
   * @param {String} nombre - Nombre del archivo para la descarga
   */
  const descargarRespaldo = async (id, nombre) => {
    try {
      loading.value = true
      error.value = null
      console.log(`⬇ Descargando respaldo: ${id}`)
      
      const token = localStorage.getItem('authToken')
      const url = `${process.env.API_URL || 'http://localhost:3000'}/api/admin/backups/${id}/download`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      
      if (!response.ok) {
        throw new Error('Error descargando respaldo')
      }
      
      // Crear blob y descargar
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = nombre || id
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      console.log(' Descarga iniciada')
      return true
      
    } catch (err) {
      console.error(' Error descargando respaldo:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar un respaldo
   * @param {String} id - ID del respaldo a eliminar
   * @returns {Promise<Boolean>} True si se eliminó correctamente
   */
  const eliminarRespaldo = async (id) => {
    try {
      loading.value = true
      error.value = null
      console.log(` Eliminando respaldo: ${id}`)
      
      const response = await api(`/${id}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        console.log(' Respaldo eliminado exitosamente')
        return true
      } else {
        throw new Error(response.message || 'Error eliminando respaldo')
      }
    } catch (err) {
      console.error(' Error eliminando respaldo:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpiar respaldos antiguos
   * @param {Number} diasRetencion - Días de retención (por defecto 30)
   * @returns {Promise<Object>} Número de respaldos eliminados
   */
  const limpiarRespaldosAntiguos = async (diasRetencion = 30) => {
    try {
      loading.value = true
      error.value = null
      console.log(`🧹 Limpiando respaldos con más de ${diasRetencion} días...`)
      
      const response = await api('/cleanup', {
        method: 'POST',
        body: JSON.stringify({ diasRetencion })
      })
      
      if (response.success) {
        console.log(` ${response.data.eliminados} respaldos eliminados`)
        return response.data
      } else {
        throw new Error(response.message || 'Error limpiando respaldos')
      }
    } catch (err) {
      console.error(' Error limpiando respaldos:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== UTILIDADES =====

  /**
   * Formatear fecha en formato legible
   * @param {String|Date} fecha - Fecha a formatear
   * @returns {String} Fecha formateada
   */
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Formatear hora en formato legible
   * @param {String|Date} fecha - Fecha a formatear
   * @returns {String} Hora formateada
   */
  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Obtener tiempo relativo (ej: "hace 2 horas")
   * @param {String|Date} fecha - Fecha a procesar
   * @returns {String} Tiempo relativo
   */
  const obtenerTiempoRelativo = (fecha) => {
    const ahora = new Date()
    const pasado = new Date(fecha)
    const diferencia = ahora - pasado
    
    const segundos = Math.floor(diferencia / 1000)
    const minutos = Math.floor(segundos / 60)
    const horas = Math.floor(minutos / 60)
    const dias = Math.floor(horas / 24)
    const meses = Math.floor(dias / 30)
    const años = Math.floor(dias / 365)
    
    if (años > 0) return `Hace ${años} ${años === 1 ? 'año' : 'años'}`
    if (meses > 0) return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`
    if (dias > 0) return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`
    if (horas > 0) return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`
    if (minutos > 0) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
    return 'Hace unos momentos'
  }

  /**
   * Calcular porcentaje de uso del espacio
   * @param {Number} usado - Espacio usado en bytes
   * @param {Number} total - Espacio total en bytes
   * @returns {Number} Porcentaje de uso
   */
  const calcularPorcentajeUso = (usado, total) => {
    if (total === 0) return 0
    return Math.round((usado / total) * 100)
  }

  /**
   * Validar espacio disponible antes de crear respaldo
   * @param {Number} tamañoEstimado - Tamaño estimado del respaldo en bytes
   * @returns {Boolean} True si hay espacio suficiente
   */
  const validarEspacioDisponible = (tamañoEstimado) => {
    // Aquí podrías implementar lógica para verificar espacio en disco
    // Por ahora retorna true
    return true
  }

  return {
    // Estado
    loading,
    error,
    
    // Operaciones CRUD
    obtenerRespaldos,
    crearRespaldo,
    obtenerDetalleRespaldo,
    descargarRespaldo,
    eliminarRespaldo,
    limpiarRespaldosAntiguos,
    
    // Utilidades
    formatearFecha,
    formatearHora,
    obtenerTiempoRelativo,
    calcularPorcentajeUso,
    validarEspacioDisponible
  }
}