
// FRONTEND/middleware/admin.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isAuthenticated } = useAuth()
  
  console.log('👑 Middleware admin - Verificando acceso de administrador:', { ruta: to.path, usuario: user.value?.nombre, tipoUsuario: user.value?.tipoUsuario })

  // Verificar autenticación
  if (!isAuthenticated.value) {
    console.log(' Usuario no autenticado, redirigiendo a login')
    return navigateTo('/login', { 
      query: { redirect: to.fullPath },
      replace: true 
    })
  }

  // Verificar rol de administrador
  if (user.value?.tipoUsuario !== 'Administrador') {
    console.log(' Usuario sin permisos de administrador:', user.value?.tipoUsuario)
    
    // Redirigir según el tipo de usuario
    const redirectPaths = {
      'Cliente': '/dashboard',
      'Evaluador': '/evaluador',
      'Cobrador': '/collector',
      'Personal': '/personal'
    }
    
    const redirectPath = redirectPaths[user.value?.tipoUsuario] || '/auth/unauthorized'
    
    return navigateTo(redirectPath, { replace: true })
  }

  console.log(' Acceso de administrador permitido')
})
