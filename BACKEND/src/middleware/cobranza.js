export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isAuthenticated } = useAuth()
  
  console.log('Middleware cobranza - Verificando acceso de cobrador:', { ruta: to.path, usuario: user.value?.nombre, tipoUsuario: user.value?.tipoUsuario })

  if (!isAuthenticated.value) {
    console.log(' Usuario no autenticado, redirigiendo a login')
    return navigateTo('/login', { 
      query: { redirect: to.fullPath },
      replace: true 
    })
  }

  const rolesPermitidos = ['Cobrador', 'Administrador']
  
  if (!rolesPermitidos.includes(user.value?.tipoUsuario)) {
    console.log(' Usuario sin permisos de cobrador:', user.value?.tipoUsuario)
    
    const redirectPaths = {
      'Cliente': '/empeno',
      'Evaluador': '/evaluador',
      'Personal': '/personal'
    }
    
    const redirectPath = redirectPaths[user.value?.tipoUsuario] || '/auth/unauthorized'
    
    return navigateTo(redirectPath, { replace: true })
  }

  console.log(' Acceso de cobrador permitido')
})