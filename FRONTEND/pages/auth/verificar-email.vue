<template>
  <div class="verificacion-page">
    <div class="verificacion-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <h2>Verificando tu email</h2>
        <p>Por favor espera un momento</p>
      </div>

      <div v-else-if="verified" class="success-state">
        <div class="icon success-icon">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C13.6569 2 15.1569 2.5 16.3856 3.35814" stroke="white" stroke-width="2"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="white" stroke-width="2"/>
          </svg>
        </div>
        <h2>Email Verificado</h2>
        <p>Tu cuenta ha sido activada exitosamente.</p>
        <button @click="irALogin" class="btn-primary">
          Iniciar Sesión
        </button>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="icon error-icon">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="white" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="white" stroke-width="2"/>
          </svg>
        </div>
        <h2>Error en la Verificación</h2>
        <p>{{ errorMessage }}</p>
        
        <div v-if="canResend" class="resend-section">
          <p>¿El enlace expiró?</p>
          <button 
            @click="reenviarVerificacion" 
            :disabled="resending"
            class="btn-secondary"
          >
            {{ resending ? 'Enviando...' : 'Reenviar Email de Verificación' }}
          </button>
        </div>
        
        <button @click="irALogin" class="btn-outline">
          Volver al Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

useHead({
  title: 'Verificar Email',
  meta: [
    { name: 'description', content: 'Verificación de email para Fredy Fasbear Industries' }
  ]
})

const route = useRoute()
const router = useRouter()
const { api } = useApi()

const loading = ref(true)
const verified = ref(false)
const error = ref(false)
const errorMessage = ref('')
const canResend = ref(false)
const resending = ref(false)
const userEmail = ref('')

const verificarEmail = async () => {
  const token = route.query.token

  if (!token) {
    error.value = true
    errorMessage.value = 'Token de verificación no proporcionado'
    loading.value = false
    return
  }

  try {
    const response = await api('/auth/verificar-email', {
      method: 'POST',
      body: { token }
    })

    if (response.success) {
      verified.value = true
    }
  } catch (err) {
    error.value = true
    
    if (err.data?.code === 'TOKEN_EXPIRED') {
      errorMessage.value = 'El enlace de verificación ha expirado'
      canResend.value = true
      userEmail.value = err.data.email
    } else {
      errorMessage.value = err.data?.message || 'Error al verificar el email'
    }
  } finally {
    loading.value = false
  }
}

const reenviarVerificacion = async () => {
  resending.value = true

  try {
    const response = await api('/auth/reenviar-verificacion', {
      method: 'POST',
      body: { email: userEmail.value }
    })

    if (response.success) {
      errorMessage.value = 'Email de verificación reenviado. Revisa tu bandeja de entrada.'
      canResend.value = false
    }
  } catch (err) {
    errorMessage.value = err.data?.message || 'Error al reenviar el email'
  } finally {
    resending.value = false
  }
}

const irALogin = () => {
  router.push('/login')
}

onMounted(() => {
  verificarEmail()
})
</script>

<style scoped>
.verificacion-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 50%, #1A1A1A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.verificacion-container {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.loading-state {
  padding: 2rem 0;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #D4AF37;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

.success-icon {
  background: #4CAF50;
}

.error-icon {
  background: #f44336;
}

h2 {
  color: #2C3E50;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.resend-section {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 10px;
  margin: 2rem 0;
}

.btn-primary, .btn-secondary, .btn-outline {
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-size: 1rem;
  margin: 0.5rem;
  width: 100%;
}

.btn-primary {
  background: #D4AF37;
  color: white;
}

.btn-primary:hover {
  background: #B8941F;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #2C3E50;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #1a252f;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: #2C3E50;
  border: 2px solid #2C3E50;
}

.btn-outline:hover {
  background: #2C3E50;
  color: white;
}

@media (max-width: 640px) {
  .verificacion-page {
    padding: 1rem;
  }
  
  .verificacion-container {
    padding: 2rem 1.5rem;
  }
}
</style>