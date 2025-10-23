export const useSolicitudDetalle = () => {
  const config = useRuntimeConfig()
  const { obtenerDetalleSolicitud, obtenerArchivosAdjuntos } = useSolicitudes()

  const solicitud = ref(null)
  const archivos = ref([])
  const loading = ref(true)
  const loadingArchivos = ref(false)
  const error = ref(null)

  const tieneInformacionFinanciera = computed(() => {
    return solicitud.value && solicitud.value.prestamo && (
      solicitud.value.prestamo.montoSolicitado || 
      solicitud.value.prestamo.tasaInteres || 
      solicitud.value.prestamo.modalidadPago || 
      solicitud.value.prestamo.plazoMeses
    )
  })

  const planPagosCalculado = computed(() => {
    if (!solicitud.value?.prestamo?.planPagos || !Array.isArray(solicitud.value.prestamo.planPagos)) {
      return []
    }

    return solicitud.value.prestamo.planPagos.map(pago => ({
      numero: pago.numeroPago,
      fecha: new Date(pago.fechaPago),
      capital: pago.capital,
      interes: pago.interes,
      totalCuota: pago.montoPago,
      saldoPendiente: pago.saldoPendiente,
      comision: pago.comision || 0
    }))
  })

  const montoPorPago = computed(() => {
    return solicitud.value?.prestamo?.resumenFinanciero?.montoPorPago || 0
  })

  const frequenciaPago = computed(() => {
    if (!solicitud.value?.prestamo?.modalidadPago) return ''
    
    const frecuencias = {
      'mensual': 'mes',
      'quincenal': '15 días',
      'semanal': 'semana',
      'contado': 'pago único'
    }
    
    return frecuencias[solicitud.value.prestamo.modalidadPago] || ''
  })

  const totalIntereses = computed(() => {
    return solicitud.value?.prestamo?.resumenFinanciero?.interesTotal || 0
  })

  const fechaVencimientoCalculada = computed(() => {
    if (!solicitud.value?.fechaSolicitud || !solicitud.value?.prestamo?.plazoMeses) return null
    
    const fechaInicio = new Date(solicitud.value.fechaSolicitud)
    fechaInicio.setMonth(fechaInicio.getMonth() + parseInt(solicitud.value.prestamo.plazoMeses))
    
    return fechaInicio
  })

  const construirUrlArchivo = (rutaArchivo) => {
    if (!rutaArchivo) return '/images/placeholder.jpg'
    if (rutaArchivo.startsWith('http')) return rutaArchivo
    
    const baseUrl = config.public.apiBase.replace('/api', '')
    return `${baseUrl}${rutaArchivo}`
  }

  const obtenerFotos = (documentos) => {
    if (!documentos || !Array.isArray(documentos)) return []
    return documentos.filter(doc => doc.tipo_mime && doc.tipo_mime.startsWith('image/'))
  }

  const obtenerDocumentos = (documentos) => {
    if (!documentos || !Array.isArray(documentos)) return []
    return documentos.filter(doc => doc.tipo_mime && !doc.tipo_mime.startsWith('image/'))
  }

  const cargarDetalle = async (solicitudId) => {
    try {
      loading.value = true
      error.value = null
      
      if (!solicitudId || isNaN(solicitudId)) {
        throw new Error('ID de solicitud inválido')
      }
      
      const response = await obtenerDetalleSolicitud(solicitudId)
      
      if (response.success && response.data) {
        solicitud.value = response.data
        await cargarArchivosAdjuntos(solicitudId)
      } else {
        throw new Error(response.message || 'No se pudo cargar el detalle')
      }
      
    } catch (err) {
      error.value = err.message || 'Error al cargar el detalle de la solicitud'
    } finally {
      loading.value = false
    }
  }

  const cargarArchivosAdjuntos = async (solicitudId) => {
    try {
      loadingArchivos.value = true
      
      if (!solicitudId || isNaN(solicitudId)) return
      
      const response = await obtenerArchivosAdjuntos(solicitudId)
      
      if (response.success && response.data) {
        const { archivos: archivosPorTipo } = response.data
        const todosLosArchivos = []
        
        Object.values(archivosPorTipo).forEach(tipoArchivos => {
          if (Array.isArray(tipoArchivos)) {
            tipoArchivos.forEach(archivo => {
              todosLosArchivos.push({
                id: archivo.id,
                tipoDocumento: archivo.tipo,
                nombreArchivo: archivo.nombreArchivo,
                rutaArchivo: archivo.rutaArchivo,
                fechaSubida: archivo.fechaSubida,
                tamanoArchivo: archivo.tamanoArchivo,
                tipoMime: archivo.tipoMime,
                urlDescarga: archivo.urlDescarga
              })
            })
          }
        })
        
        archivos.value = todosLosArchivos
      } else {
        archivos.value = []
      }
      
    } catch (err) {
      archivos.value = []
    } finally {
      loadingArchivos.value = false
    }
  }

  return {
    solicitud,
    archivos,
    loading,
    loadingArchivos,
    error,
    tieneInformacionFinanciera,
    planPagosCalculado,
    montoPorPago,
    frequenciaPago,
    totalIntereses,
    fechaVencimientoCalculada,
    construirUrlArchivo,
    obtenerFotos,
    obtenerDocumentos,
    cargarDetalle,
    cargarArchivosAdjuntos
  }
}