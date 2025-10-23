<template>
  <div class="forgot-password-page">
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
        <p class="auth-subtitle">Recupera el acceso a tu cuenta</p>
      </div>

      <!-- Contenido principal -->
      <div class="form-container">
        <!-- Formulario de recuperación -->
        <div v-if="!emailSent" class="form-content">
          <form @submit.prevent="handleForgotPassword" class="auth-form">
            <div class="form-header">
              <div class="header-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 10L12 14L8 10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <h2>¿Olvidaste tu contraseña?</h2>
              <p class="form-description">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
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
              <label for="email">Correo Electrónico</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  :disabled="loading"
                  autocomplete="email"
                />
              </div>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="loading || !email">
              <svg v-if="loading" class="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
            </button>
          </form>
        </div>

        <!-- Confirmación de envío -->
        <div v-else class="form-content">
          <div class="success-content">
            <div class="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C13.6569 2 15.1569 2.5 16.3856 3.35814" stroke="currentColor" stroke-width="2"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h2>¡Correo enviado!</h2>
            <p class="success-description">
              Hemos enviado un enlace de recuperación a <strong>{{ email }}</strong>
            </p>
            <p class="success-instructions">
              Revisa tu bandeja de entrada y spam. El enlace será válido por 1 hora.
            </p>

            <div class="success-actions">
              <button @click="resendEmail" class="btn btn-secondary" :disabled="resendCooldown > 0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <polyline points="23,4 23,10 17,10" stroke="currentColor" stroke-width="2"/>
                  <path d="M20.49 15C19.9828 16.8399 18.8927 18.4815 17.3833 19.6853C15.8739 20.8891 14.0215 21.5866 12.0957 21.6813C10.1699 21.776 8.25744 21.2635 6.64665 20.2123C5.03585 19.1611 3.81535 17.6219 3.15742 15.8293C2.49948 14.0367 2.43688 12.0793 2.97979 10.2453C3.5227 8.41133 4.64873 6.80039 6.21317 5.66993C7.77761 4.53946 9.69318 3.95279 11.6221 4.00129C13.551 4.04979 15.4369 4.73088 16.95 5.93" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar correo' }}
              </button>
              
              <button @click="resetForm" class="btn btn-outline">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
                </svg>
                Usar otro correo
              </button>
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
  title: 'Recuperar Contraseña',
  meta: [
    { name: 'description', content: 'Recupera el acceso a tu cuenta de Fredy Fasbear Industries' }
  ]
})

// Composables
const config = useRuntimeConfig()

// Reactive state
const email = ref('')
const loading = ref(false)
const emailSent = ref(false)
const errorMessage = ref('')
const resendCooldown = ref(0)

// Methods
const handleForgotPassword = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    // Validación básica
    if (!email.value) {
      throw new Error('Por favor ingresa tu correo electrónico')
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      throw new Error('Por favor ingresa un correo electrónico válido')
    }

    console.log('Enviando email de recuperación a:', email.value)

    // Llamada real a la API
    const response = await $fetch(`${config.public.apiBase}/auth/forgot-password`, {
      method: 'POST',
      body: {
        email: email.value
      }
    })

    if (response.success) {
      emailSent.value = true
      startResendCooldown()
    } else {
      throw new Error(response.message || 'Error al enviar el correo')
    }

  } catch (error) {
    console.error('Error en forgot password:', error)
    errorMessage.value = error.data?.message || error.message || 'Error al enviar el correo de recuperación'
  } finally {
    loading.value = false
  }
}

const resendEmail = async () => {
  if (resendCooldown.value > 0) return

  loading.value = true

  try {
    console.log('Reenviando email de recuperación a:', email.value)

    const response = await $fetch(`${config.public.apiBase}/auth/forgot-password`, {
      method: 'POST',
      body: {
        email: email.value
      }
    })

    if (response.success) {
      startResendCooldown()
    } else {
      throw new Error(response.message || 'Error al reenviar')
    }

  } catch (error) {
    console.error('Error reenviando:', error)
    errorMessage.value = error.data?.message || 'Error al reenviar el correo'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  emailSent.value = false
  email.value = ''
  errorMessage.value = ''
  resendCooldown.value = 0
}

const startResendCooldown = () => {
  resendCooldown.value = 60 // 60 segundos
  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(interval)
    }
  }, 1000)
}

// Limpiar error cuando el usuario empiece a escribir
watch(() => email.value, () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
})
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 50%, #1A1A1A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
}

/* Background decorativo */
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

/* Container principal */
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

/* Header */
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

/* Form container */
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

/* Form header */
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

/* Form groups */
.form-group {
  margin-bottom: 2rem;
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

.input-wrapper svg {
  position: absolute;
  left: 12px;
  color: #6c757d;
  z-index: 2;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 0.875rem 0.875rem 2.5rem;
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

/* Buttons */
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

.btn-outline {
  background: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

/* Success content */
.success-content {
  text-align: center;
}

.success-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #28a745, #20c997);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem auto;
  color: white;
}

.success-content h2 {
  color: #2C3E50;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

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

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Alerts */
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

/* Loading spinner */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
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

/* Responsive */
@media (max-width: 640px) {
  .forgot-password-page {
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
  
  .header-icon {
    width: 60px;
    height: 60px;
  }
  
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
  
  .success-content h2 {
    font-size: 1.5rem;
  }
}
</style>