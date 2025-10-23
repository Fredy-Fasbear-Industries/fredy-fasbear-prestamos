<template>
  <div v-if="mostrar" class="modal-overlay" @click="cerrarModal">
    <div class="modal-firma" @click.stop>
      <div class="modal-header">
        <div class="header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" stroke="currentColor" stroke-width="2"/>
            <path d="M18 2l4 4" stroke="currentColor" stroke-width="2"/>
            <path d="M7.5 10.5L19 2l3 3-8.5 11.5-3.5 1 1-3.5z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="header-content">
          <h3>Firma Digital</h3>
          <p>{{ empresa }} - Solicitud {{ numeroSolicitud }}</p>
        </div>
      </div>

      <div class="modal-body">
        <div class="instrucciones">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          <div class="instrucciones-texto">
            <strong>Instrucciones</strong>
            <ul>
              <li>Firme dentro del cuadro usando su dedo o mouse</li>
              <li>Su firma será vinculada legalmente a este contrato</li>
              <li>Puede borrar y volver a firmar si lo necesita</li>
            </ul>
          </div>
        </div>

        <div class="canvas-container">
          <div class="canvas-header">
            <span>Dibuje su firma aquí</span>
          </div>
          <canvas
            ref="canvas"
            class="canvas-firma"
            @mousedown="iniciarDibujo"
            @mousemove="dibujar"
            @mouseup="detenerDibujo"
            @mouseleave="detenerDibujo"
            @touchstart="iniciarDibujoTouch"
            @touchmove="dibujarTouch"
            @touchend="detenerDibujo"
          ></canvas>
        </div>

        <div class="advertencia">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
          <p>Al firmar digitalmente, usted acepta todos los términos y condiciones del contrato presentado.</p>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="limpiarFirma" class="btn-limpiar" :disabled="!tieneFirma || procesando">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <polyline points="1 4 1 10 7 10" stroke="currentColor" stroke-width="2"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" stroke-width="2"/>
          </svg>
          Limpiar
        </button>
        
        <div class="btn-group">
          <button @click="cerrarModal" class="btn-cancelar" :disabled="procesando">
            Cancelar
          </button>
          <button @click="confirmarFirma" class="btn-confirmar" :disabled="!tieneFirma || procesando">
            <svg v-if="!procesando" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span v-if="procesando" class="spinner"></span>
            {{ procesando ? 'Procesando...' : 'Confirmar Firma' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  mostrar: {
    type: Boolean,
    default: false
  },
  empresa: {
    type: String,
    default: 'Fredy Fasbear Industries'
  },
  numeroSolicitud: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['cerrar', 'confirmar'])

const canvas = ref(null)
const ctx = ref(null)
const dibujando = ref(false)
const tieneFirma = ref(false)
const procesando = ref(false)

watch(() => props.mostrar, async (nuevoValor) => {
  if (nuevoValor) {
    await nextTick()
    await nextTick()
    
    setTimeout(() => {
      if (canvas.value) {
        inicializarCanvas()
      }
    }, 200)
  } else {
    limpiarEstado()
  }
})

const inicializarCanvas = () => {
  if (!canvas.value) {
    console.error('Canvas element no disponible')
    return
  }
  
  const container = canvas.value.parentElement
  if (!container) {
    console.error('Container no disponible')
    return
  }
  
  const width = container.clientWidth
  
  canvas.value.width = width
  canvas.value.height = 250
  
  ctx.value = canvas.value.getContext('2d', { willReadFrequently: true })
  
  if (!ctx.value) {
    console.error('No se pudo obtener el contexto 2D')
    return
  }
  
  ctx.value.fillStyle = '#FFFFFF'
  ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height)
  
  ctx.value.strokeStyle = '#000000'
  ctx.value.lineWidth = 2.5
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
  
  dibujando.value = false
  tieneFirma.value = false
  
  console.log('Canvas inicializado correctamente', { width: canvas.value.width, height: canvas.value.height, hasContext: !!ctx.value })
}

const obtenerCoordenadas = (e) => {
  if (!canvas.value) return { x: 0, y: 0 }
  const rect = canvas.value.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

const iniciarDibujo = (e) => {
  if (!ctx.value || !canvas.value) {
    console.error('Canvas o contexto no disponible al iniciar dibujo')
    return
  }
  
  e.preventDefault()
  dibujando.value = true
  tieneFirma.value = true 
  
  const { x, y } = obtenerCoordenadas(e)
  
  ctx.value.beginPath()
  ctx.value.moveTo(x, y)
}

const dibujar = (e) => {
  if (!dibujando.value || !ctx.value) return
  
  e.preventDefault()
  
  const { x, y } = obtenerCoordenadas(e)
  
  ctx.value.lineTo(x, y)
  ctx.value.stroke()
}

const detenerDibujo = (e) => {
  if (!dibujando.value) return
  e?.preventDefault()
  dibujando.value = false
  if (ctx.value) {
    ctx.value.closePath()
  }
}

const obtenerCoordenadasTouch = (e) => {
  if (!canvas.value) return { x: 0, y: 0 }
  const rect = canvas.value.getBoundingClientRect()
  const touch = e.touches[0]
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  }
}

const iniciarDibujoTouch = (e) => {
  if (!ctx.value || !canvas.value) {
    console.error('Canvas o contexto no disponible al iniciar dibujo touch')
    return
  }
  
  e.preventDefault()
  dibujando.value = true
  tieneFirma.value = true
  
  const { x, y } = obtenerCoordenadasTouch(e)
  
  ctx.value.beginPath()
  ctx.value.moveTo(x, y)
}

const dibujarTouch = (e) => {
  if (!dibujando.value || !ctx.value) return
  
  e.preventDefault()
  
  const { x, y } = obtenerCoordenadasTouch(e)
  
  ctx.value.lineTo(x, y)
  ctx.value.stroke()
}

const limpiarFirma = () => {
  if (!canvas.value || !ctx.value) return
  
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  
  ctx.value.fillStyle = '#FFFFFF'
  ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height)
  
  ctx.value.strokeStyle = '#000000'
  ctx.value.lineWidth = 2.5
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
  
  tieneFirma.value = false
  dibujando.value = false
}

const limpiarEstado = () => {
  dibujando.value = false
  tieneFirma.value = false
  procesando.value = false
  ctx.value = null
}

const cerrarModal = () => {
  if (procesando.value) return
  limpiarEstado()
  emit('cerrar')
}

const confirmarFirma = async () => {
  if (!tieneFirma.value || procesando.value) return
  
  if (!canvas.value) {
    console.error('Canvas no disponible para confirmar firma')
    return
  }
  
  procesando.value = true
  
  try {
    const firmaDataURL = canvas.value.toDataURL('image/png')
    emit('confirmar', firmaDataURL)
  } catch (error) {
    console.error('Error generando imagen de firma:', error)
  } finally {
    setTimeout(() => {
      procesando.value = false
    }, 1000)
  }
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

.modal-firma {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 2rem 1.5rem 2rem;
  background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-content h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.header-content p {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.modal-body {
  padding: 2rem;
}

.instrucciones {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.instrucciones svg {
  color: #3b82f6;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.instrucciones-texto {
  flex: 1;
}

.instrucciones-texto strong {
  display: block;
  color: #1e40af;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.instrucciones-texto ul {
  margin: 0;
  padding-left: 1.25rem;
  list-style: disc;
}

.instrucciones-texto li {
  font-size: 0.813rem;
  color: #1e40af;
  line-height: 1.5;
  margin-bottom: 0.25rem;
}

.canvas-container {
  border: 2px solid #1B4332;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  margin-bottom: 1.5rem;
}

.canvas-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e5e7eb 100%);
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.canvas-header span {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.canvas-firma {
  display: block;
  width: 100%;
  height: 250px;
  cursor: crosshair;
  background: white;
  touch-action: none;
}

.advertencia {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fef3c7;
  border-left: 3px solid #f59e0b;
  border-radius: 8px;
}

.advertencia svg {
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.advertencia p {
  margin: 0;
  font-size: 0.813rem;
  color: #92400e;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 16px 16px;
}

.btn-group {
  display: flex;
  gap: 0.75rem;
}

.btn-limpiar,
.btn-cancelar,
.btn-confirmar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.938rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-limpiar {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-limpiar:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.btn-cancelar {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-cancelar:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-confirmar {
  background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(27, 67, 50, 0.3);
}

.btn-confirmar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 67, 50, 0.4);
}

.btn-limpiar:disabled,
.btn-cancelar:disabled,
.btn-confirmar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .modal-firma {
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    border-radius: 0;
    padding: 1.5rem 1rem 1rem 1rem;
  }

  .modal-body {
    padding: 1.5rem 1rem;
  }

  .modal-footer {
    flex-direction: column;
    padding: 1rem;
  }

  .btn-group {
    width: 100%;
    flex-direction: column;
  }

  .btn-limpiar,
  .btn-cancelar,
  .btn-confirmar {
    width: 100%;
  }
}
</style>