// FRONTEND/composables/useNotifications.js
import { ref, reactive } from 'vue'

// Estado global de notificaciones
const notifications = ref([])
const notificationCounter = ref(0)

export const useNotifications = () => {
  
  /**
   * Mostrar notificación
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación (success, error, warning, info)
   * @param {object} options - Opciones adicionales
   */
  const showNotification = (message, type = 'info', options = {}) => {
    const defaultOptions = {
      duration: 5000, // 5 segundos por defecto
      persistent: false, // Si es persistente, no se auto-cierra
      action: null, // Acción opcional (botón)
      position: 'top-right', // Posición en pantalla
      icon: null, // Icono personalizado
      html: false, // Si permite HTML
      onClick: null, // Callback al hacer click
      onClose: null // Callback al cerrar
    }

    const config = { ...defaultOptions, ...options }
    const id = ++notificationCounter.value

    const notification = reactive({
      id,
      message,
      type,
      ...config,
      show: true,
      timestamp: new Date()
    })

    notifications.value.push(notification)

    console.log(`📢 Notificación ${type}:`, message)

    // Auto-cerrar si no es persistente
    if (!config.persistent && config.duration > 0) {
      setTimeout(() => {
        closeNotification(id)
      }, config.duration)
    }

    return notification
  }

  /**
   * Cerrar notificación específica
   * @param {number} id - ID de la notificación
   */
  const closeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      const notification = notifications.value[index]
      
      // Llamar callback de cierre si existe
      if (notification.onClose) {
        notification.onClose(notification)
      }

      notifications.value.splice(index, 1)
      console.log(` Notificación ${id} cerrada`)
    }
  }

  /**
   * Cerrar todas las notificaciones
   */
  const clearAllNotifications = () => {
    notifications.value.forEach(notification => {
      if (notification.onClose) {
        notification.onClose(notification)
      }
    })
    
    notifications.value.length = 0
    console.log('🧹 Todas las notificaciones cerradas')
  }

  /**
   * Cerrar notificaciones por tipo
   * @param {string} type - Tipo de notificaciones a cerrar
   */
  const clearNotificationsByType = (type) => {
    const toRemove = notifications.value.filter(n => n.type === type)
    
    toRemove.forEach(notification => {
      if (notification.onClose) {
        notification.onClose(notification)
      }
    })

    notifications.value = notifications.value.filter(n => n.type !== type)
    console.log(`🧹 Notificaciones de tipo ${type} cerradas:`, toRemove.length)
  }

  // ===== MÉTODOS DE CONVENIENCIA =====

  /**
   * Mostrar notificación de éxito
   * @param {string} message - Mensaje
   * @param {object} options - Opciones
   */
  const success = (message, options = {}) => {
    return showNotification(message, 'success', {
      icon: 'check-circle',
      duration: 4000,
      ...options
    })
  }

  /**
   * Mostrar notificación de error
   * @param {string} message - Mensaje
   * @param {object} options - Opciones
   */
  const error = (message, options = {}) => {
    return showNotification(message, 'error', {
      icon: 'x-circle',
      duration: 6000, // Errores duran más tiempo
      ...options
    })
  }

  /**
   * Mostrar notificación de advertencia
   * @param {string} message - Mensaje
   * @param {object} options - Opciones
   */
  const warning = (message, options = {}) => {
    return showNotification(message, 'warning', {
      icon: 'alert-triangle',
      duration: 5000,
      ...options
    })
  }

  /**
   * Mostrar notificación informativa
   * @param {string} message - Mensaje
   * @param {object} options - Opciones
   */
  const info = (message, options = {}) => {
    return showNotification(message, 'info', {
      icon: 'info',
      duration: 4000,
      ...options
    })
  }

  /**
   * Mostrar notificación de carga/progreso
   * @param {string} message - Mensaje
   * @param {object} options - Opciones
   */
  const loading = (message, options = {}) => {
    return showNotification(message, 'loading', {
      icon: 'loader',
      persistent: true, // Las notificaciones de carga son persistentes
      ...options
    })
  }

  // ===== MÉTODOS ESPECIALIZADOS =====

  /**
   * Mostrar notificación de confirmación con acciones
   * @param {string} message - Mensaje
   * @param {function} onConfirm - Callback de confirmación
   * @param {function} onCancel - Callback de cancelación
   * @param {object} options - Opciones adicionales
   */
  const confirm = (message, onConfirm, onCancel = null, options = {}) => {
    return showNotification(message, 'confirm', {
      persistent: true,
      action: {
        confirm: {
          text: options.confirmText || 'Confirmar',
          callback: () => {
            if (onConfirm) onConfirm()
          }
        },
        cancel: {
          text: options.cancelText || 'Cancelar',
          callback: () => {
            if (onCancel) onCancel()
          }
        }
      },
      ...options
    })
  }

  /**
   * Mostrar notificación de progreso actualizable
   * @param {string} message - Mensaje inicial
   * @param {object} options - Opciones
   * @returns {object} Objeto con métodos para actualizar progreso
   */
  const progress = (message, options = {}) => {
    const notification = showNotification(message, 'progress', {
      persistent: true,
      progress: 0,
      ...options
    })

    return {
      id: notification.id,
      
      // Actualizar progreso (0-100)
      updateProgress: (percent, newMessage = null) => {
        const notif = notifications.value.find(n => n.id === notification.id)
        if (notif) {
          notif.progress = Math.max(0, Math.min(100, percent))
          if (newMessage) {
            notif.message = newMessage
          }
        }
      },
      
      // Completar progreso
      complete: (finalMessage = '¡Completado!') => {
        const notif = notifications.value.find(n => n.id === notification.id)
        if (notif) {
          notif.progress = 100
          notif.message = finalMessage
          notif.type = 'success'
          
          // Auto-cerrar después de 2 segundos
          setTimeout(() => {
            closeNotification(notification.id)
          }, 2000)
        }
      },
      
      // Fallar progreso
      fail: (errorMessage = 'Error al procesar') => {
        const notif = notifications.value.find(n => n.id === notification.id)
        if (notif) {
          notif.message = errorMessage
          notif.type = 'error'
          notif.persistent = false
          
          // Auto-cerrar después de 5 segundos
          setTimeout(() => {
            closeNotification(notification.id)
          }, 5000)
        }
      },
      
      // Cerrar manualmente
      close: () => {
        closeNotification(notification.id)
      }
    }
  }

  /**
   * Mostrar notificación de sistema (para eventos importantes)
   * @param {string} title - Título
   * @param {string} message - Mensaje
   * @param {object} options - Opciones
   */
  const system = (title, message, options = {}) => {
    return showNotification(`<strong>${title}</strong><br>${message}`, 'system', {
      html: true,
      duration: 8000,
      position: 'top-center',
      ...options
    })
  }

  // ===== MÉTODOS DE GESTIÓN DE ESTADO =====

  /**
   * Obtener notificaciones por tipo
   * @param {string} type - Tipo de notificación
   * @returns {array} Array de notificaciones
   */
  const getNotificationsByType = (type) => {
    return notifications.value.filter(n => n.type === type)
  }

  /**
   * Contar notificaciones por tipo
   * @param {string} type - Tipo de notificación
   * @returns {number} Número de notificaciones
   */
  const countNotificationsByType = (type) => {
    return notifications.value.filter(n => n.type === type).length
  }

  /**
   * Verificar si hay notificaciones activas
   * @returns {boolean}
   */
  const hasActiveNotifications = () => {
    return notifications.value.length > 0
  }

  /**
   * Obtener la última notificación
   * @returns {object|null}
   */
  const getLastNotification = () => {
    return notifications.value[notifications.value.length - 1] || null
  }

  // ===== UTILIDADES PARA APIs =====

  /**
   * Manejar respuesta de API con notificación automática
   * @param {object} response - Respuesta de API
   * @param {object} options - Opciones de notificación
   */
  const handleApiResponse = (response, options = {}) => {
    if (response.success) {
      if (response.message && options.showSuccess !== false) {
        success(response.message, options.successOptions)
      }
    } else {
      if (response.message && options.showError !== false) {
        error(response.message, options.errorOptions)
      }
    }
    
    return response
  }

  /**
   * Wrapper para operaciones asíncronas con notificaciones
   * @param {function} asyncOperation - Operación asíncrona
   * @param {object} messages - Mensajes para diferentes estados
   * @param {object} options - Opciones adicionales
   */
  const withLoadingNotification = async (asyncOperation, messages = {}, options = {}) => {
    const defaultMessages = {
      loading: 'Procesando...',
      success: '¡Operación completada!',
      error: 'Error al procesar la operación'
    }

    const msgs = { ...defaultMessages, ...messages }
    
    // Mostrar notificación de carga
    const loadingNotif = loading(msgs.loading)

    try {
      const result = await asyncOperation()
      
      // Cerrar notificación de carga
      closeNotification(loadingNotif.id)
      
      // Mostrar éxito si hay resultado exitoso
      if (result && result.success !== false && options.showSuccess !== false) {
        success(result.message || msgs.success)
      }
      
      return result
      
    } catch (err) {
      // Cerrar notificación de carga
      closeNotification(loadingNotif.id)
      
      // Mostrar error
      if (options.showError !== false) {
        error(err.message || msgs.error)
      }
      
      throw err
    }
  }

  // ===== CONFIGURACIÓN Y ESTADO =====

  /**
   * Configurar opciones globales de notificaciones
   * @param {object} config - Configuración global
   */
  const configure = (config) => {
    // Aquí se pueden establecer configuraciones globales
    console.log(' Configurando notificaciones:', config)
  }

  /**
   * Obtener estadísticas de notificaciones
   * @returns {object} Estadísticas
   */
  const getStats = () => {
    const stats = {
      total: notifications.value.length,
      byType: {},
      oldest: null,
      newest: null
    }

    notifications.value.forEach(notif => {
      stats.byType[notif.type] = (stats.byType[notif.type] || 0) + 1
      
      if (!stats.oldest || notif.timestamp < stats.oldest.timestamp) {
        stats.oldest = notif
      }
      
      if (!stats.newest || notif.timestamp > stats.newest.timestamp) {
        stats.newest = notif
      }
    })

    return stats
  }

  return {
    // Estado
    notifications: readonly(notifications),
    
    // Métodos principales
    showNotification,
    closeNotification,
    clearAllNotifications,
    clearNotificationsByType,
    
    // Métodos de conveniencia
    success,
    error,
    warning,
    info,
    loading,
    
    // Métodos especializados
    confirm,
    progress,
    system,
    
    // Gestión de estado
    getNotificationsByType,
    countNotificationsByType,
    hasActiveNotifications,
    getLastNotification,
    
    // Utilidades para APIs
    handleApiResponse,
    withLoadingNotification,
    
    // Configuración
    configure,
    getStats
  }
}