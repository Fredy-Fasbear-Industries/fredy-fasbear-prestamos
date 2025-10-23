<template>
  <div class="reset-password-page">
    <!-- Background decorativo -->
    <div class="auth-background">
      <div class="floating-shape shape-1">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      </div>
      <div class="floating-shape shape-2">
        <svg width="35" height="35" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <div class="floating-shape shape-3">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M6 3H8L12 7L16 3H18L12 11L18 21H16L12 17L8 21H6L12 11L6 3Z" fill="currentColor"/>
        </svg>
      </div>
    </div>

    <div class="auth-container">
      <!-- Header con logo -->
      <div class="auth-header">
        <NuxtLink to="/" class="logo-link">
          <div class="logo">
            <img src="~/assets/images/logo.png" alt="Fredy Fasbear Logo" />
            <h1>Fredy Fasbear</h1>
          </div>
        </NuxtLink>
        <p class="auth-subtitle">Restablece tu contraseña</p>
      </div>

      <!-- Contenido principal -->
      <div class="form-container">
        <!-- Estado de validación del token -->
        <div v-if="validatingToken" class="form-content">
          <div class="validating-content">
            <div class="loading-icon">
              <svg class="spinner" width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h2>Verificando enlace...</h2>
            <p>Por favor espera mientras validamos tu enlace de recuperación.</p>
          </div>
        </div>

        <!-- Token inválido/expirado -->
        <div v-else-if="tokenError" class="form-content">
          <div class="error-content">
            <div class="error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h2>Enlace inválido o expirado</h2>
            <p class="error-description">{{ tokenError }}</p>

            <div class="error-actions">
              <NuxtLink to="/forgot-password" class="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
                </svg>
                Solicitar nuevo enlace
              </NuxtLink>
              <NuxtLink to="/login" class="btn btn-secondary">Iniciar sesión</NuxtLink>
            </div>
          </div>
        </div>

        <!-- Formulario de nueva contraseña -->
        <div v-else-if="!resetSuccess" class="form-content">
          <form @submit.prevent="handleResetPassword" class="auth-form">
            <div class="form-header">
              <div class="header-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                </svg>
              </div>
              <h2>Crear Nueva Contraseña</h2>
              <p class="form-description">
                Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
              </p>
            </div>

            <!-- Alert de error -->
            <div v-if="errorMessage" class="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ errorMessage }}
            </div>

            <div class="form-group">
              <label for="newPassword">Nueva Contraseña</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="newPassword"
                  v-model="newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  :disabled="loading"
                  autocomplete="new-password"
                  minlength="8"
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                  :disabled="loading"
                >
                  <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="2"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
              <p class="field-hint">Mínimo 8 caracteres</p>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar Contraseña</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  :disabled="loading"
                  autocomplete="new-password"
                  minlength="8"
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :disabled="loading"
                >
                  <svg v-if="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="2"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
              <svg v-if="loading" class="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ loading ? 'Actualizando...' : 'Restablecer Contraseña' }}
            </button>
          </form>
        </div>

        <!-- Confirmación de éxito -->
        <div v-else class="form-content">
          <div class="success-content">
            <div class="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C13.6569 2 15.1569 2.5 16.3856 3.35814" stroke="currentColor" stroke-width="2"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h2>¡Contraseña Actualizada!</h2>
            <p class="success-description">
              Tu contraseña ha sido restablecida exitosamente.
            </p>
            <p class="success-instructions">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>

            <div class="success-actions">
              <NuxtLink to="/login" class="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" stroke-width="2"/>
                </svg>
                Ir a Iniciar Sesión
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="auth-footer">
        <p>¿Recordaste tu contraseña? <NuxtLink to="/login">Iniciar sesión</NuxtLink></p>
        <NuxtLink to="/" class="back-home">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver al inicio
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// Meta tags
useHead({
  title: 'Restablecer Contraseña',
  meta: [
    { name: 'description', content: 'Restablece la contraseña de tu cuenta de Fredy Fasbear Industries' }
  ]
})

// Composables
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

// Reactive state
const token = ref(route.query.token || '')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const validatingToken = ref(true)
const tokenError = ref('')
const errorMessage = ref('')
const resetSuccess = ref(false)

// Computed
const isFormValid = computed(() => {
  return newPassword.value.length >= 8 &&
         newPassword.value === confirmPassword.value
})

// Methods
const validateToken = async () => {
  if (!token.value) {
    tokenError.value = 'No se proporcionó un token de recuperación válido.'
    validatingToken.value = false
    return
  }

  // El token se validará cuando se envíe el formulario
  // Aquí solo verificamos que existe
  validatingToken.value = false
}

const handleResetPassword = async () => {
  errorMessage.value = ''

  // Validaciones
  if (newPassword.value.length < 8) {
    errorMessage.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }

  loading.value = true

  try {
    console.log('Reseteando contraseña con token')

    // Llamada real a la API
    const response = await $fetch(`${config.public.apiBase}/auth/reset-password`, {
      method: 'POST',
      body: {
        token: token.value,
        newPassword: newPassword.value
      }
    })

    if (response.success) {
      resetSuccess.value = true

      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      throw new Error(response.message || 'Error al restablecer la contraseña')
    }

  } catch (error) {
    console.error('Error en reset password:', error)

    const errorMsg = error.data?.message || error.message || 'Error al restablecer la contraseña'

    // Si el error es sobre token inválido/expirado/usado, mostrarlo en tokenError
    if (errorMsg.includes('inválido') || errorMsg.includes('expirado') || errorMsg.includes('utilizado')) {
      tokenError.value = errorMsg
    } else {
      errorMessage.value = errorMsg
    }
  } finally {
    loading.value = false
  }
}

// Limpiar errores cuando el usuario escribe
watch([newPassword, confirmPassword], () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
})

// Lifecycle
onMounted(() => {
  validateToken()
})
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 50%, #1A1A1A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.floating-shape {
  position: absolute;
  opacity: 0.1;
  color: #D4AF37;
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  top: 60%;
  right: 15%;
  animation-delay: 3s;
}

.shape-3 {
  bottom: 15%;
  left: 20%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(180deg); }
}

.auth-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 10;
}

.auth-header {
  background: linear-gradient(135deg, #2C3E50, #1A1A1A);
  color: white;
  text-align: center;
  padding: 2.5rem 2rem;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.logo img {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.logo h1 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #D4AF37;
  margin: 0;
}

.auth-subtitle {
  color: #ccc;
  margin: 0;
  font-size: 0.95rem;
}

.form-container {
  padding: 2.5rem;
}

.form-content {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  color: white;
}

.auth-form h2 {
  color: #2C3E50;
  margin-bottom: 1rem;
  font-size: 1.6rem;
}

.form-description {
  color: #6c757d;
  line-height: 1.6;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2C3E50;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper > svg:first-of-type {
  position: absolute;
  left: 12px;
  color: #6c757d;
  z-index: 2;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #D4AF37;
  background: white;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.input-wrapper input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  z-index: 2;
}

.toggle-password:hover {
  color: #D4AF37;
}

.field-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.btn {
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  margin-bottom: 1rem;
}

.btn-primary {
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  color: #1A1A1A;
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(212, 175, 55, 0.6);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
}

.alert {
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.alert-error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.loading-spinner,
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.validating-content,
.error-content,
.success-content {
  text-align: center;
}

.loading-icon,
.error-icon,
.success-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem auto;
  color: white;
}

.loading-icon {
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
}

.error-icon {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
}

.success-icon {
  background: linear-gradient(45deg, #28a745, #20c997);
}

.validating-content h2,
.error-content h2,
.success-content h2 {
  color: #2C3E50;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.error-description,
.success-description {
  color: #6c757d;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.success-instructions {
  color: #6c757d;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.error-actions,
.success-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-footer {
  background: #f8f9fa;
  padding: 1.5rem 2rem;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.auth-footer p {
  margin-bottom: 1rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.auth-footer a {
  color: #D4AF37;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d !important;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.back-home:hover {
  color: #2C3E50 !important;
}

@media (max-width: 640px) {
  .reset-password-page {
    padding: 1rem 0.5rem;
  }

  .auth-container {
    margin: 0;
    border-radius: 15px;
  }

  .auth-header,
  .form-container {
    padding: 1.5rem;
  }

  .header-icon,
  .loading-icon,
  .error-icon,
  .success-icon {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .logo h1 {
    font-size: 1.5rem;
  }

  .auth-form h2 {
    font-size: 1.4rem;
  }

  .success-content h2,
  .error-content h2 {
    font-size: 1.5rem;
  }
}
</style>
