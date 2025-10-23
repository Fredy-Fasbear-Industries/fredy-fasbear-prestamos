<template>
  <div class="cobrador-panel">
    <header class="cobrador-header">
      <div class="header-container">
        <div class="header-left">
          <NuxtLink to="/" class="logo">
            <img src="~/assets/images/logo.png" alt="Logo">
            <div>
              <h1>Fredy Fasbear</h1>
              <span class="cobrador-badge">Panel Cobrador</span>
            </div>
          </NuxtLink>
        </div>

        <div class="header-right">
          <div class="cobrador-info">
            <span class="welcome-text">{{ nombreCobrador }}</span>
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
          </div>

          <div class="cobrador-actions">
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
      <div class="spinner"></div>
      <p>Cargando panel de cobranza...</p>
    </div>

    <div v-else-if="errorCarga" class="error-container">
      <div class="error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
      </div>
      <h3>Error al cargar el panel</h3>
      <p>{{ errorCarga }}</p>
      <button class="btn-retry" @click="cargarDatosPanel">Reintentar</button>
    </div>

    <main v-else class="cobrador-main">
      <div class="container">
        <section class="panel-intro">
          <div class="intro-content">
            <h2>Bienvenido al Panel de Cobranza</h2>
            <p>Valida y gestiona los pagos reportados por los clientes</p>
          </div>
          <div class="intro-actions">
            <button class="btn-secondary" @click="cargarDatosPanel" :disabled="cargandoDatos">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ cargandoDatos ? 'Actualizando...' : 'Actualizar' }}
            </button>
          </div>
        </section>

        <section class="stats-section">
          <h2 class="section-title">Estadísticas de Validación</h2>
          <div class="stats-grid">
            <div class="stat-card pendientes">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ estadisticas.pagosPendientes || 0 }}</h3>
                <p>Pagos Pendientes</p>
                <div class="stat-monto">{{ formatMonto(estadisticas.montoTotalPendiente || 0) }}</div>
              </div>
            </div>

            <div class="stat-card validados">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ estadisticas.pagosValidados || 0 }}</h3>
                <p>Pagos Validados</p>
                <div class="stat-badge success">Aprobados</div>
              </div>
            </div>

            <div class="stat-card rechazados">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ estadisticas.pagosRechazados || 0 }}</h3>
                <p>Pagos Rechazados</p>
                <div class="stat-badge error">Denegados</div>
              </div>
            </div>

            <div class="stat-card eficiencia">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ calcularEficiencia() }}%</h3>
                <p>Tasa de Validación</p>
                <div class="stat-badge info">Eficiencia</div>
              </div>
            </div>
          </div>
        </section>

        <section class="pagos-section">
          <div class="tabs-header">
            <button 
              :class="['tab-btn', { active: tabActivo === 'pendientes' }]"
              @click="cambiarTab('pendientes')"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
              </svg>
              Pendientes ({{ estadisticas.pagosPendientes }})
            </button>
            <button 
              :class="['tab-btn', { active: tabActivo === 'validados' }]"
              @click="cambiarTab('validados')"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
              Validados ({{ estadisticas.pagosValidados }})
            </button>
            <button 
              :class="['tab-btn', { active: tabActivo === 'rechazados' }]"
              @click="cambiarTab('rechazados')"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              Rechazados ({{ estadisticas.pagosRechazados }})
            </button>
          </div>

          <div class="tab-content">
            <div v-if="cargandoPagos" class="loading-pagos">
              <div class="spinner-small"></div>
              <p>Cargando pagos...</p>
            </div>

            <div v-else-if="pagosActuales.length > 0" class="pagos-grid">
              <div v-for="pago in pagosActuales" :key="pago.id" class="pago-card">
                <div class="pago-header">
                  <div class="pago-info">
                    <h3>{{ pago.prestamo?.numeroPrestamo || 'Sin número' }}</h3>
                    <p class="pago-cliente">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      {{ pago.prestamo?.cliente?.nombre || 'Sin nombre' }} {{ pago.prestamo?.cliente?.apellido || '' }}
                    </p>
                  </div>
                  <div class="pago-monto-principal">
                    <span class="label">Monto Pagado</span>
                    <span class="monto">{{ formatMonto(pago.monto || 0) }}</span>
                  </div>
                </div>

                <div class="pago-detalles">
                  <div class="detalle-item">
                    <span class="label">Fecha</span>
                    <span class="valor">{{ formatFecha(pago.fechaPago) }}</span>
                  </div>
                  <div class="detalle-item">
                    <span class="label">Banco</span>
                    <span class="valor">{{ pago.banco || 'No especificado' }}</span>
                  </div>
                  <div class="detalle-item">
                    <span class="label">Transacción</span>
                    <span class="valor">{{ pago.numeroTransaccion || 'N/A' }}</span>
                  </div>
                  <div class="detalle-item">
                    <span class="label">Tipo Pago</span>
                    <span class="valor">{{ pago.tipoPago || 'Efectivo' }}</span>
                  </div>
                  <div class="detalle-item">
                    <span class="label">Saldo Pendiente</span>
                    <span class="valor saldo">{{ formatMonto(pago.prestamo?.saldoPendiente || 0) }}</span>
                  </div>
                </div>

                <div v-if="pago.observaciones" class="pago-observaciones">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                    <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <p>{{ pago.observaciones }}</p>
                </div>

                <div class="pago-acciones">
                  <button v-if="pago.comprobante" @click="verComprobante(pago.id)" class="btn-comprobante">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                      <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Ver Comprobante
                  </button>
                  <template v-if="tabActivo === 'pendientes'">
                    <button @click="validarPago(pago.id)" class="btn-validar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                        <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      Validar
                    </button>
                    <button @click="rechazarPago(pago.id)" class="btn-rechazar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      Rechazar
                    </button>
                  </template>
                  <template v-else-if="tabActivo === 'validados'">
                    <div class="validado-info">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                        <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <span>Validado por: {{ pago.validadoPor || 'Sistema' }}</span>
                    </div>
                  </template>
                  <template v-else-if="tabActivo === 'rechazados'">
                    <div class="rechazado-info">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <span>Rechazado por: {{ pago.rechazadoPor || 'Sistema' }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h3>No hay pagos {{ tabActivo }}</h3>
              <p>{{ getMensajeVacio() }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <Transition name="modal">
      <div v-if="mostrarModalComprobante" class="modal-overlay" @click="cerrarModalComprobante">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Comprobante de Pago</h3>
            <button @click="cerrarModalComprobante" class="btn-close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <img v-if="comprobanteActual" :src="comprobanteActual" alt="Comprobante" class="comprobante-img">
            <p v-else class="no-comprobante">No hay comprobante disponible</p>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="mostrarModalValidacion" class="modal-overlay" @click="cerrarModalValidacion">
        <div class="modal-content validacion" @click.stop>
          <div class="modal-header">
            <h3>{{ modoValidacion === 'validar' ? 'Validar Pago' : 'Rechazar Pago' }}</h3>
            <button @click="cerrarModalValidacion" class="btn-close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Observaciones</label>
              <textarea 
                v-model="observacionesValidacion" 
                :placeholder="modoValidacion === 'validar' ? 'Observaciones adicionales (opcional)' : 'Motivo del rechazo (requerido)'"
                rows="4"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="cerrarModalValidacion" class="btn-cancelar">Cancelar</button>
            <button @click="confirmarValidacion" class="btn-confirmar" :disabled="procesandoValidacion">
              {{ procesandoValidacion ? 'Procesando...' : (modoValidacion === 'validar' ? 'Validar' : 'Rechazar') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="notification">
      <div v-if="notification.show" :class="['notification', `notification-${notification.type}`]">
        <div class="notification-content">
          <svg v-if="notification.type === 'success'" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="9,12 11,14 15,10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
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
  middleware: ['auth'],
  layout: 'dashboard'
})

useHead({
  title: 'Panel de Cobranza - Fredy Fasbear Préstamos'
})

const { user, logout } = useAuth()
const { api } = useApi()
const config = useRuntimeConfig()

const loadingInicial = ref(true)
const errorCarga = ref(null)
const cargandoDatos = ref(false)
const cargandoPagos = ref(false)

const tabActivo = ref('pendientes')

const estadisticas = ref({
  pagosPendientes: 0,
  pagosValidados: 0,
  pagosRechazados: 0,
  montoTotalPendiente: 0
})

const pagosPendientes = ref([])
const pagosValidados = ref([])
const pagosRechazados = ref([])
const mostrarModalComprobante = ref(false)
const comprobanteActual = ref(null)
const mostrarModalValidacion = ref(false)
const modoValidacion = ref('validar')
const pagoIdActual = ref(null)
const observacionesValidacion = ref('')
const procesandoValidacion = ref(false)

const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

const nombreCobrador = computed(() => {
  return user.value ? `${user.value.nombre} ${user.value.apellido || ''}`.trim() : 'Cobrador'
})

const pagosActuales = computed(() => {
  if (tabActivo.value === 'pendientes') return pagosPendientes.value
  if (tabActivo.value === 'validados') return pagosValidados.value
  if (tabActivo.value === 'rechazados') return pagosRechazados.value
  return []
})

const getUrlComprobante = (rutaRelativa) => {
  if (!rutaRelativa) return null
  const apiBase = config.public.apiBase.replace('/api', '')
  return `${apiBase}${rutaRelativa}`
}

const getUserInitials = () => {
  if (!user.value) return 'C'
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido || ''
  const inicial1 = nombre ? nombre.charAt(0).toUpperCase() : ''
  const inicial2 = apellido ? apellido.charAt(0).toUpperCase() : ''
  return inicial1 + inicial2
}

const formatMonto = (monto) => {
  try {
    const montoNumerico = typeof monto === 'number' ? monto : parseFloat(monto) || 0
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(montoNumerico)
  } catch (error) {
    console.error('Error formateando monto:', error)
    return 'Q 0.00'
  }
}

const formatFecha = (fecha) => {
  try {
    if (!fecha) return 'Fecha no disponible'
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return 'Fecha inválida'
  }
}

const calcularEficiencia = () => {
  const total = estadisticas.value.pagosValidados + estadisticas.value.pagosRechazados
  if (total === 0) return 0
  return Math.round((estadisticas.value.pagosValidados / total) * 100)
}

const getMensajeVacio = () => {
  if (tabActivo.value === 'pendientes') return 'Todos los pagos han sido procesados'
  if (tabActivo.value === 'validados') return 'Aún no hay pagos validados'
  if (tabActivo.value === 'rechazados') return 'No hay pagos rechazados'
  return ''
}

const cambiarTab = async (tab) => {
  if (tabActivo.value === tab) return
  tabActivo.value = tab
  await cargarPagosPorEstado(tab)
}

const cargarEstadisticas = async () => {
  try {
    const response = await api('/cobrador/estadisticas')
    
    if (response.success && response.data) {
      estadisticas.value = {
        pagosPendientes: response.data.pagosPendientes || 0,
        pagosValidados: response.data.pagosValidados || 0,
        pagosRechazados: response.data.pagosRechazados || 0,
        montoTotalPendiente: response.data.montoTotalPendiente || 0
      }
    } else {
      throw new Error('Formato de estadísticas inválido')
    }
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
    estadisticas.value = {
      pagosPendientes: 0,
      pagosValidados: 0,
      pagosRechazados: 0,
      montoTotalPendiente: 0
    }
    throw error
  }
}

const cargarPagosPorEstado = async (estado) => {
  try {
    cargandoPagos.value = true
    let endpoint = '/cobrador/pagos-pendientes?limite=50'
    
    if (estado === 'validados') {
      endpoint = '/cobrador/pagos-validados?limite=50'
    } else if (estado === 'rechazados') {
      endpoint = '/cobrador/pagos-rechazados?limite=50'
    }
    
    const response = await api(endpoint)
    
    if (response.success && Array.isArray(response.data?.pagos)) {
      const pagosConValidacion = response.data.pagos.map(pago => ({
        ...pago,
        prestamo: {
          id: pago.prestamo?.id || 0,
          numeroPrestamo: pago.prestamo?.numeroPrestamo || 'N/A',
          saldoPendiente: pago.prestamo?.saldoPendiente || 0,
          estado: pago.prestamo?.estado || 'Desconocido',
          cliente: {
            id: pago.prestamo?.cliente?.id || 0,
            nombre: pago.prestamo?.cliente?.nombre || 'Cliente',
            apellido: pago.prestamo?.cliente?.apellido || 'No disponible',
            email: pago.prestamo?.cliente?.email || '',
            telefono: pago.prestamo?.cliente?.telefono || ''
          }
        },
        monto: pago.monto || 0,
        banco: pago.banco || 'No especificado',
        numeroTransaccion: pago.numeroTransaccion || 'N/A',
        tipoPago: pago.tipoPago || 'Efectivo'
      }))
      
      if (estado === 'pendientes') {
        pagosPendientes.value = pagosConValidacion
      } else if (estado === 'validados') {
        pagosValidados.value = pagosConValidacion
      } else if (estado === 'rechazados') {
        pagosRechazados.value = pagosConValidacion
      }
    } else {
      throw new Error('Formato de respuesta inválido')
    }
  } catch (error) {
    console.error('Error cargando pagos:', error)
    mostrarNotificacion('error', 'Error al cargar los pagos: ' + (error.message || 'Error desconocido'))
    
    if (estado === 'pendientes') {
      pagosPendientes.value = []
    } else if (estado === 'validados') {
      pagosValidados.value = []
    } else if (estado === 'rechazados') {
      pagosRechazados.value = []
    }
  } finally {
    cargandoPagos.value = false
  }
}

const verComprobante = async (pagoId) => {
  try {
    const response = await api(`/cobrador/comprobante/${pagoId}`)
    if (response.success) {
      if (response.data.tieneComprobante) {
        comprobanteActual.value = getUrlComprobante(response.data.url)
        mostrarModalComprobante.value = true
      } else {
        mostrarNotificacion('error', 'Este pago no tiene comprobante adjunto')
      }
    }
  } catch (error) {
    console.error('Error cargando comprobante:', error)
    mostrarNotificacion('error', 'Error al cargar el comprobante')
  }
}

const cerrarModalComprobante = () => {
  mostrarModalComprobante.value = false
  comprobanteActual.value = null
}

const validarPago = (pagoId) => {
  modoValidacion.value = 'validar'
  pagoIdActual.value = pagoId
  observacionesValidacion.value = ''
  mostrarModalValidacion.value = true
}

const rechazarPago = (pagoId) => {
  modoValidacion.value = 'rechazar'
  pagoIdActual.value = pagoId
  observacionesValidacion.value = ''
  mostrarModalValidacion.value = true
}

const cerrarModalValidacion = () => {
  mostrarModalValidacion.value = false
  modoValidacion.value = 'validar'
  pagoIdActual.value = null
  observacionesValidacion.value = ''
}

const confirmarValidacion = async () => {
  if (modoValidacion.value === 'rechazar' && !observacionesValidacion.value) {
    mostrarNotificacion('error', 'Debe proporcionar un motivo para rechazar el pago')
    return
  }

  try {
    procesandoValidacion.value = true
    const decision = modoValidacion.value === 'validar' ? 'Validado' : 'Rechazado'
    
    const response = await api(`/cobrador/pagos/${pagoIdActual.value}/validar`, {
      method: 'POST',
      body: JSON.stringify({
        decision,
        observaciones: observacionesValidacion.value
      })
    })

    if (response.success) {
      mostrarNotificacion('success', `Pago ${decision.toLowerCase()} exitosamente`)
      cerrarModalValidacion()
      await cargarDatosPanel()
    }
  } catch (error) {
    console.error('Error validando pago:', error)
    mostrarNotificacion('error', 'Error al procesar la validación')
  } finally {
    procesandoValidacion.value = false
  }
}

const handleLogout = () => {
  logout()
  navigateTo('/')
}

const cargarDatosPanel = async () => {
  cargandoDatos.value = true
  errorCarga.value = null
  
  try {
    await Promise.all([
      cargarEstadisticas(),
      cargarPagosPorEstado(tabActivo.value)
    ])
  } catch (error) {
    console.error('Error cargando datos del panel:', error)
    errorCarga.value = error.message || 'Error al cargar los datos del panel'
    mostrarNotificacion('error', errorCarga.value)
  } finally {
    loadingInicial.value = false
    cargandoDatos.value = false
  }
}

const mostrarNotificacion = (tipo, mensaje) => {
  notification.value = {
    show: true,
    type: tipo,
    message: mensaje
  }
  
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

onMounted(async () => {
  console.log('Inicializando panel de cobrador para:', nombreCobrador.value)
  await cargarDatosPanel()
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
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.12);
  --shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.2);
  --transition: all 0.3s ease;
}

.cobrador-panel {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
}

.cobrador-header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
}

.logo img {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  line-height: 1;
}

.cobrador-badge {
  background: #D4AF37;
  color: #1A1A1A;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cobrador-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.welcome-text {
  font-weight: 500;
  color: #D4AF37;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A1A1A;
  font-weight: bold;
  font-size: 0.9rem;
}

.cobrador-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-logout {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #ff6b6b;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: rgba(231, 76, 60, 0.3);
  color: white;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.panel-intro {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-card);
}

.intro-content h2 {
  margin: 0 0 0.5rem 0;
  color: var(--color-azul-marino);
  font-size: 1.75rem;
}

.intro-content p {
  margin: 0;
  color: var(--color-gris-acero);
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid var(--color-azul-marino);
  border-radius: 8px;
  color: var(--color-azul-marino);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
}

.btn-secondary:hover {
  background: var(--color-azul-marino);
  color: white;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats-section {
  margin-bottom: 2rem;
}

.section-title {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: var(--transition);
  border-left: 4px solid;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.stat-card.pendientes {
  border-left-color: #F39C12;
}

.stat-card.validados {
  border-left-color: #27AE60;
}

.stat-card.rechazados {
  border-left-color: #E74C3C;
}

.stat-card.eficiencia {
  border-left-color: #9B59B6;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.pendientes .stat-icon {
  background: rgba(243, 156, 18, 0.1);
  color: #F39C12;
}

.stat-card.validados .stat-icon {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.stat-card.rechazados .stat-icon {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.stat-card.eficiencia .stat-icon {
  background: rgba(155, 89, 182, 0.1);
  color: #9B59B6;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-negro-carbon);
}

.stat-content p {
  margin: 0;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-monto {
  margin-top: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-dorado-vintage);
}

.stat-badge {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-badge.success {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.stat-badge.error {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.stat-badge.info {
  background: rgba(155, 89, 182, 0.1);
  color: #9B59B6;
}

.pagos-section {
  background: white;
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 2px solid #e9ecef;
  background: #f8f9fa;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--color-gris-acero);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
  font-size: 0.95rem;
  position: relative;
}

.tab-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  color: var(--color-azul-marino);
}

.tab-btn.active {
  color: var(--color-azul-marino);
  background: white;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-azul-marino);
}

.tab-content {
  padding: 2rem;
  min-height: 400px;
}

.loading-pagos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner-small {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.pagos-grid {
  display: grid;
  gap: 1.5rem;
}

.pago-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
  transition: var(--transition);
}

.pago-card:hover {
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.15);
}

.pago-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.pago-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-azul-marino);
  font-size: 1.125rem;
  font-weight: 600;
}

.pago-cliente {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-gris-acero);
  font-size: 0.9rem;
}

.pago-monto-principal {
  text-align: right;
}

.pago-monto-principal .label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-gris-acero);
  margin-bottom: 0.25rem;
}

.pago-monto-principal .monto {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-dorado-vintage);
}

.pago-detalles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detalle-item .label {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
  text-transform: uppercase;
  font-weight: 600;
}

.detalle-item .valor {
  font-size: 0.9rem;
  color: var(--color-negro-carbon);
  font-weight: 500;
}

.detalle-item .saldo {
  color: var(--color-dorado-vintage);
  font-weight: 700;
}

.pago-observaciones {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(44, 62, 80, 0.05);
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid var(--color-azul-marino);
}

.pago-observaciones svg {
  flex-shrink: 0;
  color: var(--color-azul-marino);
}

.pago-observaciones p {
  margin: 0;
  color: var(--color-gris-acero);
  font-size: 0.9rem;
  line-height: 1.5;
}

.pago-acciones {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.pago-acciones button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.btn-comprobante {
  background: white;
  color: #3498DB;
  border: 2px solid #3498DB;
}

.btn-comprobante:hover {
  background: #3498DB;
  color: white;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-validar {
  background: #27AE60;
  color: white;
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.2);
}

.btn-validar:hover {
  background: #229954;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
}

.btn-rechazar {
  background: white;
  color: #E74C3C;
  border: 2px solid #E74C3C;
}

.btn-rechazar:hover {
  background: #E74C3C;
  color: white;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.validado-info,
.rechazado-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.validado-info {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.rechazado-info {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state svg {
  color: var(--color-gris-acero);
  opacity: 0.5;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-negro-carbon);
}

.empty-state p {
  margin: 0;
  color: var(--color-gris-acero);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}

.modal-content.validacion {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #e9ecef;
  background: linear-gradient(135deg, var(--color-azul-marino), var(--color-negro-carbon));
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  padding: 0.5rem;
  color: white;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.modal-body {
  padding: 2rem;
}

.comprobante-img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.no-comprobante {
  text-align: center;
  color: var(--color-gris-acero);
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-negro-carbon);
  font-weight: 600;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  transition: var(--transition);
}

.form-group textarea:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
}

.btn-cancelar,
.btn-confirmar {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.btn-cancelar {
  background: #f3f4f6;
  color: var(--color-negro-carbon);
}

.btn-cancelar:hover {
  background: #e5e7eb;
}

.btn-confirmar {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-confirmar:hover {
  background: var(--color-dorado-claro);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}

.btn-confirmar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10001;
  min-width: 300px;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-success {
  border-left: 4px solid #27AE60;
}

.notification-success svg {
  color: #27AE60;
}

.notification-error {
  border-left: 4px solid #E74C3C;
}

.notification-error svg {
  color: #E74C3C;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  margin-bottom: 1rem;
  color: #C0392B;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
}

.btn-retry:hover {
  background: var(--color-dorado-claro);
  transform: translateY(-2px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
  }

  .panel-intro {
    flex-direction: column;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tabs-header {
    flex-direction: column;
  }

  .pago-header {
    flex-direction: column;
    gap: 1rem;
  }

  .pago-monto-principal {
    text-align: left;
  }

  .pago-detalles {
    grid-template-columns: 1fr;
  }

  .pago-acciones {
    flex-direction: column;
  }

  .pago-acciones button {
    width: 100%;
  }
}
</style>