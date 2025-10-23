<template>
  <div class="actions-section">
    <div class="section-header">
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 11H15M9 15H15M17 21L20 18L17 15M3 19V5C3 3.89 3.89 3 5 3H19C20.11 3 21 3.89 21 5V12.5" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        Acciones Disponibles
      </h2>
    </div>

    <div class="actions-grid">
      <template v-if="['Pendiente', 'Evaluando'].includes(estado)">
        <button @click="$emit('cancelar')" class="action-button danger" :disabled="loading">
          <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="action-content">
            <span class="action-title">{{ loading ? 'Cancelando...' : 'Cancelar Solicitud' }}</span>
            <span class="action-description">Cancela esta solicitud antes de que sea evaluada</span>
          </div>
        </button>
      </template>

      <template v-if="estado === 'Aprobada'">
        <button @click="$emit('aceptar')" class="action-button success" :disabled="loading">
          <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div class="action-content">
            <span class="action-title">{{ loading ? 'Procesando...' : 'Aceptar Oferta' }}</span>
            <span class="action-description">Procede con la aceptación del préstamo</span>
          </div>
        </button>
      </template>

      <template v-if="['Rechazada', 'Completada'].includes(estado)">
        <button @click="$emit('nueva-solicitud')" class="action-button primary">
          <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="action-content">
            <span class="action-title">Nueva Solicitud</span>
            <span class="action-description">Crear una nueva solicitud de empeño</span>
          </div>
        </button>
      </template>

      <button @click="$emit('volver')" class="action-button secondary">
        <div class="action-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="action-content">
          <span class="action-title">Volver al Panel</span>
          <span class="action-description">Regresar a la lista de solicitudes</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  estado: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['cancelar', 'aceptar', 'nueva-solicitud', 'volver'])
</script>

<style scoped>
.actions-section {
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.section-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0;
}

.section-header h2 svg {
  color: var(--color-dorado-vintage);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  background: var(--color-blanco-perla);
  cursor: pointer;
  transition: var(--transition);
  text-align: left;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.15);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-button.primary {
  border-color: var(--color-dorado-vintage);
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.action-button.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #fde68a, #fcd34d);
}

.action-button.secondary {
  border-color: var(--color-gris-acero);
  background: linear-gradient(135deg, var(--color-blanco-perla), #f3f4f6);
}

.action-button.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.action-button.success {
  border-color: var(--color-verde-bosque);
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.action-button.success:hover:not(:disabled) {
  background: linear-gradient(135deg, #a7f3d0, #6ee7b7);
}

.action-button.danger {
  border-color: var(--color-rojo-granate);
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.action-button.danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
}

.action-icon {
  padding: 1rem;
  border-radius: var(--border-radius);
  flex-shrink: 0;
}

.action-button.primary .action-icon {
  background: var(--color-dorado-vintage);
  color: var(--color-blanco-perla);
}

.action-button.secondary .action-icon {
  background: var(--color-gris-acero);
  color: var(--color-blanco-perla);
}

.action-button.success .action-icon {
  background: var(--color-verde-bosque);
  color: var(--color-blanco-perla);
}

.action-button.danger .action-icon {
  background: var(--color-rojo-granate);
  color: var(--color-blanco-perla);
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.action-description {
  font-size: 0.875rem;
  color: var(--color-gris-acero);
}

@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .action-button {
    padding: 1rem;
  }
  
  .action-icon {
    padding: 0.75rem;
  }
}
</style>