<template>
  <div class="articulo-card">
    <div class="articulo-header">
      <div class="articulo-tipo">
        <div class="tipo-icono">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <span>{{ articulo.tipo_articulo?.nombre || 'Artículo' }}</span>
      </div>
      <div class="articulo-estado" :class="`estado-${articulo.estado_fisico?.toLowerCase()}`">
        {{ formatearEstadoFisico(articulo.estado_fisico) }}
      </div>
    </div>

    <div class="articulo-content">
      <div class="articulo-descripcion">
        <h4>{{ articulo.descripcion || 'Sin descripción' }}</h4>
      </div>

      <div v-if="articulo.valor_estimado_cliente" class="valoracion-cliente">
        <div class="valoracion-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
            <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Valoración Estimada del Cliente</span>
        </div>
        <div class="valoracion-monto">{{ formatCurrency(articulo.valor_estimado_cliente) }}</div>
      </div>

      <div class="articulo-detalles">
        <div class="detalles-grid">
          <div class="detalle-item" v-if="articulo.marca">
            <span class="detalle-label">Marca:</span>
            <span class="detalle-valor">{{ articulo.marca }}</span>
          </div>
          <div class="detalle-item" v-if="articulo.modelo">
            <span class="detalle-label">Modelo:</span>
            <span class="detalle-valor">{{ articulo.modelo }}</span>
          </div>
          <div class="detalle-item" v-if="articulo.serie">
            <span class="detalle-label">Serie:</span>
            <span class="detalle-valor">{{ articulo.serie }}</span>
          </div>
          <div class="detalle-item" v-if="articulo.color">
            <span class="detalle-label">Color:</span>
            <div class="color-info">
              <span class="color-muestra" :style="{ backgroundColor: getColorHex(articulo.color) }"></span>
              <span class="detalle-valor">{{ articulo.color }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="articulo.especificaciones_tecnicas" class="especificaciones-section">
        <div class="specs-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Especificaciones Técnicas</span>
        </div>
        <div class="specs-content">
          <pre>{{ articulo.especificaciones_tecnicas }}</pre>
        </div>
      </div>

      <div v-if="articulo.avaluo" class="avaluo-section">
        <div class="avaluo-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 11H15M9 15H15M17 21L20 18L17 15M3 19V5C3 3.89 3.89 3 5 3H19C20.11 3 21 3.89 21 5V12.5" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          <span>Evaluación Profesional</span>
        </div>
        <div class="avaluo-grid">
          <div class="avaluo-item">
            <span class="avaluo-label">Valor Comercial:</span>
            <span class="avaluo-valor comercial">{{ formatCurrency(articulo.avaluo.valorComercial) }}</span>
          </div>
          <div class="avaluo-item">
            <span class="avaluo-label">Porcentaje Aplicado:</span>
            <span class="avaluo-valor porcentaje">{{ articulo.avaluo.porcentajeAplicado }}%</span>
          </div>
          <div class="avaluo-item">
            <span class="avaluo-label">Monto Máximo de Préstamo:</span>
            <span class="avaluo-valor prestamo">{{ formatCurrency(articulo.avaluo.montoPrestamo) }}</span>
          </div>
          <div v-if="articulo.avaluo.observaciones" class="avaluo-observaciones">
            <span class="avaluo-label">Observaciones del Evaluador:</span>
            <p class="avaluo-obs-text">{{ articulo.avaluo.observaciones }}</p>
          </div>
        </div>
      </div>

      <div class="articulo-media" v-if="articulo.documentos && articulo.documentos.length > 0">
        <div class="media-section" v-if="obtenerFotos(articulo.documentos).length > 0">
          <div class="media-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
              <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
            </svg>
            Fotos ({{ obtenerFotos(articulo.documentos).length }})
          </div>
          <div class="fotos-grid">
            <div 
              v-for="(foto, index) in obtenerFotos(articulo.documentos)" 
              :key="index" 
              class="foto-item"
              @click="$emit('ver-imagen', foto, obtenerFotos(articulo.documentos))"
            >
              <img 
                :src="construirUrlArchivo(foto.ruta_archivo)" 
                :alt="foto.nombre_original"
                @error="manejarErrorImagen"
              />
              <div class="foto-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="media-section" v-if="obtenerDocumentos(articulo.documentos).length > 0">
          <div class="media-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
            </svg>
            Documentos ({{ obtenerDocumentos(articulo.documentos).length }})
          </div>
          <div class="documentos-list">
            <div 
              v-for="(documento, index) in obtenerDocumentos(articulo.documentos)" 
              :key="index" 
              class="documento-item"
              @click="$emit('abrir-documento', documento)"
            >
              <div class="documento-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="documento-info">
                <div class="documento-nombre">{{ documento.nombre_original }}</div>
                <div class="documento-tipo">{{ obtenerTipoDocumento(documento.tipo_mime) }}</div>
                <div class="documento-tamaño" v-if="documento.tamaño">{{ formatFileSize(documento.tamaño) }}</div>
              </div>
              <div class="documento-actions">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11" stroke="currentColor" stroke-width="2"/>
                  <path d="M15 3H21V9" stroke="currentColor" stroke-width="2"/>
                  <path d="M10 14L21 3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  articulo: {
    type: Object,
    required: true
  }
})

defineEmits(['ver-imagen', 'abrir-documento'])

const { 
  formatCurrency, 
  formatearEstadoFisico, 
  getColorHex, 
  obtenerTipoDocumento,
  formatFileSize 
} = useFormatters()

const { construirUrlArchivo, obtenerFotos, obtenerDocumentos } = useSolicitudDetalle()

const manejarErrorImagen = (event) => {
  event.target.src = '/images/error-image.svg'
}
</script>

<style scoped>
.articulo-card {
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: var(--transition);
  background: var(--color-blanco-perla);
}

.articulo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.15);
  border-color: var(--color-dorado-vintage);
}

.articulo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
  border-bottom: 1px solid #e5e7eb;
}

.articulo-tipo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-dorado-vintage);
}

.tipo-icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-dorado-vintage);
  border-radius: 6px;
  color: white;
}

.articulo-estado {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.estado-excelente {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: var(--color-verde-bosque);
}

.estado-bueno {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: var(--color-azul-marino);
}

.estado-regular {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: var(--color-marron-chocolate);
}

.estado-malo {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: var(--color-rojo-granate);
}

.articulo-content {
  padding: 1.5rem;
}

.articulo-descripcion {
  margin-bottom: 1.5rem;
}

.articulo-descripcion h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0;
  line-height: 1.4;
}

.valoracion-cliente {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid var(--color-dorado-vintage);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.valoracion-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-marron-chocolate);
  margin-bottom: 0.5rem;
}

.valoracion-header svg {
  color: var(--color-dorado-vintage);
}

.valoracion-monto {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-dorado-vintage);
}

.articulo-detalles {
  margin-bottom: 1.5rem;
}

.detalles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.detalle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
}

.detalle-label {
  color: var(--color-gris-acero);
  font-weight: 500;
}

.detalle-valor {
  color: var(--color-negro-carbon);
  font-weight: 600;
}

.color-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-muestra {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.especificaciones-section {
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.specs-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  padding: 1rem;
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  border-bottom: 1px solid #d1d5db;
}

.specs-header svg {
  color: var(--color-dorado-vintage);
}

.specs-content {
  padding: 1rem;
}

.specs-content pre {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-gris-acero);
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.avaluo-section {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1px solid #0ea5e9;
  border-radius: var(--border-radius);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.avaluo-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 1rem;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: white;
}

.avaluo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  padding: 1rem;
}

.avaluo-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0f2fe;
}

.avaluo-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-gris-acero);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.avaluo-valor {
  font-weight: 700;
  font-size: 1rem;
}

.avaluo-valor.comercial {
  color: var(--color-azul-marino);
}

.avaluo-valor.porcentaje {
  color: var(--color-verde-bosque);
}

.avaluo-valor.prestamo {
  color: var(--color-dorado-vintage);
  font-size: 1.125rem;
}

.avaluo-observaciones {
  grid-column: 1 / -1;
  margin-top: 0.5rem;
}

.avaluo-obs-text {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  font-style: italic;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
  line-height: 1.5;
  border-left: 3px solid var(--color-azul-marino);
  margin: 0;
}

.articulo-media {
  margin-top: 1rem;
}

.media-section {
  margin-bottom: 1.5rem;
}

.media-section:last-child {
  margin-bottom: 0;
}

.media-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin-bottom: 1rem;
}

.media-title svg {
  color: var(--color-dorado-vintage);
}

.fotos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.foto-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid transparent;
}

.foto-item:hover {
  transform: scale(1.05);
  border-color: var(--color-dorado-vintage);
}

.foto-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.foto-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 26, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: var(--color-blanco-perla);
}

.foto-item:hover .foto-overlay {
  opacity: 1;
}

.documentos-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.documento-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: var(--transition);
}

.documento-item:hover {
  transform: translateX(4px);
  border-color: var(--color-dorado-vintage);
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.documento-icon {
  padding: 0.75rem;
  background: var(--color-azul-marino);
  border-radius: 8px;
  color: var(--color-blanco-perla);
  flex-shrink: 0;
}

.documento-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.documento-nombre {
  font-weight: 600;
  color: var(--color-negro-carbon);
  font-size: 0.875rem;
}

.documento-tipo {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
  text-transform: uppercase;
  font-weight: 500;
}

.documento-tamaño {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
}

.documento-actions {
  color: var(--color-dorado-vintage);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .detalles-grid {
    grid-template-columns: 1fr;
  }
  
  .avaluo-grid {
    grid-template-columns: 1fr;
  }
  
  .fotos-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>