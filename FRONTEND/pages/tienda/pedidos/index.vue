<template>
  <div class="pedidos-page">
    <div class="page-header">
      <h1>Mis Pedidos</h1>
      <p>Revisa el estado de tus compras</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando pedidos...</p>
    </div>

    <div v-else-if="pedidos && pedidos.length > 0" class="pedidos-grid">
      <div v-for="pedido in pedidos" :key="pedido.id" class="pedido-card">
        <div class="card-header">
          <div class="order-info">
            <h3>Pedido #{{ pedido.id }}</h3>
            <p class="date">{{ formatFecha(pedido.fecha_pedido) }}</p>
          </div>
          <span :class="['status-badge', getStatusClass(pedido.estado)]">
            {{ pedido.estado }}
          </span>
        </div>

        <div class="card-body">
          <div v-for="item in pedido.items" :key="item.id" class="item-row">
            <img 
              :src="item.imagen" 
              :alt="item.producto"
              @error="handleImageError"
            />
            <div class="item-info">
              <p class="item-name">{{ item.producto }}</p>
              <p class="item-details">Cantidad: {{ item.cantidad }}</p>
            </div>
            <p class="item-price">Q{{ formatPrice(item.precio) }}</p>
          </div>
        </div>

        <div class="card-footer">
          <div class="footer-info">
            <p class="payment-method">{{ pedido.metodo_pago }}</p>
            <p class="total">Total: <strong>Q{{ formatPrice(pedido.total) }}</strong></p>
          </div>
          <button @click="verDetalle(pedido.id)" class="detail-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            Ver Detalles
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h2>No tienes pedidos aún</h2>
      <p>Explora nuestra tienda y realiza tu primera compra</p>
      <button @click="$router.push('/tienda')" class="shop-btn">
        Ir a la Tienda
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: 'auth',
  layout: 'tienda'
})

const router = useRouter()
const { user } = useAuth()
const config = useRuntimeConfig()

const pedidos = ref([])
const loading = ref(false)

const userId = computed(() => user.value?.id)

const imagenPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0YzRjRGNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg=='

const construirUrlImagen = (rutaImagen) => {
  if (!rutaImagen) return imagenPlaceholder
  if (rutaImagen.startsWith('http')) return rutaImagen
  
  const baseUrl = config.public.apiBase || ''
  const urlBase = baseUrl.replace('/api', '')
  
  return `${urlBase}${rutaImagen}`
}

async function cargarPedidos() {
  if (!userId.value) {
    return
  }

  loading.value = true
  
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await $fetch(`${config.public.apiBase}/pedidos/usuario/${userId.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.success) {
      pedidos.value = response.data.map(pedido => ({
        ...pedido,
        items: pedido.items.map(item => ({
          ...item,
          imagen: construirUrlImagen(item.imagen)
        }))
      }))
    }
  } catch (error) {
    console.error('Error cargando pedidos:', error)
  } finally {
    loading.value = false
  }
}

function handleImageError(event) {
  event.target.src = imagenPlaceholder
}

function verDetalle(pedidoId) {
  console.log('[LISTADO PEDIDOS] Navegando al detalle del pedido:', pedidoId)
  router.push(`/tienda/pedidos/${pedidoId}`)
}

function getStatusClass(estado) {
  const classes = {
    'Pendiente': 'pending',
    'Procesando': 'processing',
    'Enviado': 'shipped',
    'Entregado': 'completed',
    'Completado': 'completed',
    'Cancelado': 'cancelled'
  }
  return classes[estado] || 'processing'
}

function formatFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatPrice(price) {
  return parseFloat(price).toFixed(2)
}

onMounted(async () => {
  console.log('[LISTADO PEDIDOS] Componente montado')
  if (process.client) {
    if (user.value?.id) {
      await cargarPedidos()
    } else {
      setTimeout(async () => {
        if (user.value?.id) {
          await cargarPedidos()
        }
      }, 500)
    }
  }
})
</script>

<style scoped>
.pedidos-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.page-header p {
  color: #6b7280;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pedidos-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pedido-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.pedido-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.order-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.date {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.processing {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.shipped {
  background: #e0e7ff;
  color: #4c1d95;
}

.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.card-body {
  padding: 1.5rem;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
}

.item-row:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.item-row img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  background: #f3f4f6;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.item-details {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.item-price {
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-method {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.total {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.total strong {
  color: #1a1a1a;
  font-size: 1.125rem;
}

.detail-btn {
  display: inline-flex;
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

.detail-btn:hover {
  background: #b8941f;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: #9ca3af;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 2rem 0;
}

.shop-btn {
  padding: 0.875rem 2rem;
  background: #d4af37;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.shop-btn:hover {
  background: #b8941f;
}

@media (max-width: 768px) {
  .pedidos-page {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .card-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .detail-btn {
    width: 100%;
    justify-content: center;
  }

  .item-row {
    flex-wrap: wrap;
  }

  .item-row img {
    width: 48px;
    height: 48px;
  }
}
</style>