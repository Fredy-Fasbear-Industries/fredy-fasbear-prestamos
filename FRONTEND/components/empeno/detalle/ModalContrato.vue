<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="header-info">
            <h3>Contrato {{ contrato?.numeroContrato }}</h3>
            <span :class="['estado-badge', estadoClase]">
              {{ contrato?.estadoFirma }}
            </span>
          </div>
          <button @click="$emit('close')" class="btn-cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="contrato-info">
            <div class="info-row">
              <span class="label">Fecha de creación:</span>
              <span class="value">{{ formatearFecha(contrato?.fechaCreacion) }}</span>
            </div>
            <div v-if="contrato?.fechaFirma" class="info-row">
              <span class="label">Fecha de firma:</span>
              <span class="value">{{ formatearFecha(contrato?.fechaFirma) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Cliente:</span>
              <span class="value">{{ contrato?.cliente?.nombre }}</span>
            </div>
            <div class="info-row">
              <span class="label">Monto:</span>
              <span class="value">Q{{ formatearMoneda(contrato?.solicitud?.montoSolicitado) }}</span>
            </div>
          </div>

          <div class="contrato-contenido">
            <pre>{{ contrato?.contenidoContrato }}</pre>
          </div>
        </div>

        <div class="modal-footer">
          <button 
            @click="descargarPDF" 
            class="btn-primary"
            :disabled="descargando"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V15" stroke="currentColor" stroke-width="2"/>
              <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ descargando ? 'Descargando...' : 'Descargar PDF' }}
          </button>
          
          <button @click="$emit('close')" class="btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  contrato: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'descargar'])

const descargando = ref(false)
const config = useRuntimeConfig()
const { getToken } = useAuth()

const estadoClase = computed(() => {
  if (!props.contrato?.estadoFirma) return 'pendiente'
  return props.contrato.estadoFirma.toLowerCase()
})

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearMoneda = (valor) => {
  if (!valor) return '0.00'
  return parseFloat(valor).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const descargarPDF = async () => {
  if (!props.contrato) return
  
  try {
    descargando.value = true
    
    const token = getToken()
    const response = await fetch(`${config.public.apiBase}/contratos/${props.contrato.id}/pdf`, {
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
    a.download = `contrato-${props.contrato.numeroContrato}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    emit('descargar')
  } catch (error) {
    console.error('Error descargando PDF:', error)
    alert('Error al descargar el contrato')
  } finally {
    descargando.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-info h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-negro-carbon);
}

.estado-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado-badge.pendiente {
  background: #fef3c7;
  color: #92400e;
}

.estado-badge.firmado {
  background: #d1fae5;
  color: #065f46;
}

.btn-cerrar {
  background: none;
  border: none;
  color: var(--color-gris-acero);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-cerrar:hover {
  background: #f3f4f6;
  color: var(--color-negro-carbon);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.contrato-info {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 500;
  color: var(--color-gris-acero);
}

.info-row .value {
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.contrato-contenido {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  max-height: 500px;
  overflow-y: auto;
}

.contrato-contenido pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
  color: var(--color-negro-carbon);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 2px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: var(--color-negro-carbon);
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: var(--color-gris-acero);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>