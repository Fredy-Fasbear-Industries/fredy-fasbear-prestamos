<template>
  <div 
    class="prestamo-card"
    :class="[item.estado.toLowerCase().replace('_', '-'), item.tipo]"
  >
    <div class="prestamo-header">
      <div class="prestamo-info">
        <h3 class="prestamo-titulo">{{ getItemTitulo(item) }}</h3>
        <p class="prestamo-fecha">{{ getItemFecha(item) }}</p>
        <span class="tipo-badge" :class="item.tipo">
          {{ item.tipo === 'solicitud' ? 'Solicitud' : 'Préstamo' }}
        </span>
      </div>
      <div class="prestamo-estado">
        <span class="estado-badge" :class="item.estado.toLowerCase().replace('_', '-')">
          {{ formatEstado(item.estado) }}
        </span>
      </div>
    </div>

    <div class="prestamo-body">
      <div class="prestamo-details">
        <div class="detail-item" v-if="item.tipo === 'prestamo'">
          <span class="detail-label">Monto prestado:</span>
          <span class="detail-value">Q{{ formatCurrency(item.montoPrestado || 0) }}</span>
        </div>
        <div class="detail-item" v-if="item.tipo === 'prestamo'">
          <span class="detail-label">Interés:</span>
          <span class="detail-value">{{ item.tasaInteres || 0 }}%</span>
        </div>
        <div class="detail-item" v-if="item.valorEstimado">
          <span class="detail-label">Valor estimado:</span>
          <span class="detail-value">Q{{ formatCurrency(item.valorEstimado) }}</span>
        </div>
        <div class="detail-item" v-if="item.fechaVencimiento">
          <span class="detail-label">Vencimiento:</span>
          <span class="detail-value" :class="{ 'vencido': isVencido(item.fechaVencimiento) }">
            {{ formatDate(item.fechaVencimiento) }}
          </span>
        </div>
        <div class="detail-item" v-if="item.tipo === 'prestamo' && item.saldoPendiente">
          <span class="detail-label">Saldo pendiente:</span>
          <span class="detail-value total">Q{{ formatCurrency(item.saldoPendiente) }}</span>
        </div>
        <div class="detail-item" v-if="item.observaciones">
          <span class="detail-label">Observaciones:</span>
          <span class="detail-value">{{ item.observaciones }}</span>
        </div>
      </div>

      <div class="prestamo-actions">
        <button class="btn-action primary" @click="$emit('ver-detalle', item)">
          Ver Detalle
        </button>
        <button 
          class="btn-action secondary" 
          @click="$emit('renovar', item)" 
          v-if="item.tipo === 'prestamo' && item.estado === 'Activo'"
          :disabled="disabled"
        >
          {{ disabled ? 'Procesando...' : 'Renovar' }}
        </button>
        <button 
          class="btn-action success" 
          @click="$emit('pagar', item)" 
          v-if="item.tipo === 'prestamo' && ['Activo', 'Vencido', 'En_Mora'].includes(item.estado)"
          :disabled="disabled"
        >
          {{ disabled ? 'Procesando...' : 'Pagar' }}
        </button>
        <button 
          class="btn-action warning" 
          @click="$emit('cancelar', item)" 
          v-if="item.tipo === 'solicitud' && ['Pendiente', 'Evaluando'].includes(item.estado)"
          :disabled="disabled"
        >
          {{ disabled ? 'Cancelando...' : 'Cancelar' }}
        </button>
      </div>
    </div>

    <div class="prestamo-progress" v-if="item.tipo === 'prestamo' && item.fechaVencimiento">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: calcularPorcentajeTiempo(item) + '%' }"></div>
      </div>
      <span class="progress-text">{{ calcularDiasRestantes(item) }} días restantes</span>
    </div>

    <div class="solicitud-progress" v-if="item.tipo === 'solicitud'">
      <div class="progress-steps">
        <div class="step" :class="{ active: true, completed: ['Evaluando', 'Aprobada', 'Rechazada'].includes(item.estado) }">
          <span class="step-number">1</span>
          <span class="step-label">Enviada</span>
        </div>
        <div class="step" :class="{ active: ['Evaluando', 'Aprobada', 'Rechazada'].includes(item.estado), completed: ['Aprobada', 'Rechazada'].includes(item.estado) }">
          <span class="step-number">2</span>
          <span class="step-label">Evaluación</span>
        </div>
        <div class="step" :class="{ active: item.estado === 'Aprobada', completed: false }">
          <span class="step-number">3</span>
          <span class="step-label">Aprobación</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  formatCurrency, 
  formatDate, 
  formatEstado, 
  isVencido, 
  getItemTitulo, 
  getItemFecha,
  calcularDiasRestantes,
  calcularPorcentajeTiempo
} from '~/utils/empenoUtils'

defineProps({
  item: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['ver-detalle', 'renovar', 'pagar', 'cancelar'])
</script>

<style scoped>
.prestamo-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  border-left: 4px solid;
}

.prestamo-card:hover {
  transform: translateY(-2px);
}

.prestamo-card.pendiente { border-left-color: #F39C12; }
.prestamo-card.evaluando { border-left-color: #3498DB; }
.prestamo-card.aprobada { border-left-color: #27AE60; }
.prestamo-card.rechazada { border-left-color: #E74C3C; }
.prestamo-card.activo { border-left-color: #27AE60; }
.prestamo-card.vencido { border-left-color: #E74C3C; }
.prestamo-card.en-mora { border-left-color: #E67E22; }
.prestamo-card.pagado { border-left-color: #95A5A6; }

.prestamo-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: start;
  background: #F8F9FA;
  border-bottom: 1px solid #E0E0E0;
}

.prestamo-titulo {
  margin: 0 0 0.25rem;
  color: #2C3E50;
  font-size: 1.1rem;
  font-weight: 600;
}

.prestamo-fecha {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.tipo-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-top: 0.5rem;
  display: inline-block;
}

.tipo-badge.solicitud {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.tipo-badge.prestamo {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.estado-badge.pendiente { background: rgba(243, 156, 18, 0.1); color: #F39C12; }
.estado-badge.evaluando { background: rgba(52, 152, 219, 0.1); color: #3498DB; }
.estado-badge.aprobada { background: rgba(39, 174, 96, 0.1); color: #27AE60; }
.estado-badge.rechazada { background: rgba(231, 76, 60, 0.1); color: #E74C3C; }
.estado-badge.activo { background: rgba(39, 174, 96, 0.1); color: #27AE60; }
.estado-badge.vencido { background: rgba(231, 76, 60, 0.1); color: #E74C3C; }
.estado-badge.en-mora { background: rgba(230, 126, 34, 0.1); color: #E67E22; }
.estado-badge.pagado { background: rgba(149, 165, 166, 0.1); color: #95A5A6; }

.prestamo-body {
  padding: 1.5rem;
}

.prestamo-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.9rem;
  color: #666;
}

.detail-value {
  font-weight: 600;
  color: #2C3E50;
}

.detail-value.vencido {
  color: #E74C3C;
}

.detail-value.total {
  font-size: 1.1rem;
  color: #D4AF37;
}

.prestamo-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-action.primary { background: #3498DB; color: white; }
.btn-action.secondary { background: #F39C12; color: white; }
.btn-action.success { background: #27AE60; color: white; }
.btn-action.warning { background: #E67E22; color: white; }

.btn-action:not(:disabled):hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.prestamo-progress {
  padding: 1rem 1.5rem;
  background: #F8F9FA;
  border-top: 1px solid #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #E0E0E0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #27AE60, #2ECC71);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
}

.solicitud-progress {
  padding: 1rem 1.5rem;
  background: #F8F9FA;
  border-top: 1px solid #E0E0E0;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #E0E0E0;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
  background: #F8F9FA;
  padding: 0 0.5rem;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E0E0E0;
  color: #666;
  font-weight: bold;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #3498DB;
  color: white;
}

.step.completed .step-number {
  background: #27AE60;
  color: white;
}

.step-label {
  font-size: 0.7rem;
  color: #666;
  text-align: center;
  font-weight: 500;
}

.step.active .step-label {
  color: #3498DB;
  font-weight: 600;
}

.step.completed .step-label {
  color: #27AE60;
  font-weight: 600;
}
</style>