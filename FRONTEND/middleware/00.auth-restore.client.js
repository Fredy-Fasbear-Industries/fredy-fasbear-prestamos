// FRONTEND/plugins/00.auth-restore.client.js
export default defineNuxtPlugin({
  name: 'auth-restore',
  enforce: 'pre', 
  async setup() {
    if (!process.client) return

    console.log('[AUTH PLUGIN] Plugin de autenticación iniciado (prioridad máxima)')
    
    const { checkAuth, user, isLoggedIn } = useAuth()
    
    // Verificar qué hay en localStorage
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user_data')
    
    console.log('[AUTH PLUGIN] Datos en localStorage:', { hasToken: !!token, hasUserData: !!userData })
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('[AUTH PLUGIN] Usuario en localStorage:', parsedUser.email)
      } catch (e) {
        console.error('[AUTH PLUGIN] Error parseando user_data:', e)
      }
    }
    
    // Intentar restaurar la sesión
    console.log('[AUTH PLUGIN] Intentando restaurar sesión...')
    const restored = checkAuth()
    
    console.log('[AUTH PLUGIN] Resultado:', { restored, hasUser: !!user.value, isLoggedIn: isLoggedIn.value, userName: user.value?.nombre, userEmail: user.value?.email })
    
    if (restored && user.value) {
      console.log('[AUTH PLUGIN] Sesión restaurada exitosamente:', user.value.email)
    } else {
      console.log('[AUTH PLUGIN] ℹ No hay sesión para restaurar')
    }
    
    // Pequeña pausa para asegurar que el estado se propague
    await new Promise(resolve => setTimeout(resolve, 50))
    
    console.log('[AUTH PLUGIN] Plugin completado')
  }
})