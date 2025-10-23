

export const useDocumentos = () => {
  const { api } = useApi()
  const config = useRuntimeConfig()

  const loading = ref(false)
  const error = ref(null)

  /**
   * Subir documentos DPI del usuario
   * @param {Number} usuarioId - ID del usuario
   * @param {Object} archivos - { dpiFrontal, dpiTrasero }
   * @returns {Promise<Object>} Respuesta del servidor
   */
  const subirDocumentosDPI = async (usuarioId, archivos) => {
    try {
      loading.value = true
      error.value = null

      // Validar que al menos haya un archivo
      if (!archivos.dpiFrontal && !archivos.dpiTrasero) {
        throw new Error('Debes proporcionar al menos una foto del DPI')
      }

      // Crear FormData
      const formData = new FormData()

      if (archivos.dpiFrontal) {
        // Validar archivo frontal
        if (!validarArchivo(archivos.dpiFrontal)) {
          throw new Error('El archivo del DPI frontal no es válido')
        }
        formData.append('dpiFrontal', archivos.dpiFrontal)
      }

      if (archivos.dpiTrasero) {
        // Validar archivo trasero
        if (!validarArchivo(archivos.dpiTrasero)) {
          throw new Error('El archivo del DPI trasero no es válido')
        }
        formData.append('dpiTrasero', archivos.dpiTrasero)
      }

      console.log(' Subiendo documentos DPI para usuario:', usuarioId)

      const response = await api(`/usuarios/${usuarioId}/documentos-identificacion`, {
        method: 'POST',
        body: formData
      })

      if (response.success) {
        console.log(' Documentos DPI subidos exitosamente')
        return response
      } else {
        throw new Error(response.message || 'Error al subir documentos')
      }

    } catch (err) {
      console.error(' Error subiendo documentos DPI:', err)
      error.value = err.message || 'Error al subir documentos'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener documentos DPI de un usuario
   * @param {Number} usuarioId - ID del usuario
   * @returns {Promise<Object>} Documentos del usuario
   */
  const obtenerDocumentosDPI = async (usuarioId) => {
    try {
      loading.value = true
      error.value = null

      console.log(' Obteniendo documentos DPI de usuario:', usuarioId)

      const response = await api(`/usuarios/${usuarioId}/documentos-identificacion`)

      if (response.success) {
        console.log(' Documentos DPI obtenidos:', response.data.totalDocumentos)
        return response.data
      } else {
        throw new Error(response.message || 'Error al obtener documentos')
      }

    } catch (err) {
      console.error(' Error obteniendo documentos DPI:', err)
      error.value = err.message || 'Error al obtener documentos'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar un documento DPI
   * @param {Number} usuarioId - ID del usuario
   * @param {Number} documentoId - ID del documento
   * @returns {Promise<Object>} Respuesta del servidor
   */
  const eliminarDocumentoDPI = async (usuarioId, documentoId) => {
    try {
      loading.value = true
      error.value = null

      console.log(' Eliminando documento DPI:', documentoId)

      const response = await api(
        `/usuarios/${usuarioId}/documentos-identificacion/${documentoId}`,
        { method: 'DELETE' }
      )

      if (response.success) {
        console.log(' Documento DPI eliminado exitosamente')
        return response
      } else {
        throw new Error(response.message || 'Error al eliminar documento')
      }

    } catch (err) {
      console.error(' Error eliminando documento DPI:', err)
      error.value = err.message || 'Error al eliminar documento'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Validar archivo antes de subirlo
   * @param {File} archivo - Archivo a validar
   * @returns {Boolean} True si es válido
   */
  const validarArchivo = (archivo) => {
    if (!archivo) return false

    // Validar tipo MIME
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!tiposPermitidos.includes(archivo.type)) {
      error.value = 'Tipo de archivo no permitido. Usa JPG, PNG o WEBP'
      return false
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024
    if (archivo.size > maxSize) {
      error.value = 'El archivo no puede exceder 10MB'
      return false
    }

    // Validar nombre
    if (archivo.name.length > 255) {
      error.value = 'El nombre del archivo es muy largo'
      return false
    }

    return true
  }

  /**
   * Crear previsualización de imagen
   * @param {File} archivo - Archivo de imagen
   * @returns {Promise<String>} URL de la previsualización
   */
  const crearPrevisualizacion = (archivo) => {
    return new Promise((resolve, reject) => {
      if (!archivo) {
        reject(new Error('No se proporcionó archivo'))
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        resolve(e.target.result)
      }

      reader.onerror = (error) => {
        reject(error)
      }

      reader.readAsDataURL(archivo)
    })
  }

  /**
   * Obtener URL completa de un documento
   * @param {String} rutaRelativa - Ruta relativa del documento
   * @returns {String} URL completa
   */
  const obtenerUrlDocumento = (rutaRelativa) => {
    if (!rutaRelativa) return ''

    const baseURL = config.public.apiBase || 'http://localhost:3001'
    
    // Si la ruta ya es completa, devolverla tal cual
    if (rutaRelativa.startsWith('http')) {
      return rutaRelativa
    }

    // Si la ruta no empieza con /, agregarla
    const ruta = rutaRelativa.startsWith('/') ? rutaRelativa : `/${rutaRelativa}`
    
    return `${baseURL}${ruta}`
  }

  /**
   * Formatear tamaño de archivo
   * @param {Number} bytes - Tamaño en bytes
   * @returns {String} Tamaño formateado
   */
  const formatearTamano = (bytes) => {
    if (!bytes) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * Verificar si un usuario tiene documentos DPI
   * @param {Number} usuarioId - ID del usuario
   * @returns {Promise<Boolean>} True si tiene documentos
   */
  const tieneDocumentosDPI = async (usuarioId) => {
    try {
      const data = await obtenerDocumentosDPI(usuarioId)
      return data.tieneDocumentos
    } catch (err) {
      console.error('Error verificando documentos:', err)
      return false
    }
  }

  /**
   * Descargar documento
   * @param {String} rutaArchivo - Ruta del archivo
   * @param {String} nombreArchivo - Nombre del archivo
   */
  const descargarDocumento = (rutaArchivo, nombreArchivo) => {
    const url = obtenerUrlDocumento(rutaArchivo)
    
    // Crear elemento <a> temporal para descargar
    const link = document.createElement('a')
    link.href = url
    link.download = nombreArchivo || 'documento.jpg'
    link.target = '_blank'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Abrir documento en nueva pestaña
   * @param {String} rutaArchivo - Ruta del archivo
   */
  const abrirDocumento = (rutaArchivo) => {
    const url = obtenerUrlDocumento(rutaArchivo)
    window.open(url, '_blank')
  }

  /**
   * Comprimir imagen antes de subirla (opcional)
   * @param {File} archivo - Archivo de imagen
   * @param {Number} maxWidth - Ancho máximo
   * @param {Number} quality - Calidad (0-1)
   * @returns {Promise<Blob>} Imagen comprimida
   */
  const comprimirImagen = (archivo, maxWidth = 1920, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calcular nuevas dimensiones manteniendo aspect ratio
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => resolve(blob),
            archivo.type,
            quality
          )
        }

        img.onerror = reject
        img.src = e.target.result
      }

      reader.onerror = reject
      reader.readAsDataURL(archivo)
    })
  }

  return {
    // Estado
    loading,
    error,

    // Métodos principales
    subirDocumentosDPI,
    obtenerDocumentosDPI,
    eliminarDocumentoDPI,
    tieneDocumentosDPI,

    // Utilidades
    validarArchivo,
    crearPrevisualizacion,
    obtenerUrlDocumento,
    formatearTamano,
    descargarDocumento,
    abrirDocumento,
    comprimirImagen
  }
}