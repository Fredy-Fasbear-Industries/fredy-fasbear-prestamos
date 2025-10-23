<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>Cancelar Solicitud</h3>
        <button @click="$emit('close')" class="modal-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <div class="modal-content">
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
            Esta acción no se puede deshacer. La solicitud <strong>{{ numero }}</strong>
            será marcada como cancelada y no podrá ser procesada.
          </p>

          <div class="motivo-section">
            <label for="motivoCancelacion">Motivo de cancelación (opcional):</label>
            <textarea 
              id="motivoCancelacion"
              v-model="motivoInterno"
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
const props = defineProps({
  numero: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirmar'])

const motivoInterno = ref('')

const confirmar = () => {
  emit('confirmar', motivoInterno.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--color-blanco-perla);
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(26, 26, 26, 0.25);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-gris-acero);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: var(--transition);
}

.modal-close:hover {
  background: #f3f4f6;
  color: var(--color-negro-carbon);
}

.modal-content {
  padding: 2rem;
}

.warning-icon {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--color-dorado-vintage);
}

.warning-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin-bottom: 1rem;
  text-align: center;
}

.warning-content p {
  color: var(--color-gris-acero);
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.6;
}

.motivo-section {
  margin-top: 1.5rem;
}

.motivo-section label {
  display: block;
  font-weight: 500;
  color: var(--color-negro-carbon);
  margin-bottom: 0.5rem;
}

.motivo-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.3s ease;
}

.motivo-section textarea:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-danger {
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
}

.btn-secondary {
  background: var(--color-gris-acero);
  color: var(--color-blanco-perla);
}

.btn-secondary:hover {
  background: var(--color-negro-carbon);
  transform: translateY(-1px);
}

.btn-danger {
  background: var(--color-rojo-granate);
  color: var(--color-blanco-perla);
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer .btn-secondary,
  .modal-footer .btn-danger {
    width: 100%;
    justify-content: center;
  }
}
</style>