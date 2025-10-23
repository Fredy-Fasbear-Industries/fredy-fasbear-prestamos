// FRONTEND/composables/useSystemReports.js
import { ref } from 'vue'

export const useSystemReports = () => {
  // Estado reactivo
  const loading = ref(false)
  const error = ref(null)
  
  const overviewLoading = ref(false)
  const databaseLoading = ref(false)
  const healthLoading = ref(false)
  const activityLoading = ref(false)

  // Composable interno
  const { api } = useApi()

  /**
   * Obtener estadísticas generales del sistema
   */
  const getSystemOverview = async () => {
    try {
      overviewLoading.value = true
      error.value = null
      
      console.log(' Obteniendo estadísticas generales del sistema...')
      
      const response = await api('/system-reports/overview')
      
      if (response.success) {
        console.log(' Estadísticas del sistema obtenidas:', response.data.systemStats)
        return response.data.systemStats
      } else {
        throw new Error(response.message || 'Error obteniendo estadísticas del sistema')
      }
    } catch (err) {
      console.error(' Error obteniendo estadísticas del sistema:', err)
      error.value = err.message
      
      return {
        totalTables: 0,
        newTables: 0,
        totalColumns: 0,
        newColumns: 0,
        totalSchemas: 0,
        responseTime: 0,
        totalUsers: 0,
        activeSessions: 0,
        totalSolicitudes: 0,
        totalPrestamos: 0,
        totalArticulos: 0,
        totalProductos: 0
      }
    } finally {
      overviewLoading.value = false
    }
  }

  /**
   * Obtener análisis detallado de la base de datos
   */
  const getDatabaseAnalysis = async () => {
    try {
      databaseLoading.value = true
      error.value = null
      
      console.log(' Obteniendo análisis de base de datos...')
      
      const response = await api('/system-reports/database-analysis')
      
      if (response.success) {
        console.log(' Análisis de base de datos obtenido:', response.data)
        return response.data
      } else {
        throw new Error(response.message || 'Error obteniendo análisis de base de datos')
      }
    } catch (err) {
      console.error(' Error obteniendo análisis de base de datos:', err)
      error.value = err.message
      
      return {
        dbmsDistribution: {
          'PostgreSQL': 0,
          'MySQL': 0,
          'SQLite': 0,
          'Oracle': 0
        },
        dataTypesDistribution: {},
        schemaStats: [],
        constraintsInfo: []
      }
    } finally {
      databaseLoading.value = false
    }
  }

  /**
   * Obtener métricas de salud del sistema
   */
  const getSystemHealth = async () => {
    try {
      healthLoading.value = true
      error.value = null
      
      console.log('🏥 Obteniendo métricas de salud del sistema...')
      
      const response = await api('/system-reports/health-monitoring')
      
      if (response.success) {
        console.log(' Métricas de salud obtenidas:', response.data.systemHealth)
        return response.data.systemHealth
      } else {
        throw new Error(response.message || 'Error obteniendo métricas de salud')
      }
    } catch (err) {
      console.error(' Error obteniendo métricas de salud:', err)
      error.value = err.message
      
      return {
        cpu: 0,
        memory: 0,
        storage: 0,
        network: 0,
        dbConnections: 0,
        dbSize: '0 MB',
        uptime: 0,
        databaseStatus: 'disconnected'
      }
    } finally {
      healthLoading.value = false
    }
  }

  /**
   * Obtener actividad reciente del sistema
   */
  const getRecentActivity = async (limit = 15) => {
    try {
      activityLoading.value = true
      error.value = null
      
      console.log(` Obteniendo últimas ${limit} actividades...`)
      
      const response = await api(`/system-reports/recent-activity?limit=${limit}`)
      
      if (response.success) {
        console.log(' Actividad reciente obtenida:', response.data.recentActivities)
        console.log(' Total de actividades:', response.data.totalCount)
        return response.data.recentActivities
      } else {
        throw new Error(response.message || 'Error obteniendo actividad reciente')
      }
    } catch (err) {
      console.error(' Error obteniendo actividad reciente:', err)
      error.value = err.message
      
      return []
    } finally {
      activityLoading.value = false
    }
  }

  const exportSystemReport = async (config) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(' Exportando reporte del sistema...', config)
      
      const response = await api('/system-reports/export', {
        method: 'POST',
        body: config
      })
      
      if (response.success) {
        console.log(' Reporte exportado exitosamente:', response.data.export)
        return response.data.export
      } else {
        throw new Error(response.message || 'Error exportando reporte')
      }
    } catch (err) {
      console.error(' Error exportando reporte:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar todos los datos
   */
  const refreshAllData = async () => {
    try {
      loading.value = true
      console.log(' Actualizando todos los datos...')
      
      await Promise.all([
        getSystemOverview(),
        getDatabaseAnalysis(),
        getSystemHealth(),
        getRecentActivity()
      ])
      
      console.log(' Todos los datos actualizados')
    } catch (err) {
      console.error(' Error actualizando datos:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * Formatear tiempo relativo
   */
  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Justo ahora'
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
    
    return date.toLocaleDateString('es-GT', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  /**
   * Formatear números
   */
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  /**
   * Obtener color para DBMS
   */
  const getDBMSColor = (dbms) => {
    const colors = {
      'PostgreSQL': '#3b82f6',
      'MySQL': '#f59e0b',
      'SQLite': '#06b6d4',
      'Oracle': '#ef4444',
      'MongoDB': '#10b981',
      'Redis': '#dc2626'
    }
    return colors[dbms] || '#6b7280'
  }

  /**
   * Obtener icono de actividad
   */
  const getActivityIcon = (type) => {
    const icons = {
      'database': '🗄️',
      'security': '',
      'system': '⚙️',
      'maintenance': '',
      'error': '',
      'backup': '💾',
      'update': ''
    }
    return icons[type] || ''
  }

  /**
   * Obtener estado de salud
   */
  const getHealthStatus = (value, type) => {
    if (type === 'cpu' || type === 'memory') {
      if (value < 60) return 'good'
      if (value < 80) return 'warning'
      return 'critical'
    }
    if (type === 'storage') {
      if (value < 50) return 'good'
      if (value < 75) return 'warning'
      return 'critical'
    }
    if (type === 'network') {
      if (value > 800) return 'good'
      if (value > 500) return 'warning'
      return 'critical'
    }
    return 'good'
  }

  /**
   * Limpiar errores
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // Estado
    loading,
    error,
    overviewLoading,
    databaseLoading,
    healthLoading,
    activityLoading,
    
    // Métodos
    getSystemOverview,
    getDatabaseAnalysis,
    getSystemHealth,
    getRecentActivity,
    exportSystemReport,
    refreshAllData,
    
    // Utilidades
    formatTimeAgo,
    formatNumber,
    getDBMSColor,
    getActivityIcon,
    getHealthStatus,
    clearError
  }
}