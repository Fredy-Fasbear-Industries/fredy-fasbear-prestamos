<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Realizar Pago</h2>
        <button @click="$emit('close')" class="btn-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="prestamo-info">
          <div class="info-item">
            <span class="label">Saldo Pendiente</span>
            <span class="valor">Q {{ formatCurrency(prestamo.saldoPendiente) }}</span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="pago-form">
          <div class="form-group">
            <label for="monto">Monto a Pagar</label>
            <input
              type="number"
              id="monto"
              v-model.number="formData.monto"
              :max="prestamo.saldoPendiente"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
            >
            <div class="form-hint">
              <button
                type="button"
                @click="pagarTodo"
                class="btn-link"
              >
                Pagar total
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="metodoPago">Método de Pago</label>
            <select
              id="metodoPago"
              v-model="formData.metodoPago"
              required
            >
              <option value="">Selecciona un método</option>
              <option value="deposito">Depósito</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          <template v-if="formData.metodoPago">
            <div class="form-group">
              <label for="fechaDeposito">Fecha del Depósito/Transferencia</label>
              <input
                type="date"
                id="fechaDeposito"
                v-model="formData.fechaDeposito"
                :max="fechaMaxima"
                required
              >
            </div>

            <div class="form-group">
              <label for="nombreBanco">Nombre del Banco</label>
              <input
                type="text"
                id="nombreBanco"
                v-model="formData.nombreBanco"
                placeholder="Ej: Banco Industrial"
                required
                minlength="3"
              >
            </div>

            <div class="form-group">
              <label for="numeroTransaccion">Número de Transacción</label>
              <input
                type="text"
                id="numeroTransaccion"
                v-model="formData.numeroTransaccion"
                placeholder="Ingresa el número de transacción"
                required
                minlength="3"
              >
            </div>

            <div class="form-group">
              <label for="imagenComprobante">Comprobante de Depósito/Transferencia</label>
              <input
                type="file"
                id="imagenComprobante"
                @change="handleFileChange"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                required
              >
              <div class="form-hint-text">
                Formato permitido: JPG, PNG, WebP. Máximo 10MB.
              </div>
              <div v-if="previewImagen" class="preview-container">
                <img :src="previewImagen" alt="Vista previa del comprobante">
                <button type="button" @click="eliminarImagen" class="btn-remove-image">
                  Eliminar imagen
                </button>
              </div>
            </div>
          </template>

          <div class="form-group">
            <label for="observaciones">Observaciones (Opcional)</label>
            <textarea
              id="observaciones"
              v-model="formData.observaciones"
              rows="3"
              placeholder="Agrega cualquier información adicional"
            ></textarea>
          </div>

          <div v-if="errorMensaje" class="error-mensaje">
            {{ errorMensaje }}
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
              :disabled="loading || !formularioValido"
            >
              <span v-if="loading">Validando...</span>
              <span v-else>Confirmar Pago</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const config = useRuntimeConfig()

const props = defineProps({
  prestamo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'confirmar'])

const loading = ref(false)
const errorMensaje = ref('')

const formData = ref({
  monto: 0,
  metodoPago: '',
  fechaDeposito: '',
  nombreBanco: '',
  numeroTransaccion: '',
  observaciones: '',
  imagenComprobante: null
})

const previewImagen = ref(null)

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

const fechaMaxima = computed(() => {
  const hoy = new Date()
  return hoy.toISOString().split('T')[0]
})

const formularioValido = computed(() => {
  if (!formData.value.monto || formData.value.monto <= 0) return false
  if (!formData.value.metodoPago) return false
  if (formData.value.metodoPago) {
    if (!formData.value.fechaDeposito) return false
    if (!formData.value.nombreBanco || formData.value.nombreBanco.trim().length < 3) return false
    if (!formData.value.numeroTransaccion || formData.value.numeroTransaccion.trim().length < 3) return false
    if (!formData.value.imagenComprobante) return false
  }
  return true
})

const pagarTodo = () => {
  formData.value.monto = parseFloat(props.prestamo.saldoPendiente)
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  errorMensaje.value = ''
  
  if (!file) {
    formData.value.imagenComprobante = null
    previewImagen.value = null
    return
  }

  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!tiposPermitidos.includes(file.type)) {
    errorMensaje.value = 'Tipo de archivo no permitido. Use JPG, PNG o WebP.'
    event.target.value = ''
    return
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    errorMensaje.value = 'La imagen no puede superar 10MB.'
    event.target.value = ''
    return
  }

  formData.value.imagenComprobante = file

  const reader = new FileReader()
  reader.onload = (e) => {
    previewImagen.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const eliminarImagen = () => {
  formData.value.imagenComprobante = null
  previewImagen.value = null
  const fileInput = document.getElementById('imagenComprobante')
  if (fileInput) fileInput.value = ''
}

const handleSubmit = async () => {
  if (!formularioValido.value) {
    errorMensaje.value = 'Por favor complete todos los campos requeridos.'
    return
  }

  loading.value = true
  errorMensaje.value = ''

  try {
    const montoNumerico = parseFloat(formData.value.monto)
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      throw new Error('El monto debe ser un número válido mayor a 0')
    }

    const datosPago = {
      monto: montoNumerico,
      metodoPago: formData.value.metodoPago.toLowerCase(),
      fechaDeposito: formData.value.fechaDeposito,
      nombreBanco: formData.value.nombreBanco.trim(),
      numeroTransaccion: formData.value.numeroTransaccion.trim(),
      observaciones: formData.value.observaciones?.trim() || '',
      imagenComprobante: formData.value.imagenComprobante
    }

    emit('confirmar', datosPago)
    
  } catch (error) {
    console.error('Error validando pago:', error)
    errorMensaje.value = error.message || 'Error al validar el pago'
    loading.value = false
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

.prestamo-info {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-size: 0.875rem;
  color: #6B7280;
}

.info-item .valor {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A1A1A;
}

.pago-form {
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

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #D4AF37;
}

.form-group input[type="file"] {
  padding: 0.5rem;
}

.form-hint {
  display: flex;
  justify-content: flex-end;
}

.form-hint-text {
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.25rem;
}

.btn-link {
  background: none;
  border: none;
  color: #D4AF37;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.btn-link:hover {
  color: #B8941F;
}

.preview-container {
  margin-top: 1rem;
  position: relative;
}

.preview-container img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  border: 2px solid #E5E7EB;
}

.btn-remove-image {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.btn-remove-image:hover {
  background: #DC2626;
}

.error-mensaje {
  padding: 0.75rem;
  background: #FEE2E2;
  color: #991B1B;
  border-radius: 8px;
  font-size: 0.875rem;
  border: 1px solid #FECACA;
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
</style>