<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: 'auth',
  layout: 'tienda'
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { isAuthenticated, user } = useAuth()

const pedido = ref(null)
const loading = ref(false)
const error = ref(null)
const facturaRef = ref(null)

const imagenPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0YzRjRGNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg=='

const timeline = computed(() => {
  if (!pedido.value) return []

  const estado = pedido.value.estado
  const fechaCreacion = pedido.value.fecha_pedido
  const fechaActualizacion = pedido.value.updatedAt || fechaCreacion

  if (estado === 'Cancelado') {
    return [
      { status: 'Pedido realizado', date: formatFecha(fechaCreacion), completed: true },
      { status: 'Cancelado', date: formatFecha(fechaActualizacion), completed: true }
    ]
  }

  return [
    { status: 'Pedido realizado', date: formatFecha(fechaCreacion), completed: true },
    { status: 'Pago confirmado', date: estado !== 'Pendiente' ? formatFecha(fechaCreacion) : 'Pendiente', completed: estado !== 'Pendiente' },
    { status: 'En preparación', date: estado === 'Procesando' || estado === 'Enviado' || estado === 'Entregado' ? formatFecha(fechaActualizacion) : 'Pendiente', completed: estado === 'Procesando' || estado === 'Enviado' || estado === 'Entregado' },
    { status: 'Listo para recoger', date: estado === 'Enviado' || estado === 'Entregado' ? formatFecha(fechaActualizacion) : 'Pendiente', completed: estado === 'Enviado' || estado === 'Entregado' },
    { status: 'Entregado', date: estado === 'Entregado' ? formatFecha(fechaActualizacion) : 'Pendiente', completed: estado === 'Entregado' }
  ]
})

const construirUrlImagen = (rutaImagen) => {
  if (!rutaImagen) return imagenPlaceholder
  if (rutaImagen.startsWith('http')) return rutaImagen
  
  const baseUrl = config.public.apiBase || ''
  const urlBase = baseUrl.replace('/api', '')
  
  return `${urlBase}${rutaImagen}`
}

async function cargarPedido() {
  const pedidoId = route.params.id
  
  console.log('[DETALLE PEDIDO] Iniciando carga del pedido:', pedidoId)
  
  if (!pedidoId || pedidoId === 'undefined') {
    error.value = 'ID de pedido no válido'
    console.error('[DETALLE PEDIDO] ID inválido')
    return
  }

  if (!isAuthenticated.value) {
    console.log('[DETALLE PEDIDO] Usuario no autenticado, redirigiendo...')
    router.push('/login')
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    console.log('[DETALLE PEDIDO] No hay token, redirigiendo a login...')
    router.push('/login')
    return
  }

  loading.value = true
  error.value = null
  
  try {
    console.log('[DETALLE PEDIDO] Haciendo petición a:', `${config.public.apiBase}/pedidos/${pedidoId}`)
    const response = await $fetch(`${config.public.apiBase}/pedidos/${pedidoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('[DETALLE PEDIDO] Respuesta del servidor:', response)

    if (response.success) {
      pedido.value = {
        ...response.data,
        items: response.data.items.map(item => ({
          ...item,
          imagen: construirUrlImagen(item.imagen)
        }))
      }
      console.log('[DETALLE PEDIDO] Pedido cargado exitosamente:', pedido.value)
    } else {
      error.value = response.message || 'No se pudo cargar el pedido'
      console.error('[DETALLE PEDIDO] Error en respuesta:', error.value)
    }
  } catch (err) {
    console.error('[DETALLE PEDIDO] Error cargando pedido:', err)
    error.value = err.statusCode === 404 ? 'Pedido no encontrado' : 'Error al cargar el pedido'
  } finally {
    loading.value = false
  }
}

function handleImageError(event) {
  event.target.src = imagenPlaceholder
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

function getStatusKey(estado) {
  return getStatusClass(estado)
}

function formatFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-GT')
}

function formatFechaLarga(fecha) {
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

function calcularSubtotal() {
  if (!pedido.value?.items) return 0
  return pedido.value.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
}

function descargarFactura() {
  if (!facturaRef.value) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const facturaHTML = facturaRef.value.innerHTML

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Factura Pedido #${pedido.value.id} - Fredy Fasbear Industries</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #1A1A1A; background: white; }
          .factura-contenedor { max-width: 800px; margin: 0 auto; }
          .factura-header { border-bottom: 4px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: start; }
          .factura-logo { font-size: 28px; font-weight: bold; color: #2C3E50; display: flex; align-items: center; gap: 10px; }
          .logo-icon { width: 40px; height: 40px; background: #D4AF37; border-radius: 8px; }
          .factura-info { text-align: right; }
          .factura-titulo { font-size: 32px; font-weight: bold; color: #2C3E50; margin-bottom: 5px; }
          .factura-numero { font-size: 18px; color: #4A4A4A; }
          .factura-seccion { margin-bottom: 30px; }
          .seccion-titulo { font-size: 18px; font-weight: bold; color: #2C3E50; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #D4AF37; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-item { margin-bottom: 10px; }
          .info-label { font-size: 12px; color: #4A4A4A; text-transform: uppercase; }
          .info-valor { font-size: 14px; color: #1A1A1A; font-weight: 500; margin-top: 3px; }
          .factura-tabla { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #2C3E50; color: white; padding: 12px; text-align: left; font-weight: 600; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .factura-totales { margin-top: 20px; text-align: right; }
          .total-row { display: flex; justify-content: flex-end; gap: 100px; padding: 8px 0; font-size: 14px; }
          .total-row.grand-total { border-top: 2px solid #D4AF37; margin-top: 10px; padding-top: 15px; font-size: 20px; font-weight: bold; }
          .grand-total .total-value { color: #D4AF37; }
          .factura-footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #4A4A4A; font-size: 12px; }
          .status-badge-print { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 5px; }
          .status-pending { background: #fef3c7; color: #854d0e; }
          .status-processing { background: #dbeafe; color: #1e40af; }
          .status-completed { background: #dcfce7; color: #166534; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
        </style>
      </head>
      <body>
        ${facturaHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); }
          }
        <\/script>
      </body>
    </html>
  `)

  printWindow.document.close()
}

function cancelarPedido() {
  if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
    alert('Funcionalidad de cancelación en desarrollo')
  }
}

onMounted(() => {
  console.log('[DETALLE PEDIDO] Componente montado. Estado:', { isAuthenticated: isAuthenticated.value, user: user.value, hasToken: !!localStorage.getItem('token'),
    pedidoId: route.params.id
  })
  
  if (isAuthenticated.value) {
    cargarPedido()
  } else {
    console.log('[DETALLE PEDIDO] No autenticado, esperando...')
    setTimeout(() => {
      if (isAuthenticated.value) {
        cargarPedido()
      } else {
        router.push('/login')
      }
    }, 500)
  }
})

watch(isAuthenticated, (newVal) => {
  console.log('[DETALLE PEDIDO] Estado de autenticación cambió:', newVal)
  if (newVal && !pedido.value && !loading.value) {
    cargarPedido()
  }
})
</script>

<template>
  <div class="detalle-pedido-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando pedido...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" stroke-width="2"/>
      </svg>
      <h2>Pedido no encontrado</h2>
      <p>El pedido que buscas no existe</p>
      <button @click="$router.back()" class="back-btn">Volver a Mis Pedidos</button>
    </div>

    <div v-else-if="pedido" class="detalle-content">
      <div ref="facturaRef" class="factura-oculta">
        <div class="factura-contenedor">
          <div class="factura-header">
            <div class="factura-logo">
              <div class="logo-icon"></div>
              <span>Fredy Fasbear Industries</span>
            </div>
            <div class="factura-info">
              <div class="factura-titulo">FACTURA</div>
              <div class="factura-numero">Pedido #{{ pedido.id }}</div>
              <div :class="['status-badge-print', `status-${getStatusKey(pedido.estado)}`]">
                {{ pedido.estado }}
              </div>
            </div>
          </div>

          <div class="factura-seccion">
            <div class="seccion-titulo">Información del Cliente</div>
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <div class="info-label">Nombre</div>
                  <div class="info-valor">{{ pedido.cliente.nombre }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Teléfono</div>
                  <div class="info-valor">{{ pedido.cliente.telefono }}</div>
                </div>
              </div>
              <div>
                <div class="info-item">
                  <div class="info-label">Fecha de Pedido</div>
                  <div class="info-valor">{{ formatFechaLarga(pedido.fecha_pedido) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Método de Pago</div>
                  <div class="info-valor">{{ pedido.metodo_pago }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="factura-seccion">
            <div class="seccion-titulo">Dirección de Entrega</div>
            <div class="info-valor">{{ pedido.direccion_envio }}</div>
          </div>

          <div v-if="pedido.banco_origen" class="factura-seccion">
            <div class="seccion-titulo">Detalles del Pago</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Banco</div>
                <div class="info-valor">{{ pedido.banco_origen }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">No. de Transacción</div>
                <div class="info-valor">{{ pedido.numero_transaccion }}</div>
              </div>
            </div>
          </div>

          <div class="factura-seccion">
            <div class="seccion-titulo">Artículos</div>
            <table class="factura-tabla">
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Condición</th>
                  <th style="text-align: center">Cantidad</th>
                  <th style="text-align: right">Precio</th>
                  <th style="text-align: right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in pedido.items" :key="item.id">
                  <td><div style="font-weight: 600">{{ item.producto }}</div></td>
                  <td>{{ item.condicion || 'Bueno' }}</td>
                  <td style="text-align: center">{{ item.cantidad }}</td>
                  <td style="text-align: right">Q{{ formatPrice(item.precio) }}</td>
                  <td style="text-align: right; font-weight: 600">Q{{ formatPrice(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="factura-totales">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">Q{{ formatPrice(calcularSubtotal()) }}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Envío:</span>
                <span class="total-value">Gratis</span>
              </div>
              <div class="total-row grand-total">
                <span class="total-label">TOTAL:</span>
                <span class="total-value">Q{{ formatPrice(pedido.total) }}</span>
              </div>
            </div>
          </div>

          <div class="factura-footer">
            <p style="margin-bottom: 8px; font-weight: 600">Fredy Fasbear Industries</p>
            <p>Casa de Empeño y Tienda de Artículos de Segunda Mano</p>
            <p>Guatemala, Guatemala</p>
            <p style="margin-top: 15px; font-size: 11px">
              Gracias por su compra. Para cualquier consulta, contáctenos.
            </p>
          </div>
        </div>
      </div>

      <div class="header-detalle">
        <button @click="$router.back()" class="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver a Mis Pedidos
        </button>
        
        <div class="pedido-header-info">
          <div>
            <h1>Pedido #{{ pedido.id }}</h1>
            <p class="fecha">Realizado el {{ formatFechaLarga(pedido.fecha_pedido) }}</p>
          </div>
          <span :class="['estado-badge', getStatusClass(pedido.estado)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ pedido.estado }}
          </span>
        </div>
      </div>

      <div class="contenido-grid">
        <div class="columna-principal">
          <div class="card timeline-card">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
              </svg>
              Estado del Pedido
            </h2>
            <div class="timeline">
              <div v-for="(step, index) in timeline" :key="index" class="timeline-step">
                <div class="step-indicator">
                  <div :class="['step-circle', { completed: step.completed }]">
                    <svg v-if="step.completed" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div v-if="index < timeline.length - 1" :class="['step-line', { completed: step.completed }]"></div>
                </div>
                <div class="step-content">
                  <p :class="['step-title', { completed: step.completed }]">{{ step.status }}</p>
                  <p class="step-date">{{ step.date }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card productos-card">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" stroke-width="2"/>
              </svg>
              Artículos del Pedido
            </h2>
            <div class="productos-lista">
              <div v-for="item in pedido.items" :key="item.id" class="producto-item">
                <img :src="item.imagen" :alt="item.producto" @error="handleImageError" />
                <div class="producto-info">
                  <h3>{{ item.producto }}</h3>
                  <p class="condicion">Condición: {{ item.condicion || 'Bueno' }}</p>
                  <p class="cantidad">Cantidad: {{ item.cantidad }}</p>
                </div>
                <div class="producto-precio">
                  <p class="precio">Q{{ formatPrice(item.precio) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card entrega-card">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              Información de Entrega
            </h2>
            <div class="entrega-info">
              <div class="info-row">
                <p class="label">Nombre</p>
                <p class="valor">{{ pedido.cliente.nombre }}</p>
              </div>
              <div class="info-row">
                <p class="label">Teléfono</p>
                <p class="valor">{{ pedido.cliente.telefono }}</p>
              </div>
              <div class="info-row">
                <p class="label">Dirección</p>
                <p class="valor">{{ pedido.direccion_envio }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="columna-lateral">
          <div class="card resumen-card">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/>
                <path d="M14 2v6h6M16 13H8m8 4H8m2-8H8" stroke="currentColor" stroke-width="2"/>
              </svg>
              Resumen
            </h2>
            <div class="resumen-detalles">
              <div class="detalle-row">
                <span>Subtotal</span>
                <span>Q{{ formatPrice(calcularSubtotal()) }}</span>
              </div>
              <div class="detalle-row">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div class="detalle-row total">
                <span>Total</span>
                <span class="total-amount">Q{{ formatPrice(pedido.total) }}</span>
              </div>
            </div>
          </div>

          <div class="card pago-card">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M1 10h22" stroke="currentColor" stroke-width="2"/>
              </svg>
              Método de Pago
            </h2>
            <div class="pago-info">
              <div class="info-row">
                <p class="label">Método</p>
                <p class="valor">{{ pedido.metodo_pago }}</p>
              </div>
              <div v-if="pedido.banco_origen" class="info-row">
                <p class="label">Banco</p>
                <p class="valor">{{ pedido.banco_origen }}</p>
              </div>
              <div v-if="pedido.numero_transaccion" class="info-row">
                <p class="label">No. de Transacción</p>
                <p class="valor">{{ pedido.numero_transaccion }}</p>
              </div>
              <div v-if="pedido.fecha_transferencia" class="info-row">
                <p class="label">Fecha de Pago</p>
                <p class="valor">{{ formatFecha(pedido.fecha_transferencia) }}</p>
              </div>
            </div>
          </div>

          <div class="card acciones-card">
            <h2>Acciones</h2>
            <div class="acciones-botones">
              <button @click="descargarFactura" class="btn-factura">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m14-7l-5-5m0 0L7 8m5-5v12" stroke="currentColor" stroke-width="2"/>
                </svg>
                Descargar Factura
              </button>
              <button v-if="pedido.estado === 'Pendiente'" @click="cancelarPedido" class="btn-cancelar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" stroke-width="2"/>
                </svg>
                Cancelar Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detalle-pedido-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
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

.error-state svg {
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.error-state p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.back-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #d4af37;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #b8941f;
}

.factura-oculta {
  display: none;
}

.header-detalle {
  margin-bottom: 2rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
}

.back-button:hover {
  background: #f9fafb;
  border-color: #d4af37;
  color: #d4af37;
}

.pedido-header-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.pedido-header-info h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.fecha {
  color: #6b7280;
  margin: 0;
}

.estado-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge svg {
  width: 20px;
  height: 20px;
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

.contenido-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.columna-principal {
  display: flex;
  flex-direction: column;
}

.columna-lateral {
  display: flex;
  flex-direction: column;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 4px solid #d4af37;
  margin-bottom: 1.5rem;
}

.card h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1.5rem 0;
}

.card h2 svg {
  color: #d4af37;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-step {
  display: flex;
  gap: 1rem;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #9ca3af;
}

.step-circle.completed {
  background: #d4af37;
  color: white;
}

.step-line {
  width: 2px;
  height: 48px;
  background: #e5e7eb;
}

.step-line.completed {
  background: #d4af37;
}

.step-content {
  flex: 1;
  padding-bottom: 2rem;
}

.step-title {
  font-weight: 600;
  color: #9ca3af;
  margin: 0 0 0.25rem 0;
}

.step-title.completed {
  color: #1a1a1a;
}

.step-date {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.productos-lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.producto-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.producto-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: #e5e7eb;
}

.producto-info {
  flex: 1;
}

.producto-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.condicion,
.cantidad {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.producto-precio {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}

.precio {
  font-size: 1.25rem;
  font-weight: 700;
  color: #d4af37;
  margin: 0;
}

.entrega-info,
.pago-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-row .label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.info-row .valor {
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.resumen-detalles {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detalle-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detalle-row span:first-child {
  color: #6b7280;
}

.detalle-row span:last-child {
  font-weight: 600;
  color: #1a1a1a;
}

.detalle-row.total {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 2px solid #e5e7eb;
  font-size: 1.125rem;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #d4af37 !important;
}

.acciones-botones {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-factura,
.btn-cancelar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-factura {
  background: #d4af37;
  color: white;
}

.btn-factura:hover {
  background: #b8941f;
}

.btn-cancelar {
  background: #fee2e2;
  color: #991b1b;
}

.btn-cancelar:hover {
  background: #fecaca;
}

@media (max-width: 1024px) {
  .contenido-grid {
    grid-template-columns: 1fr;
  }
  
  .columna-lateral {
    order: -1;
  }
}

@media (max-width: 768px) {
  .detalle-pedido-page {
    padding: 1rem;
  }

  .pedido-header-info {
    flex-direction: column;
  }

  .pedido-header-info h1 {
    font-size: 1.5rem;
  }

  .producto-item {
    flex-direction: column;
  }

  .producto-item img {
    width: 100%;
    height: 200px;
  }

  .card {
    padding: 1rem;
  }

  .card h2 {
    font-size: 1.125rem;
  }
}
</style>