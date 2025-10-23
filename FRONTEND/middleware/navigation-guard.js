
// FRONTEND/middleware/navigation-guard.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, user } = useAuth()
  
  console.log(' Navigation Guard - Protegiendo navegación:', { de: from?.path, hacia: to.path, autenticado: isAuthenticated.value, tipoUsuario: user.value?.tipoUsuario })

  // Lista de rutas que requieren autenticación
  const rutasProtegidas = [
    '/empeno',
    '/evaluador', 
    '/admin',
    '/collector',
    '/personal',
    '/profile'
  ]

  // Verificar si la ruta actual requiere autenticación
  const requiereAuth = rutasProtegidas.some(ruta => to.path.startsWith(ruta))

  if (requiereAuth && !isAuthenticated.value) {
    console.log(' Ruta protegida sin autenticación')
    return navigateTo('/login', { 
      query: { redirect: to.fullPath },
      replace: true 
    })
  }

  // Verificar rutas específicas por rol
  if (isAuthenticated.value) {
    const userType = user.value?.tipoUsuario
    
    // Reglas de acceso por tipo de usuario
    const accessRules = {
      'Cliente': ['/empeno', '/profile'],
      'Evaluador': ['/evaluador', '/profile'],
      'Administrador': ['/admin', '/evaluador', '/empeno', '/collector', '/personal', '/profile'], 
      'Cobrador': ['/collector', '/profile'],
      'Personal': ['/personal', '/profile']
    }

    const allowedPaths = accessRules[userType] || []
    const hasAccess = allowedPaths.some(path => to.path.startsWith(path)) || 
                     to.path === '/' || 
                     to.path.startsWith('/auth/')

    if (!hasAccess) {
      console.log(` Usuario ${userType} sin acceso a ${to.path}`)
      
      // Redirigir al dashboard apropiado
      const defaultPaths = {
        'Cliente': '/empeno',
        'Evaluador': '/evaluador',
        'Administrador': '/admin',
        'Cobrador': '/collector',
        'Personal': '/personal'
      }
      
      const defaultPath = defaultPaths[userType] || '/empeno'
      return navigateTo(defaultPath, { replace: true })
    }
  }

  console.log(' Navegación permitida')
})
