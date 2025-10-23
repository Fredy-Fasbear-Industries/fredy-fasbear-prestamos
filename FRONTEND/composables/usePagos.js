import { ref } from 'vue'
import { useApi } from './useApi'

export const usePagos = () => {
  const { api, getToken } = useApi()
  const loading = ref(false)
  const error = ref(null)

  const procesarPago = async (prestamoId, formDataPago) => {
    loading.value = true
    error.value = null

    try {
      console.log('Procesando pago para préstamo:', prestamoId)

      const response = await fetch(`${api.defaults.baseURL}/prestamos/${prestamoId}/pagar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formDataPago
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error procesando el pago')
      }

      console.log('Pago procesado exitosamente:', data)

      return {
        success: true,
        data: data.data,
        message: data.message
      }

    } catch (err) {
      console.error('Error en procesarPago:', err)
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al procesar el pago'
      }
    } finally {
      loading.value = false
    }
  }

  const obtenerHistorialPagos = async (prestamoId) => {
    loading.value = true
    error.value = null

    try {
      const response = await api(`/prestamos/${prestamoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })

      if (!response.success) {
        throw new Error(response.message || 'Error obteniendo historial de pagos')
      }

      return {
        success: true,
        pagos: response.data.prestamo.pagos || []
      }

    } catch (err) {
      console.error('Error obteniendo historial de pagos:', err)
      error.value = err.message
      
      return {
        success: false,
        message: err.message || 'Error al obtener el historial de pagos'
      }
    } finally {
      loading.value = false
    }
  }

  const validarDatosPago = (datos) => {
    const errores = []

    if (!datos.monto || datos.monto <= 0) {
      errores.push('El monto debe ser mayor a 0')
    }

    if (!datos.metodoPago) {
      errores.push('Debe seleccionar un método de pago')
    }

    if (datos.metodoPago) {
      if (!datos.fechaDeposito) {
        errores.push('La fecha del depósito es requerida')
      }

      if (!datos.nombreBanco || datos.nombreBanco.trim().length < 3) {
        errores.push('El nombre del banco es requerido')
      }

      if (!datos.numeroTransaccion || datos.numeroTransaccion.trim().length < 3) {
        errores.push('El número de transacción es requerido')
      }

      if (!datos.imagenComprobante) {
        errores.push('Debe subir la imagen del comprobante')
      }
    }

    return {
      valido: errores.length === 0,
      errores
    }
  }

  return {
    loading,
    error,
    procesarPago,
    obtenerHistorialPagos,
    validarDatosPago
  }
}