import { ref, computed } from 'vue'
import { useApi } from './useApi'

export const useEmpenos = () => {
  const { api } = useApi()

  const solicitudes = ref([])
  const prestamos = ref([])
  const loadingData = ref(true)
  const error = ref(null)

  const estadisticas = ref({
    prestamosActivos: 0,
    solicitudesPendientes: 0,
    totalPrestado: 0,
    prestamosCompletados: 0
  })

  const itemsCombinados = computed(() => {
    const items = []
    
    solicitudes.value.forEach(solicitud => {
      const articulo = solicitud.articulos?.[0]
      items.push({
        id: solicitud.id,
        tipo: 'solicitud',
        estado: solicitud.estado,
        fecha: solicitud.fechaSolicitud,
        observaciones: solicitud.observaciones,
        valorEstimado: articulo?.valorEstimadoCliente || 0,
        descripcion: articulo?.descripcion || 'Sin descripción',
        marca: articulo?.marca,
        modelo: articulo?.modelo,
        articulos: solicitud.articulos || []
      })
    })
    
    prestamos.value.forEach(prestamo => {
      items.push({
        id: prestamo.id,
        tipo: 'prestamo',
        estado: prestamo.estado,
        fecha: prestamo.fechaInicio,
        fechaVencimiento: prestamo.fechaVencimiento,
        montoPrestado: prestamo.montoPrestado,
        tasaInteres: prestamo.tasaInteres,
        saldoPendiente: prestamo.saldoPendiente,
        descripcion: getArticuloDescripcion(prestamo),
        contrato: prestamo.contrato
      })
    })
    
    return items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  })

  const getArticuloDescripcion = (prestamo) => {
    if (prestamo.contrato?.solicitud?.articulos?.[0]) {
      const articulo = prestamo.contrato.solicitud.articulos[0]
      return `${articulo.descripcion}${articulo.marca ? ` - ${articulo.marca}` : ''}`
    }
    return 'Artículo en empéño'
  }

  const cargarSolicitudes = async () => {
    try {
      const response = await api('/solicitudes')
      if (response.success) {
        solicitudes.value = response.data.solicitudes || []
      }
    } catch (err) {
      console.error('Error cargando solicitudes:', err)
    }
  }

  const cargarPrestamos = async () => {
    try {
      const response = await api('/prestamos', {
        params: { limite: 50, pagina: 1 }
      })
      if (response.success) {
        prestamos.value = response.data.prestamos || []
      }
    } catch (err) {
      console.error('Error cargando préstamos:', err)
    }
  }

  const calcularEstadisticas = () => {
    estadisticas.value = {
      prestamosActivos: prestamos.value.filter(p => p.estado === 'Activo').length,
      solicitudesPendientes: solicitudes.value.filter(s => s.estado === 'Pendiente').length,
      totalPrestado: prestamos.value.reduce((sum, p) => sum + (Number(p.montoPrestado) || 0), 0),
      prestamosCompletados: prestamos.value.filter(p => p.estado === 'Pagado').length
    }
  }

  const cargarDatos = async () => {
    try {
      loadingData.value = true
      error.value = null
      
      await Promise.all([cargarSolicitudes(), cargarPrestamos()])
      calcularEstadisticas()
      
    } catch (err) {
      error.value = err.message || 'Error al cargar los datos'
    } finally {
      loadingData.value = false
    }
  }

  const renovarPrestamo = async (prestamo) => {
    throw new Error('Funcionalidad de renovación próximamente')
  }

  const pagarPrestamo = async (prestamo) => {
    return { redirect: `/empeno/${prestamo.id}?action=pagar` }
  }

  const confirmarCancelacion = async (solicitudId, motivo) => {
    try {
      const response = await api(`/solicitudes/${solicitudId}/cancelar`, {
        method: 'PUT',
        body: { motivo: motivo || 'Cancelada por el usuario desde la interfaz web' }
      })
      
      if (response.success) {
        await cargarDatos()
        return { success: true }
      }
      throw new Error(response.message || 'Error desconocido al cancelar')
    } catch (error) {
      throw error
    }
  }

  return {
    solicitudes,
    prestamos,
    estadisticas,
    itemsCombinados,
    loadingData,
    error,
    cargarDatos,
    renovarPrestamo,
    pagarPrestamo,
    confirmarCancelacion
  }
}