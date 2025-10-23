<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const router = useRouter()
const config = useRuntimeConfig()
const { isAuthenticated, user } = useAuth()

const pedidos = ref([])
const loading = ref(false)
const error = ref(null)
const filtroEstado = ref('')
const filtroMetodoPago = ref('')
const pedidoSeleccionado = ref(null)
const mostrarModal = ref(false)
const nuevoEstado = ref('')
const procesandoCambio = ref(false)

const imagenPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0YzRjRGNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg=='

const estadosDisponibles = [
  { value: 'Procesando', label: 'En Preparación', color: '#3b82f6' },
  { value: 'Enviado', label: 'Listo para Recoger', color: '#8b5cf6' },
  { value: 'Entregado', label: 'Entregado', color: '#10b981' },
  { value: 'Cancelado', label: 'Cancelado', color: '#ef4444' }
]

const pedidosFiltrados = computed(() => {
  let resultado = pedidos.value

  if (filtroEstado.value) {
    resultado = resultado.filter(p => p.estado === filtroEstado.value)
  }

  if (filtroMetodoPago.value) {
    resultado = resultado.filter(p => p.metodo_pago === filtroMetodoPago.value)
  }

  return resultado
})

const estadisticas = computed(() => {
  return {
    total: pedidos.value.length,
    pendientes: pedidos.value.filter(p => p.estado === 'Pendiente').length,
    procesando: pedidos.value.filter(p => p.estado === 'Procesando').length,
    enviados: pedidos.value.filter(p => p.estado === 'Enviado').length,
    entregados: pedidos.value.filter(p => p.estado === 'Entregado').length,
    cancelados: pedidos.value.filter(p => p.estado === 'Cancelado').length
  }
})

function construirUrlImagen(rutaImagen) {
  if (!rutaImagen) return imagenPlaceholder
  if (rutaImagen.startsWith('http')) return rutaImagen

  const baseUrl = config.public.apiBase || ''
  const urlBase = baseUrl.replace('/api', '')

  return `${urlBase}${rutaImagen}`
}

async function cargarPedidos() {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await $fetch(`${config.public.apiBase}/pedidos/admin/todos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.success) {
      pedidos.value = response.data.map(p => ({
        ...p,
        items: p.items.map(item => ({
          ...item,
          imagen: construirUrlImagen(item.imagen)
        }))
      }))
      console.log('Pedidos cargados:', pedidos.value.length)
    } else {
      error.value = response.message || 'No se pudieron cargar los pedidos'
    }
  } catch (err) {
    console.error('Error cargando pedidos:', err)
    if (err.statusCode === 403) {
      error.value = 'No tienes permisos para acceder a esta página'
    } else {
      error.value = 'Error al cargar los pedidos'
    }
  } finally {
    loading.value = false
  }
}

function abrirModal(pedido, estado) {
  pedidoSeleccionado.value = pedido
  nuevoEstado.value = estado
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
  pedidoSeleccionado.value = null
  nuevoEstado.value = ''
}

async function confirmarCambioEstado() {
  if (!pedidoSeleccionado.value || !nuevoEstado.value) return

  procesandoCambio.value = true
  const token = localStorage.getItem('token')

  try {
    const response = await $fetch(
      `${config.public.apiBase}/pedidos/${pedidoSeleccionado.value.id}/estado`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado.value })
      }
    )

    if (response.success) {
      // Actualizar el pedido en la lista
      const index = pedidos.value.findIndex(p => p.id === pedidoSeleccionado.value.id)
      if (index !== -1) {
        pedidos.value[index].estado = nuevoEstado.value
      }

      alert(`Pedido #${pedidoSeleccionado.value.id} actualizado a ${getEstadoLabel(nuevoEstado.value)}`)
      cerrarModal()
    } else {
      alert('Error: ' + response.message)
    }
  } catch (err) {
    console.error('Error cambiando estado:', err)
    alert('Error al cambiar el estado del pedido')
  } finally {
    procesandoCambio.value = false
  }
}

function getEstadoLabel(estado) {
  const estadoInfo = estadosDisponibles.find(e => e.value === estado)
  return estadoInfo ? estadoInfo.label : estado
}

function getEstadoColor(estado) {
  const estadoInfo = estadosDisponibles.find(e => e.value === estado)
  return estadoInfo ? estadoInfo.color : '#6b7280'
}

function getStatusClass(estado) {
  const classes = {
    'Pendiente': 'pending',
    'Procesando': 'processing',
    'Enviado': 'shipped',
    'Entregado': 'completed',
    'Cancelado': 'cancelled'
  }
  return classes[estado] || 'processing'
}

function formatFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatPrice(price) {
  return parseFloat(price).toFixed(2)
}

function verDetalle(pedidoId) {
  router.push(`/tienda/pedidos/${pedidoId}`)
}

function getSiguienteEstado(estadoActual) {
  const flujo = {
    'Pendiente': 'Procesando',
    'Procesando': 'Enviado',
    'Enviado': 'Entregado'
  }
  return flujo[estadoActual]
}

function puedeAvanzar(pedido) {
  return ['Pendiente', 'Procesando', 'Enviado'].includes(pedido.estado)
}

function handleImageError(event) {
  event.target.src = imagenPlaceholder
}

onMounted(() => {
  if (isAuthenticated.value) {
    cargarPedidos()
  } else {
    setTimeout(() => {
      if (isAuthenticated.value) {
        cargarPedidos()
      } else {
        router.push('/login')
      }
    }, 500)
  }
})
</script>

<template>
  <div class="admin-pedidos-page">
    <div class="page-header">
      <div class="header-content">
        <button @click="$router.push('/admin')" class="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver al Panel
        </button>
        <div class="header-text">
          <h1>Gestión de Pedidos</h1>
          <p>Administra y actualiza el estado de los pedidos de la tienda</p>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon total">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.total }}</h3>
          <p>Total Pedidos</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pending">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.pendientes }}</h3>
          <p>Pendientes</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon processing">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.procesando }}</h3>
          <p>En Preparación</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon shipped">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.enviados }}</h3>
          <p>Listos para Recoger</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon completed">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-info">
          <h3>{{ estadisticas.entregados }}</h3>
          <p>Entregados</p>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="filter-group">
        <label>Filtrar por Estado:</label>
        <select v-model="filtroEstado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Procesando">En Preparación</option>
          <option value="Enviado">Listo para Recoger</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Filtrar por Método de Pago:</label>
        <select v-model="filtroMetodoPago" class="filter-select">
          <option value="">Todos los métodos</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
        </select>
      </div>

      <button @click="cargarPedidos" class="btn-refresh" :disabled="loading">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
          <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" stroke-width="2"/>
        </svg>
        Actualizar
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando pedidos...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
      </svg>
      <h3>{{ error }}</h3>
      <button @click="cargarPedidos" class="btn-retry">Reintentar</button>
    </div>

    <div v-else-if="pedidosFiltrados.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" stroke-width="2"/>
      </svg>
      <h3>No hay pedidos</h3>
      <p>No se encontraron pedidos con los filtros seleccionados</p>
    </div>

    <div v-else class="pedidos-list">
      <div v-for="pedido in pedidosFiltrados" :key="pedido.id" class="pedido-card">
        <div class="pedido-header">
          <div class="pedido-id">
            <h3>Pedido #{{ pedido.id }}</h3>
            <span :class="['estado-badge', getStatusClass(pedido.estado)]">
              {{ pedido.estado === 'Procesando' ? 'En Preparación' : pedido.estado === 'Enviado' ? 'Listo para Recoger' : pedido.estado }}
            </span>
          </div>
          <div class="pedido-total">
            <span class="total-label">Total:</span>
            <span class="total-amount">Q{{ formatPrice(pedido.total) }}</span>
          </div>
        </div>

        <div class="pedido-info">
          <div class="info-row">
            <div class="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Creado: {{ formatFecha(pedido.fecha_pedido) }}</span>
            </div>
            <div class="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9 16.1 17 15 17H9C7.9 17 7 17.9 7 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ pedido.cliente.nombre }}</span>
            </div>
            <div class="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M1 10h22" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ pedido.metodo_pago }}</span>
            </div>
          </div>
          <div v-if="pedido.updatedAt && pedido.fecha_pedido !== pedido.updatedAt" class="info-row updated-row">
            <div class="info-item updated-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
                <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Última actualización: {{ formatFecha(pedido.updatedAt) }}</span>
            </div>
          </div>

          <div class="pedido-items">
            <div v-for="item in pedido.items" :key="item.id" class="item-preview">
              <img :src="item.imagen" :alt="item.producto" @error="handleImageError" />
              <div class="item-info">
                <p class="item-nombre">{{ item.producto }}</p>
                <p class="item-cantidad">x{{ item.cantidad }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="pedido-actions">
          <button @click="verDetalle(pedido.id)" class="btn-detalle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            Ver Detalle
          </button>

          <div class="estado-actions">
            <template v-if="puedeAvanzar(pedido)">
              <button
                @click="abrirModal(pedido, getSiguienteEstado(pedido.estado))"
                class="btn-avanzar"
                :style="{ backgroundColor: getEstadoColor(getSiguienteEstado(pedido.estado)) }"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"/>
                </svg>
                Cambiar a {{ getEstadoLabel(getSiguienteEstado(pedido.estado)) }}
              </button>
            </template>

            <button
              v-if="pedido.estado !== 'Cancelado' && pedido.estado !== 'Entregado'"
              @click="abrirModal(pedido, 'Cancelado')"
              class="btn-cancelar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" stroke-width="2"/>
              </svg>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Confirmar Cambio de Estado</h2>
          <button @click="cerrarModal" class="btn-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <div v-if="pedidoSeleccionado" class="modal-body">
          <p class="modal-message">
            ¿Estás seguro de cambiar el estado del Pedido #{{ pedidoSeleccionado.id }} de
            <strong>{{ pedidoSeleccionado.estado }}</strong> a
            <strong>{{ getEstadoLabel(nuevoEstado) }}</strong>?
          </p>

          <div class="pedido-resumen">
            <p><strong>Cliente:</strong> {{ pedidoSeleccionado.cliente.nombre }}</p>
            <p><strong>Total:</strong> Q{{ formatPrice(pedidoSeleccionado.total) }}</p>
            <p><strong>Artículos:</strong> {{ pedidoSeleccionado.items.length }} producto(s)</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-secondary" :disabled="procesandoCambio">
            Cancelar
          </button>
          <button
            @click="confirmarCambioEstado"
            class="btn-primary"
            :disabled="procesandoCambio"
            :style="{ backgroundColor: getEstadoColor(nuevoEstado) }"
          >
            <span v-if="procesandoCambio">Procesando...</span>
            <span v-else>Confirmar Cambio</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-pedidos-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
  background: #f9fafb;
}

.page-header {
  margin-bottom: 2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.back-btn:hover {
  background: #f9fafb;
  border-color: #d4af37;
  color: #d4af37;
}

.header-text h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.header-text p {
  color: #6b7280;
  margin: 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.total { background: #6b7280; }
.stat-icon.pending { background: #f59e0b; }
.stat-icon.processing { background: #3b82f6; }
.stat-icon.shipped { background: #8b5cf6; }
.stat-icon.completed { background: #10b981; }

.stat-info h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.stat-info p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1a1a1a;
  background: white;
  cursor: pointer;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #d4af37;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #b8941f;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg,
.empty-state svg {
  color: #6b7280;
  margin-bottom: 1rem;
}

.error-state h3,
.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #d4af37;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-retry:hover {
  background: #b8941f;
}

.pedidos-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pedido-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
  border-left: 4px solid #d4af37;
}

.pedido-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.pedido-id {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pedido-id h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.estado-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.estado-badge.processing {
  background: #dbeafe;
  color: #1e40af;
}

.estado-badge.shipped {
  background: #e0e7ff;
  color: #4c1d95;
}

.estado-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.estado-badge.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.pedido-total {
  text-align: right;
}

.total-label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.total-amount {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #d4af37;
}

.pedido-info {
  padding: 1.5rem;
}

.info-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-item svg {
  color: #d4af37;
}

.updated-row {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.updated-info {
  color: #8b5cf6;
  font-size: 0.8rem;
  font-style: italic;
}

.updated-info svg {
  color: #8b5cf6;
}

.pedido-items {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem 0;
}

.item-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.item-preview img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.item-info {
  text-align: center;
}

.item-nombre {
  font-size: 0.75rem;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px;
}

.item-cantidad {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.pedido-actions {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-detalle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-detalle:hover {
  background: #f9fafb;
  border-color: #d4af37;
  color: #d4af37;
}

.estado-actions {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: flex-end;
}

.btn-avanzar,
.btn-cancelar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-avanzar:hover,
.btn-cancelar:hover {
  opacity: 0.9;
}

.btn-cancelar {
  background: #ef4444;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.modal-message {
  font-size: 1rem;
  color: #4b5563;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.pedido-resumen {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #d4af37;
}

.pedido-resumen p {
  margin: 0.5rem 0;
  color: #1a1a1a;
  font-size: 0.875rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-primary {
  color: white;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .admin-pedidos-page {
    padding: 1rem;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .filters-section {
    flex-direction: column;
  }

  .pedido-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .pedido-actions {
    flex-direction: column;
  }

  .estado-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-avanzar,
  .btn-cancelar {
    width: 100%;
    justify-content: center;
  }
}
</style>
