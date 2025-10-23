import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEcommerceConfig = defineStore('ecommerceConfig', () => {
  const configuraciones = ref({})
  const loading = ref(false)
  const error = ref(null)

  const nombreTienda = computed(() => 
    configuraciones.value.ECOMMERCE_GENERAL_NOMBRE_TIENDA || 'Mi Tienda'
  )

  const moneda = computed(() => 
    configuraciones.value.ECOMMERCE_GENERAL_MONEDA || 'GTQ'
  )

  const simboloMoneda = computed(() => 
    configuraciones.value.ECOMMERCE_GENERAL_SIMBOLO_MONEDA || 'Q'
  )

  const productosPorPagina = computed(() => 
    parseInt(configuraciones.value.ECOMMERCE_GENERAL_PRODUCTOS_POR_PAGINA) || 12
  )

  const ivaIncluido = computed(() => 
    configuraciones.value.ECOMMERCE_GENERAL_IVA_INCLUIDO === 'true'
  )

  const porcentajeIva = computed(() => 
    parseFloat(configuraciones.value.ECOMMERCE_GENERAL_PORCENTAJE_IVA) || 12.00
  )

  const metodoPagoEfectivo = computed(() => 
    configuraciones.value.ECOMMERCE_PAGOS_EFECTIVO === 'true'
  )

  const metodoPagoTransferencia = computed(() => 
    configuraciones.value.ECOMMERCE_PAGOS_TRANSFERENCIA === 'true'
  )

  const metodoPagoTarjeta = computed(() => 
    configuraciones.value.ECOMMERCE_PAGOS_TARJETA === 'true'
  )

  const metodoPagoDeposito = computed(() => 
    configuraciones.value.ECOMMERCE_PAGOS_DEPOSITO === 'true'
  )

  const costoEnvioBase = computed(() => 
    parseFloat(configuraciones.value.ECOMMERCE_ENVIOS_COSTO_BASE) || 25.00
  )

  const costoEnvioDepartamental = computed(() => 
    parseFloat(configuraciones.value.ECOMMERCE_ENVIOS_COSTO_DEPARTAMENTAL) || 50.00
  )

  const envioGratisDesde = computed(() => 
    parseFloat(configuraciones.value.ECOMMERCE_ENVIOS_GRATIS_DESDE) || 500.00
  )

  const tiempoEntrega = computed(() => 
    configuraciones.value.ECOMMERCE_ENVIOS_TIEMPO_ENTREGA || '2-5 días laborales'
  )

  const retiroEnTienda = computed(() => 
    configuraciones.value.ECOMMERCE_ENVIOS_RETIRO_TIENDA === 'true'
  )

  const promocionesActivas = computed(() => 
    configuraciones.value.ECOMMERCE_PROMOCIONES_ACTIVAS === 'true'
  )

  const porcentajeDescuentoMaximo = computed(() => 
    parseInt(configuraciones.value.ECOMMERCE_PROMOCIONES_PORCENTAJE_MAXIMO) || 50
  )

  const descuentoPrimeraCompra = computed(() => 
    parseInt(configuraciones.value.ECOMMERCE_PROMOCIONES_PRIMERA_COMPRA) || 10
  )

  const cuponesActivos = computed(() => 
    configuraciones.value.ECOMMERCE_PROMOCIONES_CUPONES === 'true'
  )

  const diasDevolucion = computed(() => 
    parseInt(configuraciones.value.ECOMMERCE_POLITICAS_DEVOLUCION_DIAS) || 7
  )

  const diasGarantia = computed(() => 
    parseInt(configuraciones.value.ECOMMERCE_POLITICAS_GARANTIA_DIAS) || 30
  )

  const permiteCambioProducto = computed(() => 
    configuraciones.value.ECOMMERCE_POLITICAS_CAMBIO_PRODUCTO === 'true'
  )

  const reembolsoCompleto = computed(() => 
    configuraciones.value.ECOMMERCE_POLITICAS_REEMBOLSO_COMPLETO === 'true'
  )

  const temaPrincipal = computed(() => 
    configuraciones.value.ECOMMERCE_APARIENCIA_TEMA_PRINCIPAL || 'azul'
  )

  const productosDestacados = computed(() => 
    parseInt(configuraciones.value.ECOMMERCE_APARIENCIA_PRODUCTOS_DESTACADOS) || 8
  )

  const mostrarOfertas = computed(() => 
    configuraciones.value.ECOMMERCE_APARIENCIA_MOSTRAR_OFERTAS === 'true'
  )

  const metodosPagoDisponibles = computed(() => {
    const metodos = []
    if (metodoPagoEfectivo.value) metodos.push({ id: 'efectivo', nombre: 'Efectivo' })
    if (metodoPagoTransferencia.value) metodos.push({ id: 'transferencia', nombre: 'Transferencia' })
    if (metodoPagoTarjeta.value) metodos.push({ id: 'tarjeta', nombre: 'Tarjeta' })
    if (metodoPagoDeposito.value) metodos.push({ id: 'deposito', nombre: 'Depósito' })
    return metodos
  })

  async function cargarConfiguracion() {
    loading.value = true
    error.value = null

    try {
      const config = useRuntimeConfig()
      
      const response = await $fetch(`${config.public.apiBase}/ecommerce-config/public`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (response.success && response.data) {
        const configs = {}
        response.data.forEach(item => {
          configs[item.nombreParametro] = item.valorParametro
        })
        configuraciones.value = configs
        console.log('Configuración de ecommerce cargada correctamente')
      }
    } catch (err) {
      error.value = err.message || 'Error al cargar configuración'
      console.error('Error cargando configuración ecommerce:', err)
      
      configuraciones.value = {
        ECOMMERCE_GENERAL_NOMBRE_TIENDA: 'Mi Tienda',
        ECOMMERCE_GENERAL_MONEDA: 'GTQ',
        ECOMMERCE_GENERAL_SIMBOLO_MONEDA: 'Q',
        ECOMMERCE_GENERAL_PRODUCTOS_POR_PAGINA: '12',
        ECOMMERCE_GENERAL_IVA_INCLUIDO: 'true',
        ECOMMERCE_GENERAL_PORCENTAJE_IVA: '12.00',
        ECOMMERCE_PAGOS_EFECTIVO: 'true',
        ECOMMERCE_PAGOS_TRANSFERENCIA: 'true',
        ECOMMERCE_PAGOS_TARJETA: 'false',
        ECOMMERCE_PAGOS_DEPOSITO: 'true',
        ECOMMERCE_ENVIOS_COSTO_BASE: '25.00',
        ECOMMERCE_ENVIOS_COSTO_DEPARTAMENTAL: '50.00',
        ECOMMERCE_ENVIOS_GRATIS_DESDE: '500.00',
        ECOMMERCE_ENVIOS_TIEMPO_ENTREGA: '2-5 días laborales',
        ECOMMERCE_ENVIOS_RETIRO_TIENDA: 'true',
        ECOMMERCE_PROMOCIONES_ACTIVAS: 'true',
        ECOMMERCE_PROMOCIONES_PORCENTAJE_MAXIMO: '50',
        ECOMMERCE_PROMOCIONES_PRIMERA_COMPRA: '10',
        ECOMMERCE_PROMOCIONES_CUPONES: 'true',
        ECOMMERCE_POLITICAS_DEVOLUCION_DIAS: '7',
        ECOMMERCE_POLITICAS_GARANTIA_DIAS: '30',
        ECOMMERCE_POLITICAS_CAMBIO_PRODUCTO: 'true',
        ECOMMERCE_POLITICAS_REEMBOLSO_COMPLETO: 'true',
        ECOMMERCE_APARIENCIA_TEMA_PRINCIPAL: 'azul',
        ECOMMERCE_APARIENCIA_PRODUCTOS_DESTACADOS: '8',
        ECOMMERCE_APARIENCIA_MOSTRAR_OFERTAS: 'true'
      }
      console.warn('Usando configuración por defecto')
    } finally {
      loading.value = false
    }
  }

  function formatearPrecio(precio) {
    const precioFinal = calcularPrecioConIva(precio)
    return `${simboloMoneda.value}${parseFloat(precioFinal).toFixed(2)}`
  }

  function calcularPrecioConIva(precio) {
    if (ivaIncluido.value) {
      return parseFloat(precio)
    }
    return parseFloat(precio) * (1 + porcentajeIva.value / 100)
  }

  function calcularCostoEnvio(total, esDepartamental = false) {
    if (total >= envioGratisDesde.value) {
      return 0
    }
    return esDepartamental ? costoEnvioDepartamental.value : costoEnvioBase.value
  }

  function obtenerInfoEnvio(total, esDepartamental = false) {
    const costo = calcularCostoEnvio(total, esDepartamental)
    return {
      costo,
      esGratis: costo === 0,
      faltaParaGratis: costo > 0 ? envioGratisDesde.value - total : 0,
      tiempoEstimado: tiempoEntrega.value
    }
  }

  function validarMetodoPago(metodoPago) {
    const metodosValidos = {
      efectivo: metodoPagoEfectivo.value,
      transferencia: metodoPagoTransferencia.value,
      tarjeta: metodoPagoTarjeta.value,
      deposito: metodoPagoDeposito.value
    }
    return metodosValidos[metodoPago] || false
  }

  return {
    configuraciones,
    loading,
    error,
    nombreTienda,
    moneda,
    simboloMoneda,
    productosPorPagina,
    ivaIncluido,
    porcentajeIva,
    metodoPagoEfectivo,
    metodoPagoTransferencia,
    metodoPagoTarjeta,
    metodoPagoDeposito,
    costoEnvioBase,
    costoEnvioDepartamental,
    envioGratisDesde,
    tiempoEntrega,
    retiroEnTienda,
    promocionesActivas,
    porcentajeDescuentoMaximo,
    descuentoPrimeraCompra,
    cuponesActivos,
    diasDevolucion,
    diasGarantia,
    permiteCambioProducto,
    reembolsoCompleto,
    temaPrincipal,
    productosDestacados,
    mostrarOfertas,
    metodosPagoDisponibles,
    cargarConfiguracion,
    formatearPrecio,
    calcularPrecioConIva,
    calcularCostoEnvio,
    obtenerInfoEnvio,
    validarMetodoPago
  }
})