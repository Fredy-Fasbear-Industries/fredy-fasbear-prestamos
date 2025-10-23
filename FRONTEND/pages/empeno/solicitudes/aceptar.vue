<template>
  <div class="aceptar-prestamo-page">
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="spinning">
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <p>Cargando información...</p>
    </div>

    <div class="error-container" v-else-if="error">
      <div class="error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h2>Error al cargar</h2>
      <p>{{ error }}</p>
      <button @click="volverAtras" class="btn-primary">Volver</button>
    </div>

    <div class="container" v-else-if="solicitud">
      <div class="header">
        <button @click="volverAtras" class="btn-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver
        </button>
        <h1>Solicitar Préstamo</h1>
        <p class="subtitle">Completa los siguientes pasos para aceptar tu préstamo</p>
      </div>

      <div class="progress-bar">
        <div 
          v-for="(paso, index) in pasos" 
          :key="index"
          class="progress-step"
          :class="{ 
            active: pasoActual === index + 1, 
            completed: pasoActual > index + 1 
          }"
        >
          <div class="step-circle">
            <svg v-if="pasoActual > index + 1" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ paso }}</span>
        </div>
      </div>

      <div class="content-card">
        <div v-if="pasoActual === 1" class="paso-container">
          <h2>Resumen del Préstamo</h2>
          <p class="paso-descripcion">Revisa los detalles de tu préstamo aprobado</p>

          <div class="resumen-grid">
            <div class="resumen-card principal">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                  <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="card-content">
                <span class="card-label">Monto Aprobado</span>
                <span class="card-value">Q{{ formatCurrency(solicitud.prestamo?.montoSolicitado) }}</span>
              </div>
            </div>

            <div class="resumen-card">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="card-content">
                <span class="card-label">Plazo</span>
                <span class="card-value">{{ solicitud.prestamo?.plazoMeses }} meses</span>
              </div>
            </div>

            <div class="resumen-card">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 14S9.5 16 12 16S16 14 16 14" stroke="currentColor" stroke-width="2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2"/>
                  <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="card-content">
                <span class="card-label">Tasa de Interés</span>
                <span class="card-value">{{ solicitud.prestamo?.tasaInteres }}%</span>
              </div>
            </div>

            <div class="resumen-card destacada">
              <div class="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4H8" stroke="currentColor" stroke-width="2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="card-content">
                <span class="card-label">Total a Pagar</span>
                <span class="card-value">Q{{ formatCurrency(solicitud.prestamo?.totalAPagar) }}</span>
              </div>
            </div>
          </div>

          <div class="info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 16V12" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8H12.01" stroke="currentColor" stroke-width="2"/>
            </svg>
            <p>Al continuar, deberás validar tus datos personales y subir fotos de tu DPI para completar el proceso.</p>
          </div>

          <div class="button-group">
            <button @click="siguientePaso" class="btn-primary btn-large">
              Continuar
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="pasoActual === 2" class="paso-container">
          <h2>Validación de Datos Personales</h2>
          <p class="paso-descripcion">Confirma que tu información sea correcta</p>

          <form @submit.prevent="siguientePaso" class="form-datos">
            <div class="form-grid">
              <div class="form-group">
                <label for="nombre">Nombre Completo</label>
                <input 
                  type="text" 
                  id="nombre" 
                  v-model="formDatos.nombre" 
                  required
                  placeholder="Ingresa tu nombre"
                >
              </div>

              <div class="form-group">
                <label for="apellido">Apellido</label>
                <input 
                  type="text" 
                  id="apellido" 
                  v-model="formDatos.apellido" 
                  required
                  placeholder="Ingresa tu apellido"
                >
              </div>

              <div class="form-group">
                <label for="cedula">DPI</label>
                <input 
                  type="text" 
                  id="cedula" 
                  v-model="formDatos.cedula" 
                  required
                  placeholder="0000 00000 0000"
                  maxlength="20"
                >
              </div>

              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input 
                  type="tel" 
                  id="telefono" 
                  v-model="formDatos.telefono" 
                  required
                  placeholder="0000-0000"
                >
              </div>

              <div class="form-group full-width">
                <label for="direccion">Dirección Completa</label>
                <textarea 
                  id="direccion" 
                  v-model="formDatos.direccion" 
                  required
                  rows="3"
                  placeholder="Ingresa tu dirección completa"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="fechaNacimiento">Fecha de Nacimiento</label>
                <input 
                  type="date" 
                  id="fechaNacimiento" 
                  v-model="formDatos.fechaNacimiento" 
                  required
                  :max="fechaMaxima"
                >
              </div>
            </div>

            <div class="info-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>Asegúrate de que todos los datos coincidan con tu DPI. Cualquier discrepancia podría retrasar tu solicitud.</p>
            </div>

            <div class="button-group">
              <button type="button" @click="anteriorPaso" class="btn-secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
                </svg>
                Anterior
              </button>
              <button type="submit" class="btn-primary btn-large">
                Continuar
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </form>
        </div>

        <div v-if="pasoActual === 3" class="paso-container">
          <h2>Documentación de Identidad</h2>
          <p class="paso-descripcion">Sube fotos claras de ambos lados de tu DPI</p>

          <div class="upload-grid">
            <div class="upload-card">
              <div class="upload-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 10L12 14L16 10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3>DPI Frontal</h3>
              </div>
              
              <div class="upload-area" :class="{ 'has-file': previsualizacionFrontal }">
                <input 
                  type="file" 
                  ref="dpiFrontalInput"
                  @change="handleDpiFrontal" 
                  accept="image/*"
                  hidden
                >
                
                <div v-if="!previsualizacionFrontal" class="upload-placeholder" @click="$refs.dpiFrontalInput.click()">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" stroke-width="2"/>
                    <polyline points="17,8 12,3 7,8" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <p>Click para subir foto</p>
                  <span>Parte frontal del DPI</span>
                </div>

                <div v-else class="preview-container">
                  <img :src="previsualizacionFrontal" alt="DPI Frontal" class="preview-image">
                  <button type="button" @click="eliminarDpiFrontal" class="btn-remove-file">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  <div class="file-info">
                    <p>{{ fotoDpiFrontal?.name }}</p>
                    <span>{{ formatFileSize(fotoDpiFrontal?.size) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="upload-card">
              <div class="upload-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 10L12 14L16 10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3>DPI Trasero</h3>
              </div>
              
              <div class="upload-area" :class="{ 'has-file': previsualizacionTrasero }">
                <input 
                  type="file" 
                  ref="dpiTraseroInput"
                  @change="handleDpiTrasero" 
                  accept="image/*"
                  hidden
                >
                
                <div v-if="!previsualizacionTrasero" class="upload-placeholder" @click="$refs.dpiTraseroInput.click()">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" stroke-width="2"/>
                    <polyline points="17,8 12,3 7,8" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <p>Click para subir foto</p>
                  <span>Parte trasera del DPI</span>
                </div>

                <div v-else class="preview-container">
                  <img :src="previsualizacionTrasero" alt="DPI Trasero" class="preview-image">
                  <button type="button" @click="eliminarDpiTrasero" class="btn-remove-file">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  <div class="file-info">
                    <p>{{ fotoDpiTrasero?.name }}</p>
                    <span>{{ formatFileSize(fotoDpiTrasero?.size) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="info-box warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.64 21H20.36A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" stroke-width="2" fill="none"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="17" r="1" fill="currentColor"/>
            </svg>
            <div>
              <p><strong>Importante:</strong></p>
              <ul>
                <li>Las fotos deben ser claras y legibles</li>
                <li>Asegúrate de que toda la información sea visible</li>
                <li>Formato aceptado: JPG, PNG, WebP</li>
                <li>Se requieren ambas fotos para continuar</li>
              </ul>
            </div>
          </div>

          <div class="button-group">
            <button type="button" @click="anteriorPaso" class="btn-secondary" :disabled="subiendoDPI">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
              </svg>
              Anterior
            </button>
            <button 
              @click="continuarConDPI" 
              class="btn-primary btn-large"
              :disabled="!fotoDpiFrontal || !fotoDpiTrasero || subiendoDPI"
            >
              <svg v-if="subiendoDPI" width="20" height="20" viewBox="0 0 24 24" fill="none" class="spinning">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
              <span v-if="!subiendoDPI">Continuar</span>
              <span v-else>Procesando...</span>
              <svg v-if="!subiendoDPI" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="pasoActual === 4" class="paso-container">
          <h2>Confirmar Aceptación</h2>
          <p class="paso-descripcion">Revisa y confirma que deseas aceptar este préstamo</p>

          <div class="confirmacion-container">
            <div class="check-item completed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Datos personales validados</span>
            </div>

            <div class="check-item completed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Documentos DPI subidos</span>
            </div>

            <div class="resumen-final">
              <h3>Resumen del Préstamo</h3>
              <div class="resumen-item">
                <span>Monto:</span>
                <strong>Q{{ formatCurrency(solicitud.prestamo?.montoSolicitado) }}</strong>
              </div>
              <div class="resumen-item">
                <span>Plazo:</span>
                <strong>{{ solicitud.prestamo?.plazoMeses }} meses</strong>
              </div>
              <div class="resumen-item">
                <span>Interés:</span>
                <strong>{{ solicitud.prestamo?.tasaInteres }}%</strong>
              </div>
              <div class="resumen-item total">
                <span>Total a pagar:</span>
                <strong>Q{{ formatCurrency(solicitud.prestamo?.totalAPagar) }}</strong>
              </div>
            </div>

            <div class="checkbox-container">
              <label class="checkbox-label">
                <input type="checkbox" v-model="confirmarAceptacion">
                <span class="checkbox-custom"></span>
                <span class="checkbox-text">
                  Confirmo que he revisado toda la información y acepto los términos del préstamo
                </span>
              </label>
            </div>

            <div class="info-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 16V12" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8H12.01" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>Al aceptar, el evaluador generará tu contrato. Recibirás una notificación cuando esté listo para firmar.</p>
            </div>
          </div>

          <div class="button-group">
            <button type="button" @click="anteriorPaso" class="btn-secondary" :disabled="procesandoAceptacion">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
              </svg>
              Anterior
            </button>
            <button 
              @click="procesarAceptacion" 
              class="btn-primary btn-large"
              :disabled="!confirmarAceptacion || procesandoAceptacion"
            >
              <svg v-if="procesandoAceptacion" width="20" height="20" viewBox="0 0 24 24" fill="none" class="spinning">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
              <span v-if="!procesandoAceptacion">Aceptar Préstamo</span>
              <span v-else>Procesando...</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="notification-container" v-if="notification.show">
      <div class="notification" :class="`notification-${notification.type}`">
        <div class="notification-content">
          <svg v-if="notification.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          <svg v-else-if="notification.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>{{ notification.message }}</span>
        </div>
        <button @click="notification.show = false" class="notification-close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { obtenerDetalleSolicitud, aceptarOferta } = useSolicitudes()
const config = useRuntimeConfig()

useHead({
  title: 'Aceptar Préstamo - Mis Empéños',
  meta: [
    { name: 'description', content: 'Acepta tu préstamo aprobado' }
  ]
})

const loading = ref(true)
const error = ref(null)
const solicitud = ref(null)
const pasoActual = ref(1)
const subiendoDPI = ref(false)
const procesandoAceptacion = ref(false)
const confirmarAceptacion = ref(false)
const dpiSubido = ref(false)

const pasos = ['Resumen', 'Datos Personales', 'Documentación', 'Confirmación']

const formDatos = ref({
  nombre: '',
  apellido: '',
  cedula: '',
  telefono: '',
  direccion: '',
  fechaNacimiento: ''
})

const fotoDpiFrontal = ref(null)
const fotoDpiTrasero = ref(null)
const previsualizacionFrontal = ref(null)
const previsualizacionTrasero = ref(null)

const dpiFrontalInput = ref(null)
const dpiTraseroInput = ref(null)

const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

const solicitudId = computed(() => {
  const id = route.query.id || route.params.id
  const parsedId = parseInt(id)
  
  if (isNaN(parsedId) || parsedId <= 0) {
    console.error('ID de solicitud inválido:', id)
    return null
  }
  
  return parsedId
})

const fechaMaxima = computed(() => {
  const hoy = new Date()
  hoy.setFullYear(hoy.getFullYear() - 18)
  return hoy.toISOString().split('T')[0]
})

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const cargarDatosSolicitud = async () => {
  try {
    if (!solicitudId.value) {
      error.value = 'ID de solicitud inválido. Por favor, vuelve a intentarlo.'
      loading.value = false
      return
    }
    
    loading.value = true
    error.value = null
    
    const response = await obtenerDetalleSolicitud(solicitudId.value)
    
    if (response.success && response.data) {
      solicitud.value = response.data
      
      if (user.value) {
        formDatos.value.nombre = user.value.nombre || ''
        formDatos.value.apellido = user.value.apellido || ''
        formDatos.value.telefono = user.value.telefono || ''
        formDatos.value.cedula = user.value.cedula || ''
        formDatos.value.direccion = user.value.direccion || ''
        
        if (user.value.fechaNacimiento) {
          const fecha = new Date(user.value.fechaNacimiento)
          formDatos.value.fechaNacimiento = fecha.toISOString().split('T')[0]
        }
      }
    } else {
      throw new Error(response.message || 'No se pudo cargar la solicitud')
    }
  } catch (err) {
    console.error('Error cargando solicitud:', err)
    error.value = err.message || 'Error al cargar los datos de la solicitud'
  } finally {
    loading.value = false
  }
}

const handleDpiFrontal = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!tiposPermitidos.includes(file.type)) {
    mostrarNotificacion('Por favor selecciona una imagen válida (JPG, PNG o WEBP)', 'error')
    event.target.value = ''
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    mostrarNotificacion('La imagen no puede exceder 10MB', 'error')
    event.target.value = ''
    return
  }

  fotoDpiFrontal.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    previsualizacionFrontal.value = e.target.result
  }
  reader.readAsDataURL(file)

  console.log('DPI Frontal seleccionado:', file.name)
}

const handleDpiTrasero = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!tiposPermitidos.includes(file.type)) {
    mostrarNotificacion('Por favor selecciona una imagen válida (JPG, PNG o WEBP)', 'error')
    event.target.value = ''
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    mostrarNotificacion('La imagen no puede exceder 10MB', 'error')
    event.target.value = ''
    return
  }

  fotoDpiTrasero.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    previsualizacionTrasero.value = e.target.result
  }
  reader.readAsDataURL(file)

  console.log('DPI Trasero seleccionado:', file.name)
}

const eliminarDpiFrontal = () => {
  fotoDpiFrontal.value = null
  previsualizacionFrontal.value = null
  if (dpiFrontalInput.value) {
    dpiFrontalInput.value.value = ''
  }
}

const eliminarDpiTrasero = () => {
  fotoDpiTrasero.value = null
  previsualizacionTrasero.value = null
  if (dpiTraseroInput.value) {
    dpiTraseroInput.value.value = ''
  }
}

const continuarConDPI = async () => {
  try {
    if (!fotoDpiFrontal.value || !fotoDpiTrasero.value) {
      mostrarNotificacion('Por favor, sube ambas fotos del DPI', 'error')
      return
    }

    subiendoDPI.value = true

    const formData = new FormData()
    formData.append('dpiFrontal', fotoDpiFrontal.value)
    formData.append('dpiTrasero', fotoDpiTrasero.value)

    console.log('Subiendo documentos DPI para solicitud:', solicitudId.value)

    const { getToken } = useAuth()
    const token = getToken()

    const response = await fetch(`${config.public.apiBase}/solicitudes/${solicitudId.value}/documentos-dpi`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const result = await response.json()

    if (result.success) {
      console.log('Documentos DPI subidos exitosamente')
      mostrarNotificacion('Documentos subidos exitosamente', 'success')
      dpiSubido.value = true
      pasoActual.value = 4
    } else {
      throw new Error(result.message || 'Error al subir documentos')
    }

  } catch (err) {
    console.error('Error subiendo documentos DPI:', err)
    mostrarNotificacion(err.message || 'Error al subir los documentos', 'error')
  } finally {
    subiendoDPI.value = false
  }
}

const procesarAceptacion = async () => {
  try {
    if (!confirmarAceptacion.value) {
      mostrarNotificacion('Debes confirmar que aceptas las condiciones', 'error')
      return
    }

    if (!dpiSubido.value) {
      mostrarNotificacion('Debes subir las fotos del DPI primero', 'error')
      pasoActual.value = 3
      return
    }

    procesandoAceptacion.value = true

    console.log('Procesando aceptación de oferta...')

    const datosAceptacion = {
      datosUsuario: {
        nombre: formDatos.value.nombre.trim(),
        apellido: formDatos.value.apellido.trim(),
        cedula: formDatos.value.cedula.trim(),
        telefono: formDatos.value.telefono.trim(),
        email: user.value.email,
        direccion: formDatos.value.direccion.trim(),
        fechaNacimiento: formDatos.value.fechaNacimiento
      },
      confirmarAceptacion: true
    }

    const resultado = await aceptarOferta(solicitudId.value, datosAceptacion)

    if (resultado.success) {
      console.log('Oferta aceptada exitosamente')
      mostrarNotificacion('Oferta aceptada exitosamente. El evaluador generará tu contrato.', 'success')
      
      setTimeout(() => {
        router.push(`/empeno/solicitudes/${solicitudId.value}`)
      }, 2000)
    } else {
      throw new Error(resultado.message || 'Error al aceptar la oferta')
    }

  } catch (err) {
    console.error('Error procesando aceptación:', err)
    
    let mensajeError = 'Error al procesar la aceptación'
    
    if (err.message.includes('DPI_INCOMPLETO')) {
      mensajeError = 'Debes subir ambas fotos del DPI antes de aceptar'
      pasoActual.value = 3
    } else if (err.message.includes('OFERTA_YA_ACEPTADA')) {
      mensajeError = 'Ya has aceptado esta oferta previamente'
      setTimeout(() => {
        router.push(`/empeno/solicitudes/${solicitudId.value}`)
      }, 2000)
    } else if (err.message) {
      mensajeError = err.message
    }
    
    mostrarNotificacion(mensajeError, 'error')
    error.value = mensajeError
  } finally {
    procesandoAceptacion.value = false
  }
}

const siguientePaso = () => {
  if (pasoActual.value < 4) {
    pasoActual.value++
  }
}

const anteriorPaso = () => {
  if (pasoActual.value > 1) {
    pasoActual.value--
  }
}

const volverAtras = () => {
  if (solicitudId.value) {
    router.push(`/empeno/solicitudes/${solicitudId.value}`)
  } else {
    router.push('/empeno')
  }
}

const mostrarNotificacion = (message, type = 'success') => {
  notification.value = {
    show: true,
    type,
    message
  }
  
  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

onMounted(async () => {
  if (!solicitudId.value) {
    error.value = 'ID de solicitud inválido. Redirigiendo...'
    setTimeout(() => {
      router.push('/empeno')
    }, 2000)
    return
  }

  try {
    loading.value = true
    
    const { getToken } = useAuth()
    const token = getToken()
    
    const verificacionResponse = await fetch(
      `${config.public.apiBase}/solicitudes/${solicitudId.value}/verificar-aceptacion`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
    
    if (verificacionResponse.status === 200) {
      const verificacion = await verificacionResponse.json()
      
      if (verificacion.success && verificacion.data?.clienteAceptoOferta) {
        mostrarNotificacion('Ya has aceptado esta oferta previamente', 'info')
        setTimeout(() => {
          router.push(`/empeno/solicitudes/${solicitudId.value}`)
        }, 2000)
        return
      }
    }
    
    await cargarDatosSolicitud()
    
  } catch (err) {
    console.log('Cliente aún no ha aceptado, puede continuar')
    await cargarDatosSolicitud()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
:root {
  --color-negro-carbon: #1A1A1A;
  --color-blanco-perla: #F5F5F5;
  --color-gris-acero: #4A4A4A;
  --color-azul-marino: #2C3E50;
  --color-dorado-vintage: #D4AF37;
  --color-dorado-claro: #F4D03F;
  --color-rojo-granate: #8B0000;
  --color-marron-chocolate: #3E2723;
  --color-verde-bosque: #1B4332;
  --border-radius: 12px;
  --shadow-card: 0 15px 35px rgba(26, 26, 26, 0.2);
  --transition: all 0.3s ease;
}

.aceptar-prestamo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
  padding: 2rem 0;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
  color: var(--color-blanco-perla);
}

.loading-spinner {
  margin-bottom: 1.5rem;
}

.loading-spinner svg {
  color: var(--color-dorado-vintage);
}

.error-icon {
  margin-bottom: 1.5rem;
  color: var(--color-rojo-granate);
}

.error-container h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-blanco-perla);
  margin-bottom: 0.5rem;
}

.error-container p {
  color: var(--color-gris-acero);
  margin-bottom: 2rem;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(245, 245, 245, 0.1);
  border: 1px solid rgba(245, 245, 245, 0.2);
  color: var(--color-blanco-perla);
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 8px;
  transition: var(--transition);
  margin-bottom: 1.5rem;
}

.btn-back:hover {
  background: rgba(245, 245, 245, 0.2);
  transform: translateX(-2px);
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-blanco-perla);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: rgba(245, 245, 245, 0.8);
  font-size: 1.125rem;
}

.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
  padding: 0 2rem;
  position: relative;
}

.progress-bar::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 20%;
  right: 20%;
  height: 2px;
  background: rgba(245, 245, 245, 0.2);
  z-index: 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(245, 245, 245, 0.3);
  background: var(--color-azul-marino);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: rgba(245, 245, 245, 0.6);
  transition: var(--transition);
}

.progress-step.active .step-circle {
  border-color: var(--color-dorado-vintage);
  background: var(--color-dorado-vintage);
  color: white;
}

.progress-step.completed .step-circle {
  border-color: var(--color-verde-bosque);
  background: var(--color-verde-bosque);
  color: white;
}

.step-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(245, 245, 245, 0.6);
}

.progress-step.active .step-label,
.progress-step.completed .step-label {
  color: var(--color-blanco-perla);
  font-weight: 600;
}

.content-card {
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  padding: 3rem;
}

.paso-container h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin-bottom: 0.5rem;
}

.paso-descripcion {
  color: var(--color-gris-acero);
  margin-bottom: 2rem;
}

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.resumen-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: var(--border-radius);
  border: 2px solid transparent;
  transition: var(--transition);
}

.resumen-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(26, 26, 26, 0.1);
}

.resumen-card.principal {
  border-color: var(--color-dorado-vintage);
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.resumen-card.destacada {
  border-color: var(--color-verde-bosque);
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.card-icon {
  padding: 1rem;
  border-radius: var(--border-radius);
  flex-shrink: 0;
}

.resumen-card.principal .card-icon {
  background: var(--color-dorado-vintage);
  color: white;
}

.resumen-card.destacada .card-icon {
  background: var(--color-verde-bosque);
  color: white;
}

.resumen-card:not(.principal):not(.destacada) .card-icon {
  background: var(--color-azul-marino);
  color: white;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gris-acero);
}

.card-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.resumen-card.principal .card-value {
  color: var(--color-dorado-vintage);
  font-size: 1.5rem;
}

.resumen-card.destacada .card-value {
  color: var(--color-verde-bosque);
  font-size: 1.5rem;
}

.form-datos {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: var(--color-negro-carbon);
  font-size: 0.875rem;
}

.form-group input,
.form-group textarea {
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: var(--transition);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.upload-card {
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  background: #f8fafc;
}

.upload-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.upload-header svg {
  color: var(--color-azul-marino);
}

.upload-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: var(--border-radius);
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  background: white;
  cursor: pointer;
}

.upload-area:hover {
  border-color: var(--color-dorado-vintage);
  background: #FFF9E6;
}

.upload-area.has-file {
  border-color: var(--color-verde-bosque);
  border-style: solid;
  cursor: default;
  padding: 1rem;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--color-gris-acero);
  text-align: center;
}

.upload-placeholder svg {
  opacity: 0.5;
}

.upload-placeholder p {
  font-weight: 500;
  margin: 0;
}

.upload-placeholder span {
  font-size: 0.875rem;
  opacity: 0.7;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-image {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--color-dorado-vintage);
}

.btn-remove-file {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  background: var(--color-rojo-granate);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.btn-remove-file:hover {
  background: #A00000;
  transform: scale(1.1);
}

.btn-remove-file svg {
  color: white;
}

.file-info {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 6px;
  border-left: 3px solid var(--color-dorado-vintage);
}

.file-info p {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0 0 0.25rem 0;
  word-break: break-word;
}

.file-info span {
  font-size: 0.8rem;
  color: var(--color-gris-acero);
}

.confirmacion-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--border-radius);
  border-left: 4px solid transparent;
}

.check-item.completed {
  border-left-color: var(--color-verde-bosque);
}

.check-item svg {
  color: var(--color-verde-bosque);
  flex-shrink: 0;
}

.check-item span {
  font-weight: 500;
  color: var(--color-negro-carbon);
}

.resumen-final {
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: var(--border-radius);
  border: 2px solid #e5e7eb;
}

.resumen-final h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin-bottom: 1.5rem;
}

.resumen-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.resumen-item:last-child {
  border-bottom: none;
}

.resumen-item.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid var(--color-dorado-vintage);
}

.resumen-item span {
  color: var(--color-gris-acero);
}

.resumen-item strong {
  color: var(--color-negro-carbon);
  font-size: 1.125rem;
}

.resumen-item.total strong {
  color: var(--color-dorado-vintage);
  font-size: 1.5rem;
}

.checkbox-container {
  padding: 1.5rem;
  background: #fff;
  border-radius: var(--border-radius);
  border: 2px solid #e5e7eb;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 24px;
  height: 24px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  flex-shrink: 0;
  position: relative;
  transition: var(--transition);
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
  background: var(--color-dorado-vintage);
  border-color: var(--color-dorado-vintage);
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  flex: 1;
  line-height: 1.6;
  color: var(--color-negro-carbon);
}

.info-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--color-azul-marino);
  margin-bottom: 2rem;
}

.info-box svg {
  color: var(--color-azul-marino);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.info-box p {
  margin: 0;
  color: var(--color-azul-marino);
  line-height: 1.6;
}

.info-box.warning {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-left-color: var(--color-dorado-vintage);
}

.info-box.warning svg,
.info-box.warning p,
.info-box.warning strong {
  color: var(--color-marron-chocolate);
}

.info-box ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.info-box li {
  margin-bottom: 0.25rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-dorado-claro);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn-secondary {
  background: var(--color-gris-acero);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-negro-carbon);
  transform: translateY(-1px);
}

.notification-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1100;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  max-width: 400px;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 25px 50px rgba(26, 26, 26, 0.25);
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-success {
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.95), rgba(5, 150, 105, 0.95));
  color: var(--color-blanco-perla);
}

.notification-error {
  background: linear-gradient(135deg, rgba(139, 0, 0, 0.95), rgba(220, 38, 38, 0.95));
  color: var(--color-blanco-perla);
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.notification-content svg {
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.notification-close {
  background: none;
  border: none;
  color: currentColor;
  opacity: 0.7;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: opacity 0.2s ease;
}

.notification-close:hover {
  opacity: 1;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .content-card {
    padding: 2rem 1.5rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .progress-bar {
    padding: 0;
  }

  .progress-bar::before {
    left: 15%;
    right: 15%;
  }

  .step-circle {
    width: 40px;
    height: 40px;
    font-size: 0.875rem;
  }

  .step-label {
    font-size: 0.75rem;
  }

  .resumen-grid,
  .form-grid,
  .upload-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group button {
    width: 100%;
    justify-content: center;
  }

  .notification-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }

  .notification {
    max-width: 100%;
  }

  .preview-image {
    height: 220px;
  }
}
</style>