<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="image-viewer" @click.stop>
      <div class="viewer-header">
        <div class="viewer-title">
          <h3>{{ imagenActual?.nombre_original || 'Imagen del artículo' }}</h3>
          <span class="image-counter">{{ indice + 1 }} de {{ imagenes.length }}</span>
        </div>
        <button @click="$emit('close')" class="viewer-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      
      <div class="viewer-content">
        <button 
          v-if="imagenes.length > 1"
          @click="$emit('anterior')" 
          class="viewer-nav prev"
          :disabled="indice === 0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <polyline points="15,18 9,12 15,6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        
        <div class="image-container">
          <img 
            :src="construirUrlArchivo(imagenActual.ruta_archivo)" 
            :alt="imagenActual?.nombre_original"
            @error="manejarErrorImagen"
          />
        </div>
        
        <button 
          v-if="imagenes.length > 1"
          @click="$emit('siguiente')" 
          class="viewer-nav next"
          :disabled="indice === imagenes.length - 1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <polyline points="9,18 15,12 9,6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      
      <div class="viewer-footer" v-if="imagenes.length > 1">
        <div class="thumbnails">
          <button 
            v-for="(imagen, index) in imagenes" 
            :key="index"
            @click="$emit('cambiar', index)"
            class="thumbnail"
            :class="{ active: index === indice }"
          >
            <img 
              :src="construirUrlArchivo(imagen.ruta_archivo)" 
              :alt="`Miniatura ${index + 1}`"
              @error="manejarErrorImagen"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  imagenActual: {
    type: Object,
    required: true
  },
  imagenes: {
    type: Array,
    default: () => []
  },
  indice: {
    type: Number,
    default: 0
  }
})

defineEmits(['close', 'anterior', 'siguiente', 'cambiar'])

const { construirUrlArchivo } = useSolicitudDetalle()

const manejarErrorImagen = (event) => {
  event.target.src = '/images/error-image.svg'
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

.image-viewer {
  background: var(--color-negro-carbon);
  border-radius: 16px;
  max-width: 95vw;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--color-blanco-perla);
  border-bottom: 1px solid #e5e7eb;
}

.viewer-title h3 {
  color: var(--color-negro-carbon);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.image-counter {
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.viewer-close {
  background: none;
  border: none;
  color: var(--color-gris-acero);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: var(--transition);
}

.viewer-close:hover {
  background: #f3f4f6;
  color: var(--color-negro-carbon);
}

.viewer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
  min-height: 400px;
  background: var(--color-negro-carbon);
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  max-height: 70vh;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.viewer-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(245, 245, 245, 0.9);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-negro-carbon);
  transition: var(--transition);
}

.viewer-nav:hover:not(:disabled) {
  background: var(--color-blanco-perla);
  transform: translateY(-50%) scale(1.1);
}

.viewer-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.viewer-nav.prev {
  left: 1rem;
}

.viewer-nav.next {
  right: 1rem;
}

.viewer-footer {
  padding: 1rem;
  background: var(--color-blanco-perla);
  border-top: 1px solid #e5e7eb;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
  padding: 0;
  background: none;
}

.thumbnail.active {
  border-color: var(--color-dorado-vintage);
}

.thumbnail:hover {
  transform: scale(1.05);
  border-color: var(--color-dorado-vintage);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .image-viewer {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .viewer-nav {
    width: 40px;
    height: 40px;
  }
}
</style>