<template>
  <div v-if="tipo === 'rechazada'" class="rejection-alert">
    <div class="rejection-icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>
    
    <div class="rejection-content">
      <h3>Solicitud Rechazada</h3>
      <p><strong>Número:</strong> {{ numero }}</p>
      <p v-if="observaciones"><strong>Motivo:</strong> {{ observaciones }}</p>
      <p>Lo sentimos, tu solicitud no pudo ser aprobada en esta ocasión.</p>
    </div>
  </div>

  <div v-else-if="tipo === 'aprobada'" class="approval-alert">
    <div class="approval-icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <polyline points="9 12 12 15 16 10" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>
    
    <div class="approval-content">
      <h3>Solicitud Aprobada</h3>
      <p><strong>Número:</strong> {{ numero }}</p>
      <p v-if="observaciones">{{ observaciones }}</p>

      <div v-if="montoAprobado && plazo" class="info-monto-aprobado">
        <div class="info-item">
          <span class="info-label">Monto Aprobado</span>
          <span class="info-valor">Q {{ formatCurrency(montoAprobado) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Plazo</span>
          <span class="info-valor">{{ plazo }} meses</span>
        </div>
      </div>

      <div v-if="clienteAceptoOferta && fechaAceptacion" class="info-aceptacion">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0;">
          <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        </svg>
        <p class="aceptacion-text">Oferta aceptada el {{ formatearFecha(fechaAceptacion) }}</p>
      </div>

      <div v-if="!tieneContrato && !clienteAceptoOferta" class="mensaje-espera">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="6" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
        <p>Debes aceptar la oferta para poder continuar con el proceso de préstamo.</p>
      </div>

      <div v-if="!tieneContrato && clienteAceptoOferta" class="mensaje-espera">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
        </svg>
        <p>El evaluador está generando tu contrato. Recibirás una notificación cuando esté listo para firmar.</p>
      </div>

      <div class="approval-actions">
        <button 
          v-if="!clienteAceptoOferta"
          @click="$emit('solicitar-prestamo')"
          class="btn-solicitar-prestamo"
          :disabled="loading"
        >
          <div class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="btn-content">
            <div class="btn-title">Aceptar Oferta</div>
            <div class="btn-subtitle">Completa tus datos y acepta los términos</div>
          </div>
          <div class="btn-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </button>

        <button 
          v-if="tieneContrato && estadoFirma === 'Pendiente'"
          @click="$emit('firmar-contrato')"
          class="btn-firmar-contrato"
          :disabled="loading"
        >
          <div class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" stroke="currentColor" stroke-width="2"/>
              <path d="M18 2l4 4" stroke="currentColor" stroke-width="2"/>
              <path d="M7.5 10.5L19 2l3 3-8.5 11.5-3.5 1 1-3.5z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="btn-content">
            <div class="btn-title">Firmar Contrato</div>
            <div class="btn-subtitle">Firmar electrónicamente y activar préstamo</div>
          </div>
          <div class="btn-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </button>

        <button 
          v-if="tieneContrato"
          @click="$emit('ver-contrato')"
          class="btn-ver-contrato"
        >
          <div class="btn-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
              <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="btn-content">
            <div class="btn-title">Ver Contrato</div>
            <div class="btn-subtitle">{{ estadoFirma === 'Firmado' ? 'Contrato firmado' : 'Descargar PDF' }}</div>
          </div>
          <div class="btn-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tipo: {
    type: String,
    required: true,
    validator: (value) => ['aprobada', 'rechazada'].includes(value)
  },
  numero: {
    type: String,
    required: true
  },
  observaciones: {
    type: String,
    default: null
  },
  montoAprobado: {
    type: Number,
    default: null
  },
  plazo: {
    type: Number,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  clienteAceptoOferta: {
    type: Boolean,
    default: false
  },
  fechaAceptacion: {
    type: String,
    default: null
  },
  tieneContrato: {
    type: Boolean,
    default: false
  },
  estadoFirma: {
    type: String,
    default: 'Pendiente',
    validator: (value) => ['Pendiente', 'Firmado'].includes(value)
  }
})

defineEmits(['solicitar-prestamo', 'ver-contrato', 'firmar-contrato'])

const { formatCurrency } = useFormatters()

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
</script>

<style scoped>
.rejection-alert,
.approval-alert {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: var(--border-radius);
  border-left: 4px solid;
}

.rejection-alert {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-left-color: var(--color-rojo-granate);
}

.approval-alert {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-left-color: var(--color-verde-bosque);
}

.rejection-icon {
  color: var(--color-rojo-granate);
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.approval-icon {
  color: var(--color-verde-bosque);
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.rejection-content h3,
.approval-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.rejection-content h3 {
  color: var(--color-rojo-granate);
}

.approval-content h3 {
  color: var(--color-verde-bosque);
}

.rejection-content p,
.approval-content p {
  margin: 0;
  line-height: 1.6;
  font-size: 0.875rem;
}

.rejection-content p {
  color: var(--color-marron-chocolate);
}

.approval-content p {
  color: var(--color-verde-bosque);
}

.rejection-content p:not(:last-child),
.approval-content p:not(:last-child) {
  margin-bottom: 0.75rem;
}

.info-aceptacion {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  border-left: 3px solid #10b981;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.aceptacion-text {
  color: #065f46;
  font-size: 0.875rem;
  margin: 0;
}

.mensaje-espera {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  border-left: 3px solid var(--color-dorado-vintage);
  color: #92400E;
}

.mensaje-espera svg {
  flex-shrink: 0;
  color: var(--color-dorado-vintage);
}

.mensaje-espera p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #92400E;
}

.approval-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-solicitar-prestamo,
.btn-ver-contrato,
.btn-firmar-contrato {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
}

.btn-solicitar-prestamo {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.btn-firmar-contrato {
  background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
  box-shadow: 0 4px 12px rgba(27, 67, 50, 0.3);
}

.btn-ver-contrato {
  background: linear-gradient(135deg, var(--color-dorado-vintage) 0%, #B8941F 100%);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.btn-solicitar-prestamo:hover:not(:disabled),
.btn-ver-contrato:hover,
.btn-firmar-contrato:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-solicitar-prestamo:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
}

.btn-firmar-contrato:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(27, 67, 50, 0.4);
}

.btn-ver-contrato:hover {
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.btn-solicitar-prestamo:disabled,
.btn-firmar-contrato:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  flex-shrink: 0;
}

.btn-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.btn-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
}

.btn-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 400;
}

.btn-arrow {
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.btn-solicitar-prestamo:hover:not(:disabled) .btn-arrow,
.btn-ver-contrato:hover .btn-arrow,
.btn-firmar-contrato:hover:not(:disabled) .btn-arrow {
  transform: translateX(4px);
}

.info-monto-aprobado {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

.info-monto-aprobado .info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-monto-aprobado .info-label {
  font-size: 0.75rem;
  color: #047857;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-monto-aprobado .info-valor {
  font-size: 1.125rem;
  font-weight: 700;
  color: #065f46;
}

@media (max-width: 480px) {
  .btn-solicitar-prestamo,
  .btn-ver-contrato,
  .btn-firmar-contrato {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .btn-arrow {
    transform: rotate(90deg);
  }
  
  .info-monto-aprobado {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>