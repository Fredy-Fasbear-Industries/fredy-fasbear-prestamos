<template>
  <div class="empenos-page">
    <header class="empenos-header">
      <div class="header-container">
        <div class="header-left">
          <NuxtLink to="/dashboard" class="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Volver al Dashboard
          </NuxtLink>
          <div class="page-title">
            <h1>Gestión de Empéños</h1>
            <p>Administra tus préstamos pignoraticios</p>
          </div>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="welcome-text">Hola, {{ user?.nombre }} {{ user?.apellido || '' }}</span>
            <div class="user-avatar">
              <span class="user-initials">{{ getUserInitials(user) }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div v-if="loadingData" class="loading-overlay">
      <div class="loading-spinner">
        <svg class="animate-spin" width="40" height="40" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
          <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p>Cargando información...</p>
      </div>
    </div>

    <div v-if="error && !loadingData" class="error-state">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h3>Error al cargar los datos</h3>
      <p>{{ error }}</p>
      <button class="btn-primary" @click="cargarDatos">Reintentar</button>
    </div>

    <main class="empenos-main" v-else>
      <div class="container">
        <EstadisticasCards :estadisticas="estadisticas" />

        <section class="actions-section">
          <div class="actions-container">
            <button class="action-btn primary" @click="mostrarNuevoPrestamo = true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Nuevo Empéño
            </button>
            <button class="action-btn secondary" @click="mostrarCalculadora = true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M8 6H16M8 10H16M8 14H16M8 18H16" stroke="currentColor" stroke-width="2"/>
              </svg>
              Calculadora de Préstamo
            </button>
          </div>
        </section>

        <section class="prestamos-section">
          <div class="section-header">
            <h2>Mis Préstamos y Solicitudes</h2>
            <div class="filters">
              <select v-model="filtroEstado" class="filter-select">
                <option value="">Todos</option>
                <option value="Pendiente">Solicitudes Pendientes</option>
                <option value="Evaluando">En Evaluación</option>
                <option value="Aprobada">Aprobadas</option>
                <option value="Activo">Préstamos Activos</option>
                <option value="Vencido">Vencidos</option>
                <option value="Pagado">Pagados</option>
                <option value="Rechazada">Rechazadas</option>
              </select>
            </div>
          </div>

          <div class="prestamos-grid" v-if="itemsFiltrados.length > 0">
            <PrestamoCard
              v-for="item in itemsFiltrados"
              :key="`${item.tipo}-${item.id}`"
              :item="item"
              :disabled="loadingOperaciones"
              @ver-detalle="verDetalle"
              @renovar="handleRenovar"
              @pagar="handlePagar"
              @cancelar="handleCancelar"
            />
          </div>

          <div class="empty-state" v-else-if="!loadingData">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <h3>{{ filtroEstado ? 'No hay elementos con este estado' : 'No tienes préstamos o solicitudes' }}</h3>
            <p>¡Comienza tu primer empéño y obtén el efectivo que necesitas!</p>
            <button class="btn-primary" @click="mostrarNuevoPrestamo = true">
              Crear Nuevo Empéño
            </button>
          </div>
        </section>
      </div>
    </main>

    <Teleport to="body" v-if="mostrarNuevoPrestamo">
      <div class="modal-overlay" @click="mostrarNuevoPrestamo = false">
        <div class="modal-content formulario-modal" @click.stop>
          <button class="modal-close-floating" @click="mostrarNuevoPrestamo = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <div class="modal-scroll-container">
            <FormularioNuevoEmpeno 
              :visible="mostrarNuevoPrestamo"
              @close="mostrarNuevoPrestamo = false"
              @submit="procesarSolicitudEmpeno"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <ModalCalculadora
      v-if="mostrarCalculadora"
      :calculadora="calculadora"
      :loading-simulacion="loadingSimulacion"
      @close="mostrarCalculadora = false"
      @calcular="handleCalcular"
      @obtener-simulacion="handleSimulacion"
    />

    <ModalPago
      v-if="mostrarModalPago && prestamoSeleccionado"
      :prestamo="prestamoSeleccionado"
      @close="cerrarModalPago"
      @confirmar="procesarPago"
    />

    <ModalRenovar
      v-if="mostrarModalRenovar && prestamoSeleccionado"
      :prestamo="prestamoSeleccionado"
      @close="cerrarModalRenovar"
      @confirmar="procesarRenovacion"
    />

    <ModalConfirmacionCancelacion
      v-if="mostrarConfirmacionCancelacion"
      :solicitud="solicitudACancel"
      :motivo="motivoCancelacion"
      :loading="loadingCancelacion"
      @close="cerrarConfirmacionCancelacion"
      @confirmar="ejecutarCancelacion"
    />

    <NotificationToast
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      @close="notification.show = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useEmpenos } from '~/composables/useEmpenos'
import { useCalculadoraPrestamo } from '~/composables/useCalculadoraPrestamo'
import { getUserInitials } from '~/utils/empenoUtils'

import EstadisticasCards from '~/components/empeno/EstadisticasCards.vue'
import PrestamoCard from '~/components/empeno/PrestamoCard.vue'
import ModalCalculadora from '~/components/empeno/ModalCalculadora.vue'
import ModalConfirmacionCancelacion from '~/components/empeno/ModalConfirmacionCancelacion.vue'
import NotificationToast from '~/components/common/NotificationToast.vue'
import FormularioNuevoEmpeno from '~/pages/empeno/FormularioNuevoEmpeno.vue'
import ModalPago from '~/components/empeno/ModalPago.vue'
import ModalRenovar from '~/components/empeno/ModalRenovar.vue'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'Mis Empéños - Gestión de Préstamos',
  meta: [
    { name: 'description', content: 'Administra tus préstamos pignoraticios de manera fácil y segura' }
  ]
})

const router = useRouter()
const config = useRuntimeConfig()
const { user, getToken } = useAuth()

const {
  estadisticas,
  itemsCombinados,
  loadingData,
  error,
  cargarDatos,
  confirmarCancelacion
} = useEmpenos()

const {
  calculadora,
  loadingSimulacion,
  calcularPrestamo,
  obtenerSimulacionOficial
} = useCalculadoraPrestamo()

const mostrarNuevoPrestamo = ref(false)
const mostrarCalculadora = ref(false)
const mostrarModalPago = ref(false)
const mostrarModalRenovar = ref(false)
const mostrarConfirmacionCancelacion = ref(false)
const filtroEstado = ref('')
const loadingOperaciones = ref(false)
const loadingCancelacion = ref(false)
const solicitudACancel = ref(null)
const motivoCancelacion = ref('')
const prestamoSeleccionado = ref(null)

const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

const itemsFiltrados = computed(() => {
  if (!filtroEstado.value) return itemsCombinados.value
  return itemsCombinados.value.filter(item => item.estado === filtroEstado.value)
})

const mostrarNotificacion = (message, type = 'success') => {
  notification.value = { show: true, type, message }
  setTimeout(() => { notification.value.show = false }, 5000)
}

const verDetalle = (item) => {
  if (item.tipo === 'solicitud') {
    router.push(`/empeno/solicitudes/${item.id}`)
  } else {
    router.push(`/empeno/prestamo/${item.id}`)
  }
}

const handleRenovar = async (prestamo) => {
  try {
    loadingOperaciones.value = true
    const token = getToken()
    
    const response = await fetch(`${config.public.apiBase}/prestamos/${prestamo.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const result = await response.json()
    
    if (result.success) {
      prestamoSeleccionado.value = result.data.prestamo
      mostrarModalRenovar.value = true
    } else {
      mostrarNotificacion('Error al cargar el préstamo', 'error')
    }
  } catch (error) {
    console.error('Error cargando préstamo:', error)
    mostrarNotificacion('Error al cargar el préstamo', 'error')
  } finally {
    loadingOperaciones.value = false
  }
}

const handlePagar = async (prestamo) => {
  try {
    loadingOperaciones.value = true
    const token = getToken()
    
    const response = await fetch(`${config.public.apiBase}/prestamos/${prestamo.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const result = await response.json()
    
    if (result.success) {
      prestamoSeleccionado.value = result.data.prestamo
      mostrarModalPago.value = true
    } else {
      mostrarNotificacion('Error al cargar el préstamo', 'error')
    }
  } catch (error) {
    console.error('Error cargando préstamo:', error)
    mostrarNotificacion('Error al cargar el préstamo', 'error')
  } finally {
    loadingOperaciones.value = false
  }
}

const cerrarModalPago = () => {
  mostrarModalPago.value = false
  prestamoSeleccionado.value = null
}

const cerrarModalRenovar = () => {
  mostrarModalRenovar.value = false
  prestamoSeleccionado.value = null
}

const procesarPago = async (datosPago) => {
  try {
    loadingOperaciones.value = true
    const token = getToken()
    
    const formData = new FormData()
    formData.append('monto', datosPago.monto.toString())
    formData.append('metodoPago', datosPago.metodoPago)
    formData.append('fechaDeposito', datosPago.fechaDeposito)
    formData.append('nombreBanco', datosPago.nombreBanco)
    formData.append('numeroTransaccion', datosPago.numeroTransaccion)
    
    if (datosPago.observaciones) {
      formData.append('observaciones', datosPago.observaciones)
    }
    
    if (datosPago.imagenComprobante) {
      formData.append('imagenComprobante', datosPago.imagenComprobante)
    }
    
    const response = await fetch(`${config.public.apiBase}/prestamos/${prestamoSeleccionado.value.id}/pagar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    const result = await response.json()
    
    if (result.success) {
      mostrarNotificacion('Pago registrado exitosamente', 'success')
      cerrarModalPago()
      await cargarDatos()
    } else {
      throw new Error(result.message || 'Error al procesar el pago')
    }
  } catch (error) {
    console.error('Error procesando pago:', error)
    mostrarNotificacion(error.message || 'Error al procesar el pago', 'error')
  } finally {
    loadingOperaciones.value = false
  }
}

const procesarRenovacion = async (datosRenovacion) => {
  try {
    loadingOperaciones.value = true
    const token = getToken()
    
    const response = await fetch(`${config.public.apiBase}/prestamos/${prestamoSeleccionado.value.id}/renovar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nuevosPlazoMeses: datosRenovacion.nuevosPlazoMeses,
        motivoRenovacion: datosRenovacion.motivoRenovacion
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      mostrarNotificacion('Préstamo renovado exitosamente', 'success')
      cerrarModalRenovar()
      await cargarDatos()
    } else {
      throw new Error(result.message || 'Error al renovar el préstamo')
    }
  } catch (error) {
    console.error('Error renovando préstamo:', error)
    mostrarNotificacion(error.message || 'Error al renovar el préstamo', 'error')
  } finally {
    loadingOperaciones.value = false
  }
}

const handleCancelar = (solicitud) => {
  if (!['Pendiente', 'Evaluando'].includes(solicitud.estado)) {
    mostrarNotificacion('Esta solicitud no puede ser cancelada en su estado actual', 'warning')
    return
  }
  solicitudACancel.value = solicitud
  motivoCancelacion.value = ''
  mostrarConfirmacionCancelacion.value = true
}

const cerrarConfirmacionCancelacion = () => {
  mostrarConfirmacionCancelacion.value = false
  solicitudACancel.value = null
  motivoCancelacion.value = ''
}

const ejecutarCancelacion = async (motivo) => {
  if (!solicitudACancel.value) return

  try {
    loadingCancelacion.value = true
    await confirmarCancelacion(solicitudACancel.value.id, motivo)
    mostrarNotificacion('Solicitud cancelada exitosamente', 'success')
    cerrarConfirmacionCancelacion()
  } catch (error) {
    const mensajeError = error.message?.includes('estado') 
      ? 'La solicitud no puede ser cancelada en su estado actual'
      : error.message?.includes('autorizado')
      ? 'No tienes permisos para cancelar esta solicitud'
      : error.message || 'Error al cancelar la solicitud'
    
    mostrarNotificacion(mensajeError, 'error')
  } finally {
    loadingCancelacion.value = false
  }
}

const procesarSolicitudEmpeno = async (formData) => {
  try {
    loadingData.value = true
    const token = getToken()
    
    if (!token) {
      throw new Error('No tienes sesión activa. Por favor inicia sesión.')
    }

    const url = `${config.public.apiBase}/solicitudes`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const result = await response.json()

    if (result.success) {
      mostrarNotificacion('Solicitud enviada exitosamente. Recibirás una evaluación pronto.', 'success')
      mostrarNuevoPrestamo.value = false
      await cargarDatos()
    } else {
      throw new Error(result.message || 'Error al enviar la solicitud')
    }

  } catch (err) {
    console.error('Error procesando solicitud:', err)
    mostrarNotificacion(err.message || 'Error al procesar la solicitud', 'error')
  } finally {
    loadingData.value = false
  }
}

const handleCalcular = () => {
  const { monto, plazo, categoria } = calculadora.value
  
  if (!monto || monto <= 0) {
    mostrarNotificacion('Ingresa un monto válido', 'warning')
    return
  }
  
  if (!plazo || plazo <= 0) {
    mostrarNotificacion('Selecciona un plazo', 'warning')
    return
  }
  
  if (!categoria) {
    mostrarNotificacion('Selecciona una categoría', 'warning')
    return
  }
  
  calcularPrestamo()
}

const handleSimulacion = async () => {
  const { monto, plazo, categoria } = calculadora.value
  
  if (!monto || monto <= 0) {
    mostrarNotificacion('Ingresa un monto válido', 'warning')
    return
  }
  
  if (!plazo || plazo <= 0) {
    mostrarNotificacion('Selecciona un plazo', 'warning')
    return
  }
  
  if (!categoria) {
    mostrarNotificacion('Selecciona una categoría', 'warning')
    return
  }
  
  try {
    await obtenerSimulacionOficial()
    mostrarNotificacion('Simulación obtenida del servidor', 'success')
  } catch (err) {
    mostrarNotificacion('Error al obtener simulación del servidor', 'error')
  }
}

onMounted(async () => {
  await cargarDatos()
})
</script>

<style scoped>
.empenos-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.empenos-header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  color: white;
  padding: 1.5rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #D4AF37;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.back-link:hover {
  opacity: 0.8;
}

.page-title h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.page-title p {
  margin: 0.25rem 0 0;
  color: #B0BEC5;
  font-size: 0.9rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.welcome-text {
  font-weight: 500;
  color: #F5F5F5;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #D4AF37;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  min-height: 50vh;
}

.error-icon {
  color: #E74C3C;
  margin-bottom: 1rem;
}

.empenos-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.actions-section {
  margin-bottom: 3rem;
}

.actions-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background: #D4AF37;
  color: white;
}

.action-btn.primary:hover {
  background: #B8941F;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #3498DB;
  color: white;
}

.action-btn.secondary:hover {
  background: #2980B9;
}

.prestamos-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #2C3E50;
  font-size: 1.5rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  background: white;
  color: #2C3E50;
  cursor: pointer;
}

.prestamos-grid {
  display: grid;
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  color: #D4AF37;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: #2C3E50;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn-primary {
  background: #D4AF37;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #B8941F;
  transform: translateY(-1px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-close-floating {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.modal-close-floating:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.modal-scroll-container {
  max-height: 90vh;
  overflow-y: auto;
}

.formulario-modal {
  max-width: 900px;
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
  }
  
  .header-left {
    gap: 1rem;
  }
  
  .welcome-text {
    display: none;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .actions-container {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>