// FRONTEND/plugins/router-protection.client.js
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  // Interceptar errores de navegación
  router.onError((error, to, from) => {
    console.error(' Error de navegación:', { error: error.message, de: from?.path, hacia: to?.path, usuario: user?.value?.email || 'No autenticado' })

    // Función helper para redirigir de forma segura
    const redirectToSafePage = () => {
      if (isAuthenticated?.value && user?.value?.tipoUsuario) {
        const dashboardPaths = {
          'Cliente': '/empeno',
          'Evaluador': '/evaluador',
          'Administrador': '/admin',
          'Cobrador': '/collector',
          'Personal': '/personal'
        }
        
        const dashboardPath = dashboardPaths[user.value.tipoUsuario] || '/empeno'
        return navigateTo(dashboardPath, { replace: true })
      } else {
        return navigateTo('/', { replace: true })
      }
    }

    // Si es un error 404, redirigir a la página apropiada
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.log(' Redirigiendo por error 404')
      return redirectToSafePage()
    }

    // Para otros errores, NO lanzar error, solo registrar y redirigir
    console.warn(' Error de navegación no crítico, redirigiendo...', error.message)
    return redirectToSafePage()
  })

  // Interceptar antes de cada navegación
  router.beforeEach((to, from) => {
    console.log(' Navegando:', { de: from.path, hacia: to.path, usuario: user?.value?.email || 'No autenticado', autenticado: isAuthenticated?.value || false })

    // Limpiar notificaciones en cada navegación
    if (process.client) {
      try {
        const notifications = document.querySelectorAll('.notification')
        notifications.forEach(notification => {
          notification.remove()
        })
      } catch (e) {
        console.warn('Error limpiando notificaciones:', e)
      }
    }

    return true
  })

  // Interceptar después de cada navegación
  router.afterEach((to, from) => {
    console.log(' Navegación completada:', { de: from?.path, hacia: to.path, timestamp: new Date().toISOString()
    })

    // Actualizar título de la página
    if (process.client) {
      try {
        nextTick(() => {
          if (to.meta?.title) {
            document.title = `${to.meta.title} - Fredy Fasbear Préstamos`
          }
        })
      } catch (e) {
        console.warn('Error actualizando título:', e)
      }
    }
  })

  console.log('🛡 Sistema de protección de rutas inicializado')
})