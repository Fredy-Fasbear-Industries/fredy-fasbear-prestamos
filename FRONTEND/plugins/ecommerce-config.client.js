
export default defineNuxtPlugin(async () => {
  if (!process.client) return

  console.log('[ECOMMERCE CONFIG] Plugin iniciado')
  
  const ecommerceConfig = useEcommerceConfig()
  
  try {
    await ecommerceConfig.cargarConfiguracion()
    console.log('[ECOMMERCE CONFIG] Configuración cargada')
  } catch (error) {
    console.error('[ECOMMERCE CONFIG] Error al cargar configuración:', error)
  }
})