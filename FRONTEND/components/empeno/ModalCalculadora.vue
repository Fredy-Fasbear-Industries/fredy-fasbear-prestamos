<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content calculator-modal" @click.stop>
      <div class="modal-header">
        <h3>Calculadora de Préstamo</h3>
        <button class="modal-close" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="calculator-form">
          <div class="form-group">
            <label>Valor estimado del artículo</label>
            <input 
              type="number" 
              v-model="localCalculadora.valor" 
              @input="onInput"
              placeholder="Q 0.00"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>Porcentaje de préstamo ({{ localCalculadora.porcentaje }}%)</label>
            <input 
              type="range" 
              v-model="localCalculadora.porcentaje" 
              @input="onInput"
              min="30" 
              max="80" 
              class="form-range"
            >
          </div>
          <div class="form-group">
            <label>Plazo (meses)</label>
            <select v-model="localCalculadora.plazo" @change="onInput" class="form-select">
              <option value="1">1 mes</option>
              <option value="2">2 meses</option>
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
            </select>
          </div>
          <div class="form-group">
            <button 
              class="btn-secondary full-width" 
              @click="obtenerSimulacion" 
              :disabled="loadingSimulacion"
            >
              {{ loadingSimulacion ? 'Calculando...' : 'Obtener Cálculo Oficial' }}
            </button>
          </div>
        </div>
        <div class="calculator-result">
          <div class="result-item">
            <span>Monto del préstamo:</span>
            <strong>Q{{ formatCurrency(localCalculadora.montoPrestamo) }}</strong>
          </div>
          <div class="result-item">
            <span>Interés total ({{ localCalculadora.interesMensual }}% mensual):</span>
            <strong>Q{{ formatCurrency(localCalculadora.interesTotal) }}</strong>
          </div>
          <div class="result-item total">
            <span>Total a pagar:</span>
            <strong>Q{{ formatCurrency(localCalculadora.totalPagar) }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { formatCurrency } from '~/utils/empenoUtils'

const props = defineProps({
  calculadora: {
    type: Object,
    required: true
  },
  loadingSimulacion: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'calcular', 'obtener-simulacion'])

const localCalculadora = ref({ ...props.calculadora })

watch(() => props.calculadora, (newVal) => {
  localCalculadora.value = { ...newVal }
}, { deep: true })

const onInput = () => {
  emit('calcular', localCalculadora.value)
}

const obtenerSimulacion = () => {
  emit('obtener-simulacion')
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

.calculator-modal {
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

.calculator-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2C3E50;
  font-size: 0.9rem;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #D4AF37;
}

.form-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #E0E0E0;
  outline: none;
  cursor: pointer;
}

.form-range::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #D4AF37;
  cursor: pointer;
}

.form-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #D4AF37;
  cursor: pointer;
  border: none;
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

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.full-width {
  width: 100%;
}

.calculator-result {
  background: #F8F9FA;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #D4AF37;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #E0E0E0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item.total {
  background: rgba(212, 175, 55, 0.1);
  margin: 0.5rem -1.5rem -1.5rem;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
}

.result-item span {
  color: #666;
}

.result-item strong {
  color: #2C3E50;
  font-size: 1.1rem;
}

.result-item.total strong {
  color: #D4AF37;
  font-size: 1.3rem;
}
</style>