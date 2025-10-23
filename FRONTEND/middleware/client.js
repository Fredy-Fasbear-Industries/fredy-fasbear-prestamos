
// FRONTEND/middleware/cliente.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isAuthenticated } = useAuth()
  
  console.log(' Middleware cliente - Verificando acceso de cliente:', { ruta: to.path, usuario: user.value?.nombre, tipoUsuario: user.value?.tipoUsuario })

  // Verificar autenticación
  if (!isAuthenticated.value) {
    console.log(' Usuario no autenticado, redirigiendo a login')
    return navigateTo('/login', { 
      query: { redirect: to.fullPath },
      replace: true 
    })
  }

  // Los clientes pueden acceder a sus rutas, pero verificar que no sean otros roles que no deberían estar ahí
  const rolesPermitidos = ['Cliente', 'Administrador'] // Admin puede ver todo
  
  if (!rolesPermitidos.includes(user.value?.tipoUsuario)) {
    console.log(' Usuario sin permisos de cliente:', user.value?.tipoUsuario)
    
    // Redirigir según el tipo de usuario
    const redirectPaths = {
      'Evaluador': '/evaluador',
      'Cobrador': '/collector',
      'Personal': '/personal'
    }
    
    const redirectPath = redirectPaths[user.value?.tipoUsuario] || '/auth/unauthorized'
    
    return navigateTo(redirectPath, { replace: true })
  }

  console.log(' Acceso de cliente permitido')
})
