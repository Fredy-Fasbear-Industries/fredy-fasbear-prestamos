<template>
  <Transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click="cerrarModal">
      <div class="modal-container" @click.stop>
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <div>
              <h2>Documentación de Identidad</h2>
              <p>{{ usuario?.nombre }} - DPI: {{ usuario?.cedula }}</p>
            </div>
          </div>
          <button @click="cerrarModal" class="btn-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Loading -->
          <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>Cargando documentos...</p>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="error-container">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2"/>
            </svg>
            <p>{{ error }}</p>
            <button @click="cargarDocumentos" class="btn-retry">Reintentar</button>
          </div>

          <!-- Documentos -->
          <div v-else-if="documentos.length > 0" class="documentos-container">
            <div class="stats-bar">
              <div class="stat-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ documentos.length }} documento(s)</span>
              </div>
              <div class="stat-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>Última actualización: {{ formatearFecha(documentos[0]?.fechaSubida) }}</span>
              </div>
            </div>

            <div class="documentos-grid">
              <div 
                v-for="documento in documentos" 
                :key="documento.id"
                class="documento-card"
              >
                <!-- Imagen -->
                <div class="imagen-container">
                  <img 
                    :src="obtenerUrlDocumento(documento.rutaArchivo)" 
                    :alt="documento.nombreArchivo"
                    @click="ampliarImagen(documento)"
                    class="documento-imagen"
                  >
                  <div class="overlay-actions">
                    <button 
                      @click="ampliarImagen(documento)" 
                      class="btn-action"
                      title="Ver en tamaño completo"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                    <button 
                      @click="descargarDocumento(documento.rutaArchivo, documento.nombreArchivo)" 
                      class="btn-action"
                      title="Descargar"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                    <button 
                      @click="abrirEnNuevaPestana(documento.rutaArchivo)" 
                      class="btn-action"
                      title="Abrir en nueva pestaña"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Info -->
                <div class="documento-info">
                  <h4>{{ documento.nombreArchivo }}</h4>
                  <div class="info-details">
                    <span class="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      {{ formatearFecha(documento.fechaSubida) }}
                    </span>
                    <span class="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      {{ formatearTamano(documento.tamanoArchivo) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sin documentos -->
          <div v-else class="empty-container">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/>
              <path d="M9 9l3 3 3-3" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h3>No hay documentos</h3>
            <p>El cliente aún no ha subido su documentación de identidad</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modal de imagen ampliada -->
  <Transition name="modal">
    <div v-if="imagenAmpliada" class="imagen-modal" @click="cerrarImagenAmpliada">
      <div class="imagen-modal-container" @click.stop>
        <button @click="cerrarImagenAmpliada" class="btn-close-imagen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <img 
          :src="obtenerUrlDocumento(imagenAmpliada.rutaArchivo)" 
          :alt="imagenAmpliada.nombreArchivo"
          class="imagen-ampliada"
        >
        <div class="imagen-info">
          <p>{{ imagenAmpliada.nombreArchivo }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useDocumentos } from '~/composables/useDocumentos'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  solicitudId: {
    type: Number,
    default: null
  },
  usuarioId: {
    type: Number,
    default: null
  },
  usuario: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const { 
  obtenerDocumentosDPI, 
  obtenerUrlDocumento, 
  formatearTamano,
  descargarDocumento: descargarDoc,
  abrirDocumento
} = useDocumentos()

// Estado
const documentos = ref([])
const loading = ref(false)
const error = ref(null)
const imagenAmpliada = ref(null)

// Cargar documentos
const cargarDocumentos = async () => {
  if (!props.usuarioId) {
    error.value = 'ID de usuario no proporcionado'
    return
  }

  try {
    loading.value = true
    error.value = null

    const data = await obtenerDocumentosDPI(props.usuarioId)
    documentos.value = data.documentos || []

  } catch (err) {
    console.error('Error cargando documentos:', err)
    error.value = err.message || 'Error al cargar documentos'
  } finally {
    loading.value = false
  }
}

// Cerrar modal
const cerrarModal = () => {
  emit('update:modelValue', false)
}

// Ampliar imagen
const ampliarImagen = (documento) => {
  imagenAmpliada.value = documento
}

// Cerrar imagen ampliada
const cerrarImagenAmpliada = () => {
  imagenAmpliada.value = null
}

// Descargar documento
const descargarDocumento = (rutaArchivo, nombreArchivo) => {
  descargarDoc(rutaArchivo, nombreArchivo)
}

// Abrir en nueva pestaña
const abrirEnNuevaPestana = (rutaArchivo) => {
  abrirDocumento(rutaArchivo)
}

// Formatear fecha
const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch para cargar documentos cuando se abre el modal
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    cargarDocumentos()
  }
})

// Cargar al montar si el modal ya está abierto
onMounted(() => {
  if (props.modelValue) {
    cargarDocumentos()
  }
})
</script>

<style scoped>
:root {
  --color-negro-carbon: #1A1A1A;
  --color-blanco-perla: #F5F5F5;
  --color-gris-acero: #4A4A4A;
  --color-azul-marino: #2C3E50;
  --color-dorado-vintage: #D4AF37;
  --color-verde-bosque: #1B4332;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #F0F0F0;
  background: linear-gradient(135deg, var(--color-azul-marino), var(--color-negro-carbon));
  border-radius: 16px 16px 0 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-content svg {
  color: var(--color-dorado-vintage);
  flex-shrink: 0;
}

.header-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.header-content p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0.25rem 0 0 0;
}

.btn-close {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-close svg {
  color: white;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}

/* Modal Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-gris-acero);
}

.stat-item svg {
  color: var(--color-dorado-vintage);
}

/* Documentos Grid */
.documentos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.documento-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #E0E0E0;
  transition: all 0.3s;
}

.documento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--color-dorado-vintage);
}

.imagen-container {
  position: relative;
  width: 100%;
  height: 240px;
  background: #F5F5F5;
  overflow: hidden;
}

.documento-imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s;
}

.documento-imagen:hover {
  transform: scale(1.05);
}

.overlay-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.imagen-container:hover .overlay-actions {
  opacity: 1;
}

.btn-action {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: none;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-action:hover {
  background: var(--color-dorado-vintage);
  transform: scale(1.1);
}

.btn-action svg {
  color: var(--color-negro-carbon);
}

.btn-action:hover svg {
  color: white;
}

.documento-info {
  padding: 1.25rem;
}

.documento-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0 0 0.75rem 0;
  word-break: break-word;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-gris-acero);
}

.detail-item svg {
  color: var(--color-dorado-vintage);
  flex-shrink: 0;
}

/* Loading, Error, Empty */
.loading-container,
.error-container,
.empty-container {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E0E0E0;
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: rotate 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-container svg,
.empty-container svg {
  color: var(--color-gris-acero);
  margin-bottom: 1rem;
}

.empty-container h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0 0 0.5rem 0;
}

.empty-container p {
  font-size: 0.95rem;
  color: var(--color-gris-acero);
  margin: 0;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-azul-marino);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-retry:hover {
  background: var(--color-negro-carbon);
}

/* Modal Footer */
.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 2px solid #F0F0F0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-secondary {
  padding: 0.85rem 1.75rem;
  background: white;
  color: var(--color-azul-marino);
  border: 2px solid var(--color-azul-marino);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: var(--color-azul-marino);
  color: white;
}

/* Imagen Ampliada Modal */
.imagen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.imagen-modal-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-close-imagen {
  position: absolute;
  top: -50px;
  right: 0;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 2px solid white;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.btn-close-imagen:hover {
  background: white;
}

.btn-close-imagen svg {
  color: white;
}

.btn-close-imagen:hover svg {
  color: var(--color-negro-carbon);
}

.imagen-ampliada {
  max-width: 100%;
  max-height: calc(90vh - 80px);
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.imagen-info {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.imagen-info p {
  color: white;
  font-size: 0.95rem;
  margin: 0;
  font-weight: 600;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    border-radius: 0;
  }

  .documentos-grid {
    grid-template-columns: 1fr;
  }

  .stats-bar {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>