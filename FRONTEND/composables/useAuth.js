export const useAuth = () => {
  const TOKEN_KEY = 'token'
  const USER_DATA_KEY = 'user_data'

  const findExistingToken = () => {
    if (!process.client) return null
    
    const possibleTokenKeys = ['token', 'auth_token', 'auth-token', 'authToken']
    
    for (const key of possibleTokenKeys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (token) return token
    }
    return null
  }

  const findExistingUserData = () => {
    if (!process.client) return null
    
    const possibleUserKeys = ['user_data', 'user-data', 'userData']
    
    for (const key of possibleUserKeys) {
      const userDataStr = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (userDataStr) {
        try {
          return JSON.parse(userDataStr)
        } catch (error) {
          console.error(`[AUTH] ✗ Error parseando datos:`, error)
        }
      }
    }
    return null
  }

  const clearAllTokens = () => {
    if (!process.client) return
    
    const possibleTokenKeys = ['token', 'auth_token', 'auth-token', 'authToken']
    const possibleUserKeys = ['user_data', 'user-data', 'userData']
    
    possibleTokenKeys.forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
    
    possibleUserKeys.forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
  }

  const initializeUserState = () => {
    if (!process.client) return null
    
    const token = findExistingToken()
    const userData = findExistingUserData()
    
    if (token && userData) {
      return userData
    }
    
    return null
  }

  const user = useState('auth.user', () => initializeUserState())

  const redirectAfterLogin = (tipoUsuario) => {
    console.log('[AUTH] Redirigiendo usuario tipo:', tipoUsuario)
    
    switch(tipoUsuario) {
      case 'Administrador':
        return navigateTo('/admin')
        
      case 'Evaluador':
        return navigateTo('/evaluador')
        
      case 'Cobrador':
        return navigateTo('/collector')
        
      case 'Cliente':
        return navigateTo('/dashboard')
        
      case 'Personal':
        return navigateTo('/personal')
        
      default:
        console.error('[AUTH] Tipo de usuario desconocido:', tipoUsuario)
        return navigateTo('/')
    }
  }

  const checkAuth = () => {
    if (!process.client) return false
    
    const token = findExistingToken()
    const userData = findExistingUserData()
    
    if (token && userData) {
      if (!user.value || user.value.email !== userData.email) {
        user.value = { ...userData }
      }
      return true
    }
    
    user.value = null
    return false
  }

  const login = (userData, token, remember = false) => {
    if (!process.client) return
    
    console.log('[AUTH LOGIN] Iniciando sesión:', userData.email)
    
    clearAllTokens()
    
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    
    user.value = { ...userData }
    
    console.log('[AUTH LOGIN] Login completado')
    
    redirectAfterLogin(userData.tipoUsuario)
  }

  const logout = () => {
    if (!process.client) return
    
    console.log('[AUTH LOGOUT] 🚪 Cerrando sesión')
    
    user.value = null
    clearAllTokens()
    
    console.log('[AUTH LOGOUT] Sesión cerrada')
  }

  const getToken = () => {
    if (!process.client) return null
    return findExistingToken()
  }

  const isLoggedIn = computed(() => !!user.value)
  const isClient = computed(() => user.value && user.value.tipoUsuario === 'Cliente')
  const isAdmin = computed(() => user.value && user.value.tipoUsuario === 'Administrador')
  const isEvaluator = computed(() => user.value && user.value.tipoUsuario === 'Evaluador')
  const isCollector = computed(() => user.value && user.value.tipoUsuario === 'Cobrador')

  const requireAuth = (redirectTo = '/login') => {
    if (!isLoggedIn.value) {
      navigateTo(redirectTo)
      return false
    }
    return true
  }

  const requireAuthWithMessage = (message = 'Debes iniciar sesión', redirectTo = '/login') => {
    if (!isLoggedIn.value) {
      if (process.client) {
        sessionStorage.setItem('auth_message', message)
      }
      navigateTo(redirectTo)
      return false
    }
    return true
  }

  const getAuthMessage = () => {
    if (process.client) {
      const message = sessionStorage.getItem('auth_message')
      if (message) {
        sessionStorage.removeItem('auth_message')
        return message
      }
    }
    return null
  }

  const initAuth = () => {
    if (process.client) {
      return checkAuth()
    }
    return false
  }

  const getDebugInfo = () => {
    if (!process.client) return {}
    
    return {
      userState: user.value,
      isLoggedIn: isLoggedIn.value,
      isAdmin: isAdmin.value,
      isClient: isClient.value,
      isEvaluator: isEvaluator.value,
      isCollector: isCollector.value,
      token: getToken() ? 'Present' : 'Missing',
      tokensInStorage: {
        localStorage: Object.keys(localStorage).filter(key => 
          key.includes('token') || key.includes('user')),
        sessionStorage: Object.keys(sessionStorage).filter(key => 
          key.includes('token') || key.includes('user'))
      }
    }
  }

  return {
    user: readonly(user),
    isLoggedIn,
    isAuthenticated: isLoggedIn,
    isClient,
    isAdmin,
    isEvaluator,
    isCollector,
    login,
    logout,
    checkAuth,
    getToken,
    initAuth,
    redirectAfterLogin,
    requireAuth,
    requireAuthWithMessage,
    getAuthMessage,
    getDebugInfo
  }
}