<template>
  <div class="detalle-solicitud-page">
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="spinning">
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <p>Cargando detalle de solicitud...</p>
    </div>

    <div class="error-container" v-else-if="error">
      <div class="error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h2>Error al cargar solicitud</h2>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="cargarDetalle(solicitudId)" class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M1 4V10H7" stroke="currentColor" stroke-width="2"/>
            <path d="M23 20V14H17" stroke="currentColor" stroke-width="2"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
          </svg>
          Reintentar
        </button>
        <button @click="volverAlInicio" class="btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver al Inicio
        </button>
      </div>
    </div>

    <div class="detalle-container" v-else-if="solicitud">
      <DetalleSolicitudHeader 
        :solicitud="solicitud" 
        @volver="volverAlInicio" 
      />

      <AlertaSolicitud
        v-if="solicitud.estado === 'Rechazada'"
        tipo="rechazada"
        :numero="solicitud.numero"
        :observaciones="solicitud.observaciones"
      />

      <AlertaSolicitud
        v-if="solicitud.estado === 'Aprobada'"
        tipo="aprobada"
        :numero="solicitud.numero"
        :observaciones="solicitud.observaciones"
        :monto-aprobado="solicitud.prestamo?.montoSolicitado"
        :plazo="solicitud.prestamo?.plazoMeses"
        :loading="loadingAction"
        :cliente-acepto-oferta="solicitud.clienteAceptoOferta"
        :fecha-aceptacion="solicitud.fechaAceptacion"
        :tiene-contrato="solicitud.tieneContrato"
        :estado-firma="solicitud.contrato?.estadoFirma || 'Pendiente'"
        @solicitar-prestamo="solicitarPrestamo"
        @ver-contrato="verContrato"
        @firmar-contrato="firmarContrato"
      />

      <div class="pestanas-navegacion">
        <button 
          @click="pestanaActiva = 'informacion'"
          :class="['btn-pestana', { active: pestanaActiva === 'informacion' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"/>
          </svg>
          Información General
        </button>

        <button 
          @click="pestanaActiva = 'financiero'"
          :class="['btn-pestana', { active: pestanaActiva === 'financiero' }]"
          v-if="tieneInformacionFinanciera"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
            <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Detalles Financieros
          <span v-if="solicitud.prestamo?.montoSolicitado" class="contador-badge">
            Q{{ formatCurrency(solicitud.prestamo.montoSolicitado) }}
          </span>
        </button>
        
        <button 
          @click="pestanaActiva = 'archivos'"
          :class="['btn-pestana', { active: pestanaActiva === 'archivos' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21.44 11.05L12.25 20.24C11.84 20.65 11.84 21.28 12.25 21.69C12.66 22.1 13.29 22.1 13.7 21.69L22.89 12.5C24.46 10.93 24.46 8.37 22.89 6.8C21.32 5.23 18.76 5.23 17.19 6.8L7.71 16.28C6.53 17.46 6.53 19.34 7.71 20.52C8.89 21.7 10.77 21.7 11.95 20.52L20.83 11.64" stroke="currentColor" stroke-width="2"/>
          </svg>
          Archivos Adjuntos
          <span v-if="archivos.length" class="contador-badge">{{ archivos.length }}</span>
        </button>
      </div>

      <div class="pestanas-contenido">
        <TabInformacionGeneral
          v-if="pestanaActiva === 'informacion'"
          :solicitud="solicitud"
          :loading="loadingAction"
          @ver-imagen="abrirVisualizadorImagen"
          @abrir-documento="abrirDocumento"
          @cancelar="confirmarCancelacion"
          @aceptar="aceptarOferta"
          @nueva-solicitud="crearNuevaSolicitud"
          @volver="volverAlInicio"
        />

        <TabDetallesFinancieros
          v-if="pestanaActiva === 'financiero'"
          :prestamo="solicitud.prestamo"
          :fecha-solicitud="solicitud.fechaSolicitud"
        />

        <div v-if="pestanaActiva === 'archivos'" class="archivos-pestana">
          <ArchivosAdjuntos 
            :archivos="archivos"
            :loading="loadingArchivos"
          /> 
          <div v-if="!loadingArchivos && archivos.length === 0" class="archivos-estado-vacio">
            <div class="estado-vacio-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="icono-vacio">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#9CA3AF" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="#9CA3AF" stroke-width="2"/>
              </svg>
              <h4>No hay archivos adjuntos</h4>
              <p>Esta solicitud no tiene documentos o fotos adjuntas.</p>
              
              <button @click="cargarArchivosAdjuntos(solicitudId)" class="btn-refresh">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.5 21 7.26 19.81 5.77 17.96" stroke="currentColor" stroke-width="2"/>
                  <path d="M3 12L6 9L9 12" stroke="currentColor" stroke-width="2"/>
                </svg>
                Refrescar archivos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ModalCancelacion
      v-if="mostrarConfirmacionCancelacion"
      :numero="solicitud?.numero"
      :loading="loadingCancelacion"
      @close="cerrarConfirmacionCancelacion"
      @confirmar="ejecutarCancelacion"
    />

    <VisualizadorImagenes
      v-if="imagenVisualizando"
      :imagen-actual="imagenVisualizando"
      :imagenes="imagenesVisualizando"
      :indice="indiceImagenActual"
      @close="cerrarVisualizadorImagen"
      @anterior="imagenAnterior"
      @siguiente="imagenSiguiente"
      @cambiar="cambiarImagen"
    />

    <ModalFirmaDigital
      :mostrar="mostrarModalFirma"
      :numero-solicitud="solicitud?.numero || ''"
      @cerrar="cerrarModalFirma"
      @confirmar="confirmarFirmaDigital"
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
import DetalleSolicitudHeader from '~/components/empeno/detalle/DetalleSolicitudHeader.vue'
import AlertaSolicitud from '~/components/empeno/detalle/AlertaSolicitud.vue'
import TabInformacionGeneral from '~/components/empeno/detalle/TabInformacionGeneral.vue'
import TabDetallesFinancieros from '~/components/empeno/detalle/TabDetallesFinancieros.vue'
import ModalCancelacion from '~/components/empeno/detalle/ModalCancelacion.vue'
import VisualizadorImagenes from '~/components/empeno/detalle/VisualizadorImagenes.vue'
import ArchivosAdjuntos from '~/pages/empeno/solicitudes/ArchivosAdjuntos.vue'
import NotificationToast from '~/components/common/NotificationToast.vue'
import ModalFirmaDigital from '~/components/empeno/ModalFirmaDigital.vue'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { cancelarSolicitud } = useSolicitudes()
const { formatCurrency } = useFormatters()
const {
  solicitud,
  archivos,
  loading,
  loadingArchivos,
  error,
  tieneInformacionFinanciera,
  construirUrlArchivo,
  cargarDetalle,
  cargarArchivosAdjuntos
} = useSolicitudDetalle()

useHead({
  title: 'Detalle de Solicitud - Mis Empéños',
  meta: [
    { name: 'description', content: 'Ver detalle completo de tu solicitud de empeño' }
  ]
})

const loadingAction = ref(false)
const loadingCancelacion = ref(false)
const pestanaActiva = ref('informacion')
const mostrarConfirmacionCancelacion = ref(false)
const mostrarModalFirma = ref(false)
const motivoCancelacion = ref('')
const imagenVisualizando = ref(null)
const imagenesVisualizando = ref([])
const indiceImagenActual = ref(0)
const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

const solicitudId = computed(() => parseInt(route.params.id))

const volverAlInicio = () => {
  navigateTo('/empeno')
}

const crearNuevaSolicitud = () => {
  navigateTo('/empeno?nueva=true')
}

const solicitarPrestamo = async () => {
  try {
    loadingAction.value = true
    await navigateTo(`/empeno/solicitudes/aceptar?id=${solicitudId.value}`)
  } catch (error) {
    mostrarNotificacion('Error al procesar la solicitud del préstamo', 'error')
  } finally {
    loadingAction.value = false
  }
}

const verContrato = async () => {
  if (!solicitud.value?.contrato?.id) {
    mostrarNotificacion('No se encontró el contrato', 'error')
    return
  }

  try {
    loadingAction.value = true
    const config = useRuntimeConfig()
    const { getToken } = useAuth()
    
    const url = `${config.public.apiBase}/contratos/${solicitud.value.contrato.id}/pdf`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    
    if (!response.ok) throw new Error('Error al descargar el contrato')
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `contrato-${solicitud.value.contrato.numeroContrato}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    mostrarNotificacion('Contrato descargado exitosamente', 'success')
  } catch (error) {
    mostrarNotificacion('Error al descargar el contrato', 'error')
  } finally {
    loadingAction.value = false
  }
}

const aceptarOferta = async () => {
  try {
    loadingAction.value = true
    navigateTo(`/empeno/solicitudes/${solicitudId.value}/aceptar`)
  } catch (error) {
    mostrarNotificacion('Error al procesar la aceptación', 'error')
  } finally {
    loadingAction.value = false
  }
}

const confirmarCancelacion = () => {
  mostrarConfirmacionCancelacion.value = true
  motivoCancelacion.value = ''
}

const cerrarConfirmacionCancelacion = () => {
  mostrarConfirmacionCancelacion.value = false
  motivoCancelacion.value = ''
}

const ejecutarCancelacion = async (motivo) => {
  if (!solicitud.value) {
    mostrarNotificacion('Error: No se encontró la solicitud', 'error')
    return
  }

  try {
    loadingCancelacion.value = true
    
    const response = await cancelarSolicitud(
      solicitud.value.id_solicitud,
      motivo || 'Cancelada por el usuario desde la página de detalle'
    )
    
    if (response.success) {
      mostrarNotificacion(
        `Solicitud ${solicitud.value.numero} cancelada exitosamente`, 
        'success'
      )
      
      cerrarConfirmacionCancelacion()
      await cargarDetalle(solicitudId.value)
    } else {
      throw new Error(response.message || 'Error desconocido al cancelar')
    }
    
  } catch (error) {
    let mensajeError = 'Error al cancelar la solicitud'
    if (error.message) {
      if (error.message.includes('estado')) {
        mensajeError = 'La solicitud no puede ser cancelada en su estado actual'
      } else if (error.message.includes('autorizado')) {
        mensajeError = 'No tienes permisos para cancelar esta solicitud'
      } else if (error.message.includes('encontrada')) {
        mensajeError = 'La solicitud no fue encontrada'
      } else {
        mensajeError = error.message
      }
    }
    
    mostrarNotificacion(mensajeError, 'error')
  } finally {
    loadingCancelacion.value = false
  }
}

const firmarContrato = async () => {
  if (!solicitud.value?.contrato?.id) {
    mostrarNotificacion('No se encontró el contrato', 'error')
    return
  }

  if (solicitud.value.contrato.estadoFirma === 'Firmado') {
    mostrarNotificacion('Este contrato ya ha sido firmado', 'info')
    return
  }

  mostrarModalFirma.value = true
}

const cerrarModalFirma = () => {
  mostrarModalFirma.value = false
}

const confirmarFirmaDigital = async (firmaDataURL) => {
  try {
    loadingAction.value = true
    const config = useRuntimeConfig()
    const { getToken } = useAuth()
    
    const response = await fetch(
      `${config.public.apiBase}/contratos/${solicitud.value.contrato.id}/firmar`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firmaDigital: firmaDataURL
        })
      }
    )
    
    const resultado = await response.json()
    
    if (!response.ok) {
      throw new Error(resultado.message || 'Error al firmar el contrato')
    }

    if (resultado.success) {
      mostrarModalFirma.value = false
      mostrarNotificacion('Contrato firmado exitosamente. Tu préstamo ha sido activado.', 'success')
      
      await cargarDetalle(solicitudId.value)
      
      setTimeout(() => {
        navigateTo('/empeno')
      }, 2000)
    } else {
      throw new Error(resultado.message || 'Error al firmar el contrato')
    }
    
  } catch (error) {
    console.error('Error firmando contrato:', error)
    mostrarNotificacion(
      error.message || 'Error al firmar el contrato. Por favor intenta nuevamente.',
      'error'
    )
  } finally {
    loadingAction.value = false
  }
}

const abrirVisualizadorImagen = (imagen, todasLasImagenes) => {
  imagenVisualizando.value = imagen
  imagenesVisualizando.value = todasLasImagenes || [imagen]
  indiceImagenActual.value = todasLasImagenes ? todasLasImagenes.findIndex(img => img === imagen) : 0
}

const cerrarVisualizadorImagen = () => {
  imagenVisualizando.value = null
  imagenesVisualizando.value = []
  indiceImagenActual.value = 0
}

const imagenAnterior = () => {
  if (indiceImagenActual.value > 0) {
    indiceImagenActual.value--
    imagenVisualizando.value = imagenesVisualizando.value[indiceImagenActual.value]
  }
}

const imagenSiguiente = () => {
  if (indiceImagenActual.value < imagenesVisualizando.value.length - 1) {
    indiceImagenActual.value++
    imagenVisualizando.value = imagenesVisualizando.value[indiceImagenActual.value]
  }
}

const cambiarImagen = (index) => {
  indiceImagenActual.value = index
  imagenVisualizando.value = imagenesVisualizando.value[index]
}

const abrirDocumento = (documento) => {
  const url = construirUrlArchivo(documento.ruta_archivo)
  window.open(url, '_blank')
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
  await cargarDetalle(solicitudId.value)
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

.detalle-solicitud-page {
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
}

.loading-spinner svg {
  color: var(--color-dorado-vintage);
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
  color: var(--color-gris-acero);
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.detalle-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.pestanas-navegacion {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  border-bottom: 2px solid #e9ecef;
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
  background: var(--color-dorado-vintage);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.pestanas-contenido {
  animation: fadeIn 0.3s ease;
}

.archivos-pestana {
  margin: 0 1rem 2rem 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.archivos-estado-vacio {
  padding: 3rem 2rem;
  text-align: center;
  background: white;
  border-radius: var(--border-radius);
  margin: 1rem;
}

.estado-vacio-content {
  max-width: 400px;
  margin: 0 auto;
}

.icono-vacio {
  margin: 0 auto 1.5rem;
  opacity: 0.6;
}

.estado-vacio-content h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.estado-vacio-content p {
  color: #6B7280;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.btn-refresh:hover {
  background: #E5E7EB;
  border-color: #9CA3AF;
  transform: translateY(-1px);
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
}

.btn-primary {
  background: var(--color-dorado-vintage);
  color: var(--color-blanco-perla);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-dorado-claro);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-gris-acero);
  color: var(--color-blanco-perla);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-negro-carbon);
  transform: translateY(-1px);
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

@media (max-width: 768px) {
  .detalle-container {
    padding: 0 1rem;
  }

  .pestanas-navegacion {
    padding: 0 0.5rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .pestanas-navegacion::-webkit-scrollbar {
    display: none;
  }

  .btn-pestana {
    padding: 0.75rem 1rem;
    white-space: nowrap;
    font-size: 0.875rem;
  }

  .archivos-pestana {
    margin: 0 0.5rem 1rem 0.5rem;
  }
}
</style>