// FRONTEND/middleware/evaluador.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isAuthenticated } = useAuth()
  
  console.log('🛡 Middleware evaluador - Verificando acceso:', { ruta: to.path, usuario: user.value?.nombre, autenticado: isAuthenticated.value, tipoUsuario: user.value?.tipoUsuario })

  // Verificar autenticación
  if (!isAuthenticated.value) {
    console.log(' Usuario no autenticado, redirigiendo a login')
    return navigateTo('/login', { 
      query: { redirect: to.fullPath },
      replace: true 
    })
  }

  // Verificar rol de evaluador o administrador
  const rolesPermitidos = ['Evaluador', 'Administrador']
  if (!rolesPermitidos.includes(user.value?.tipoUsuario)) {
    console.log(' Usuario sin permisos de evaluador:', user.value?.tipoUsuario)
    
    // Redirigir según el tipo de usuario
    const redirectPaths = {
      'Cliente': '/dashboard',
      'Cobrador': '/collector',
      'Personal': '/personal'
    }
    
    const redirectPath = redirectPaths[user.value?.tipoUsuario] || '/auth/unauthorized'
    
    return navigateTo(redirectPath, { replace: true })
  }

  console.log(' Acceso permitido al panel de evaluador')
})

