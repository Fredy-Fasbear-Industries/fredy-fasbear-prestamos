// FRONTEND/middleware/cobrador.js
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()

  if (!user.value) {
    console.warn(' Usuario no autenticado intentando acceder a cobrador')
    
    if (process.client && to.path !== '/login') {
      sessionStorage.setItem('redirect_after_login', to.fullPath)
    }
    
    return navigateTo('/login')
  }

  if (user.value.tipoUsuario !== 'Cobrador') {
    console.warn(' Usuario sin permisos de cobrador:', { email: user.value?.email, tipoUsuario: user.value?.tipoUsuario, rutaIntentada: to.fullPath })
    
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso Denegado',
      data: {
        message: 'No tienes permisos para acceder a esta sección.',
        requiredRole: 'Cobrador',
        currentRole: user.value?.tipoUsuario || 'Sin rol',
        suggestion: 'Contacta al administrador si necesitas acceso.'
      }
    })
  }

  console.log(' Acceso autorizado a cobrador:', { email: user.value.email, nombre: `${user.value.nombre} ${user.value.apellido}`, ruta: to.fullPath })
})