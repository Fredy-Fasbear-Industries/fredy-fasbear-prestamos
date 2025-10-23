import { ref } from 'vue'
import { useApi } from './useApi'

export const useCalculadoraPrestamo = () => {
  const { api } = useApi()

  const calculadora = ref({
    valor: 0,
    porcentaje: 50,
    plazo: 1,
    interesMensual: 5,
    montoPrestamo: 0,
    interesTotal: 0,
    totalPagar: 0
  })

  const loadingSimulacion = ref(false)

  const calcularPrestamo = () => {
    const valor = parseFloat(calculadora.value.valor) || 0
    const porcentaje = parseFloat(calculadora.value.porcentaje) || 50
    const plazo = parseInt(calculadora.value.plazo) || 1
    const interesMensual = parseFloat(calculadora.value.interesMensual) || 5

    calculadora.value.montoPrestamo = valor * (porcentaje / 100)
    calculadora.value.interesTotal = calculadora.value.montoPrestamo * (interesMensual / 100) * plazo
    calculadora.value.totalPagar = calculadora.value.montoPrestamo + calculadora.value.interesTotal
  }

  const obtenerSimulacionOficial = async () => {
    try {
      loadingSimulacion.value = true
      
      const response = await api('/prestamos/simulacion', {
        params: {
          valorArticulo: calculadora.value.valor,
          porcentajePrestamo: calculadora.value.porcentaje,
          plazoMeses: calculadora.value.plazo
        }
      })
      
      if (response.success) {
        const simData = response.data
        calculadora.value.montoPrestamo = simData.montoPrestamo
        calculadora.value.interesTotal = simData.interesTotal
        calculadora.value.totalPagar = simData.totalPagar
        calculadora.value.interesMensual = simData.tasaInteres
        
        return { success: true }
      }
      throw new Error(response.message || 'Error en simulación')
    } catch (error) {
      throw error
    } finally {
      loadingSimulacion.value = false
    }
  }

  return {
    calculadora,
    loadingSimulacion,
    calcularPrestamo,
    obtenerSimulacionOficial
  }
}