<template>
  <div class="backups-page">
    <div class="backups-container">
      <!-- Botón de regreso -->
      <div class="navigation-header">
        <NuxtLink to="/admin" class="btn-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="12,19 5,12 12,5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Volver al Panel de Administración
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <p>Cargando logs de auditoría...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>Error al cargar logs</h3>
        <p>{{ error }}</p>
        <button @click="cargarLogs" class="btn-primary">
          Reintentar
        </button>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Header -->
        <div class="backups-header">
          <div class="header-content">
            <div class="header-info">
              <h1>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
                </svg>
                Auditoría y Logs del Sistema
              </h1>
              <p>Monitoreo y registro de todas las actividades del sistema</p>
            </div>
            <div class="header-actions">
              <button @click="cargarLogs" :disabled="loading" class="btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Actualizar
              </button>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="stats-row">
            <div class="stat-box">
              <div class="stat-icon" style="background: rgba(212, 175, 55, 0.1); color: #D4AF37;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-info">
                <h3>{{ totalLogs }}</h3>
                <p>Eventos Registrados</p>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon" style="background: rgba(52, 152, 219, 0.1); color: #3498DB;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-info">
                <h3>{{ ultimaActualizacion }}</h3>
                <p>Última Actualización</p>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon" style="background: rgba(39, 174, 96, 0.1); color: #27AE60;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-info">
                <h3>{{ logs.filter(l => l.usuario).length }}</h3>
                <p>Usuarios Activos</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de Logs -->
        <div class="backups-table-container">
          <div class="table-header">
            <h2>Registro de Actividades</h2>
            <div class="filtros-grupo">
              <select v-model="filtros.accion" @change="aplicarFiltros" class="filter-select">
                <option value="">Todas las acciones</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREAR">Crear</option>
                <option value="ACTUALIZAR">Actualizar</option>
                <option value="ELIMINAR">Eliminar</option>
                <option value="CONSULTAR">Consultar</option>
                <option value="PAGO">Pago</option>
              </select>

              <select v-model="filtros.entidad" @change="aplicarFiltros" class="filter-select">
                <option value="">Todas las entidades</option>
                <option value="Usuario">Usuario</option>
                <option value="Cliente">Cliente</option>
                <option value="Evento">Evento</option>
                <option value="Paquete">Paquete</option>
                <option value="Parametro">Parámetro</option>
              </select>

              <button @click="limpiarFiltros" class="btn-refresh" v-if="filtrosActivos">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
                Limpiar
              </button>
            </div>
          </div>

          <!-- Barra de búsqueda -->
          <div class="search-container">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
            </svg>
            <input 
              v-model="filtros.search"
              @input="debouncedSearch"
              type="text" 
              placeholder="Buscar por acción, entidad, usuario o IP..."
              class="search-input"
            >
          </div>

          <!-- Empty State -->
          <div v-if="logs.length === 0" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h3>No hay logs registrados</h3>
            <p>No se encontraron eventos que coincidan con los filtros aplicados</p>
          </div>

          <!-- Tabla -->
          <table v-else class="backups-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>Usuario</th>
                <th>Fecha y Hora</th>
                <th>IP</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="log in logs" :key="log.id">
                <tr class="backup-row">
                  <td>
                    <span class="backup-id">#{{ log.id }}</span>
                  </td>
                  <td>
                    <span :class="['badge-accion', getActionClass(log.accion)]">
                      {{ log.accion }}
                    </span>
                  </td>
                  <td>
                    <strong>{{ log.entidad }}</strong>
                    <div v-if="log.entidadId" class="entity-id">ID: {{ log.entidadId }}</div>
                  </td>
                  <td>
                    <div class="usuario-info">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      {{ log.usuario ? `${log.usuario.nombre} ${log.usuario.apellido}` : 'Sistema' }}
                    </div>
                  </td>
                  <td>
                    <div class="fecha-info">
                      <strong>{{ formatFecha(log.fechaHora) }}</strong>
                    </div>
                  </td>
                  <td>
                    <code class="ip-address">{{ log.ipAddress }}</code>
                  </td>
                  <td>
                    <button @click="toggleDetalles(log)" class="btn-action">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="1" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="5" r="1" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="19" r="1" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
                <!-- Detalles expandidos - ahora DENTRO del template -->
                <tr v-if="logExpandido === log.id" class="details-row">
                  <td colspan="7">
                    <div class="log-details">
                      <div class="detail-grid">
                        <div class="detail-item">
                          <span class="detail-label">User Agent:</span>
                          <span class="detail-value">{{ log.userAgent || 'N/A' }}</span>
                        </div>
                        <div class="detail-item" v-if="log.detalles">
                          <span class="detail-label">Detalles:</span>
                          <pre class="json-details">{{ formatJSON(log.detalles) }}</pre>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              @click="cambiarPagina(paginaActual - 1)"
              :disabled="paginaActual === 1"
              class="pagination-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
              </svg>
              Anterior
            </button>

            <span class="pagination-info">
              Página {{ paginaActual }} de {{ totalPages }}
            </span>

            <button 
              @click="cambiarPagina(paginaActual + 1)"
              :disabled="paginaActual === totalPages"
              class="pagination-btn"
            >
              Siguiente
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Middleware
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

// Meta tags
useHead({
  title: 'Auditoría y Logs - Admin'
})

// Composables
const { getLogs } = useAuditLogs()

// Estado
const loading = ref(false)
const error = ref(null)
const logs = ref([])
const totalLogs = ref(0)
const paginaActual = ref(1)
const registrosPorPagina = ref(20)
const logExpandido = ref(null)

// Filtros
const filtros = ref({
  search: '',
  accion: '',
  entidad: ''
})

// Debounce timer
let searchTimeout = null

// Computed
const totalPages = computed(() => {
  return Math.ceil(totalLogs.value / registrosPorPagina.value)
})

const ultimaActualizacion = computed(() => {
  if (!logs.value.length) return 'N/A'
  const now = new Date()
  const latest = new Date(logs.value[0].fechaHora)
  const diff = Math.floor((now - latest) / 1000)
  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  return `Hace ${Math.floor(diff / 3600)} hrs`
})

const filtrosActivos = computed(() => {
  return filtros.value.search || filtros.value.accion || filtros.value.entidad
})

// Métodos
const cargarLogs = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = {
      page: paginaActual.value,
      limit: registrosPorPagina.value,
      ...filtros.value
    }
    
    const response = await getLogs(params)
    
    if (response.success) {
      logs.value = response.data.logs || []
      totalLogs.value = response.data.total || 0
    }
  } catch (err) {
    console.error('Error cargando logs:', err)
    error.value = err.message || 'Error al cargar los logs'
  } finally {
    loading.value = false
  }
}

const aplicarFiltros = () => {
  paginaActual.value = 1
  cargarLogs()
}

const limpiarFiltros = () => {
  filtros.value = {
    search: '',
    accion: '',
    entidad: ''
  }
  aplicarFiltros()
}

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    aplicarFiltros()
  }, 500)
}

const cambiarPagina = (nuevaPagina) => {
  if (nuevaPagina >= 1 && nuevaPagina <= totalPages.value) {
    paginaActual.value = nuevaPagina
    cargarLogs()
  }
}

const toggleDetalles = (log) => {
  logExpandido.value = logExpandido.value === log.id ? null : log.id
}

// Formatters
const formatFecha = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatJSON = (json) => {
  if (!json) return 'N/A'
  try {
    return JSON.stringify(json, null, 2)
  } catch {
    return 'Formato inválido'
  }
}

const getActionClass = (accion) => {
  const actionMap = {
    'LOGIN': 'success',
    'LOGOUT': 'info',
    'CREAR': 'primary',
    'ACTUALIZAR': 'warning',
    'ELIMINAR': 'danger',
    'CONSULTAR': 'info',
    'PAGO': 'success'
  }
  return actionMap[accion] || 'default'
}

// Lifecycle
onMounted(() => {
  cargarLogs()
})
</script>

<style scoped>
/* Estilos base */
.backups-page {
  min-height: 100vh;
  padding: 2rem 0;
}

.backups-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Botón de regreso */
.navigation-header {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid rgba(212, 175, 55, 0.5);
  color: #D4AF37;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-back:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #D4AF37;
}

/* Estados de carga */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6c757d;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-state svg {
  animation: spin 1s linear infinite;
  color: #D4AF37;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg {
  color: #E74C3C;
  margin-bottom: 1rem;
}

.error-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: #2C3E50;
}

/* Header */
.backups-header {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.header-info h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2C3E50;
}

.header-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
}

/* Botón primario - FONDO DORADO SÓLIDO */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #D4AF37;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #B8941F;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Estadísticas */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #f8f9fa;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2C3E50;
}

.stat-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
}

/* Tabla de respaldos */
.backups-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.table-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2C3E50;
}

.filtros-grupo {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #D4AF37;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border: 1px solid rgba(212, 175, 55, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: rgba(212, 175, 55, 0.2);
}

/* Búsqueda */
.search-container {
  position: relative;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.search-container svg {
  position: absolute;
  left: 2.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-state svg {
  color: #D4AF37;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: #2C3E50;
}

/* Tabla */
.backups-tabla {
  width: 100%;
  border-collapse: collapse;
}

.backups-tabla thead th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.backup-row {
  border-bottom: 1px solid #e9ecef;
  transition: background 0.2s;
}

.backup-row:hover {
  background: #f8f9fa;
}

.backups-tabla td {
  padding: 1rem;
  color: #2C3E50;
}

.backup-id {
  font-weight: 600;
  color: #6c757d;
}

/* Badges de acción */
.badge-accion {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-accion.success {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.badge-accion.warning {
  background: rgba(243, 156, 18, 0.1);
  color: #F39C12;
}

.badge-accion.danger {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.badge-accion.info {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.badge-accion.primary {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

/* Otros elementos */
.entity-id {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
}

.fecha-info strong {
  color: #2C3E50;
}

.ip-address {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #6c757d;
}

.btn-action {
  background: rgba(212, 175, 55, 0.1);
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #D4AF37;
  transition: all 0.3s ease;
}

.btn-action:hover {
  background: rgba(212, 175, 55, 0.2);
}

/* Detalles expandidos */
.details-row td {
  background: #f8f9fa;
  padding: 0 !important;
}

.log-details {
  padding: 1.5rem 2rem;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #6c757d;
  font-size: 0.9rem;
}

.json-details {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #2C3E50;
  border: 1px solid #e9ecef;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
}

.pagination-btn {
  background: white;
  border: 2px solid #D4AF37;
  color: #D4AF37;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #D4AF37;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-info {
  color: #6c757d;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .backups-tabla {
    font-size: 0.85rem;
  }

  .backups-tabla thead {
    display: none;
  }

  .backup-row {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #e9ecef;
    border-radius: 8px;
  }

  .backups-tabla td {
    display: block;
    text-align: right;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .backups-tabla td:before {
    content: attr(data-label);
    float: left;
    font-weight: 600;
    color: #2C3E50;
  }
}
</style>