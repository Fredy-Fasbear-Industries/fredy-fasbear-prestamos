<template>
  <div class="detalle-content">
    <div class="info-section">
      <div class="section-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2"/>
          </svg>
          Información General
        </h2>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Número de Solicitud</span>
            <span class="info-value">{{ solicitud.numero }}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Fecha de Solicitud</span>
            <span class="info-value">{{ formatDateLong(solicitud.fechaSolicitud) }}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Estado Actual</span>
            <span class="info-value">{{ formatearEstado(solicitud.estado) }}</span>
          </div>
        </div>

        <div class="info-card" v-if="solicitud.fecha_evaluacion">
          <div class="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 11H15M9 15H15M17 21L20 18L17 15M3 19V5C3 3.89 3.89 3 5 3H19C20.11 3 21 3.89 21 5V12.5" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Fecha de Evaluación</span>
            <span class="info-value">{{ formatDateLong(solicitud.fecha_evaluacion) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="articulos-section">
      <div class="section-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
          </svg>
          Artículos Incluidos
          <span class="items-count" v-if="solicitud.articulos">
            ({{ solicitud.articulos.length }} {{ solicitud.articulos.length === 1 ? 'artículo' : 'artículos' }})
          </span>
        </h2>
      </div>

      <div class="articulos-grid" v-if="solicitud.articulos && solicitud.articulos.length > 0">
        <ArticuloCard 
          v-for="articulo in solicitud.articulos" 
          :key="articulo.id_articulo"
          :articulo="articulo"
          @ver-imagen="$emit('ver-imagen', $event)"
          @abrir-documento="$emit('abrir-documento', $event)"
        />
      </div>

      <div class="empty-articulos" v-else>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
          <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
        </svg>
        <p>No se encontraron artículos en esta solicitud</p>
      </div>
    </div>

    <AccionesDisponibles
      :estado="solicitud.estado"
      :loading="loading"
      @cancelar="$emit('cancelar')"
      @aceptar="$emit('aceptar')"
      @nueva-solicitud="$emit('nueva-solicitud')"
      @volver="$emit('volver')"
    />
  </div>
</template>

<script setup>
import ArticuloCard from '~/components/empeno/detalle/ArticuloCard.vue'
import AccionesDisponibles from '~/components/empeno/detalle/AccionesDisponibles.vue'

const props = defineProps({
  solicitud: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['ver-imagen', 'abrir-documento', 'cancelar', 'aceptar', 'nueva-solicitud', 'volver'])

const { formatDateLong, formatearEstado } = useFormatters()
</script>

<style scoped>
.detalle-content {
  display: grid;
  gap: 2rem;
}

.info-section,
.articulos-section {
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

.items-count {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--color-gris-acero);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
  transition: var(--transition);
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.15);
  border-color: var(--color-dorado-vintage);
}

.info-icon {
  padding: 1rem;
  background: var(--color-dorado-vintage);
  border-radius: var(--border-radius);
  color: var(--color-blanco-perla);
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gris-acero);
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.articulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.empty-articulos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--color-gris-acero);
}

.empty-articulos svg {
  margin-bottom: 1rem;
  color: var(--color-gris-acero);
  opacity: 0.5;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .articulos-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
</style>