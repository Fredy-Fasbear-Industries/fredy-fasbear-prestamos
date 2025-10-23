
// FRONTEND/middleware/guest.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, user } = useAuth()
  
  console.log(' Middleware guest - Verificando estado de invitado:', { ruta: to.path, autenticado: isAuthenticated.value })

  if (isAuthenticated.value) {
    console.log(' Usuario ya autenticado, redirigiendo al dashboard')
    
    // Redirigir según el tipo de usuario
    const dashboardPaths = {
      'Cliente': '/empeno',
      'Evaluador': '/evaluador',
      'Administrador': '/admin',
      'Cobrador': '/collector',
      'Personal': '/personal'
    }
    
    const dashboardPath = dashboardPaths[user.value?.tipoUsuario] || '/empeno'
    
    return navigateTo(dashboardPath, { replace: true })
  }

  console.log(' Acceso de invitado permitido')
})
