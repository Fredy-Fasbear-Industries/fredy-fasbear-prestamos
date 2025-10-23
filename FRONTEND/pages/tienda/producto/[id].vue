<template>
  <div class="producto-detalle">
    <header class="page-header">
      <div class="header-content">
        <router-link to="/tienda" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>Volver a la Tienda</span>
        </router-link>
        <div class="header-actions">
          <button class="icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <button class="icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
              <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando producto...</p>
    </main>

    <main v-else-if="producto" class="main-content">
      <div class="content-wrapper">
        <div class="gallery-section">
          <div class="main-image">
            <img :src="imagenActual || '/placeholder.png'" :alt="producto.nombre" />
            <div v-if="producto.descuento > 0" class="discount-badge">
              -{{ producto.descuento }}%
            </div>
            <div v-if="producto.estado === 'Reservado'" class="status-badge">
              Reservado
            </div>
            <div class="image-controls">
              <button @click="prevImagen" :disabled="imagenIndex === 0" class="control-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <button @click="nextImagen" :disabled="imagenIndex === producto.imagenes.length - 1" class="control-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
            <div class="image-indicators">
              <span 
                v-for="(img, idx) in producto.imagenes" 
                :key="idx"
                :class="['indicator', { active: idx === imagenIndex }]"
                @click="imagenIndex = idx"
              ></span>
            </div>
          </div>

          <div v-if="producto.imagenes.length > 1" class="thumbnails">
            <button 
              v-for="(imagen, idx) in producto.imagenes" 
              :key="idx"
              @click="imagenIndex = idx"
              :class="['thumbnail', { active: idx === imagenIndex }]"
            >
              <img :src="imagen || '/placeholder.png'" :alt="`${producto.nombre} ${idx + 1}`" />
            </button>
          </div>
        </div>

        <div class="info-section">
          <div class="product-header">
            <div class="badges">
              <span class="badge category">{{ producto.categoria }}</span>
              <span class="badge condition">{{ producto.condicion }}</span>
              <span v-if="producto.estado === 'Reservado'" class="badge reserved">Reservado</span>
            </div>
            <h1>{{ producto.nombre }}</h1>
          </div>

          <div class="price-section">
            <span class="current-price">Q{{ formatPrice(producto.precio) }}</span>
            <span v-if="producto.precioOriginal" class="original-price">
              Q{{ formatPrice(producto.precioOriginal) }}
            </span>
            <span v-if="producto.descuento > 0" class="discount-tag">
              -{{ producto.descuento }}%
            </span>
          </div>

          <div v-if="producto.enEmpeno" class="empeno-alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2"/>
            </svg>
            <div class="alert-content">
              <p class="alert-title">Artículo en Empeño</p>
              <p v-if="producto.fechaEmpeno" class="alert-text">
                Fecha de empeño: {{ formatFecha(producto.fechaEmpeno) }}
              </p>
            </div>
          </div>

          <div class="description-section">
            <h2>Descripción</h2>
            <p>{{ producto.descripcion || 'Sin descripción disponible' }}</p>
          </div>

          <div class="specs-section">
            <h2>Especificaciones</h2>
            <dl class="specs-list">
              <template v-for="(valor, clave) in producto.especificaciones" :key="clave">
                <dt>{{ clave }}:</dt>
                <dd>{{ valor }}</dd>
              </template>
            </dl>
          </div>

          <button 
            @click="agregarAlCarrito"
            :disabled="producto.estado !== 'Disponible'"
            class="add-to-cart-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.4.4-.1 1.2.4 1.2H17" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ producto.estado === 'Disponible' ? 'Agregar al Carrito' : 'No Disponible' }}
          </button>
        </div>
      </div>

      <div class="comments-section">
        <div class="content-wrapper">
          <div class="comments-header">
            <div class="header-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h2>Comentarios y Valoraciones</h2>
            </div>
            <div class="rating-summary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span class="rating-value">{{ producto.valoracion.toFixed(1) }}</span>
              <span class="rating-count">({{ producto.comentarios?.length || 0 }} valoraciones)</span>
            </div>
          </div>

          <div class="comment-form">
            <h3>Tu valoración</h3>
            <div class="stars-input">
              <button 
                v-for="star in 5" 
                :key="star"
                @click="nuevoComentario.calificacion = star"
                class="star-btn"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" :fill="star <= nuevoComentario.calificacion ? '#d4af37' : 'none'">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#d4af37" stroke-width="2"/>
                </svg>
              </button>
            </div>
            <textarea 
              v-model="nuevoComentario.texto"
              placeholder="Comparte tu experiencia con este producto..."
              rows="4"
            ></textarea>
            <button @click="publicarComentario" class="submit-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2"/>
              </svg>
              Publicar Comentario
            </button>
          </div>

<div class="comments-list">
  <h3>Comentarios de clientes ({{ producto.comentarios?.length || 0 }})</h3>
  <div v-if="!producto.comentarios || producto.comentarios.length === 0" class="no-comments">
    <p>Aún no hay comentarios. ¡Sé el primero en compartir tu opinión!</p>
  </div>
  <div v-else class="comment-items">
    <div v-for="comentario in producto.comentarios" :key="comentario.id" class="comment-item">
      <div class="comment-avatar">
        {{ getInitials(comentario.usuario) }}
      </div>
      <div class="comment-content">
        <div class="comment-header">
          <div>
            <p class="comment-author">{{ comentario.usuario || 'Anónimo' }}</p>
            <p class="comment-date">{{ formatFecha(comentario.fecha) }}</p>
          </div>
          <div class="comment-rating">
            <svg v-for="star in 5" :key="star" width="16" height="16" viewBox="0 0 24 24" :fill="star <= comentario.calificacion ? '#d4af37' : 'none'">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#d4af37" stroke-width="2"/>
            </svg>
          </div>
        </div>
        <p class="comment-text">{{ comentario.comentario }}</p>
      </div>
    </div>
  </div>
</div>
        </div>
      </div>
    </main>

    <div v-if="notification.show" class="notification" :class="notification.type">
      <span>{{ notification.message }}</span>
      <button @click="notification.show = false">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTiendaStore } from '~/stores/tienda'
import { useCarritoStore } from '~/stores/carrito'

definePageMeta({
  layout: 'tienda'
})

const route = useRoute()
const router = useRouter()
const tiendaStore = useTiendaStore()
const carritoStore = useCarritoStore()
const { user } = useAuth()

const config = useRuntimeConfig()
const API_URL = config.public.apiBase

const producto = ref(null)
const loading = ref(false)
const imagenIndex = ref(0)

const nuevoComentario = ref({
  calificacion: 5,
  texto: ''
})

const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

const imagenActual = computed(() => {
  return producto.value?.imagenes?.[imagenIndex.value] || null
})

async function cargarProducto() {
  loading.value = true
  try {
    const id = route.params.id
    producto.value = await tiendaStore.fetchProductoDetalle(id)
  } catch (error) {
    console.error('Error cargando producto:', error)
    mostrarNotificacion('error', 'Error al cargar el producto')
    router.push('/tienda')
  } finally {
    loading.value = false
  }
}

function prevImagen() {
  if (imagenIndex.value > 0) {
    imagenIndex.value--
  }
}

function nextImagen() {
  if (producto.value && imagenIndex.value < producto.value.imagenes.length - 1) {
    imagenIndex.value++
  }
}

async function agregarAlCarrito() {
  if (!producto.value || producto.value.estado !== 'Disponible') return
  
  try {
    await carritoStore.agregarItem({
      id: producto.value.id,
      nombre: producto.value.nombre,
      precio: producto.value.precio,
      imagen: producto.value.imagenes?.[0],
      categoria: producto.value.categoria,
      condicion: producto.value.condicion
    })
    mostrarNotificacion('success', `${producto.value.nombre} agregado al carrito`)
  } catch (error) {
    mostrarNotificacion('error', 'Error al agregar al carrito')
  }
}

async function publicarComentario() {
  if (!nuevoComentario.value.texto.trim()) {
    mostrarNotificacion('error', 'Por favor escribe un comentario')
    return
  }

  if (!user.value) {
    mostrarNotificacion('error', 'Debes iniciar sesión para comentar')
    return
  }
  
  try {
    const response = await $fetch(`${API_URL}/productos/${route.params.id}/comentarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        usuarioId: user.value.id,
        calificacion: nuevoComentario.value.calificacion,
        comentario: nuevoComentario.value.texto
      }
    })

    if (response.success) {
      mostrarNotificacion('success', 'Comentario publicado exitosamente')
      nuevoComentario.value = {
        calificacion: 5,
        texto: ''
      }
      await cargarProducto()
    }
  } catch (error) {
    console.error('Error publicando comentario:', error)
    mostrarNotificacion('error', 'Error al publicar el comentario')
  }
}

function getInitials(nombre) {
  if (!nombre) return 'U'
  if (typeof nombre === 'string') {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  return 'U'
}

function formatPrice(price) {
  return price.toFixed(2)
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-GT', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function mostrarNotificacion(type, message) {
  notification.value = {
    show: true,
    type,
    message
  }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

onMounted(() => {
  cargarProducto()
})
</script>

<style scoped>
.producto-detalle {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #f9fafb;
  border-color: #d4af37;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.main-content {
  padding: 2rem 1rem;
}

.content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.gallery-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  position: relative;
  aspect-ratio: 1;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 0.5rem 1rem;
  background: #8b0000;
  color: white;
  border-radius: 6px;
  font-weight: 600;
}

.status-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 0.5rem 1rem;
  background: #d4af37;
  color: #1a1a1a;
  border-radius: 6px;
  font-weight: 600;
}

.image-controls {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.main-image:hover .image-controls {
  opacity: 1;
}

.control-btn {
  width: 48px;
  height: 48px;
  background: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}

.control-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.image-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.indicator {
  width: 8px;
  height: 8px;
  background: rgba(255,255,255,0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.indicator.active {
  width: 24px;
  background: #d4af37;
  border-radius: 4px;
}

.thumbnails {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.thumbnail {
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.thumbnail:hover {
  border-color: #9ca3af;
}

.thumbnail.active {
  border-color: #d4af37;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.product-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge.category {
  background: #f3f4f6;
  color: #1a1a1a;
  border: 1px solid #d1d5db;
}

.badge.condition {
  background: rgba(27, 67, 50, 0.1);
  color: #1b4332;
  border: 1px solid rgba(27, 67, 50, 0.2);
}

.badge.reserved {
  background: #d4af37;
  color: #1a1a1a;
}

.product-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.current-price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #d4af37;
}

.original-price {
  font-size: 1.25rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.discount-tag {
  padding: 0.375rem 0.75rem;
  background: #8b0000;
  color: white;
  border-radius: 6px;
  font-weight: 600;
}

.empeno-alert {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  border-left: 4px solid #d4af37;
  border-radius: 6px;
}

.empeno-alert svg {
  color: #d4af37;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: #d4af37;
  margin: 0 0 0.25rem 0;
}

.alert-text {
  font-size: 0.875rem;
  color: #4a4a4a;
  margin: 0;
}

.description-section, .specs-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.description-section h2, .specs-section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.description-section p {
  color: #4a4a4a;
  line-height: 1.6;
  margin: 0;
}

.specs-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin: 0;
}

.specs-list dt {
  font-weight: 500;
  color: #6b7280;
}

.specs-list dd {
  font-weight: 600;
  color: #1a1a1a;
  text-align: right;
  margin: 0;
}

.add-to-cart-btn {
  width: 100%;
  padding: 1rem;
  background: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #c9a532;
}

.add-to-cart-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.comments-section {
  padding: 3rem 1rem;
  background: white;
  margin-top: 2rem;
}

.comments-section .content-wrapper {
  grid-template-columns: 1fr;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-left svg {
  color: #d4af37;
}

.header-left h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-summary svg {
  color: #d4af37;
}

.rating-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.rating-count {
  font-size: 0.875rem;
  color: #6b7280;
}

.comment-form {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.comment-form h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.stars-input {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.star-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.star-btn:hover {
  transform: scale(1.1);
}

.comment-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: none;
  margin-bottom: 1rem;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #c9a532;
}

.comments-list h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
}

.no-comments {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
}

.comment-avatar {
  width: 48px;
  height: 48px;
  background: #d4af37;
  color: #1a1a1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 600;
  margin: 0;
}

.comment-date {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.comment-rating {
  display: flex;
  gap: 2px;
}

.comment-text {
  color: #4a4a4a;
  line-height: 1.6;
  margin: 0;
}

.notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  z-index: 100;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification.success {
  border-left: 4px solid #1b4332;
}

.notification.error {
  border-left: 4px solid #8b0000;
}

.notification button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .thumbnails {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>