<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content confirmation-modal" @click.stop>
      <div class="modal-header">
        <h3>Confirmar Cancelación</h3>
        <button class="modal-close" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="warning-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.64 21H20.36A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" stroke-width="2" fill="none"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
        </div>
        
        <div class="warning-content">
          <h4>¿Estás seguro de que deseas cancelar esta solicitud?</h4>
          <p>
            Esta acción no se puede deshacer. La solicitud será marcada como cancelada 
            y no podrá ser procesada.
          </p>

          <div class="solicitud-info" v-if="solicitud">
            <div class="info-row">
              <span>Artículo:</span>
              <span>{{ getItemTitulo(solicitud) }}</span>
            </div>
            <div class="info-row">
              <span>Estado actual:</span>
              <span class="status-badge" :class="`status-${solicitud.estado?.toLowerCase()}`">
                {{ solicitud.estado }}
              </span>
            </div>
            <div class="info-row">
              <span>Fecha de solicitud:</span>
              <span>{{ formatDate(solicitud.fecha) }}</span>
            </div>
          </div>

          <div class="motivo-section">
            <label for="motivoCancelacion">Motivo de cancelación (opcional):</label>
            <textarea 
              id="motivoCancelacion"
              v-model="localMotivo"
              placeholder="Escribe el motivo por el cual deseas cancelar esta solicitud..."
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">
          No, mantener solicitud
        </button>
        <button 
          @click="confirmar" 
          :disabled="loading"
          class="btn-danger"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" v-if="!loading">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="spinning" v-else>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          {{ loading ? 'Cancelando...' : 'Sí, cancelar solicitud' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getItemTitulo, formatDate } from '~/utils/empenoUtils'

const props = defineProps({
  solicitud: {
    type: Object,
    default: null
  },
  motivo: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirmar'])

const localMotivo = ref(props.motivo)

watch(() => props.motivo, (newVal) => {
  localMotivo.value = newVal
})

const confirmar = () => {
  emit('confirmar', localMotivo.value)
}
</script>

<style scoped>
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
  padding: 1rem;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
}

.confirmation-modal {
  max-width: 600px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E0E0E0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2C3E50;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #E0E0E0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.warning-icon {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #F39C12;
}

.warning-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 1rem;
  text-align: center;
}

.warning-content p {
  color: #666;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.6;
}

.solicitud-info {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #E0E0E0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid #E0E0E0;
}

.info-row span:first-child {
  font-weight: 500;
  color: #666;
}

.info-row span:last-child {
  font-weight: 600;
  color: #2C3E50;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-pendiente {
  background: rgba(243, 156, 18, 0.1);
  color: #F39C12;
}

.status-evaluando {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.motivo-section {
  margin-top: 1.5rem;
}

.motivo-section label {
  display: block;
  font-weight: 500;
  color: #2C3E50;
  margin-bottom: 0.5rem;
}

.motivo-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.3s ease;
}

.motivo-section textarea:focus {
  outline: none;
  border-color: #D4AF37;
}

.btn-secondary {
  background: #3498DB;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #2980B9;
}

.btn-danger {
  background: #E74C3C;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger:hover {
  background: #C0392B;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>