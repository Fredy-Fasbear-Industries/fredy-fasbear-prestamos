<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="header-container">
        <div class="header-left">
          <NuxtLink to="/dashboard" class="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2"/>
            </svg>
            Volver al Dashboard
          </NuxtLink>
        </div>
        
        <div class="header-right">
          <NuxtLink to="/" class="logo">
            <img src="~/assets/images/logo.png" alt="Fredy Fasbear Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="logo-fallback" style="display: none;">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" fill="#D4AF37" stroke="#1A1A1A" stroke-width="3"/>
                <circle cx="35" cy="35" r="8" fill="#1A1A1A"/>
                <circle cx="65" cy="35" r="8" fill="#1A1A1A"/>
                <path d="M35 65 Q50 75 65 65" stroke="#1A1A1A" stroke-width="3" fill="none"/>
              </svg>
            </div>
            <h1>Fredy Fasbear</h1>
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="profile-main">
      <div class="container">
        <section class="profile-info">
          <div class="profile-avatar">
            <div class="avatar-circle">
              <span class="avatar-initials">{{ getUserInitials() }}</span>
            </div>
            <div class="profile-details">
              <h2>{{ user?.nombre }} {{ user?.apellido }}</h2>
              <p class="user-email">{{ user?.email }}</p>
              <span class="user-type">{{ user?.tipoUsuario || 'Cliente' }}</span>
            </div>
          </div>
        </section>

        <div class="forms-grid">
          <section class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <h3>Información Personal</h3>
            </div>

            <div v-if="profileMessage.text" 
                 class="message" 
                 :class="profileMessage.type">
              <svg v-if="profileMessage.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C13.6569 2 15.1569 2.5 16.3856 3.35814" stroke="currentColor" stroke-width="2"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ profileMessage.text }}
            </div>

            <form @submit.prevent="handleUpdateProfile" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="nombre">Nombre</label>
                  <input
                    id="nombre"
                    v-model="profileForm.nombre"
                    type="text"
                    placeholder="Tu nombre"
                    required
                    :disabled="profileLoading"
                  />
                </div>

                <div class="form-group">
                  <label for="apellido">Apellido</label>
                  <input
                    id="apellido"
                    v-model="profileForm.apellido"
                    type="text"
                    placeholder="Tu apellido"
                    required
                    :disabled="profileLoading"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="telefono">Teléfono</label>
                  <input
                    id="telefono"
                    v-model="profileForm.telefono"
                    type="text"
                    placeholder="12345678"
                    required
                    maxlength="8"
                    minlength="8"
                    pattern="[0-9]{8}"
                    @input="validateNumericInput($event, 'telefono')"
                    :disabled="profileLoading"
                  />
                  <small class="form-hint">Exactamente 8 dígitos numéricos</small>
                </div>

                <div class="form-group">
                  <label for="cedula">DPI</label>
                  <input
                    id="cedula"
                    v-model="profileForm.cedula"
                    type="text"
                    placeholder="1234567890123"
                    required
                    maxlength="13"
                    minlength="13"
                    pattern="[0-9]{13}"
                    @input="validateNumericInput($event, 'cedula')"
                    :disabled="profileLoading"
                  />
                  <small class="form-hint">Exactamente 13 dígitos numéricos</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="fechaNacimiento">Fecha de Nacimiento</label>
                  <input
                    id="fechaNacimiento"
                    v-model="profileForm.fechaNacimiento"
                    type="date"
                    :max="maxBirthDate"
                    :disabled="profileLoading"
                  />
                  <small class="form-hint">Debe ser mayor de 18 años</small>
                </div>

                <div class="form-group">
                  <label for="email">Correo Electrónico</label>
                  <input
                    id="email"
                    v-model="profileForm.email"
                    type="email"
                    placeholder="tu@email.com"
                    readonly
                    disabled
                    title="El email no se puede modificar"
                  />
                  <small class="form-hint">El email no puede modificarse</small>
                </div>
              </div>

              <div class="form-group">
                <label for="direccion">Dirección</label>
                <textarea
                  id="direccion"
                  v-model="profileForm.direccion"
                  placeholder="Tu dirección completa"
                  rows="3"
                  required
                  :disabled="profileLoading"
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="profileLoading || !isProfileFormValid">
                <svg v-if="profileLoading" class="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2"/>
                  <polyline points="9,1 9,7 15,7" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ profileLoading ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </form>
          </section>

          <section class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <h3>Cambiar Contraseña</h3>
            </div>

            <div v-if="passwordMessage.text" 
                 class="message" 
                 :class="passwordMessage.type">
              <svg v-if="passwordMessage.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C13.6569 2 15.1569 2.5 16.3856 3.35814" stroke="currentColor" stroke-width="2"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ passwordMessage.text }}
            </div>

            <form @submit.prevent="handleChangePassword" class="password-form">
              <div class="form-group">
                <label for="currentPassword">Contraseña Actual</label>
                <div class="input-wrapper">
                  <input
                    id="currentPassword"
                    v-model="passwordForm.currentPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    required
                    :disabled="passwordLoading"
                  />
                  <button 
                    type="button" 
                    class="password-toggle"
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <svg v-if="showCurrentPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 4.231 7.81663 6.65 6.61L17.94 17.94Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19L9.9 4.24Z" stroke="currentColor" stroke-width="2"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="newPassword">Nueva Contraseña</label>
                <div class="input-wrapper">
                  <input
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    required
                    minlength="8"
                    :disabled="passwordLoading"
                  />
                  <button 
                    type="button" 
                    class="password-toggle"
                    @click="showNewPassword = !showNewPassword"
                  >
                    <svg v-if="showNewPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 4.231 7.81663 6.65 6.61L17.94 17.94Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19L9.9 4.24Z" stroke="currentColor" stroke-width="2"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
                <small class="form-hint">Mínimo 8 caracteres</small>
              </div>

              <div class="form-group">
                <label for="confirmNewPassword">Confirmar Nueva Contraseña</label>
                <div class="input-wrapper">
                  <input
                    id="confirmNewPassword"
                    v-model="passwordForm.confirmNewPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    required
                    minlength="8"
                    :disabled="passwordLoading"
                  />
                  <button 
                    type="button" 
                    class="password-toggle"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <svg v-if="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 4.231 7.81663 6.65 6.61L17.94 17.94Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19L9.9 4.24Z" stroke="currentColor" stroke-width="2"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" class="btn btn-secondary" :disabled="passwordLoading || !isPasswordFormValid">
                <svg v-if="passwordLoading" class="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3H7C5.9 3 5 3.9 5 5V19C5 20.1 5.9 21 7 21H15C16.1 21 17 20.1 17 19V5C17 3.9 16.1 3 15 3Z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                {{ passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña' }}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'Mi Perfil - Fredy Fasbear',
  meta: [
    { name: 'description', content: 'Actualiza tu información personal y configuración de cuenta' }
  ]
})

const { user, checkAuth } = useAuth()
const { api } = useApi()

const profileLoading = ref(false)
const passwordLoading = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const profileMessage = ref({ text: '', type: '' })
const passwordMessage = ref({ text: '', type: '' })

const profileForm = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  cedula: '',
  direccion: '',
  fechaNacimiento: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmNewPassword &&
         passwordForm.value.newPassword === passwordForm.value.confirmNewPassword &&
         passwordForm.value.newPassword.length >= 8
})

const isProfileFormValid = computed(() => {
  return profileForm.value.nombre.trim() &&
         profileForm.value.apellido.trim() &&
         profileForm.value.telefono.length === 8 &&
         profileForm.value.cedula.length === 13 &&
         profileForm.value.direccion.trim()
})

const maxBirthDate = computed(() => {
  const today = new Date()
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  return eighteenYearsAgo.toISOString().split('T')[0]
})

const validateNumericInput = (event, field) => {
  const value = event.target.value
  const numericValue = value.replace(/[^0-9]/g, '')
  profileForm.value[field] = numericValue
}

const getUserInitials = () => {
  if (!user.value) return 'U'
  
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido || ''
  
  const inicialNombre = nombre.charAt(0).toUpperCase()
  const inicialApellido = apellido.charAt(0).toUpperCase()
  
  return `${inicialNombre}${inicialApellido}` || 'U'
}

const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  
  try {
    if (dateString.includes('T')) {
      return dateString.split('T')[0]
    }
    
    if (dateString.includes('/')) {
      const parts = dateString.split('/')
      if (parts.length === 3) {
        const [day, month, year] = parts
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
    }
    
    if (dateString.includes('-')) {
      return dateString
    }
    
    return dateString
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return ''
  }
}

const loadUserProfile = async () => {
  try {
    const response = await api('/auth/me')
    
    if (response.success && response.data.user) {
      const userData = response.data.user
      
      profileForm.value = {
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        email: userData.email || '',
        telefono: userData.telefono || '',
        cedula: userData.cedula || '',
        direccion: userData.direccion || '',
        fechaNacimiento: formatDateForInput(userData.fechaNacimiento) || ''
      }
    }
  } catch (error) {
    console.error('Error cargando perfil:', error)
  }
}

const validateAge = (birthDate) => {
  if (!birthDate) return true
  
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age >= 18
}

const handleUpdateProfile = async () => {
  clearProfileMessage()
  profileLoading.value = true

  try {
    if (!profileForm.value.nombre || !profileForm.value.apellido || !profileForm.value.telefono || !profileForm.value.cedula || !profileForm.value.direccion) {
      throw new Error('Por favor completa todos los campos obligatorios')
    }

    if (profileForm.value.telefono.length !== 8) {
      throw new Error('El teléfono debe tener exactamente 8 dígitos')
    }

    if (profileForm.value.cedula.length !== 13) {
      throw new Error('El DPI debe tener exactamente 13 dígitos')
    }

    if (profileForm.value.fechaNacimiento && !validateAge(profileForm.value.fechaNacimiento)) {
      throw new Error('Debes ser mayor de 18 años')
    }

    const updateData = {
      nombre: profileForm.value.nombre.trim(),
      apellido: profileForm.value.apellido.trim(),
      telefono: profileForm.value.telefono.trim(),
      cedula: profileForm.value.cedula.trim(),
      direccion: profileForm.value.direccion.trim(),
    }

    if (profileForm.value.fechaNacimiento) {
      updateData.fechaNacimiento = profileForm.value.fechaNacimiento
    }

    const response = await api('/auth/profile', {
      method: 'PUT',
      body: updateData
    })

    if (response.success) {
      const { login, getToken } = useAuth()
      const token = getToken()
      login(response.data.user, token, false)
      
      profileMessage.value = {
        text: 'Perfil actualizado exitosamente',
        type: 'success'
      }
      
      setTimeout(() => {
        clearProfileMessage()
      }, 3000)
    } else {
      throw new Error(response.message || 'Error al actualizar el perfil')
    }

  } catch (error) {
    console.error('Error actualizando perfil:', error)
    
    let errorMessage = 'Error al actualizar el perfil'
    
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    profileMessage.value = {
      text: errorMessage,
      type: 'error'
    }
  } finally {
    profileLoading.value = false
  }
}

const handleChangePassword = async () => {
  clearPasswordMessage()
  passwordLoading.value = true

  try {
    if (!isPasswordFormValid.value) {
      throw new Error('Por favor completa todos los campos correctamente')
    }

    if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
      throw new Error('Las contraseñas nuevas no coinciden')
    }

    if (passwordForm.value.newPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres')
    }

    const response = await api('/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      }
    })

    if (response.success) {
      passwordMessage.value = {
        text: 'Contraseña actualizada exitosamente',
        type: 'success'
      }
      
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }
      
      setTimeout(() => {
        clearPasswordMessage()
      }, 3000)
    } else {
      throw new Error(response.message || 'Error al cambiar la contraseña')
    }

  } catch (error) {
    console.error('Error cambiando contraseña:', error)
    
    let errorMessage = 'Error al cambiar la contraseña'
    
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    passwordMessage.value = {
      text: errorMessage,
      type: 'error'
    }
  } finally {
    passwordLoading.value = false
  }
}

const clearProfileMessage = () => {
  profileMessage.value = { text: '', type: '' }
}

const clearPasswordMessage = () => {
  passwordMessage.value = { text: '', type: '' }
}

onMounted(async () => {
  checkAuth()
  
  if (!user.value) {
    navigateTo('/login')
    return
  }

  await loadUserProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.profile-header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #D4AF37;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: #F4D03F;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.logo img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.logo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo h1 {
  font-size: 1.25rem;
  font-weight: bold;
  color: #D4AF37;
  margin: 0;
}

.profile-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.profile-info {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.profile-avatar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-initials {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.profile-details h2 {
  color: #2C3E50;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.user-email {
  color: #6c757d;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.user-type {
  background: #D4AF37;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
}

.form-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  background: linear-gradient(45deg, #2C3E50, #34495E);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-icon {
  width: 48px;
  height: 48px;
  background: rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D4AF37;
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.profile-form,
.password-form {
  padding: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2C3E50;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #D4AF37;
}

.form-group input:disabled,
.form-group textarea:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group input[type="date"] {
  position: relative;
}

.form-group input[type="date"]::-webkit-calendar-picker-indicator {
  color: #D4AF37;
  cursor: pointer;
}

.input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #D4AF37;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  color: #6c757d;
  font-size: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  width: 100%;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary {
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.btn-secondary {
  background: linear-gradient(45deg, #2C3E50, #34495E);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(44, 62, 80, 0.3);
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .forms-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .profile-avatar {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-form,
  .password-form {
    padding: 1.5rem;
  }
  
  .section-header {
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .profile-main {
    padding: 1rem 0;
  }
  
  .profile-info {
    padding: 1.5rem;
  }
  
  .avatar-circle {
    width: 60px;
    height: 60px;
  }
  
  .avatar-initials {
    font-size: 1.2rem;
  }
}
</style>