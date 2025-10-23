// Archivo: composables/useHomepage.js
// Composable para manejar la lógica de la página principal

export const useHomepage = () => {
  const config = useRuntimeConfig()
  
  // Estado reactivo
  const homeData = ref(null)
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // URL base de la API
  const apiUrl = config.public.apiBase || 'http://localhost:3000/api'

  // Obtener datos de la homepage desde el backend
  const fetchHomeData = async () => {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch(`${apiUrl}/homepage/data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      homeData.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar datos de la página principal'
      console.error('Error fetching home data:', err)
      
      // Datos de fallback si la API falla
      homeData.value = {
        heroSection: {
          title: "Empeña y Compra con Confianza",
          subtitle: "Bienvenido a nuestro servicio",
          description: "Te brindamos préstamos por tus artículos y precios accesibles en tus compras."
        },
        features: [
          {
            id: 1,
            title: "Avalúo Profesional",
            description: "Evaluamos tus artículos con criterios profesionales para ofrecerte el mejor valor por tus pertenencias."
          }
        ]
      }
    } finally {
      loading.value = false
    }
  }

  // Obtener estadísticas dinámicas
  const fetchStats = async () => {
    try {
      const { data } = await $fetch(`${apiUrl}/homepage/stats`, {
        method: 'GET'
      })

      stats.value = data
      return data
    } catch (err) {
      console.error('Error fetching stats:', err)
      
      // Stats de fallback
      stats.value = {
        totalClientes: 1500,
        prestamosActivos: 320,
        articulosEnVenta: 850,
        montoTotalPrestado: 2500000
      }
    }
  }

  // Enviar mensaje de contacto
  const sendContactMessage = async (formData) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch(`${apiUrl}/contacto`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      return { success: true, data }
    } catch (err) {
      error.value = err.message || 'Error al enviar mensaje'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Obtener productos destacados para la homepage
  const fetchFeaturedProducts = async (limit = 6) => {
    try {
      const { data } = await $fetch(`${apiUrl}/productos/destacados`, {
        method: 'GET',
        query: { limit }
      })

      return data
    } catch (err) {
      console.error('Error fetching featured products:', err)
      return []
    }
  }

  // Funciones de utilidad
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount)
  }

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-GT').format(number)
  }

  // Inicializar datos al usar el composable
  const initializeHomepage = async () => {
    await Promise.all([
      fetchHomeData(),
      fetchStats()
    ])
  }

  // Computed properties
  const heroTitle = computed(() => 
    homeData.value?.heroSection?.title || "Empeña y Compra con Confianza"
  )

  const heroSubtitle = computed(() => 
    homeData.value?.heroSection?.subtitle || "Bienvenido a nuestro servicio"
  )

  const heroDescription = computed(() => 
    homeData.value?.heroSection?.description || "Te brindamos préstamos por tus artículos y precios accesibles en tus compras."
  )

  const formattedStats = computed(() => {
    if (!stats.value) return null

    return {
      clientes: formatNumber(stats.value.totalClientes),
      prestamos: formatNumber(stats.value.prestamosActivos),
      articulos: formatNumber(stats.value.articulosEnVenta),
      monto: formatCurrency(stats.value.montoTotalPrestado)
    }
  })

  return {
    // Estado
    homeData,
    stats,
    loading,
    error,

    // Computed
    heroTitle,
    heroSubtitle,
    heroDescription,
    formattedStats,

    // Métodos
    fetchHomeData,
    fetchStats,
    sendContactMessage,
    fetchFeaturedProducts,
    initializeHomepage,
    formatCurrency,
    formatNumber
  }
}