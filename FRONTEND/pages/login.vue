<template>
  <div class="auth-page">
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
      <div class="auth-header">
        <NuxtLink to="/" class="logo-link">
          <div class="logo">
            <img src="~/assets/images/logo.png" alt="Logo">
            <h1>Fredy Fasbear</h1>
          </div>
        </NuxtLink>
        <p class="auth-subtitle">Accede a tu cuenta o únete a nuestra familia</p>
      </div>

      <div class="tab-selector">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'login' }"
          @click="setActiveTab('login')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 3H7C5.9 3 5 3.9 5 5V19C5 20.1 5.9 21 7 21H15C16.1 21 17 20.1 17 19V5C17 3.9 16.1 3 15 3Z" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          Iniciar Sesión
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'register' }"
          @click="setActiveTab('register')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M16 21V19C16 17.9 15.1 17 14 17H10C8.9 17 8 17.9 8 19V21" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          Crear Cuenta
        </button>
      </div>

      <div class="form-container">
        <div v-if="activeTab === 'login'" class="form-content">
          <form @submit.prevent="handleLogin" class="auth-form">
            <h2>Bienvenido de vuelta</h2>
            <p class="form-description">Ingresa tus credenciales para acceder a tu cuenta</p>

            <div v-if="loginMessage.text" class="alert" :class="loginMessage.type">
              <svg v-if="loginMessage.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="loginMessage.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 20h20L12 2z" stroke="currentColor" stroke-width="2" fill="none"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="17" r="1" fill="currentColor"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C13.6569 2 15.1569 2.5 16.3856 3.35814" stroke="currentColor" stroke-width="2"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ loginMessage.text }}</span>
              <button 
                v-if="loginMessage.showResend" 
                type="button"
                @click="reenviarVerificacion(loginMessage.email)"
                class="resend-btn"
                :disabled="resending"
              >
                {{ resending ? 'Enviando...' : 'Reenviar Email' }}
              </button>
            </div>

            <div class="form-group">
              <label for="login-email">Correo Electrónico</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="login-email"
                  v-model="loginForm.email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  :disabled="loginLoading"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="login-password">Contraseña</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="login-password"
                  v-model="loginForm.password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  :disabled="loginLoading"
                />
                <button 
                  type="button" 
                  class="password-toggle"
                  @click="showLoginPassword = !showLoginPassword"
                >
                  <svg v-if="showLoginPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
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

            <div class="form-options">
              <label class="checkbox-label">
                <input v-model="loginForm.remember" type="checkbox" :disabled="loginLoading">
                <span class="checkmark"></span>
                Recordarme
              </label>
              <NuxtLink to="/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</NuxtLink>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="loginLoading">
              <svg v-if="loginLoading" class="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 3H7C5.9 3 5 3.9 5 5V19C5 20.1 5.9 21 7 21H15C16.1 21 17 20.1 17 19V5C17 3.9 16.1 3 15 3Z" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
              {{ loginLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </button>
          </form>
        </div>

        <div v-if="activeTab === 'register'" class="form-content">
          <form @submit.prevent="handleRegister" class="auth-form">
            <h2>Únete a nosotros</h2>
            <p class="form-description">Crea tu cuenta y empieza a disfrutar nuestros servicios</p>

            <div v-if="registerMessage.text" class="alert" :class="registerMessage.type">
              <svg v-if="registerMessage.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C13.6569 2 15.1569 2.5 16.3856 3.35814" stroke="currentColor" stroke-width="2"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ registerMessage.text }}
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="register-name">Nombre</label>
                <div class="input-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <input
                    id="register-name"
                    v-model="registerForm.nombre"
                    type="text"
                    placeholder="Juan"
                    required
                    :disabled="registerLoading"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="register-lastname">Apellido</label>
                <div class="input-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <input
                    id="register-lastname"
                    v-model="registerForm.apellido"
                    type="text"
                    placeholder="Pérez"
                    required
                    :disabled="registerLoading"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="register-email">Correo Electrónico</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="register-email"
                  v-model="registerForm.email"
                  type="email"
                  placeholder="juan@email.com"
                  required
                  :disabled="registerLoading"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="register-birthdate">Fecha de Nacimiento</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="register-birthdate"
                  v-model="registerForm.fechaNacimiento"
                  type="date"
                  required
                  :max="maxDate"
                  :disabled="registerLoading"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="register-phone">Teléfono</label>
                <div class="input-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92V19C22 20.1046 21.1046 21 20 21H18C8.05888 21 0 12.9411 0 3V1C0 -0.104569 0.895431 -1 2 -1H5.08C5.63228 -1 6.10204 -0.530243 6.10204 0.0220408V2.5C6.10204 3.05228 5.63228 3.52204 5.08 3.52204H3C3 11.8366 9.16344 18 17.5 18V15.92C17.5 15.3677 17.9698 14.898 18.522 14.898H21C21.5523 14.898 22.0221 15.3677 22.0221 15.92L22 16.92Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <input
                    id="register-phone"
                    v-model="registerForm.telefono"
                    type="text"
                    placeholder="12345678"
                    required
                    maxlength="8"
                    pattern="[0-9]{8}"
                    @input="validateNumericInput($event, 'telefono')"
                    :disabled="registerLoading"
                  />
                </div>
                <small class="input-hint">Solo 8 dígitos numéricos</small>
              </div>

              <div class="form-group">
                <label for="register-cedula">DPI</label>
                <div class="input-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                    <line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" stroke-width="2"/>
                    <line x1="7" y1="12" x2="13" y2="12" stroke="currentColor" stroke-width="2"/>
                    <line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <input
                    id="register-cedula"
                    v-model="registerForm.cedula"
                    type="text"
                    placeholder="1234567890123"
                    required
                    maxlength="13"
                    minlength="13"
                    pattern="[0-9]{13}"
                    @input="validateNumericInput($event, 'cedula')"
                    :disabled="registerLoading"
                  />
                </div>
                <small class="input-hint">Exactamente 13 dígitos</small>
              </div>
            </div>

            <div class="form-group">
              <label for="register-address">Dirección</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="register-address"
                  v-model="registerForm.direccion"
                  type="text"
                  placeholder="Tu dirección completa"
                  required
                  :disabled="registerLoading"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="register-password">Contraseña</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="register-password"
                  v-model="registerForm.password"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  minlength="8"
                  :disabled="registerLoading"
                />
                <button 
                  type="button" 
                  class="password-toggle"
                  @click="showRegisterPassword = !showRegisterPassword"
                >
                  <svg v-if="showRegisterPassword" width="20" height="20" viewBox="0 0 24 24" fill="none">
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
              <label for="register-confirm-password">Confirmar Contraseña</label>
              <div class="input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  id="register-confirm-password"
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  :disabled="registerLoading"
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

            <div class="form-options">
              <label class="checkbox-label">
                <input v-model="registerForm.acceptTerms" type="checkbox" required :disabled="registerLoading">
                <span class="checkmark"></span>
                Acepto los <NuxtLink to="/terms" target="_blank">términos y condiciones</NuxtLink>
              </label>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="registerLoading || !isRegisterFormValid">
              <svg v-if="registerLoading" class="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M16 21V19C16 17.9 15.1 17 14 17H10C8.9 17 8 17.9 8 19V21" stroke="currentColor" stroke-width="2" fill="none"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
              {{ registerLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
            </button>
          </form>
        </div>
      </div>

      <div class="auth-footer">
        <p>¿Problemas para acceder? <NuxtLink to="/contact">Contáctanos</NuxtLink></p>
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
useHead({
  title: 'Iniciar Sesión',
  meta: [
    { name: 'description', content: 'Accede a tu cuenta de Fredy Fasbear Industries o crea una nueva cuenta como cliente' }
  ]
})

const { login, getAuthMessage, getDebugInfo, isLoggedIn, user } = useAuth()
const { api } = useApi()

const activeTab = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)
const resending = ref(false)
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)

const loginMessage = ref({ text: '', type: '', showResend: false, email: '' })
const registerMessage = ref({ text: '', type: '' })

const loginForm = ref({
  email: '',
  password: '',
  remember: false
})

const registerForm = ref({
  nombre: '',
  apellido: '',
  email: '',
  fechaNacimiento: '',
  telefono: '',
  cedula: '',
  direccion: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const maxDate = computed(() => {
  const today = new Date()
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  return eighteenYearsAgo.toISOString().split('T')[0]
})

const isRegisterFormValid = computed(() => {
  return registerForm.value.nombre.trim() &&
         registerForm.value.apellido.trim() &&
         registerForm.value.email.trim() &&
         registerForm.value.fechaNacimiento &&
         registerForm.value.telefono.length === 8 &&
         registerForm.value.cedula.length === 13 &&
         registerForm.value.direccion.trim() &&
         registerForm.value.password === registerForm.value.confirmPassword &&
         registerForm.value.password.length >= 8 &&
         registerForm.value.acceptTerms
})

const validateNumericInput = (event, field) => {
  const value = event.target.value
  const numericValue = value.replace(/[^0-9]/g, '')
  registerForm.value[field] = numericValue
}

const setActiveTab = (tab) => {
  activeTab.value = tab
  clearMessages()
}

const clearMessages = () => {
  loginMessage.value = { text: '', type: '', showResend: false, email: '' }
  registerMessage.value = { text: '', type: '' }
}

const redirectAfterLogin = (userData) => {
  const redirectUrl = process.client ? sessionStorage.getItem('redirect_after_login') : null
  
  if (redirectUrl) {
    sessionStorage.removeItem('redirect_after_login')
    
    const isAdminRoute = redirectUrl.startsWith('/admin')
    const isEvaluatorRoute = redirectUrl.startsWith('/evaluador')
    const isCollectorRoute = redirectUrl.startsWith('/collector')
    const isAdminUser = userData.tipoUsuario === 'Administrador'
    const isEvaluatorUser = userData.tipoUsuario === 'Evaluador'
    const isCollectorUser = userData.tipoUsuario === 'Cobrador'
    
    const roleRouteMatch = (
      (isAdminRoute && isAdminUser) ||
      (isEvaluatorRoute && isEvaluatorUser) ||
      (isCollectorRoute && isCollectorUser) ||
      (!isAdminRoute && !isEvaluatorRoute && !isCollectorRoute && userData.tipoUsuario === 'Cliente')
    )
    
    if (!roleRouteMatch) {
      let targetRoute = '/dashboard'
      if (isAdminUser) targetRoute = '/admin'
      else if (isEvaluatorUser) targetRoute = '/evaluador'
      else if (isCollectorUser) targetRoute = '/collector'
      
      return navigateTo(targetRoute)
    }
    
    return navigateTo(redirectUrl)
  }
  
  switch (userData.tipoUsuario) {
    case 'Administrador':
      return navigateTo('/admin')
    case 'Cliente':
      return navigateTo('/dashboard')
    case 'Evaluador':
      return navigateTo('/evaluador')
    case 'Cobrador':
      return navigateTo('/collector')
    default:
      return navigateTo('/dashboard')
  }
}

const reenviarVerificacion = async (email) => {
  resending.value = true

  try {
    const response = await api('/auth/reenviar-verificacion', {
      method: 'POST',
      body: { email }
    })

    if (response.success) {
      loginMessage.value = {
        text: 'Email de verificación reenviado. Revisa tu bandeja de entrada.',
        type: 'success',
        showResend: false,
        email: ''
      }
    }
  } catch (error) {
    loginMessage.value = {
      text: error.data?.message || 'Error al reenviar el email',
      type: 'error',
      showResend: false,
      email: ''
    }
  } finally {
    resending.value = false
  }
}

const handleLogin = async () => {
  clearMessages()
  loginLoading.value = true

  try {
    if (!loginForm.value.email || !loginForm.value.password) {
      throw new Error('Por favor completa todos los campos')
    }

    const response = await api('/auth/login', {
      method: 'POST',
      body: {
        email: loginForm.value.email,
        password: loginForm.value.password,
        remember: loginForm.value.remember
      }
    })

    if (response.success && response.data?.token && response.data?.user) {
      login(response.data.user, response.data.token, loginForm.value.remember)
      
      setTimeout(() => {
        const debugInfo = getDebugInfo()
        if (!debugInfo.isLoggedIn) {
          loginMessage.value = {
            text: 'Error guardando datos de sesión. Intenta de nuevo.',
            type: 'error'
          }
          return
        }
      }, 100)
      
      const roleConfig = {
        'Administrador': { name: 'Administrador' },
        'Evaluador': { name: 'Evaluador' },
        'Cobrador': { name: 'Cobrador' },
        'Cliente': { name: 'Cliente' }
      }
      
      const userRole = roleConfig[response.data.user.tipoUsuario] || { name: 'Usuario' }
      
      loginMessage.value = {
        text: `Bienvenido ${response.data.user.nombre}, accediendo como ${userRole.name}...`,
        type: 'success'
      }

      setTimeout(() => {
        redirectAfterLogin(response.data.user)
      }, 1500)
      
    } else {
      const errorMsg = response.message || 'Error en la respuesta del servidor'
      throw new Error(errorMsg)
    }

  } catch (error) {
    let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.'
    
    if (error.data?.code === 'EMAIL_NOT_VERIFIED') {
      errorMessage = 'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.'
      
      loginMessage.value = {
        text: errorMessage,
        type: 'warning',
        showResend: true,
        email: error.data.email
      }
      loginLoading.value = false
      return
    }
    
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.'
    } else if (error.message) {
      errorMessage = error.message
    }

    loginMessage.value = {
      text: errorMessage,
      type: 'error'
    }
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  clearMessages()
  registerLoading.value = true

  try {
    if (!isRegisterFormValid.value) {
      throw new Error('Por favor completa todos los campos correctamente')
    }

    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      throw new Error('Las contraseñas no coinciden')
    }

    if (registerForm.value.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres')
    }

    if (registerForm.value.telefono.length !== 8) {
      throw new Error('El teléfono debe tener exactamente 8 dígitos')
    }

    if (registerForm.value.cedula.length !== 13) {
      throw new Error('El DPI debe tener exactamente 13 dígitos')
    }

    if (!registerForm.value.acceptTerms) {
      throw new Error('Debes aceptar los términos y condiciones')
    }

    const response = await api('/auth/register', {
      method: 'POST',
      body: {
        nombre: registerForm.value.nombre.trim(),
        apellido: registerForm.value.apellido.trim(),
        email: registerForm.value.email.toLowerCase().trim(),
        fechaNacimiento: registerForm.value.fechaNacimiento,
        telefono: registerForm.value.telefono.trim(),
        cedula: registerForm.value.cedula.trim(),
        direccion: registerForm.value.direccion.trim(),
        password: registerForm.value.password,
        tipoUsuario: 'Cliente'
      }
    })

    if (response.success) {
      registerMessage.value = {
        text: response.message || 'Cuenta creada. Revisa tu email para verificar tu cuenta.',
        type: 'success'
      }
      
      registerForm.value = {
        nombre: '',
        apellido: '',
        email: '',
        fechaNacimiento: '',
        telefono: '',
        cedula: '',
        direccion: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
      }
      
      setTimeout(() => {
        setActiveTab('login')
        loginForm.value.email = response.data?.user?.email || ''
        loginMessage.value = {
          text: 'Verifica tu email antes de iniciar sesión.',
          type: 'info'
        }
      }, 3000)
    } else {
      throw new Error(response.message || 'Error en el registro')
    }

  } catch (error) {
    let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.'
    
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.'
    } else if (error.message) {
      errorMessage = error.message
    }

    registerMessage.value = {
      text: errorMessage,
      type: 'error'
    }
  } finally {
    registerLoading.value = false
  }
}

watch([() => loginForm.value.email, () => loginForm.value.password], () => {
  if (loginMessage.value.text) {
    clearMessages()
  }
})

watch([() => registerForm.value.email, () => registerForm.value.password], () => {
  if (registerMessage.value.text) {
    clearMessages()
  }
})

onMounted(() => {
  if (isLoggedIn.value && user.value) {
    console.log('[LOGIN] Usuario ya autenticado, redirigiendo...', user.value.email)
    
    const redirectUrl = process.client ? sessionStorage.getItem('redirect_after_login') : null
    
    if (redirectUrl) {
      sessionStorage.removeItem('redirect_after_login')
      console.log('[LOGIN] Redirigiendo a:', redirectUrl)
      return navigateTo(redirectUrl)
    }
    
    console.log('[LOGIN] Redirigiendo según rol:', user.value.tipoUsuario)
    redirectAfterLogin(user.value)
    return
  }
  
  const savedMessage = getAuthMessage()
  
  if (savedMessage) {
    loginMessage.value = {
      text: savedMessage,
      type: 'info'
    }
  }
  
  if (process.client) {
    console.log('[LOGIN] Estado inicial de autenticación:', getDebugInfo())
  }
})
</script>

<style scoped>
.auth-page {
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

.tab-selector {
  display: flex;
  background: #f8f9fa;
  margin: 0;
}

.tab-btn {
  flex: 1;
  padding: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-bottom: 3px solid transparent;
}

.tab-btn.active {
  color: #D4AF37;
  background: white;
  border-bottom-color: #D4AF37;
}

.tab-btn:hover {
  background: #f1f3f4;
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

.auth-form h2 {
  color: #2C3E50;
  margin-bottom: 0.5rem;
  font-size: 1.6rem;
}

.form-description {
  color: #6c757d;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.input-wrapper input[type="date"] {
  color-scheme: light;
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

.input-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6c757d;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #D4AF37;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #6c757d;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 0.5rem;
  accent-color: #D4AF37;
}

.forgot-link {
  color: #D4AF37;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
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

.alert {
  padding: 0.875rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  flex-wrap: wrap;
}

.alert span {
  flex: 1;
}

.alert.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.alert.info {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
}

.alert.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.alert.warning {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.resend-btn {
  padding: 0.5rem 1rem;
  background: #D4AF37;
  color: #1A1A1A;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resend-btn:hover:not(:disabled) {
  background: #B8941F;
  transform: translateY(-1px);
}

.resend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  color: #6c757d;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.back-home:hover {
  color: #2C3E50;
}

@media (max-width: 640px) {
  .auth-page {
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
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tab-btn {
    padding: 1rem;
    font-size: 0.9rem;
  }
  
  .alert {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .resend-btn {
    width: 100%;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .logo h1 {
    font-size: 1.5rem;
  }
  
  .auth-form h2 {
    font-size: 1.4rem;
  }
}
</style>