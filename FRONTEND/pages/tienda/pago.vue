<template>
  <div class="pago-page">
    <header class="page-header">
      <div class="header-content">
        <router-link to="/tienda/carrito" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver al carrito
        </router-link>
      </div>
    </header>

    <main class="main-content">
      <div class="content-wrapper">
        <div class="form-section">
          <div class="section-card">
            <h2>Información de Envío</h2>
            <form @submit.prevent="procesarPago">
              <div class="form-group">
                <label for="nombre">Nombre Completo</label>
                <input 
                  id="nombre"
                  v-model="formulario.nombre"
                  type="text"
                  required
                  placeholder="Juan Pérez"
                >
              </div>

              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input 
                  id="telefono"
                  v-model="formulario.telefono"
                  type="tel"
                  required
                  placeholder="5555-5555"
                >
              </div>

              <div class="form-group">
                <label for="direccion">Dirección de Envío</label>
                <textarea 
                  id="direccion"
                  v-model="formulario.direccion"
                  required
                  rows="3"
                  placeholder="Calle, número, zona, ciudad"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="notas">Notas Adicionales (Opcional)</label>
                <textarea 
                  id="notas"
                  v-model="formulario.notas"
                  rows="2"
                  placeholder="Referencias de ubicación, horario preferido, etc."
                ></textarea>
              </div>

              <h2 class="section-title">Método de Pago</h2>
              
              <div class="payment-methods">
                <div 
                  v-for="metodo in metodosPagoFiltrados" 
                  :key="metodo.id"
                  @click="formulario.metodoPago = metodo.id"
                  class="payment-method"
                  :class="{ active: formulario.metodoPago === metodo.id }"
                >
                  <input 
                    type="radio" 
                    :value="metodo.id" 
                    v-model="formulario.metodoPago"
                  >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="method-icon">
                    <path v-if="metodo.id === 'Efectivo'" d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path v-else d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <div>
                    <p class="method-name">{{ metodo.nombre }}</p>
                    <p class="method-desc">{{ metodo.descripcion }}</p>
                  </div>
                </div>
              </div>

              <div v-if="formulario.metodoPago === 'Transferencia'" class="bank-info">
                <h3>Datos para Transferencia</h3>
                <div class="info-box">
                  <p><strong>Banco:</strong> {{ configuracion.banco || 'Industrial' }}</p>
                  <p><strong>Cuenta:</strong> {{ configuracion.numeroCuenta || '1234-5678-9012-3456' }}</p>
                  <p><strong>Nombre:</strong> {{ configuracion.nombreCuenta || 'Fredy Fasbear Industries' }}</p>
                </div>
                <div class="transfer-notice">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <p>Tu pedido quedará en estado <strong>Pendiente</strong> hasta que nuestro cobrador valide tu transferencia.</p>
                </div>

                <div class="form-group">
                  <label for="bancoOrigen">Banco donde realizaste la transferencia *</label>
                  <input 
                    id="bancoOrigen"
                    v-model="formulario.bancoOrigen"
                    type="text"
                    required
                    placeholder="Ejemplo: Banco Industrial"
                  >
                </div>

                <div class="form-group">
                  <label for="fechaTransferencia">Fecha de la transferencia *</label>
                  <input 
                    id="fechaTransferencia"
                    v-model="formulario.fechaTransferencia"
                    type="date"
                    required
                    :max="new Date().toISOString().split('T')[0]"
                  >
                </div>

                <div class="form-group">
                  <label for="numeroTransaccion">Número de transacción *</label>
                  <input 
                    id="numeroTransaccion"
                    v-model="formulario.numeroTransaccion"
                    type="text"
                    required
                    placeholder="Ejemplo: 123456789"
                  >
                </div>

                <div class="form-group">
                  <label for="comprobante">Subir Comprobante *</label>
                  <input 
                    id="comprobante"
                    type="file"
                    @change="handleComprobanteUpload"
                    accept="image/*,.pdf"
                    required
                  >
                  <p class="file-hint">Formatos aceptados: JPG, PNG, PDF (Máx. 5MB)</p>
                </div>
              </div>

              <button 
                type="submit" 
                class="submit-btn"
                :disabled="procesando"
              >
                {{ procesando ? 'Procesando...' : 'Confirmar Pedido' }}
              </button>
            </form>
          </div>
        </div>

        <div class="summary-section">
          <div class="section-card">
            <h2>Resumen del Pedido</h2>
            
            <div class="cart-items">
              <div 
                v-for="item in carrito" 
                :key="item.id"
                class="cart-item"
              >
                <img 
                  :src="item.imagen || '/placeholder.jpg'" 
                  :alt="item.nombre"
                >
                <div class="item-details">
                  <h3>{{ item.nombre }}</h3>
                  <p class="item-price">{{ simboloMoneda }}{{ item.precio.toFixed(2) }}</p>
                  <p class="item-quantity">Cantidad: {{ item.cantidad || 1 }}</p>
                </div>
                <div class="item-total">
                  {{ simboloMoneda }}{{ (item.precio * (item.cantidad || 1)).toFixed(2) }}
                </div>
              </div>
            </div>

<div class="summary-totals">
  <div class="total-row">
    <span>Subtotal{{ ivaIncluido ? ' (sin IVA)' : '' }}:</span>
    <span>{{ simboloMoneda }}{{ subtotalSinIva.toFixed(2) }}</span>
  </div>
  
  <div class="total-row">
    <span>IVA ({{ porcentajeIva }}%){{ ivaIncluido ? ' incluido' : '' }}:</span>
    <span>{{ simboloMoneda }}{{ iva.toFixed(2) }}</span>
  </div>
  
  <div class="total-row">
    <span>Envío:</span>
    <span>{{ envioGratis ? 'Gratis' : `${simboloMoneda}${envio.toFixed(2)}` }}</span>
  </div>

  <div class="summary-divider"></div>

  <div class="total-row grand-total">
    <span>Total a Pagar:</span>
    <span class="total-amount">{{ simboloMoneda }}{{ total.toFixed(2) }}</span>
  </div>
</div>

            <div class="delivery-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m-4 0v-1m4 1v-1m6 1a2 2 0 104 0m-4 0a2 2 0 114 0m-4 0v-1m4 1v-1" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>Tiempo estimado de entrega: {{ tiempoEntrega || '2-3 días hábiles' }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <transition name="notification-fade">
      <div v-if="mostrarNotificacion" class="notification-toast" :class="notificacionTipo">
        <svg v-if="notificacionTipo === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>{{ mensajeNotificacion }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEcommerceConfig } from '~/stores/ecommerceConfig'

definePageMeta({
  middleware: 'auth',
  layout: 'tienda'
})

const router = useRouter()
const ecommerceConfig = useEcommerceConfig()
const config = useRuntimeConfig()
const API_URL = config.public.apiBase

const carrito = ref([])
const configuracion = ref({})

const simboloMoneda = ref('Q')
const moneda = ref('GTQ')
const ivaIncluido = ref(false)
const porcentajeIva = ref(12)
const envioGratisDesdeMonto = ref(500)
const tiempoEntrega = ref('2-3 días hábiles')
const costoEnvio = ref(50)

const formulario = ref({
  nombre: '',
  telefono: '',
  direccion: '',
  notas: '',
  metodoPago: 'Efectivo',
  comprobante: null,
  bancoOrigen: '',
  fechaTransferencia: '',
  numeroTransaccion: ''
})

const procesando = ref(false)
const mostrarNotificacion = ref(false)
const mensajeNotificacion = ref('')
const notificacionTipo = ref('success')

const metodosPagoFiltrados = computed(() => {
  return [
    { 
      id: 'Efectivo', 
      nombre: 'Efectivo', 
      descripcion: 'Pago en efectivo contra entrega' 
    },
    { 
      id: 'Transferencia', 
      nombre: 'Transferencia Bancaria', 
      descripcion: 'Transferencia bancaria (requiere validación)' 
    }
  ]
})

const subtotal = computed(() => {
  return carrito.value.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0)
})

const subtotalSinIva = computed(() => {
  if (ivaIncluido.value) {
    return subtotal.value / (1 + porcentajeIva.value / 100)
  }
  return subtotal.value
})

const iva = computed(() => {
  if (ivaIncluido.value) {
    return subtotal.value - subtotalSinIva.value
  }
  return subtotal.value * (porcentajeIva.value / 100)
})

const envioGratis = computed(() => {
  return subtotal.value >= envioGratisDesdeMonto.value
})

const envio = computed(() => {
  return envioGratis.value ? 0 : costoEnvio.value
})

const total = computed(() => {
  if (ivaIncluido.value) {
    return subtotal.value + envio.value
  }
  return subtotal.value + iva.value + envio.value
})

function getToken() {
  if (process.client) {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }
  return null
}

const cargarCarrito = () => {
  if (process.client) {
    const carritoGuardado = localStorage.getItem('carrito')
    if (carritoGuardado) {
      carrito.value = JSON.parse(carritoGuardado)
    }
    if (carrito.value.length === 0) {
      router.push('/tienda/carrito')
    }
  }
}

const cargarConfiguracion = async () => {
  try {
    const response = await $fetch(`${API_URL}/ecommerce-config/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response && response.success) {
      const configs = response.data
      
      configs.forEach(config => {
        const valor = config.valorParametro
        switch(config.nombreParametro) {
          case 'ECOMMERCE_GENERAL_SIMBOLO_MONEDA':
            simboloMoneda.value = valor
            break
          case 'ECOMMERCE_GENERAL_MONEDA':
            moneda.value = valor
            break
          case 'ECOMMERCE_GENERAL_IVA_INCLUIDO':
            ivaIncluido.value = valor === 'true'
            break
          case 'ECOMMERCE_GENERAL_PORCENTAJE_IVA':
            porcentajeIva.value = parseFloat(valor)
            break
          case 'ECOMMERCE_ENVIOS_GRATIS_DESDE':
            envioGratisDesdeMonto.value = parseFloat(valor)
            break
          case 'ECOMMERCE_ENVIOS_TIEMPO_ENTREGA':
            tiempoEntrega.value = valor
            break
          case 'ECOMMERCE_ENVIOS_COSTO_BASE':
            costoEnvio.value = parseFloat(valor)
            break
          case 'ECOMMERCE_PAGOS_BANCO':
            configuracion.value.banco = valor
            break
          case 'ECOMMERCE_PAGOS_NUMERO_CUENTA':
            configuracion.value.numeroCuenta = valor
            break
          case 'ECOMMERCE_PAGOS_NOMBRE_CUENTA':
            configuracion.value.nombreCuenta = valor
            break
        }
      })
    }
  } catch (error) {
    console.error('Error al cargar configuración:', error)
  }
}

const handleComprobanteUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      mostrarNotificacion.value = true
      notificacionTipo.value = 'error'
      mensajeNotificacion.value = 'El archivo no puede superar 5MB'
      setTimeout(() => {
        mostrarNotificacion.value = false
      }, 3000)
      event.target.value = ''
      return
    }
    formulario.value.comprobante = file
  }
}

const procesarPago = async () => {
  if (!formulario.value.nombre || !formulario.value.telefono || !formulario.value.direccion) {
    mostrarNotificacion.value = true
    notificacionTipo.value = 'error'
    mensajeNotificacion.value = 'Por favor completa todos los campos requeridos'
    setTimeout(() => {
      mostrarNotificacion.value = false
    }, 3000)
    return
  }

  if (formulario.value.metodoPago === 'Transferencia') {
    if (!formulario.value.bancoOrigen || !formulario.value.fechaTransferencia || 
        !formulario.value.numeroTransaccion || !formulario.value.comprobante) {
      mostrarNotificacion.value = true
      notificacionTipo.value = 'error'
      mensajeNotificacion.value = 'Por favor completa todos los datos de la transferencia incluyendo el comprobante'
      setTimeout(() => {
        mostrarNotificacion.value = false
      }, 3000)
      return
    }
  }

  procesando.value = true

  try {
    const formData = new FormData()
    formData.append('nombre', formulario.value.nombre)
    formData.append('telefono', formulario.value.telefono)
    formData.append('direccion', formulario.value.direccion)
    formData.append('notas', formulario.value.notas)
    formData.append('metodo_pago', formulario.value.metodoPago)
    formData.append('total', total.value.toFixed(2))
    formData.append('subtotal', subtotalSinIva.value.toFixed(2))
    formData.append('iva', iva.value.toFixed(2))
    formData.append('envio', envio.value.toFixed(2))
    formData.append('productos', JSON.stringify(carrito.value.map(item => ({
      id: item.id,
      precio: item.precio,
      cantidad: item.cantidad || 1
    }))))

    if (formulario.value.metodoPago === 'Transferencia') {
      formData.append('banco_origen', formulario.value.bancoOrigen)
      formData.append('fecha_transferencia', formulario.value.fechaTransferencia)
      formData.append('numero_transaccion', formulario.value.numeroTransaccion)
      
      if (formulario.value.comprobante) {
        formData.append('comprobante', formulario.value.comprobante)
      }
    }

    const response = await $fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    })

    if (response.success) {
      localStorage.removeItem('carrito')
      mostrarNotificacion.value = true
      notificacionTipo.value = 'success'
      
      if (formulario.value.metodoPago === 'Transferencia') {
        mensajeNotificacion.value = 'Pedido creado. En espera de validación de tu transferencia.'
      } else {
        mensajeNotificacion.value = 'Pedido procesado exitosamente'
      }
      
      setTimeout(() => {
        router.push('/tienda/pedidos')
      }, 2000)
    }
  } catch (error) {
    console.error('Error al procesar pago:', error)
    mostrarNotificacion.value = true
    notificacionTipo.value = 'error'
    mensajeNotificacion.value = error.data?.message || 'Error al procesar el pedido'
    
    setTimeout(() => {
      mostrarNotificacion.value = false
    }, 3000)
  } finally {
    procesando.value = false
  }
}

onMounted(async () => {
  await ecommerceConfig.cargarConfiguracion()
  cargarCarrito()
  cargarConfiguracion()
})
</script>

<style scoped>
.pago-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.page-header {
  background: white;
  border-bottom: 1px solid #dee2e6;
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #1b4332;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.back-link:hover {
  color: #2d6a4f;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-card h2 {
  margin: 0 0 1.5rem 0;
  color: #1b4332;
  font-size: 1.5rem;
}

.section-title {
  margin: 2rem 0 1.5rem 0;
  color: #1b4332;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2d6a4f;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  background: white;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #1b4332;
}

.form-group input[type="date"] {
  cursor: pointer;
}

.form-group input[type="file"] {
  padding: 0.5rem;
  cursor: pointer;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.file-hint {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #6c757d;
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-method {
  position: relative;
  cursor: pointer;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.payment-method:hover {
  border-color: #1b4332;
  background: #f8f9fa;
}

.payment-method.active {
  border-color: #1b4332;
  background: #f1f8f4;
}

.payment-method input[type="radio"] {
  margin-top: 0.25rem;
  cursor: pointer;
}

.method-icon {
  color: #1b4332;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.payment-method.active .method-icon {
  color: #2d6a4f;
}

.method-name {
  font-weight: 600;
  color: #1b4332;
  margin: 0 0 0.25rem 0;
}

.method-desc {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

.bank-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.bank-info h3 {
  margin: 0 0 1rem 0;
  color: #1b4332;
  font-size: 1.1rem;
}

.info-box {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-box p {
  margin: 0.5rem 0;
  color: #495057;
}

.info-box strong {
  color: #1b4332;
}

.transfer-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #fef9e7;
  border-left: 4px solid #d4af37;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.transfer-notice svg {
  color: #d4af37;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.transfer-notice p {
  margin: 0;
  color: #7d6608;
  font-size: 0.9rem;
}

.transfer-notice strong {
  color: #6b5200;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(27,67,50,0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cart-items {
  margin-bottom: 1.5rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #dee2e6;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #2d6a4f;
}

.item-price {
  color: #1b4332;
  font-weight: 600;
  margin: 0.25rem 0;
}

.item-quantity {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

.item-total {
  font-weight: 600;
  color: #1b4332;
  text-align: right;
}

.summary-totals {
  border-top: 2px solid #dee2e6;
  padding-top: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  color: #495057;
}

.total-row.final {
  border-top: 2px solid #dee2e6;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1b4332;
}

.envio-gratis-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #d4edda;
  color: #155724;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.envio-gratis-badge svg {
  flex-shrink: 0;
}

.delivery-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
}

.delivery-info svg {
  color: #1b4332;
  flex-shrink: 0;
}

.delivery-info p {
  margin: 0;
  color: #495057;
  font-size: 0.9rem;
}

.notification-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
}

.notification-toast.success {
  border-left: 4px solid #1b4332;
}

.notification-toast.success svg {
  color: #1b4332;
}

.notification-toast.error {
  border-left: 4px solid #dc3545;
}

.notification-toast.error svg {
  color: #dc3545;
}

.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: all 0.3s ease;
}

.notification-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .summary-section {
    order: -1;
  }
  
  .payment-methods {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 1rem;
  }
  
  .section-card {
    padding: 1.5rem;
  }
  
  .cart-item {
    grid-template-columns: 60px 1fr;
    gap: 0.75rem;
  }
  
  .cart-item img {
    width: 60px;
    height: 60px;
  }
  
  .item-total {
    grid-column: 2;
    text-align: left;
    margin-top: 0.5rem;
  }
}
</style>