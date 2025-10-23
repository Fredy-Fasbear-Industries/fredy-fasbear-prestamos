<template>
  <div class="prestamo-detalle-page">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="spinning">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.3"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <p>Cargando detalle del préstamo...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h2>Error al cargar préstamo</h2>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="cargarDetalle" class="btn-primary">
          Reintentar
        </button>
        <button @click="volverAlInicio" class="btn-secondary">
          Volver al inicio
        </button>
      </div>
    </div>

    <div v-else-if="prestamo" class="detalle-container">
      <div class="header-detalle">
        <button @click="volverAlInicio" class="btn-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver a Mis Empeños
        </button>

        <div class="header-card">
          <div class="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
              <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="header-content">
            <h1>{{ prestamo.numeroContrato || 'Préstamo' }}</h1>
            <p>Detalle de tu préstamo activo</p>
          </div>
          <div class="header-badge">
            <span class="badge" :class="`badge-${getEstadoClass(prestamo.estado)}`">
              {{ prestamo.estado }}
            </span>
          </div>
        </div>

        <div class="progress-card" v-if="prestamo.estado === 'Activo'">
          <div class="progress-steps">
            <div class="step completed">
              <div class="step-circle">1</div>
              <span class="step-label">Préstamo Otorgado</span>
              <span class="step-date">{{ formatDateShort(prestamo.fechaInicio) }}</span>
            </div>
            <div class="step active">
              <div class="step-circle">2</div>
              <span class="step-label">En Vigencia</span>
            </div>
            <div class="step">
              <div class="step-circle">3</div>
              <span class="step-label">Liquidado</span>
            </div>
          </div>
        </div>
      </div>

      <div class="alert-estado" v-if="alertaEstado" :class="`alert-${alertaEstado.tipo}`">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
        </svg>
        <div class="alert-content">
          <h3>{{ alertaEstado.titulo }}</h3>
          <p>{{ alertaEstado.mensaje }}</p>
        </div>
      </div>

      <div class="pestanas-navegacion">
        <button
          @click="pestanaActiva = 'informacion'"
          :class="['btn-pestana', { active: pestanaActiva === 'informacion' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2"/>
          </svg>
          Información General
        </button>

        <button
          @click="pestanaActiva = 'financiero'"
          :class="['btn-pestana', { active: pestanaActiva === 'financiero' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
            <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Detalles Financieros
          <span v-if="prestamo.montoPrestado" class="contador-badge">
            {{ formatCurrency(prestamo.montoPrestado) }}
          </span>
        </button>

        <button
          @click="pestanaActiva = 'pagos'"
          :class="['btn-pestana', { active: pestanaActiva === 'pagos' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
            <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          Historial de Pagos
          <span v-if="prestamo.pagos?.length" class="contador-badge">{{ prestamo.pagos.length }}</span>
        </button>

        <button
          @click="pestanaActiva = 'garantia'"
          :class="['btn-pestana', { active: pestanaActiva === 'garantia' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
          </svg>
          Artículo en Garantía
        </button>
      </div>

      <div class="pestanas-contenido">
        <div v-if="pestanaActiva === 'informacion'" class="tab-informacion">
          <div class="info-section">
            <div class="section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h2>Información General</h2>
            </div>

            <div class="info-grid">
              <div class="info-card">
                <div class="info-icon dorado">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                    <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Monto Prestado</span>
                  <span class="info-valor">{{ formatCurrency(prestamo.montoPrestado) }}</span>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon azul">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 14S9.5 16 12 16S16 14 16 14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Tasa de Interés</span>
                  <span class="info-valor">{{ prestamo.tasaInteres }}%</span>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon naranja">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Plazo</span>
                  <span class="info-valor">{{ prestamo.plazoMeses }} {{ prestamo.plazoMeses === 1 ? 'mes' : 'meses' }}</span>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon gris">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Fecha Inicio</span>
                  <span class="info-valor">{{ formatDateShort(prestamo.fechaInicio) }}</span>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon gris">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Fecha Vencimiento</span>
                  <span class="info-valor">{{ formatDateShort(prestamo.fechaVencimiento) }}</span>
                </div>
              </div>

              <div class="info-card destacada">
                <div class="info-icon verde">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                    <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Saldo Pendiente</span>
                  <span class="info-valor">{{ formatCurrency(prestamo.saldoPendiente) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="acciones-section">
            <div class="section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h2>Acciones Disponibles</h2>
            </div>

            <div class="acciones-grid">
              <button
                v-if="prestamo.estado === 'Activo' && prestamo.saldoPendiente > 0"
                @click="mostrarModalPago = true"
                class="accion-btn primary"
                :disabled="loadingAction"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>Realizar Pago</span>
              </button>

              <button
                v-if="prestamo.estado === 'Activo'"
                @click="mostrarModalRenovar = true"
                class="accion-btn secondary"
                :disabled="loadingAction"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.5 21 7.26 19.81 5.77 17.96" stroke="currentColor" stroke-width="2"/>
                  <path d="M3 12L6 9L9 12" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>Renovar Préstamo</span>
              </button>

              <button
                @click="descargarContrato"
                class="accion-btn secondary"
                :disabled="loadingAction"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>Descargar Contrato</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="pestanaActiva === 'financiero'" class="tab-financiero">
          <TabDetallesFinancieros
            :prestamo="prestamoAdaptado"
            :fecha-solicitud="prestamo.fechaInicio"
          />
        </div>

        <div v-if="pestanaActiva === 'pagos'" class="tab-pagos">
          <div class="pagos-section">
            <div class="section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h2>Historial de Pagos</h2>
            </div>

            <div v-if="prestamo.pagos && prestamo.pagos.length > 0" class="pagos-lista">
              <div
                v-for="pago in prestamo.pagos"
                :key="pago.id"
                class="pago-card"
              >
                <div class="pago-fecha">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ formatDateLong(pago.fechaPago) }}</span>
                </div>

                <div class="pago-detalles">
                  <div class="pago-monto">
                    <span class="label">Monto Pagado</span>
                    <span class="valor">{{ formatCurrency(pago.montoPago) }}</span>
                  </div>

                  <div class="pago-metodo">
                    <span class="label">Método</span>
                    <span class="valor">{{ formatMetodoPago(pago.tipoPago) }}</span>
                  </div>

                  <div class="pago-estado">
                    <span class="label">Estado</span>
                    <span class="badge-estado" :class="`estado-${pago.estadoValidacion.toLowerCase()}`">
                      {{ formatEstadoPago(pago.estadoValidacion) }}
                    </span>
                  </div>

                  <div v-if="pago.numeroTransaccion" class="pago-referencia">
                    <span class="label">Transacción</span>
                    <span class="valor">{{ pago.numeroTransaccion }}</span>
                  </div>
                </div>

                <button @click="descargarRecibo(pago.id)" class="btn-recibo" :disabled="pago.estadoValidacion === 'Rechazado'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" stroke="currentColor" stroke-width="2"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Recibo
                </button>
              </div>
            </div>

            <div v-else class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h3>Sin pagos registrados</h3>
              <p>Aún no se han registrado pagos para este préstamo</p>
            </div>
          </div>
        </div>

        <div v-if="pestanaActiva === 'garantia'" class="tab-garantia">
          <div class="garantia-section">
            <div class="section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h2>Artículo en Garantía</h2>
            </div>

            <div v-if="articulo" class="articulo-detalle">
              <div class="articulo-header">
                <div class="articulo-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="articulo-info">
                  <h3>{{ articulo.descripcion }}</h3>
<span class="badge-categoria">{{ articulo.tipoArticulo?.nombre || articulo.tipoArticulo }}</span>
                </div>
              </div>

              <div class="articulo-info-grid">
                <div class="info-item" v-if="articulo.marca">
                  <span class="label">Marca</span>
                  <span class="valor">{{ articulo.marca }}</span>
                </div>

                <div class="info-item" v-if="articulo.modelo">
                  <span class="label">Modelo</span>
                  <span class="valor">{{ articulo.modelo }}</span>
                </div>

                <div class="info-item" v-if="articulo.serie">
                  <span class="label">Serie</span>
                  <span class="valor">{{ articulo.serie }}</span>
                </div>

                <div class="info-item" v-if="articulo.color">
                  <span class="label">Color</span>
                  <span class="valor">{{ articulo.color }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Estado Físico</span>
                  <span class="valor">{{ articulo.estadoFisico }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Valor Estimado</span>
                  <span class="valor">{{ formatCurrency(articulo.valorEstimadoCliente) }}</span>
                </div>
              </div>

              <div v-if="articulo.especificacionesTecnicas" class="especificaciones">
                <h4>Especificaciones Técnicas</h4>
                <p>{{ articulo.especificacionesTecnicas }}</p>
              </div>

              <div v-if="archivosArticulo.length > 0" class="archivos-articulo">
                <h4>Fotos y Documentos</h4>
                <div class="archivos-grid">
                  <div
                    v-for="archivo in archivosArticulo"
                    :key="archivo.id"
                    class="archivo-item"
                    @click="abrirArchivo(archivo)"
                  >
                    <img 
                      v-if="esImagen(archivo)" 
                      :src="getUrlArchivo(archivo)" 
                      :alt="archivo.nombreArchivo"
                      class="archivo-preview"
                    />
                    <div v-else class="archivo-documento">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <span>{{ archivo.nombreArchivo }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="loadingArchivos" class="loading-archivos">
                <div class="spinner-small"></div>
                <span>Cargando archivos...</span>
              </div>
            </div>

            <div v-else class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h3>Sin información de garantía</h3>
              <p>No se encontró información del artículo empeñado</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ModalPago
      v-if="mostrarModalPago"
      :prestamo="prestamo"
      @close="mostrarModalPago = false"
      @confirmar="procesarPago"
    />

    <ModalRenovar
      v-if="mostrarModalRenovar"
      :prestamo="prestamo"
      @close="mostrarModalRenovar = false"
      @confirmar="procesarRenovacion"
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
import { useRoute, useRouter } from 'vue-router'
import { useFormatters } from '~/composables/useFormatters'
import TabDetallesFinancieros from '~/components/empeno/detalle/TabDetallesFinancieros.vue'
import NotificationToast from '~/components/common/NotificationToast.vue'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { formatCurrency, formatDateShort, formatDateLong } = useFormatters()
const config = useRuntimeConfig()

const prestamo = ref(null)
const archivosArticulo = ref([])
const loading = ref(true)
const loadingArchivos = ref(false)
const error = ref(null)
const loadingAction = ref(false)
const pestanaActiva = ref('informacion')
const mostrarModalPago = ref(false)
const mostrarModalRenovar = ref(false)

const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

const prestamoId = computed(() => parseInt(route.params.id))

const articulo = computed(() => {
  return prestamo.value?.contrato?.solicitud?.articulos?.[0] || null
})

const prestamoAdaptado = computed(() => {
  if (!prestamo.value) return null
  
  const saldoPendienteActual = parseFloat(prestamo.value.saldoPendiente || 0)
  const totalAPagar = parseFloat(prestamo.value.totalAPagar || 0)
  const plazo = parseInt(prestamo.value.plazoMeses)
  
  let planPagos = []
  let montoPorCuota = 0
  let interesTotal = 0
  
  if (prestamo.value.planPagos && prestamo.value.planPagos.length > 0) {
    planPagos = prestamo.value.planPagos.map(cuota => ({
      numeroPago: cuota.numeroCuota,
      fechaPago: new Date(cuota.fechaVencimiento).toISOString().split('T')[0],
      capital: parseFloat(cuota.montoCapital),
      interes: parseFloat(cuota.montoInteres),
      montoPago: parseFloat(cuota.montoCuota),
      saldoPendiente: 0,
      estado: cuota.estado
    }))
    
    let saldoRestante = totalAPagar
    for (let i = 0; i < planPagos.length; i++) {
      saldoRestante -= planPagos[i].montoPago
      planPagos[i].saldoPendiente = parseFloat(Math.max(0, saldoRestante).toFixed(2))
    }
    
    montoPorCuota = planPagos.length > 0 ? planPagos[0].montoPago : 0
    interesTotal = planPagos.reduce((sum, p) => sum + p.interes, 0)
  } else {
    const monto = parseFloat(prestamo.value.montoPrestado)
    const tasa = parseFloat(prestamo.value.tasaInteres)
    
    interesTotal = monto * (tasa / 100) * plazo
    const totalCalculado = monto + interesTotal
    montoPorCuota = totalCalculado / plazo
    const capitalPorCuota = monto / plazo
    const interesPorCuota = interesTotal / plazo
    
    const fechaInicio = new Date(prestamo.value.fechaInicio)
    let saldoRestante = totalCalculado
    
    for (let i = 1; i <= plazo; i++) {
      const fechaPago = new Date(fechaInicio)
      fechaPago.setMonth(fechaPago.getMonth() + i)
      
      saldoRestante = totalCalculado - (montoPorCuota * i)
      
      planPagos.push({
        numeroPago: i,
        fechaPago: fechaPago.toISOString().split('T')[0],
        capital: parseFloat(capitalPorCuota.toFixed(2)),
        interes: parseFloat(interesPorCuota.toFixed(2)),
        montoPago: parseFloat(montoPorCuota.toFixed(2)),
        saldoPendiente: parseFloat(Math.max(0, saldoRestante).toFixed(2)),
        estado: 'Pendiente'
      })
    }
  }
  
  return {
    montoSolicitado: parseFloat(prestamo.value.montoPrestado),
    tasaInteres: parseFloat(prestamo.value.tasaInteres),
    plazoMeses: plazo,
    modalidadPago: prestamo.value.modalidadPago || 'mensual',
    fechaInicio: prestamo.value.fechaInicio,
    fechaVencimiento: prestamo.value.fechaVencimiento,
    saldoPendiente: saldoPendienteActual,
    totalPagar: totalAPagar,
    totalAPagar: totalAPagar,
    planPagos: planPagos,
    resumenFinanciero: {
      montoPorPago: parseFloat(montoPorCuota.toFixed(2)),
      interesTotal: parseFloat(interesTotal.toFixed(2)),
      totalAPagar: totalAPagar
    }
  }
})

const alertaEstado = computed(() => {
  if (!prestamo.value) return null

  const estado = prestamo.value.estado
  const fechaVencimiento = new Date(prestamo.value.fechaVencimiento)
  const hoy = new Date()
  const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24))

  if (estado === 'Vencido') {
    return {
      tipo: 'error',
      titulo: 'Préstamo Vencido',
      mensaje: 'Este préstamo ha vencido. Contacta con nosotros para evitar la pérdida de tu artículo.'
    }
  }

  if (estado === 'Activo' && diasRestantes <= 7 && diasRestantes > 0) {
    return {
      tipo: 'warning',
      titulo: 'Próximo a Vencer',
      mensaje: `Tu préstamo vence en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}. Realiza un pago para evitar recargos.`
    }
  }

  if (estado === 'Pagado') {
    return {
      tipo: 'success',
      titulo: 'Préstamo Completado',
      mensaje: 'Has completado exitosamente este préstamo. Puedes recoger tu artículo.'
    }
  }

  return null
})

const getEstadoClass = (estado) => {
  const clases = {
    'Activo': 'success',
    'Vencido': 'error',
    'Pagado': 'info',
    'Renovado': 'warning'
  }
  return clases[estado] || 'default'
}

const formatMetodoPago = (metodo) => {
  const metodos = {
    'efectivo': 'Efectivo',
    'transferencia': 'Transferencia',
    'tarjeta': 'Tarjeta',
    'deposito': 'Depósito'
  }
  return metodos[metodo?.toLowerCase()] || metodo
}

const formatEstadoPago = (estado) => {
  const estados = {
    'Pendiente': 'Pendiente de Validación',
    'Validado': 'Aprobado',
    'Rechazado': 'Rechazado'
  }
  return estados[estado] || estado
}

const esImagen = (archivo) => {
  const tiposImagen = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return tiposImagen.includes(archivo.tipoMime) || archivo.tipoDocumento === 'Foto_Prenda'
}
const getUrlArchivo = (archivo) => {
  if (!archivo || !archivo.rutaArchivo) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0Q1RDVENSIvPgo8cGF0aCBkPSJNODAgODBDODUuNTIyOCA4MCA5MCA4NC40NzcyIDkwIDkwQzkwIDk1LjUyMjggODUuNTIyOCAxMDAgODAgMTAwQzc0LjQ3NzIgMTAwIDcwIDk1LjUyMjggNzAgOTBDNzAgODQuNDc3MiA3NC40NzcyIDgwIDgwIDgwWiIgZmlsbD0iI0FBQUFBQSIvPgo8L3N2Zz4K';
  }

  let rutaArchivo = archivo.rutaArchivo;
  
  if (rutaArchivo.startsWith('http')) {
    return rutaArchivo;
  }
  
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  
  if (!apiBase) {
    console.error('NUXT_PUBLIC_API_BASE no está configurado');
    return rutaArchivo;
  }
  
  const baseUrl = apiBase.replace('/api', '');
  
  if (rutaArchivo.startsWith('/uploads')) {
    return `${baseUrl}${rutaArchivo}`;
  }
  
  return `${baseUrl}/uploads/${rutaArchivo}`;
};

const abrirArchivo = (archivo) => {
  const url = getUrlArchivo(archivo)
  window.open(url, '_blank')
}

const cargarDetalle = async () => {
  try {
    loading.value = true
    error.value = null

    const { getToken } = useAuth()
    const token = getToken()

    const response = await fetch(`${config.public.apiBase}/prestamos/${prestamoId.value}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('No se pudo cargar el préstamo')
    }

    const result = await response.json()

    if (result.success) {
      prestamo.value = result.data.prestamo
      
      const solicitudId = prestamo.value?.contrato?.solicitud?.id
      if (solicitudId) {
        await cargarArchivosArticulo(solicitudId)
      }
    } else {
      throw new Error(result.message || 'Error al cargar el préstamo')
    }

  } catch (err) {
    error.value = err.message || 'Error al cargar el préstamo'
  } finally {
    loading.value = false
  }
}

const cargarArchivosArticulo = async (solicitudId) => {
  try {
    loadingArchivos.value = true
    
    const { getToken } = useAuth()
    const token = getToken()

    const response = await fetch(`${config.public.apiBase}/solicitudes/${solicitudId}/archivos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('No se pudieron cargar los archivos')
    }

    const result = await response.json()

    if (result.success && result.data) {
      const todosLosArchivos = []
      const { archivos } = result.data
      
      if (archivos.fotos) {
        todosLosArchivos.push(...archivos.fotos)
      }
      if (archivos.documentos) {
        todosLosArchivos.push(...archivos.documentos)
      }
      if (archivos.otros) {
        todosLosArchivos.push(...archivos.otros)
      }
      
      archivosArticulo.value = todosLosArchivos
    }

  } catch (err) {
    console.error('Error cargando archivos:', err)
    archivosArticulo.value = []
  } finally {
    loadingArchivos.value = false
  }
}

const procesarPago = async (datosPago) => {
  try {
    loadingAction.value = true
    const { getToken } = useAuth()
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

    const response = await fetch(`${config.public.apiBase}/prestamos/${prestamoId.value}/pagar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const result = await response.json()

    if (result.success) {
      mostrarModalPago.value = false
      mostrarNotificacion('Pago registrado exitosamente', 'success')
      await cargarDetalle()
    } else {
      throw new Error(result.message || 'Error al procesar el pago')
    }
  } catch (error) {
    console.error('Error procesando pago:', error)
    mostrarNotificacion(error.message || 'Error al procesar el pago', 'error')
  } finally {
    loadingAction.value = false
  }
}

const procesarRenovacion = async (datosRenovacion) => {
  try {
    const { getToken } = useAuth()
    const token = getToken()

    const response = await fetch(`${config.public.apiBase}/prestamos/${prestamoId.value}/renovar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosRenovacion)
    })

    const result = await response.json()

    if (result.success) {
      mostrarModalRenovar.value = false
      mostrarNotificacion('Préstamo renovado exitosamente', 'success')
      await cargarDetalle()
    } else {
      throw new Error(result.message || 'Error al renovar el préstamo')
    }

  } catch (err) {
    mostrarNotificacion(err.message || 'Error al renovar el préstamo', 'error')
  }
}

const descargarContrato = async () => {
  try {
    loadingAction.value = true

    const { getToken } = useAuth()
    const token = getToken()

    const response = await fetch(`${config.public.apiBase}/contratos/${prestamo.value.contrato.id}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Error al descargar el contrato')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contrato-${prestamo.value.numeroContrato || prestamoId.value}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    mostrarNotificacion('Contrato descargado exitosamente', 'success')

  } catch (err) {
    mostrarNotificacion('Error al descargar el contrato', 'error')
  } finally {
    loadingAction.value = false
  }
}

const descargarRecibo = async (pagoId) => {
  try {
    const pago = prestamo.value.pagos.find(p => p.id === pagoId)

    if (!pago) {
      mostrarNotificacion('Pago no encontrado', 'error')
      return
    }

    if (pago.estadoValidacion === 'Rechazado') {
      mostrarNotificacion('No se puede descargar el recibo de un pago rechazado', 'warning')
      return
    }

    if (pago.estadoValidacion === 'Pendiente') {
      mostrarNotificacion('El recibo estará disponible cuando el pago sea validado', 'info')
      return
    }

    const { getToken } = useAuth()
    const token = getToken()

    const response = await fetch(`${config.public.apiBase}/prestamos/${prestamoId.value}/recibo-pago/${pagoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      // Solo intentar leer JSON si hay error
      const result = await response.json()
      throw new Error(result.message || 'Error al descargar el recibo')
    }

    const contentType = response.headers.get('content-type')

    // Si es JSON, significa que no hay recibo disponible
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json()
      mostrarNotificacion(result.message || 'Funcionalidad de recibo en desarrollo', 'info')
      return
    }

    // Si llegamos aquí, es un PDF - leer como blob
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recibo-pago-${pagoId}-${prestamo.value.numeroPrestamo || prestamoId.value}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    mostrarNotificacion('Recibo descargado exitosamente', 'success')

  } catch (err) {
    console.error('Error al descargar recibo:', err)
    mostrarNotificacion(err.message || 'Error al descargar el recibo', 'error')
  }
}

const volverAlInicio = () => {
  router.push('/empeno')
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

onMounted(async () => {
  await cargarDetalle()
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
  --border-radius: 12px;
  --shadow-card: 0 15px 35px rgba(26, 26, 26, 0.2);
  --transition: all 0.3s ease;
}

.prestamo-detalle-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
  padding: 2rem 0;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
  color: var(--color-blanco-perla);
}

.loading-spinner {
  margin-bottom: 1.5rem;
  color: var(--color-dorado-vintage);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  margin-bottom: 1.5rem;
  color: var(--color-rojo-granate);
}

.error-container h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-blanco-perla);
  margin-bottom: 0.5rem;
}

.error-container p {
  color: rgba(245, 245, 245, 0.8);
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
}

.detalle-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-blanco-perla);
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 8px;
  transition: var(--transition);
  margin-bottom: 1.5rem;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(-2px);
}

.header-detalle {
  margin-bottom: 2rem;
}

.header-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-card);
  margin-bottom: 1.5rem;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
}

.header-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin: 0 0 0.25rem 0;
}

.header-content p {
  color: var(--color-gris-acero);
  margin: 0;
  font-size: 0.875rem;
}

.header-badge {
  display: flex;
  align-items: center;
}

.badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-success {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: var(--color-verde-bosque);
}

.badge-error {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: var(--color-rojo-granate);
}

.badge-warning {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: var(--color-marron-chocolate);
}

.badge-info {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: var(--color-azul-marino);
}

.progress-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-card);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 20%;
  right: 20%;
  height: 2px;
  background: #e5e7eb;
  z-index: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
  flex: 1;
  text-align: center;
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  background: #f3f4f6;
  color: #9ca3af;
  border: 3px solid #e5e7eb;
}

.step.completed .step-circle {
  background: linear-gradient(135deg, var(--color-verde-bosque), #2d6a4f);
  color: white;
  border-color: var(--color-verde-bosque);
}

.step.active .step-circle {
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  color: white;
  border-color: var(--color-dorado-vintage);
}

.step-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.step-date {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
}

.alert-estado {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
  background: white;
  box-shadow: var(--shadow-card);
}

.alert-success {
  border-left: 4px solid var(--color-verde-bosque);
}

.alert-success svg {
  color: var(--color-verde-bosque);
}

.alert-warning {
  border-left: 4px solid var(--color-dorado-vintage);
}

.alert-warning svg {
  color: var(--color-dorado-vintage);
}

.alert-error {
  border-left: 4px solid var(--color-rojo-granate);
}

.alert-error svg {
  color: var(--color-rojo-granate);
}

.alert-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--color-negro-carbon);
}

.alert-content p {
  font-size: 0.875rem;
  margin: 0;
  color: var(--color-gris-acero);
}

.pestanas-navegacion {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  border-bottom: 2px solid #e9ecef;
  overflow-x: auto;
}

.btn-pestana {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--color-negro-carbon);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  border-radius: 8px 8px 0 0;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.btn-pestana:hover {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: var(--color-negro-carbon);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-pestana.active {
  color: white;
  background: var(--color-dorado-vintage);
  border-bottom-color: var(--color-dorado-vintage);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(212, 175, 55, 0.3);
}

.contador-badge {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.btn-pestana:not(.active) .contador-badge {
  background: var(--color-dorado-vintage);
  color: white;
}

.pestanas-contenido {
  animation: fadeIn 0.3s ease;
  margin: 0 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-section,
.acciones-section,
.pagos-section,
.garantia-section {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-card);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
}

.section-header svg {
  color: var(--color-dorado-vintage);
}

.section-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-blanco-perla);
  border-radius: var(--border-radius);
  border: 2px solid transparent;
  transition: var(--transition);
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--color-dorado-vintage);
}

.info-card.destacada {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-color: var(--color-verde-bosque);
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  flex-shrink: 0;
}

.info-icon.dorado {
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  color: white;
}

.info-icon.azul {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
}

.info-icon.naranja {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
}

.info-icon.gris {
  background: linear-gradient(135deg, var(--color-gris-acero), #6b7280);
  color: white;
}

.info-icon.verde {
  background: linear-gradient(135deg, var(--color-verde-bosque), #2d6a4f);
  color: white;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gris-acero);
}

.info-valor {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.acciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.accion-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.accion-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.accion-btn.primary {
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  color: white;
}

.accion-btn.primary:hover:not(:disabled) {
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
}

.accion-btn.secondary {
  background: var(--color-blanco-perla);
  color: var(--color-negro-carbon);
  border-color: #e5e7eb;
}

.accion-btn.secondary:hover:not(:disabled) {
  border-color: var(--color-dorado-vintage);
}

.accion-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagos-lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
}

.pago-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  background: var(--color-blanco-perla);
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
  transition: var(--transition);
}

.pago-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: var(--color-dorado-vintage);
}

.pago-fecha {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.pago-detalles {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.pago-monto,
.pago-metodo,
.pago-estado,
.pago-referencia {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.pago-detalles .label {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
}

.pago-detalles .valor {
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.badge-estado {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-estado.estado-pendiente {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: var(--color-marron-chocolate);
}

.badge-estado.estado-validado {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: var(--color-verde-bosque);
}

.badge-estado.estado-rechazado {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: var(--color-rojo-granate);
}

.btn-recibo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid var(--color-dorado-vintage);
  color: var(--color-dorado-vintage);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.btn-recibo:hover:not(:disabled) {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-recibo:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #d1d5db;
  color: #9ca3af;
}

.articulo-detalle {
  padding: 2rem;
}

.articulo-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.articulo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
}

.articulo-info {
  flex: 1;
}

.articulo-info h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0 0 0.5rem 0;
}

.badge-categoria {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  color: white;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
}

.articulo-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--color-blanco-perla);
  border-radius: 8px;
}

.info-item .label {
  font-size: 0.875rem;
  color: var(--color-gris-acero);
}

.info-item .valor {
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.especificaciones {
  padding: 1.5rem;
  background: var(--color-blanco-perla);
  border-radius: 8px;
  margin-bottom: 2rem;
}

.especificaciones h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0 0 1rem 0;
}

.especificaciones p {
  color: var(--color-gris-acero);
  line-height: 1.6;
  margin: 0;
}

.archivos-articulo h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0 0 1rem 0;
}

.archivos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.archivo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid #e5e7eb;
}

.archivo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: var(--color-dorado-vintage);
}

.archivo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.archivo-documento {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1rem;
  background: var(--color-blanco-perla);
  text-align: center;
}

.archivo-documento svg {
  color: var(--color-dorado-vintage);
  margin-bottom: 0.5rem;
}

.archivo-documento span {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
  word-break: break-word;
}

.loading-archivos {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  justify-content: center;
  color: var(--color-gris-acero);
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-blanco-perla);
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state svg {
  color: var(--color-gris-acero);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--color-gris-acero);
  margin: 0;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.btn-primary {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-primary:hover {
  background: var(--color-dorado-claro);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-gris-acero);
  color: white;
}

.btn-secondary:hover {
  background: var(--color-negro-carbon);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .detalle-container {
    padding: 0 1rem;
  }

  .header-card {
    flex-direction: column;
    text-align: center;
  }

  .progress-steps {
    flex-direction: column;
    gap: 1.5rem;
  }

  .progress-steps::before {
    display: none;
  }

  .pestanas-navegacion {
    padding: 0 0.5rem;
    overflow-x: auto;
  }

  .btn-pestana {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .pestanas-contenido {
    margin: 0 0.5rem;
  }

  .info-grid,
  .acciones-grid {
    grid-template-columns: 1fr;
  }

  .pago-card {
    grid-template-columns: 1fr;
  }

  .pago-detalles {
    flex-direction: column;
    gap: 1rem;
  }

  .articulo-info-grid {
    grid-template-columns: 1fr;
  }

  .archivos-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>