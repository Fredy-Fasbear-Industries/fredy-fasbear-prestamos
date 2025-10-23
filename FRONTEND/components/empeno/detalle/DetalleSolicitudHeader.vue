<template>
  <div class="detalle-header">
    <div class="header-navigation">
      <button @click="$emit('volver')" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
        </svg>
        Volver a Mis Empéños
      </button>
    </div>

    <div class="header-content">
      <div class="header-info">
        <h1>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ solicitud.numero }}
        </h1>
        <p>Detalle de tu solicitud de empeño</p>
      </div>

      <div class="header-status">
        <div class="status-badge" :class="`status-${solicitud.estado?.toLowerCase()}`">
          <span class="status-dot"></span>
          {{ formatearEstado(solicitud.estado) }}
        </div>
      </div>
    </div>

    <div class="progress-steps">
      <div class="step" :class="{ active: true, completed: ['Evaluando', 'Aprobada', 'Rechazada'].includes(solicitud.estado) }">
        <span class="step-number">1</span>
        <span class="step-label">Solicitud Enviada</span>
        <span class="step-date">{{ formatDate(solicitud.fechaSolicitud) }}</span>
      </div>
      <div class="step" :class="{ active: ['Evaluando', 'Aprobada', 'Rechazada'].includes(solicitud.estado), completed: ['Aprobada', 'Rechazada'].includes(solicitud.estado) }">
        <span class="step-number">2</span>
        <span class="step-label">En Evaluación</span>
        <span class="step-date" v-if="solicitud.fecha_evaluacion">{{ formatDate(solicitud.fecha_evaluacion) }}</span>
      </div>
      <div class="step" :class="{ 
        active: ['Aprobada', 'Rechazada'].includes(solicitud.estado), 
        completed: solicitud.estado === 'Aprobada',
        rejected: solicitud.estado === 'Rechazada'
      }">
        <span class="step-number">
          <svg v-if="solicitud.estado === 'Rechazada'" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else-if="solicitud.estado === 'Aprobada'" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span v-else>3</span>
        </span>
        <span class="step-label">
          {{ solicitud.estado === 'Rechazada' ? 'Rechazada' : solicitud.estado === 'Aprobada' ? 'Aprobada' : 'Resultado' }}
        </span>
        <span class="step-date" v-if="solicitud.fecha_evaluacion && ['Aprobada', 'Rechazada'].includes(solicitud.estado)">
          {{ formatDate(solicitud.fecha_evaluacion) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  solicitud: {
    type: Object,
    required: true
  }
})

defineEmits(['volver'])

const { formatearEstado, formatDate } = useFormatters()
</script>

<style scoped>
.detalle-header {
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  margin-bottom: 2rem;
  overflow: hidden;
}

.header-navigation {
  padding: 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 8px;
  transition: var(--transition);
}

.btn-back:hover {
  background: var(--color-dorado-vintage);
  color: var(--color-blanco-perla);
  transform: translateX(-2px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-info h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin-bottom: 0.5rem;
}

.header-info h1 svg {
  color: var(--color-dorado-vintage);
}

.header-info p {
  color: var(--color-gris-acero);
  margin: 0;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-pendiente {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: var(--color-marron-chocolate);
}

.status-pendiente .status-dot {
  background: var(--color-dorado-vintage);
}

.status-evaluando {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: var(--color-azul-marino);
}

.status-evaluando .status-dot {
  background: var(--color-azul-marino);
}

.status-aprobada {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: var(--color-verde-bosque);
}

.status-aprobada .status-dot {
  background: var(--color-verde-bosque);
}

.status-rechazada {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: var(--color-rojo-granate);
}

.status-rechazada .status-dot {
  background: var(--color-rojo-granate);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  position: relative;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 50px;
  left: 20%;
  right: 20%;
  height: 2px;
  background: linear-gradient(90deg, var(--color-gris-acero), var(--color-dorado-vintage));
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
  background: var(--color-blanco-perla);
  padding: 0 1rem;
  text-align: center;
  flex: 1;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid var(--color-gris-acero);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-gris-acero);
  background: var(--color-blanco-perla);
  transition: var(--transition);
}

.step.active .step-number {
  border-color: var(--color-dorado-vintage);
  color: var(--color-dorado-vintage);
}

.step.completed .step-number {
  background: var(--color-verde-bosque);
  border-color: var(--color-verde-bosque);
  color: var(--color-blanco-perla);
}

.step.rejected .step-number {
  background: var(--color-rojo-granate);
  border-color: var(--color-rojo-granate);
  color: var(--color-blanco-perla);
}

.step-label {
  font-weight: 500;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.step.active .step-label {
  color: var(--color-dorado-vintage);
  font-weight: 600;
}

.step.completed .step-label {
  color: var(--color-verde-bosque);
  font-weight: 600;
}

.step.rejected .step-label {
  color: var(--color-rojo-granate);
  font-weight: 600;
}

.step-date {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .progress-steps {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem;
  }
  
  .progress-steps::before {
    display: none;
  }
  
  .step {
    flex-direction: row;
    text-align: left;
    padding: 0;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    font-size: 0.875rem;
  }
}
</style>    