<template>
  <div class="solicitudes-evaluador">
    <div class="page-header">
      <div class="header-left">
        <button @click="volverAlPanel" class="btn-volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver al Panel
        </button>
        
        <div class="header-info">
          <h1>Solicitudes Pendientes</h1>
          <p>Evalúa las solicitudes de préstamo de los clientes</p>
        </div>
      </div>
      
      <button @click="cargarSolicitudes" class="btn-refresh" :disabled="loading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :class="{ spinning: loading }">
          <path d="M23 4v6h-6" stroke="currentColor" stroke-width="2"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36" stroke="currentColor" stroke-width="2"/>
        </svg>
        Actualizar
      </button>
    </div>

    <div class="filtros-container">
      <div class="filtros-info">
        <div class="info-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>{{ totalSolicitudes }} solicitud{{ totalSolicitudes !== 1 ? 'es' : '' }} pendiente{{ totalSolicitudes !== 1 ? 's' : '' }}</span>
        </div>
      </div>
      
      <div class="filtros-busqueda">
        <input 
          v-model="busqueda" 
          type="text" 
          placeholder="Buscar por nombre del cliente..."
          @input="buscarSolicitudes"
          class="input-busqueda"
        >
      </div>
    </div>

    <div v-if="loading && !solicitudes.length" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando solicitudes...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
      <h3>Error al cargar</h3>
      <p>{{ error }}</p>
      <button @click="cargarSolicitudes" class="btn-primary">Reintentar</button>
    </div>

    <div v-else-if="solicitudes.length" class="solicitudes-grid">
      <div 
        v-for="solicitud in solicitudes" 
        :key="solicitud.id"
        class="solicitud-card"
        @click="verDetalle(solicitud.id)"
      >
        <div class="solicitud-header">
          <div class="solicitud-numero">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
            </svg>
            Solicitud #{{ solicitud.id }}
          </div>
          <span class="estado-badge pendiente">
            Pendiente
          </span>
        </div>

        <div class="solicitud-cliente">
          <div class="cliente-avatar">
            {{ getIniciales(solicitud.usuario) }}
          </div>
          <div class="cliente-info">
            <h4>{{ solicitud.usuario.nombre }} {{ solicitud.usuario.apellido }}</h4>
            <p>{{ solicitud.usuario.email }}</p>
            <p>{{ solicitud.usuario.telefono }}</p>
          </div>
        </div>

        <div class="solicitud-detalles">
          <div class="detalle-item">
            <span class="label">Fecha:</span>
            <span class="value">{{ formatDate(solicitud.fechaSolicitud) }}</span>
          </div>
          <div class="detalle-item" v-if="solicitud.montoSolicitado">
            <span class="label">Monto:</span>
            <span class="value">Q {{ formatearMoneda(solicitud.montoSolicitado) }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Días pendiente:</span>
            <span class="value">{{ solicitud.diasPendiente }} días</span>
          </div>
        </div>

        <div class="solicitud-accion">
          <button @click.stop="verDetalle(solicitud.id)" class="btn-evaluar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            Evaluar
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2"/>
      </svg>
      <h3>No hay solicitudes pendientes</h3>
      <p>Todas las solicitudes han sido evaluadas</p>
    </div>

    <div v-if="pagination.totalPages > 1" class="paginacion">
      <button 
        @click="cambiarPagina(pagination.page - 1)"
        :disabled="pagination.page === 1"
        class="btn-paginacion"
      >
        Anterior
      </button>
      
      <span class="pagina-info">
        Página {{ pagination.page }} de {{ pagination.totalPages }}
      </span>
      
      <button 
        @click="cambiarPagina(pagination.page + 1)"
        :disabled="pagination.page === pagination.totalPages"
        class="btn-paginacion"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

definePageMeta({
  middleware: ['evaluador'],
  layout: 'dashboard'
})

useHead({
  title: 'Solicitudes Pendientes - Panel de Evaluador'
})

const { api } = useApi()

const loading = ref(false)
const error = ref(null)
const solicitudes = ref([])
const totalSolicitudes = ref(0)
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0
})

const busqueda = ref('')

const volverAlPanel = () => {
  navigateTo('/evaluador')
}

const cargarSolicitudes = async () => {
  try {
    loading.value = true
    error.value = null

    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.limit,
      estado: 'Pendiente'
    })

    if (busqueda.value) {
      params.append('busqueda', busqueda.value)
    }

    const response = await api(`/evaluador/solicitudes?${params}`)

    if (response.success) {
      solicitudes.value = response.data.solicitudes
      pagination.value = {
        ...pagination.value,
        ...response.data.pagination
      }
      totalSolicitudes.value = response.data.pagination.total
    }

  } catch (err) {
    console.error('Error cargando solicitudes:', err)
    error.value = err.message || 'Error al cargar solicitudes'
  } finally {
    loading.value = false
  }
}

let busquedaTimeout = null
const buscarSolicitudes = () => {
  clearTimeout(busquedaTimeout)
  busquedaTimeout = setTimeout(() => {
    pagination.value.page = 1
    cargarSolicitudes()
  }, 500)
}

const cambiarPagina = (nuevaPagina) => {
  if (nuevaPagina < 1 || nuevaPagina > pagination.value.totalPages) return
  pagination.value.page = nuevaPagina
  cargarSolicitudes()
}

const verDetalle = (solicitudId) => {
  navigateTo(`/evaluador/solicitudes/${solicitudId}`)
}

const getIniciales = (usuario) => {
  if (!usuario) return '?'
  const inicial1 = usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : ''
  const inicial2 = usuario.apellido ? usuario.apellido.charAt(0).toUpperCase() : ''
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

const formatearMoneda = (monto) => {
  if (!monto) return '0.00'
  return parseFloat(monto).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

onMounted(() => {
  cargarSolicitudes()
})
</script>

<style scoped>
.solicitudes-evaluador {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.btn-volver {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #D4AF37;
  border-radius: 8px;
  color: #2C3E50;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-volver:hover {
  background: #D4AF37;
  color: white;
  transform: translateX(-4px);
}

.header-info h1 {
  margin: 0 0 0.25rem 0;
  color: #2C3E50;
  font-size: 1.75rem;
}

.header-info p {
  margin: 0;
  color: #7F8C8D;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover:not(:disabled) {
  border-color: #D4AF37;
  background: #fff9e6;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filtros-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.filtros-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  border-radius: 8px;
  color: #856404;
  font-weight: 600;
}

.filtros-busqueda {
  flex: 1;
  max-width: 400px;
}

.input-busqueda {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.input-busqueda:focus {
  outline: none;
  border-color: #D4AF37;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}

.error-state svg {
  color: #C0392B;
  margin-bottom: 1rem;
}

.empty-state svg {
  color: #2ECC71;
  margin-bottom: 1rem;
}

.solicitudes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.solicitud-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.solicitud-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.solicitud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.solicitud-numero {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2C3E50;
}

.estado-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.pendiente {
  background: #fff3cd;
  color: #856404;
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
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D4AF37, #C49B27);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.cliente-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2C3E50;
  font-weight: 600;
}

.cliente-info p {
  margin: 0;
  color: #7F8C8D;
  font-size: 0.875rem;
}

.solicitud-detalles {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detalle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detalle-item .label {
  color: #7F8C8D;
  font-size: 0.875rem;
}

.detalle-item .value {
  color: #2C3E50;
  font-weight: 600;
}

.solicitud-accion {
  display: flex;
  justify-content: flex-end;
}

.btn-evaluar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #D4AF37;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-evaluar:hover {
  background: #C49B27;
  transform: translateX(4px);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #D4AF37;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #C49B27;
}

.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-paginacion {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #D4AF37;
  color: #2C3E50;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-paginacion:hover:not(:disabled) {
  background: #D4AF37;
  color: white;
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #e9ecef;
}

.pagina-info {
  color: #7F8C8D;
  font-weight: 500;
}

@media (max-width: 768px) {
  .solicitudes-evaluador {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
  }

  .filtros-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filtros-busqueda {
    max-width: 100%;
  }

  .solicitudes-grid {
    grid-template-columns: 1fr;
  }
}
</style>