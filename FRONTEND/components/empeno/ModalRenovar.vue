<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Renovar Préstamo</h2>
        <button @click="$emit('close')" class="btn-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="info-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
          </svg>
          <p>Renovar tu préstamo extenderá el plazo y recalculará los intereses. Se generará un nuevo plan de pagos.</p>
        </div>

        <div class="prestamo-actual">
          <h3>Préstamo Actual</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Monto Prestado</span>
              <span class="valor">{{ formatCurrency(prestamo.montoPrestado) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Saldo Pendiente</span>
              <span class="valor">{{ formatCurrency(prestamo.saldoPendiente) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Plazo Actual</span>
              <span class="valor">{{ prestamo.plazoMeses }} meses</span>
            </div>
            <div class="info-item">
              <span class="label">Fecha Vencimiento</span>
              <span class="valor">{{ formatDateShort(prestamo.fechaVencimiento) }}</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="renovacion-form">
          <div class="form-group">
            <label for="nuevosPlazoMeses">Nuevo Plazo</label>
            <select
              id="nuevosPlazoMeses"
              v-model.number="formData.nuevosPlazoMeses"
              required
            >
              <option value="">Selecciona el nuevo plazo</option>
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
              <option value="9">9 meses</option>
              <option value="12">12 meses</option>
            </select>
          </div>

          <div v-if="formData.nuevosPlazoMeses" class="estimacion">
            <h4>Estimación de Renovación</h4>
            <div class="estimacion-grid">
              <div class="est-item">
                <span class="label">Nueva Fecha Vencimiento</span>
                <span class="valor">{{ nuevaFechaVencimiento }}</span>
              </div>
              <div class="est-item">
                <span class="label">Intereses Aproximados</span>
                <span class="valor">{{ interesesAproximados }}</span>
              </div>
              <div class="est-item destacada">
                <span class="label">Nuevo Total Aproximado</span>
                <span class="valor">{{ nuevoTotalAproximado }}</span>
              </div>
            </div>
            <p class="estimacion-nota">Esta es una estimación. El cálculo exacto se realizará al confirmar la renovación.</p>
          </div>

          <div class="form-group">
            <label for="motivoRenovacion">Motivo de Renovación (Opcional)</label>
            <textarea
              id="motivoRenovacion"
              v-model="formData.motivoRenovacion"
              rows="3"
              placeholder="Explica por qué necesitas renovar el préstamo"
            ></textarea>
          </div>

          <div class="confirmacion-box">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="formData.aceptoTerminos"
                required
              >
              <span>
                Entiendo que al renovar mi préstamo se generarán nuevos intereses y acepto los términos de renovación.
              </span>
            </label>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              @click="$emit('close')"
              class="btn-secondary"
              :disabled="loading"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="loading || !formData.nuevosPlazoMeses || !formData.aceptoTerminos"
            >
              <span v-if="loading">Procesando...</span>
              <span v-else>Confirmar Renovación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFormatters } from '~/composables/useFormatters'

const props = defineProps({
  prestamo: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirmar'])

const { formatCurrency, formatDateShort } = useFormatters()

const formData = ref({
  nuevosPlazoMeses: '',
  motivoRenovacion: '',
  aceptoTerminos: false
})

const nuevaFechaVencimiento = computed(() => {
  if (!formData.value.nuevosPlazoMeses) return '-'
  
  const fecha = new Date()
  fecha.setMonth(fecha.getMonth() + formData.value.nuevosPlazoMeses)
  return formatDateShort(fecha)
})

const interesesAproximados = computed(() => {
  if (!formData.value.nuevosPlazoMeses) return '-'
  
  const saldo = parseFloat(props.prestamo.saldoPendiente) || 0
  const tasa = (parseFloat(props.prestamo.tasaInteres) || 0) / 100
  const intereses = saldo * tasa * formData.value.nuevosPlazoMeses
  
  return formatCurrency(intereses)
})

const nuevoTotalAproximado = computed(() => {
  if (!formData.value.nuevosPlazoMeses) return '-'
  
  const saldo = parseFloat(props.prestamo.saldoPendiente) || 0
  const tasa = (parseFloat(props.prestamo.tasaInteres) || 0) / 100
  const intereses = saldo * tasa * formData.value.nuevosPlazoMeses
  const total = saldo + intereses
  
  return formatCurrency(total)
})

const handleSubmit = () => {
  emit('confirmar', formData.value)
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #F3F4F6;
  color: #1A1A1A;
}

.modal-body {
  padding: 2rem;
}

.info-alert {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #FEF3C7;
  border-left: 4px solid #F59E0B;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.info-alert svg {
  flex-shrink: 0;
  color: #F59E0B;
}

.info-alert p {
  margin: 0;
  color: #92400E;
  font-size: 0.875rem;
  line-height: 1.5;
}

.prestamo-actual {
  background: #F9FAFB;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.prestamo-actual h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 1rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.75rem;
  color: #6B7280;
}

.info-item .valor {
  font-weight: 600;
  color: #1A1A1A;
}

.renovacion-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #D4AF37;
}

.estimacion {
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  padding: 1.5rem;
  border-radius: 12px;
}

.estimacion h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #065F46;
  margin: 0 0 1rem 0;
}

.estimacion-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.est-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
}

.est-item.destacada {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  font-weight: 700;
  border: 2px solid #D97706;
}

.est-item .label {
  color: #374151;
  font-size: 0.875rem;
}

.est-item .valor {
  color: #1A1A1A;
  font-weight: 600;
}

.estimacion-nota {
  font-size: 0.75rem;
  color: #065F46;
  margin: 0;
  font-style: italic;
}

.confirmacion-box {
  background: #F9FAFB;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 0.25rem;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label span {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #1A1A1A;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #fde68a, #fcd34d);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #1A1A1A;
  border: 2px solid #E5E7EB;
}

.btn-secondary:hover:not(:disabled) {
  background: #F3F4F6;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>