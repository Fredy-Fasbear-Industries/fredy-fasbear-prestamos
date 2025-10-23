<template>
  <section class="stats-section">
    <div class="stats-grid">
      <div class="stat-card active">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Préstamos Activos</h3>
          <p class="stat-number">{{ estadisticas.prestamosActivos }}</p>
          <span class="stat-subtitle">En proceso</span>
        </div>
      </div>

      <div class="stat-card pending">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Solicitudes Pendientes</h3>
          <p class="stat-number">{{ estadisticas.solicitudesPendientes }}</p>
          <span class="stat-subtitle">En evaluación</span>
        </div>
      </div>

      <div class="stat-card total">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2V22M17 5H9.5C8.83696 5 8.20107 5.26339 7.73223 5.73223C7.26339 6.20107 7 6.83696 7 7.5S7.26339 8.79893 7.73223 9.26777C8.20107 9.73661 8.83696 10 9.5 10H14.5C15.163 10 15.7989 10.2634 16.2678 10.7322C16.7366 11.2011 17 11.837 17 12.5S16.7366 13.7989 16.2678 14.2678C15.7989 14.7366 15.163 15 14.5 15H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Total Prestado</h3>
          <p class="stat-number">Q{{ formatCurrency(estadisticas.totalPrestado) }}</p>
          <span class="stat-subtitle">Monto acumulado</span>
        </div>
      </div>

      <div class="stat-card completed">
        <div class="stat-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>Préstamos Completados</h3>
          <p class="stat-number">{{ estadisticas.prestamosCompletados }}</p>
          <span class="stat-subtitle">Finalizados</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { formatCurrency } from '~/utils/empenoUtils'

defineProps({
  estadisticas: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.stats-section {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.active {
  border-left-color: #27AE60;
}

.stat-card.pending {
  border-left-color: #F39C12;
}

.stat-card.total {
  border-left-color: #D4AF37;
}

.stat-card.completed {
  border-left-color: #3498DB;
}

.stat-icon {
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.active .stat-icon {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.stat-card.pending .stat-icon {
  background: rgba(243, 156, 18, 0.1);
  color: #F39C12;
}

.stat-card.total .stat-icon {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.stat-card.completed .stat-icon {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.stat-content h3 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2C3E50;
}

.stat-subtitle {
  font-size: 0.8rem;
  color: #888;
}
</style>