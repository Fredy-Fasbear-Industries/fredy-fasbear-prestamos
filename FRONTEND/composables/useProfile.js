// FRONTEND/composables/useProfile.js
export const useProfile = () => {
  const { api } = useApi()
  const { user, login, getToken } = useAuth()

  // Obtener perfil completo del usuario
  const getUserProfile = async () => {
    try {
      console.log(' Cargando perfil del usuario...')
      
      const response = await api('/auth/me')
      
      if (response.success && response.data.user) {
        console.log(' Perfil cargado:', response.data.user)
        return response.data.user
      } else {
        throw new Error('No se pudo cargar el perfil')
      }
    } catch (error) {
      console.error(' Error cargando perfil:', error)
      throw error
    }
  }

  // Actualizar perfil del usuario
  const updateUserProfile = async (profileData) => {
    try {
      console.log(' Actualizando perfil...', profileData)
      
      const response = await api('/auth/profile', {
        method: 'PUT',
        body: profileData
      })

      if (response.success && response.data.user) {
        // Actualizar usuario en el estado global
        const token = getToken()
        if (token) {
          login(response.data.user, token, false)
        }
        
        console.log(' Perfil actualizado exitosamente')
        return response.data.user
      } else {
        throw new Error(response.message || 'Error al actualizar el perfil')
      }
    } catch (error) {
      console.error(' Error actualizando perfil:', error)
      throw error
    }
  }

  // Cambiar contraseña
  const changePassword = async (passwordData) => {
    try {
      console.log(' Cambiando contraseña...')
      
      const response = await api('/auth/change-password', {
        method: 'POST',
        body: passwordData
      })

      if (response.success) {
        console.log(' Contraseña actualizada exitosamente')
        return response
      } else {
        throw new Error(response.message || 'Error al cambiar la contraseña')
      }
    } catch (error) {
      console.error(' Error cambiando contraseña:', error)
      throw error
    }
  }

  // Formatear fecha para input HTML
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      
      // Formatear como YYYY-MM-DD para input type="date"
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error('Error formateando fecha:', error)
      return ''
    }
  }

  // Obtener fecha máxima permitida (18 años atrás)
  const getMaxBirthDate = () => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
  }

  return {
    getUserProfile,
    updateUserProfile,
    changePassword,
    formatDateForInput,
    getMaxBirthDate
  }
}