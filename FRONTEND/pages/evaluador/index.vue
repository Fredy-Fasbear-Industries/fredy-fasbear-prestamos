<template>
  <div class="evaluador-panel">
    <header class="evaluador-header">
      <div class="header-container">
        <div class="header-left">
          <NuxtLink to="/" class="logo">
            <img src="~/assets/images/logo.png" alt="Logo">
            <div>
              <h1>Fredy Fasbear</h1>
              <span class="evaluador-badge">Panel Evaluador</span>
            </div>
          </NuxtLink>
        </div>
        
        <div class="header-right">
          <div class="evaluador-info">
            <span class="welcome-text">{{ nombreEvaluador }}</span>
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
          </div>
          
          <div class="evaluador-actions">
            <button class="btn-logout" @click="handleLogout" title="Cerrar Sesión">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div v-if="loadingInicial" class="loading-container">
      <div class="loading-spinner">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="spinning">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M16 12l-4-4-4 4" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h3>Cargando panel de evaluador...</h3>
      <p>Obteniendo estadísticas y solicitudes pendientes</p>
    </div>

    <div v-else-if="errorCarga" class="error-container">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
      </div>
      <h3>Error al cargar el panel</h3>
      <p>{{ errorCarga }}</p>
      <div class="button-group">
        <button @click.prevent="reintentar" class="btn-primary">Reintentar</button>
        <button @click.prevent="irASolicitudes" class="btn-secondary">Ver Solicitudes</button>
      </div>
    </div>

    <main v-else class="evaluador-main">
      <div class="container">
        <div class="panel-intro">
          <div class="intro-content">
            <h2>Bienvenido, {{ user?.nombre }}</h2>
            <p>Gestiona y evalúa las solicitudes de préstamo</p>
          </div>
          
          <div class="intro-actions">
            <button @click.prevent="actualizarDatos" class="btn-refresh" :disabled="cargandoDatos">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :class="{ spinning: cargandoDatos }">
                <path d="M23 4v6h-6" stroke="currentColor" stroke-width="2"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ cargandoDatos ? 'Actualizando...' : 'Actualizar' }}
            </button>
            
            <button @click.prevent="navegarASolicitudes()" class="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              </svg>
              Ver Solicitudes Pendientes
            </button>
            
            <button @click.prevent="navegarASolicitudesAprobadas()" class="btn-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
              Ver Solicitudes Aprobadas
            </button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card pendientes" @click.prevent="navegarASolicitudes('Pendiente')">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>Pendientes</h3>
              <p class="stat-number">{{ estadisticas?.solicitudesPendientes || 0 }}</p>
              <span class="stat-label">Solicitudes por revisar</span>
            </div>
            <div class="stat-action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
          </div>

          <div class="stat-card revision" @click.prevent="navegarASolicitudes('Evaluando')">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>En Evaluación</h3>
              <p class="stat-number">{{ estadisticas?.solicitudesEvaluando || 0 }}</p>
              <span class="stat-label">En proceso de evaluación</span>
            </div>
            <div class="stat-action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
          </div>

          <div class="stat-card aprobadas" @click.prevent="navegarASolicitudes()">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>Aprobadas</h3>
              <p class="stat-number">{{ estadisticas?.solicitudesAprobadas || 0 }}</p>
              <span class="stat-label">Este mes</span>
            </div>
            <div class="stat-action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
          </div>

          <div class="stat-card eficiencia">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" stroke-width="2"/>
                <polyline points="7.5,4.21 12,6.81 16.5,4.21" stroke="currentColor" stroke-width="2"/>
                <polyline points="7.5,19.79 7.5,14.6 3,12" stroke="currentColor" stroke-width="2"/>
                <polyline points="21,12 16.5,14.6 16.5,19.79" stroke="currentColor" stroke-width="2"/>
                <polyline points="12,22.81 12,16.81" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>Eficiencia</h3>
              <p class="stat-number">{{ estadisticas?.tasaAprobacion || 0 }}%</p>
              <span class="stat-label">Tasa de aprobación</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>Solicitudes Pendientes de Revisión</h2>
            <button @click.prevent="navegarASolicitudes()" class="btn-secondary">
              Ver Todas
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>

          <div v-if="cargandoSolicitudes" class="loading-solicitudes">
            <div class="loading-spinner small">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="spinning">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M16 12l-4-4-4 4" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <span>Cargando solicitudes...</span>
          </div>

          <div v-else-if="errorSolicitudes" class="error-solicitudes">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Error al cargar solicitudes</span>
            <button @click.prevent="cargarSolicitudesPendientes" class="btn-link">Reintentar</button>
          </div>

          <div v-else-if="solicitudesPendientes.length === 0" class="empty-solicitudes">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
              <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h3>Excelente trabajo</h3>
            <p>No hay solicitudes pendientes por revisar</p>
          </div>

          <div v-else class="solicitudes-list">
            <div v-for="solicitud in solicitudesPendientes" :key="solicitud.id" 
                 class="solicitud-card" 
                 @click.prevent="navegarADetalleSolicitud(solicitud.id)">
              
              <div class="solicitud-header">
                <div class="solicitud-info">
                  <h4>Solicitud #{{ solicitud.id }}</h4>
                  <span :class="`estado-badge ${solicitud.estado.toLowerCase()}`">
                    {{ formatearEstado(solicitud.estado) }}
                  </span>
                </div>
                
                <div class="solicitud-tiempo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span :class="{ urgente: solicitud.diasPendiente > 3 }">
                    {{ solicitud.diasPendiente }} {{ solicitud.diasPendiente === 1 ? 'día' : 'días' }}
                  </span>
                </div>
              </div>

              <div class="solicitud-cliente">
                <div class="cliente-avatar">
                  <span>{{ iniciales(solicitud.usuario?.nombre, solicitud.usuario?.apellido) }}</span>
                </div>
                <div class="cliente-info">
                  <h5>{{ solicitud.usuario?.nombre }} {{ solicitud.usuario?.apellido }}</h5>
                  <p>{{ solicitud.usuario?.email }}</p>
                </div>
              </div>

              <div class="solicitud-monto">
                <span class="label">Monto:</span>
                <span class="value">{{ formatMonto(solicitud.montoSolicitado) }}</span>
                <span class="label">Plazo:</span>
                <span class="value">{{ solicitud.plazoMeses }} meses</span>
              </div>

              <div class="solicitud-actions">
                <span class="fecha-solicitud">
                  Solicitado el {{ formatDate(solicitud.fechaSolicitud) }}
                </span>
                
                <div class="action-buttons">
                  <button @click.stop="navegarADetalleSolicitud(solicitud.id)" class="btn-action">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Evaluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2>Actividad Reciente</h2>
          </div>

          <div v-if="cargandoActividad" class="loading-actividad">
            <div class="loading-spinner small">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="spinning">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M16 12l-4-4-4 4" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <span>Cargando actividad...</span>
          </div>

          <div v-else-if="actividadReciente.length === 0" class="empty-actividad">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
            </svg>
            <p>No hay actividad reciente</p>
          </div>

          <div v-else class="actividad-list">
            <div v-for="actividad in actividadReciente" :key="actividad.id" class="actividad-item">
              <div class="actividad-icon" :class="getActividadType(actividad.estado)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path v-if="actividad.estado === 'Aprobada'" 
                        d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                  <polyline v-if="actividad.estado === 'Aprobada'" 
                            points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
                  
                  <circle v-else-if="actividad.estado === 'Rechazada'" 
                          cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <line v-if="actividad.estado === 'Rechazada'" 
                        x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                  <line v-if="actividad.estado === 'Rechazada'" 
                        x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                  
                  <path v-else 
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              
              <div class="actividad-content">
                <p>{{ actividad.descripcion }}</p>
                <span class="actividad-fecha">{{ formatDateHora(actividad.fecha) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Transition name="notification">
      <div v-if="notification.show" :class="`notification notification-${notification.type}`">
        <div class="notification-content">
          <svg v-if="notification.type === 'success'" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
            <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else-if="notification.type === 'error'" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>{{ notification.message }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useApi } from '~/composables/useApi'

definePageMeta({
  middleware: ['evaluador'],
  layout: 'dashboard'
})

useHead({
  title: 'Panel de Evaluador - Fredy Fasbear Préstamos',
  meta: [
    { name: 'description', content: 'Panel de control para evaluadores de solicitudes de préstamo' }
  ]
})

const { user, logout } = useAuth()
const { api } = useApi()

const loadingInicial = ref(true)
const errorCarga = ref(null)
const cargandoDatos = ref(false)

const estadisticas = ref(null)
const solicitudesPendientes = ref([])
const actividadReciente = ref([])

const cargandoSolicitudes = ref(false)
const errorSolicitudes = ref(null)
const cargandoActividad = ref(false)

const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

const nombreEvaluador = computed(() => {
  return user.value ? `${user.value.nombre} ${user.value.apellido}` : 'Evaluador'
})

const getUserInitials = () => {
  if (!user.value) return 'E'
  
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido || ''
  
  const inicialNombre = nombre.charAt(0).toUpperCase()
  const inicialApellido = apellido.charAt(0).toUpperCase()
  
  return `${inicialNombre}${inicialApellido}` || 'E'
}

const handleLogout = () => {
  logout()
  navigateTo('/')
}

const cargarDatosPanel = async () => {
  try {
    loadingInicial.value = true
    errorCarga.value = null

    console.log('Cargando datos del panel de evaluador...')

    await Promise.all([
      cargarEstadisticas(),
      cargarSolicitudesPendientes(5),
      cargarActividadReciente()
    ])

    console.log('Datos del panel cargados exitosamente')

  } catch (err) {
    console.error('Error cargando datos del panel:', err)
    errorCarga.value = err.message || 'Error al cargar el panel'
  } finally {
    loadingInicial.value = false
  }
}

const cargarEstadisticas = async () => {
  try {
    console.log('Cargando estadísticas...')
    
    const response = await api('/evaluador/stats')
    
    if (!response.success) {
      throw new Error(response.message || 'Error al cargar estadísticas')
    }

    estadisticas.value = response.data
    console.log('Estadísticas cargadas:', estadisticas.value)

  } catch (err) {
    console.error('Error cargando estadísticas:', err)
    throw err
  }
}

const cargarSolicitudesPendientes = async (limit = 5) => {
  try {
    cargandoSolicitudes.value = true
    errorSolicitudes.value = null
    
    console.log('Cargando solicitudes pendientes...')
    
    const response = await api(`/evaluador/solicitudes?estado=Pendiente&limit=${limit}`)
    
    if (!response.success) {
      throw new Error(response.message || 'Error al cargar solicitudes')
    }

    solicitudesPendientes.value = response.data.solicitudes || []
    console.log('Solicitudes pendientes cargadas:', solicitudesPendientes.value.length)

  } catch (err) {
    console.error('Error cargando solicitudes pendientes:', err)
    errorSolicitudes.value = err.message
  } finally {
    cargandoSolicitudes.value = false
  }
}

const cargarActividadReciente = async () => {
  try {
    cargandoActividad.value = true
    
    console.log('Cargando actividad reciente...')
    
    const response = await api('/evaluador/recent-activity?limit=5')
    
    if (!response.success) {
      throw new Error(response.message || 'Error al cargar actividad')
    }

    actividadReciente.value = response.data || []
    console.log('Actividad reciente cargada:', actividadReciente.value.length)

  } catch (err) {
    console.error('Error cargando actividad reciente:', err)
    actividadReciente.value = []
  } finally {
    cargandoActividad.value = false
  }
}

const navegarASolicitudes = (estado = null) => {
  console.log('Navegando a solicitudes:', estado)
  
  if (estado && typeof estado === 'object') {
    console.warn('Evento detectado, navegando sin filtro')
    navigateTo('/evaluador/solicitudes')
    return
  }
  
  if (estado && typeof estado === 'string') {
    navigateTo(`/evaluador/solicitudes?estado=${encodeURIComponent(estado)}`)
  } else {
    navigateTo('/evaluador/solicitudes')
  }
}

const navegarASolicitudesAprobadas = () => {
  console.log('Navegando a solicitudes aprobadas')
  navigateTo('/evaluador/solicitudes-aprobadas')
}

const navegarADetalleSolicitud = (solicitudId) => {
  try {
    console.log('Navegando a detalle de solicitud:', solicitudId)
    
    if (!solicitudId) {
      console.error('ID de solicitud no válido')
      return
    }
    
    navigateTo(`/evaluador/solicitudes/${solicitudId}`)
    
  } catch (err) {
    console.error('Error navegando a detalle:', err)
  }
}

const irASolicitudes = () => {
  navegarASolicitudes()
}

const actualizarDatos = async () => {
  try {
    cargandoDatos.value = true
    console.log('Actualizando datos del panel...')
    
    await Promise.all([
      cargarEstadisticas(),
      cargarSolicitudesPendientes(5),
      cargarActividadReciente()
    ])
    
    mostrarNotificacion('Datos actualizados correctamente', 'success')
    console.log('Datos actualizados exitosamente')

  } catch (err) {
    console.error('Error actualizando datos:', err)
    mostrarNotificacion('Error al actualizar datos', 'error')
  } finally {
    cargandoDatos.value = false
  }
}

const reintentar = async () => {
  await cargarDatosPanel()
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

const formatearEstado = (estado) => {
  const estados = {
    'Pendiente': 'Pendiente',
    'Evaluando': 'Evaluando',
    'Aprobada': 'Aprobada',
    'Rechazada': 'Rechazada'
  }
  return estados[estado] || estado
}

const iniciales = (nombre, apellido) => {
  const inicial1 = nombre ? nombre.charAt(0).toUpperCase() : ''
  const inicial2 = apellido ? apellido.charAt(0).toUpperCase() : ''
  return inicial1 + inicial2
}

const formatDate = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatDateHora = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMonto = (monto) => {
  if (!monto) return 'Q 0.00'
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ'
  }).format(monto)
}

const getActividadType = (estado) => {
  const tipos = {
    'Aprobada': 'success',
    'Rechazada': 'error',
    'Evaluando': 'info'
  }
  return tipos[estado] || 'info'
}

onMounted(async () => {
  console.log('Inicializando panel de evaluador para:', nombreEvaluador.value)
  await cargarDatosPanel()
})
</script>

<style scoped>
:root {
  --color-azul-marino: #2C3E50;
  --color-dorado-vintage: #D4AF37;
  --color-verde-bosque: #2ECC71;
  --color-negro-carbon: #1A1A1A;
  --color-gris-acero: #7F8C8D;
  --color-blanco-perla: #F5F5F5;
  --color-rojo-vino: #C0392B;
  --color-azul-cielo: #3498DB;
  --color-naranja-calido: #E67E22;
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.15);
  --transition: all 0.3s ease;
}

.evaluador-panel {
  min-height: 100vh;
  background: #f8f9fa;
}

.evaluador-header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
  transition: var(--transition);
}

.header-left .logo:hover {
  opacity: 0.9;
}

.header-left .logo img {
  width: 45px;
  height: 45px;
  border-radius: 8px;
}

.header-left .logo h1 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
}

.evaluador-badge {
  display: inline-block;
  background: var(--color-dorado-vintage);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.evaluador-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-text {
  font-weight: 600;
  font-size: 0.95rem;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-dorado-vintage);
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
}

.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  transition: var(--transition);
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.evaluador-main {
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.panel-intro {
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.intro-content h2 {
  margin: 0 0 0.5rem 0;
  color: var(--color-azul-marino);
  font-size: 2rem;
  font-weight: 700;
}

.intro-content p {
  margin: 0;
  color: var(--color-gris-acero);
  font-size: 1.1rem;
}

.intro-actions {
  display: flex;
  gap: 1rem;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  text-align: center;
  margin: 2rem auto;
  max-width: 600px;
}

.loading-spinner {
  margin-bottom: 1.5rem;
}

.loading-spinner svg {
  color: var(--color-dorado-vintage);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon svg {
  color: var(--color-rojo-vino);
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-card);
  transition: var(--transition);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: var(--transition);
}

.stat-card.pendientes::before {
  background: var(--color-naranja-calido);
}

.stat-card.revision::before {
  background: var(--color-azul-cielo);
}

.stat-card.aprobadas::before {
  background: var(--color-verde-bosque);
}

.stat-card.eficiencia::before {
  background: var(--color-dorado-vintage);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
}

.stat-card:hover::before {
  height: 6px;
}

.stat-card .stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 1.5rem;
}

.stat-card.pendientes .stat-icon {
  background: rgba(230, 126, 34, 0.1);
  color: var(--color-naranja-calido);
}

.stat-card.revision .stat-icon {
  background: rgba(52, 152, 219, 0.1);
  color: var(--color-azul-cielo);
}

.stat-card.aprobadas .stat-icon {
  background: rgba(46, 204, 113, 0.1);
  color: var(--color-verde-bosque);
}

.stat-card.eficiencia .stat-icon {
  background: rgba(212, 175, 55, 0.1);
  color: var(--color-dorado-vintage);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--color-azul-marino);
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-azul-marino);
  font-size: 1.1rem;
  font-weight: 600;
}

.stat-label {
  color: var(--color-gris-acero);
  font-size: 0.9rem;
}

.stat-action {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  opacity: 0;
  transition: var(--transition);
  color: var(--color-gris-acero);
}

.stat-card:hover .stat-action {
  opacity: 1;
}

.section {
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  margin-bottom: 2rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
  margin: 0;
  color: var(--color-azul-marino);
  font-size: 1.5rem;
  font-weight: 600;
}

.solicitudes-list {
  padding: 1rem;
}

.solicitud-card {
  background: var(--color-blanco-perla);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid transparent;
}

.solicitud-card:hover {
  background: white;
  border-color: var(--color-dorado-vintage);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.solicitud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.solicitud-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.solicitud-info h4 {
  margin: 0;
  color: var(--color-azul-marino);
  font-weight: 600;
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado-badge.pendiente {
  background: rgba(230, 126, 34, 0.1);
  color: var(--color-naranja-calido);
}

.estado-badge.evaluando {
  background: rgba(52, 152, 219, 0.1);
  color: var(--color-azul-cielo);
}

.solicitud-tiempo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-gris-acero);
  font-size: 0.9rem;
}

.solicitud-tiempo .urgente {
  color: var(--color-rojo-vino);
  font-weight: 600;
}

.solicitud-cliente {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.cliente-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-dorado-vintage);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.cliente-info h5 {
  margin: 0 0 0.25rem 0;
  color: var(--color-azul-marino);
  font-weight: 600;
}

.cliente-info p {
  margin: 0;
  color: var(--color-gris-acero);
  font-size: 0.9rem;
}

.solicitud-monto {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.solicitud-monto .label {
  color: var(--color-gris-acero);
  font-size: 0.85rem;
}

.solicitud-monto .value {
  color: var(--color-azul-marino);
  font-weight: 600;
  margin-right: 1rem;
}

.solicitud-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fecha-solicitud {
  color: var(--color-gris-acero);
  font-size: 0.85rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.loading-solicitudes,
.error-solicitudes,
.loading-actividad {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--color-gris-acero);
}

.loading-spinner.small svg {
  width: 20px;
  height: 20px;
}

.empty-solicitudes,
.empty-actividad {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--color-gris-acero);
}

.empty-solicitudes svg,
.empty-actividad svg {
  margin-bottom: 1rem;
  color: var(--color-verde-bosque);
}

.empty-solicitudes h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-azul-marino);
}

.actividad-list {
  padding: 1rem 2rem 2rem 2rem;
}

.actividad-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
}

.actividad-item:last-child {
  border-bottom: none;
}

.actividad-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.actividad-icon.success {
  background: rgba(46, 204, 113, 0.1);
  color: var(--color-verde-bosque);
}

.actividad-icon.error {
  background: rgba(192, 57, 43, 0.1);
  color: var(--color-rojo-vino);
}

.actividad-icon.info {
  background: rgba(52, 152, 219, 0.1);
  color: var(--color-azul-cielo);
}

.actividad-content p {
  margin: 0 0 0.25rem 0;
  color: var(--color-azul-marino);
  font-size: 0.95rem;
  line-height: 1.4;
}

.actividad-fecha {
  color: var(--color-gris-acero);
  font-size: 0.8rem;
}

.btn-primary,
.btn-secondary,
.btn-refresh,
.btn-action,
.btn-link,
.btn-success {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
}

.btn-primary {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #c19b26;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
}

.btn-success {
  background: var(--color-verde-bosque);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(46, 204, 113, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--color-gris-acero);
  border: 2px solid var(--color-gris-acero);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-gris-acero);
  color: white;
  transform: translateY(-2px);
}

.btn-refresh {
  background: transparent;
  color: var(--color-azul-cielo);
  border: 2px solid var(--color-azul-cielo);
}

.btn-refresh:hover:not(:disabled) {
  background: var(--color-azul-cielo);
  color: white;
}

.btn-action {
  background: var(--color-verde-bosque);
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

.btn-action:hover:not(:disabled) {
  background: #27ae60;
}

.btn-link {
  background: transparent;
  color: var(--color-azul-cielo);
  padding: 0.5rem;
  text-decoration: underline;
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.notification-success {
  background: var(--color-verde-bosque);
}

.notification-error {
  background: var(--color-rojo-vino);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 1024px) {
  .panel-intro {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .intro-actions {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .evaluador-panel {
    padding: 0;
  }
  
  .header-container {
    padding: 0 1rem;
  }
  
  .header-left .logo h1 {
    font-size: 1.1rem;
  }
  
  .evaluador-badge {
    font-size: 0.65rem;
    padding: 0.15rem 0.5rem;
  }
  
  .welcome-text {
    display: none;
  }
  
  .evaluador-main {
    padding: 1rem 0;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .panel-intro {
    padding: 1.5rem;
  }
  
  .intro-content h2 {
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .solicitud-card {
    padding: 1rem;
  }
  
  .solicitud-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .solicitud-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .panel-intro {
    padding: 1rem;
  }
  
  .intro-content h2 {
    font-size: 1.25rem;
  }
  
  .intro-actions {
    flex-direction: column;
  }
  
  .stat-card {
    padding: 1.5rem;
  }
  
  .section-header {
    padding: 1.5rem 1rem 1rem 1rem;
  }
  
  .solicitudes-list {
    padding: 0.5rem;
  }
  
  .actividad-list {
    padding: 1rem;
  }
}
</style>