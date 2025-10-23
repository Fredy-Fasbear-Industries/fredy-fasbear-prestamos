// FRONTEND/middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, user } = useAuth()
  
  console.log(' Middleware auth - Verificando autenticación:', { ruta: to.path, autenticado: isAuthenticated.value, usuario: user.value?.email })

  if (!isAuthenticated.value) {
    console.log(' Usuario no autenticado, redirigiendo a login')
    
    // No redirigir si ya estamos en una página de auth
    if (to.path.startsWith('/auth/')) {
      return
    }
    
    return navigateTo('/login', { 
      query: { redirect: to.fullPath },
      replace: true 
    })
  }

  console.log(' Usuario autenticado correctamente')
})
