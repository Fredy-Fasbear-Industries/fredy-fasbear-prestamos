<template>
  <div class="debug-container">
    <h1>Debug de Autenticación</h1>
    
    <div class="debug-section">
      <h2>Estado Actual</h2>
      <div class="info-box">
        <p><strong>isAuthenticated:</strong> {{ isAuthenticated ? 'SÍ' : 'NO' }}</p>
        <p><strong>Usuario:</strong> {{ user ? user.nombre : 'null' }}</p>
        <p><strong>Email:</strong> {{ user ? user.email : 'null' }}</p>
        <p><strong>Tipo:</strong> {{ user ? user.tipoUsuario : 'null' }}</p>
      </div>
    </div>

    <div class="debug-section">
      <h2>LocalStorage</h2>
      <div class="storage-box">
        <p><strong>token:</strong> {{ tokenExists ? 'EXISTE' : 'NO EXISTE' }}</p>
        <p><strong>user_data:</strong> {{ userDataExists ? 'EXISTE' : 'NO EXISTE' }}</p>
        <pre>{{ storageData }}</pre>
      </div>
    </div>

    <div class="debug-section">
      <h2>Acciones</h2>
      <div class="button-group">
        <button @click="checkAuth()" class="btn-primary">
          Verificar Autenticación
        </button>
        <button @click="goToLogin" class="btn-success">
          Ir a Login
        </button>
        <button @click="clearStorage" class="btn-danger">
          Limpiar Storage
        </button>
        <button @click="reload" class="btn-info">
          Recargar Página
        </button>
      </div>
    </div>

    <div v-if="message" class="message" :class="message.type">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { isAuthenticated, user, checkAuth: verifyAuth, logout } = useAuth()

const tokenExists = ref(false)
const userDataExists = ref(false)
const storageData = ref({})
const message = ref(null)

function loadStorageData() {
  if (process.client) {
    tokenExists.value = !!localStorage.getItem('token')
    userDataExists.value = !!localStorage.getItem('user_data')
    
    storageData.value = {
      token: localStorage.getItem('token')?.substring(0, 20) + '...',
      user_data: localStorage.getItem('user_data')
    }
  }
}

function checkAuth() {
  const result = verifyAuth()
  message.value = {
    text: result ? 'Usuario autenticado correctamente' : 'Usuario NO autenticado',
    type: result ? 'success' : 'error'
  }
  loadStorageData()
  
  setTimeout(() => {
    message.value = null
  }, 3000)
}

function goToLogin() {
  router.push('/login')
}

function clearStorage() {
  logout()
  loadStorageData()
  message.value = {
    text: 'Storage limpiado',
    type: 'success'
  }
  
  setTimeout(() => {
    message.value = null
  }, 3000)
}

function reload() {
  window.location.reload()
}

onMounted(() => {
  loadStorageData()
  console.log('Estado de autenticación:', { isAuthenticated: isAuthenticated.value, user: user.value })
})
</script>

<style scoped>
.debug-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: monospace;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.debug-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  color: #34495e;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.info-box,
.storage-box {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #d4af37;
}

.info-box p,
.storage-box p {
  margin: 0.5rem 0;
}

pre {
  background: #2c3e50;
  color: #fff;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 1rem;
}

.button-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.button-group button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-success {
  background: #2ecc71;
  color: white;
}

.btn-success:hover {
  background: #27ae60;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-info {
  background: #95a5a6;
  color: white;
}

.btn-info:hover {
  background: #7f8c8d;
}

.message {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-weight: 600;
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
</style>