<template>
  <div class="solicitudes-aprobadas">
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-left">
        <button @click="volverAlPanel" class="btn-volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver al Panel
        </button>
        
        <div class="header-info">
          <h1>Solicitudes Aprobadas</h1>
          <p>Revisa las solicitudes que han sido aprobadas</p>
        </div>
      </div>
      
      <div class="header-actions">
        <button @click="cargarSolicitudes" class="btn-refresh" :disabled="loading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :class="{ spinning: loading }">
            <path d="M23 4v6h-6" stroke="currentColor" stroke-width="2"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36" stroke="currentColor" stroke-width="2"/>
          </svg>
          Actualizar
        </button>
      </div>
    </div>

    <!-- ESTADÍSTICAS RÁPIDAS -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
            <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Total Aprobadas</h3>
          <p class="stat-number">{{ pagination.total }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Con Contrato</h3>
          <p class="stat-number">{{ solicitudesConContrato }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Sin Contrato</h3>
          <p class="stat-number">{{ solicitudesSinContrato }}</p>
        </div>
      </div>
    </div>

    <!-- FILTROS -->
    <div class="filtros-container">
      <div class="filtros-busqueda">
        <input 
          v-model="busqueda" 
          type="text" 
          placeholder="Buscar por cliente, número de solicitud..."
          @input="buscarSolicitudes"
          class="input-busqueda"
        >
      </div>
      
      <div class="filtros-opciones">
        <select v-model="filtroContrato" @change="aplicarFiltros" class="select-filtro">
          <option value="">Todas</option>
          <option value="con-contrato">Con contrato</option>
          <option value="sin-contrato">Sin contrato</option>
        </select>
        
        <select v-model="ordenamiento" @change="cargarSolicitudes" class="select-filtro">
          <option value="fecha-desc">Más recientes</option>
          <option value="fecha-asc">Más antiguas</option>
          <option value="monto-desc">Mayor monto</option>
          <option value="monto-asc">Menor monto</option>
        </select>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading && !solicitudes.length" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando solicitudes aprobadas...</p>
    </div>

    <!-- ERROR -->
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

    <!-- LISTA DE SOLICITUDES -->
    <div v-else-if="solicitudesFiltradas.length" class="solicitudes-grid">
      <div 
        v-for="solicitud in solicitudesFiltradas" 
        :key="solicitud.id"
        class="solicitud-card aprobada"
        @click="verDetalle(solicitud.id)"
      >
        <div class="solicitud-header">
          <div class="solicitud-numero">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Solicitud #{{ solicitud.id }}
          </div>
          
          <div class="badges">
            <span class="estado-badge aprobada">
              Aprobada
            </span>
            
            <span v-if="solicitud.tieneContrato" class="contrato-badge con-contrato">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
              </svg>
              Con Contrato
            </span>
            <span v-else class="contrato-badge sin-contrato">
              Sin Contrato
            </span>
          </div>
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
            <span class="label">Fecha Aprobación:</span>
            <span class="value">{{ formatDate(solicitud.fechaEvaluacion) }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Monto Aprobado:</span>
            <span class="value monto">Q {{ formatearMoneda(solicitud.montoSolicitado) }}</span>
          </div>
          <div class="detalle-item">
            <span class="label">Plazo:</span>
            <span class="value">{{ solicitud.plazoMeses }} meses</span>
          </div>
          <div class="detalle-item" v-if="solicitud.evaluador">
            <span class="label">Evaluado por:</span>
            <span class="value">{{ solicitud.evaluador.nombre }}</span>
          </div>
        </div>

        <div class="solicitud-acciones">
          <button @click.stop="verDetalle(solicitud.id)" class="btn-ver">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            Ver Detalle
          </button>
          
          <button 
            v-if="solicitud.tieneContrato" 
            @click.stop="generarContrato(solicitud.id)"
            class="btn-contrato"
            :disabled="generandoContrato === solicitud.id"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
              <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ generandoContrato === solicitud.id ? 'Generando...' : 'Descargar Contrato' }}
          </button>
          
          <button 
            v-else 
            @click.stop="generarContrato(solicitud.id)"
            class="btn-generar"
            :disabled="generandoContrato === solicitud.id"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ generandoContrato === solicitud.id ? 'Generando...' : 'Generar Contrato' }}
          </button>
        </div>
      </div>
    </div>

    <!-- VACÍO -->
    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
        <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
      </svg>
      <h3>No hay solicitudes aprobadas</h3>
      <p>No se encontraron solicitudes aprobadas con los filtros seleccionados</p>
    </div>

    <!-- PAGINACIÓN -->
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
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useApi } from '~/composables/useApi'

definePageMeta({
  middleware: ['evaluador'],
  layout: 'dashboard'
})

useHead({
  title: 'Solicitudes Aprobadas - Panel de Evaluador',
  meta: [
    { name: 'description', content: 'Lista de solicitudes aprobadas' }
  ]
})

const { api } = useApi()
const config = useRuntimeConfig()

const loading = ref(false)
const error = ref(null)
const solicitudes = ref([])
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0
})

const busqueda = ref('')
const filtroContrato = ref('')
const ordenamiento = ref('fecha-desc')
const generandoContrato = ref(null)

// Computed
const solicitudesFiltradas = computed(() => {
  let resultado = [...solicitudes.value]
  
  if (filtroContrato.value === 'con-contrato') {
    resultado = resultado.filter(s => s.tieneContrato)
  } else if (filtroContrato.value === 'sin-contrato') {
    resultado = resultado.filter(s => !s.tieneContrato)
  }
  
  return resultado
})

const solicitudesConContrato = computed(() => 
  solicitudes.value.filter(s => s.tieneContrato).length
)

const solicitudesSinContrato = computed(() => 
  solicitudes.value.filter(s => !s.tieneContrato).length
)

// Navegación
const volverAlPanel = () => {
  navigateTo('/evaluador')
}

const verDetalle = (solicitudId) => {
  navigateTo(`/evaluador/solicitudes/${solicitudId}`)
}

// Cargar solicitudes
const cargarSolicitudes = async () => {
  try {
    loading.value = true
    error.value = null

    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.limit,
      estado: 'Aprobada'
    })

    if (busqueda.value) {
      params.append('busqueda', busqueda.value)
    }

    console.log(' Cargando solicitudes aprobadas...')

    const response = await api(`/evaluador/solicitudes?${params}`)

    if (response.success) {
      // Verificar cuáles tienen contrato
      const solicitudesConEstadoContrato = await Promise.all(
        response.data.solicitudes.map(async (solicitud) => {
          try {
            const contratoResponse = await api(`/contratos/solicitud/${solicitud.id}`)
            return {
              ...solicitud,
              tieneContrato: contratoResponse.success && contratoResponse.data
            }
          } catch (err) {
            return {
              ...solicitud,
              tieneContrato: false
            }
          }
        })
      )

      solicitudes.value = solicitudesConEstadoContrato
      pagination.value = {
        ...pagination.value,
        ...response.data.pagination
      }
      
      console.log(' Solicitudes aprobadas cargadas:', solicitudes.value.length)
    }

  } catch (err) {
    console.error(' Error cargando solicitudes:', err)
    error.value = err.message || 'Error al cargar solicitudes aprobadas'
  } finally {
    loading.value = false
  }
}

// Búsqueda con debounce
let busquedaTimeout = null
const buscarSolicitudes = () => {
  clearTimeout(busquedaTimeout)
  busquedaTimeout = setTimeout(() => {
    pagination.value.page = 1
    cargarSolicitudes()
  }, 500)
}

// Aplicar filtros
const aplicarFiltros = () => {
  // Los filtros se aplican en el computed
  console.log('Filtro aplicado:', filtroContrato.value)
}

// Paginación
const cambiarPagina = (nuevaPagina) => {
  if (nuevaPagina < 1 || nuevaPagina > pagination.value.totalPages) return
  pagination.value.page = nuevaPagina
  cargarSolicitudes()
}

// Generar/Descargar contrato
const generarContrato = async (solicitudId) => {
  try {
    generandoContrato.value = solicitudId
    console.log(' Procesando contrato para solicitud:', solicitudId)

    // Primero verificar si ya existe
    try {
      const contratoExistente = await api(`/contratos/solicitud/${solicitudId}`)
      
      if (contratoExistente.success && contratoExistente.data) {
        // Ya existe, descargar
        await descargarContratoPDF(contratoExistente.data.id)
        return
      }
    } catch (err) {
      // No existe, generar nuevo
      console.log('Generando nuevo contrato...')
    }

    // Generar nuevo contrato
    const response = await api(`/contratos/generar/${solicitudId}`, {
      method: 'POST'
    })

    if (response.success) {
      console.log(' Contrato generado exitosamente')
      
      // Recargar solicitudes para actualizar el estado
      await cargarSolicitudes()
      
      // Descargar el PDF
      if (response.data?.id) {
        await descargarContratoPDF(response.data.id)
      }
      
      alert(' Contrato generado exitosamente')
    }

  } catch (err) {
    console.error(' Error con el contrato:', err)
    alert(` Error: ${err.message || 'No se pudo procesar el contrato'}`)
  } finally {
    generandoContrato.value = null
  }
}

const descargarContratoPDF = async (contratoId) => {
  try {
    const { getToken } = useAuth()
    const token = getToken()

    const response = await fetch(`${config.public.apiBase}/contratos/${contratoId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Error al descargar el PDF')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contrato-${contratoId}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    console.log(' PDF descargado exitosamente')

  } catch (error) {
    console.error(' Error descargando PDF:', error)
    throw error
  }
}

// Utilidades
const getIniciales = (usuario) => {
  if (!usuario) return '?'
  const inicial1 = usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : ''
  const inicial2 = usuario.apellido ? usuario.apellido.charAt(0).toUpperCase() : ''
  return inicial1 + inicial2
}

const formatDate = (fecha) => {
  if (!fecha) return 'No especificada'
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
:root {
  --color-azul-marino: #2C3E50;
  --color-dorado-vintage: #D4AF37;
  --color-verde-bosque: #2ECC71;
  --color-rojo-vino: #C0392B;
  --color-gris-acero: #7F8C8D;
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.solicitudes-aprobadas {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 2rem;
}

/* HEADER */
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
  border: 2px solid var(--color-dorado-vintage);
  border-radius: 8px;
  color: var(--color-azul-marino);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-volver:hover {
  background: var(--color-dorado-vintage);
  color: white;
  transform: translateX(-4px);
}

.header-info h1 {
  margin: 0 0 0.25rem 0;
  color: var(--color-azul-marino);
  font-size: 1.75rem;
}

.header-info p {
  margin: 0;
  color: var(--color-gris-acero);
}

.header-actions {
  display: flex;
  gap: 1rem;
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
  border-color: var(--color-dorado-vintage);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* STATS CARDS */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-card);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 12px;
}

.stat-icon.success {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: var(--color-verde-bosque);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  color: #856404;
}

.stat-icon.info {
  background: linear-gradient(135deg, #d1ecf1, #b8daff);
  color: #004085;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  color: var(--color-azul-marino);
  font-size: 1.75rem;
  font-weight: 700;
}

/* FILTROS */
.filtros-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-card);
}

.filtros-busqueda {
  margin-bottom: 1rem;
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
  border-color: var(--color-dorado-vintage);
}

.filtros-opciones {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.select-filtro {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.select-filtro:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
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
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid var(--color-verde-bosque);
}

.solicitud-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.solicitud-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.solicitud-numero {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-verde-bosque);
}

.badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.estado-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.aprobada {
  background: #d4edda;
  color: #155724;
}

.contrato-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.contrato-badge.con-contrato {
  background: #d1ecf1;
  color: #0c5460;
}

.contrato-badge.sin-contrato {
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
  background: linear-gradient(135deg, var(--color-verde-bosque), #27ae60);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.cliente-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--color-azul-marino);
  font-weight: 600;
}

.cliente-info p {
  margin: 0;
  color: var(--color-gris-acero);
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
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.detalle-item .value {
  color: var(--color-azul-marino);
  font-weight: 600;
}

.detalle-item .value.monto {
  color: var(--color-verde-bosque);
  font-size: 1.1rem;
}

.solicitud-acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-ver,
.btn-contrato,
.btn-generar {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.btn-ver {
  background: var(--color-azul-marino);
  color: white;
}

.btn-ver:hover {
  background: #1a252f;
}

.btn-contrato {
  background: var(--color-verde-bosque);
  color: white;
}

.btn-contrato:hover:not(:disabled) {
  background: #27ae60;
}

.btn-generar {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-generar:hover:not(:disabled) {
  background: #C49B27;
}

.btn-contrato:disabled,
.btn-generar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ESTADOS */
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
  box-shadow: var(--shadow-card);
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--color-verde-bosque);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-state svg {
  color: var(--color-verde-bosque);
  margin-bottom: 1rem;
}

/* PAGINACIÓN */
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
  border: 2px solid var(--color-dorado-vintage);
  color: var(--color-azul-marino);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-paginacion:hover:not(:disabled) {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #e9ecef;
}

.pagina-info {
  color: var(--color-gris-acero);
  font-weight: 500;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .solicitudes-aprobadas {
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

  .solicitudes-grid {
    grid-template-columns: 1fr;
  }

  .solicitud-acciones {
    flex-direction: column;
  }
}
</style>