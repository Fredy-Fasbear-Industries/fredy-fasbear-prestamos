<template>
  <div class="tienda-container">
    <header class="tienda-header">
      <div class="header-content">
        <router-link to="/" class="logo-container">
          <img src="~/assets/images/logo.png" alt="Fredy Fasbear Logo" class="logo-image">
          <div class="logo-text">
            <h1>{{ ecommerceConfig.nombreTienda }}</h1>
            <p>Industries</p>
          </div>  
        </router-link>

        <div class="search-bar">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input 
            v-model="searchQuery"
            type="search" 
            placeholder="Buscar artículos..."
          />
        </div>

        <div class="header-actions">
          <router-link to="/tienda/carrito" class="cart-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.4.4-.1 1.2.4 1.2H17m0 0a2 2 0 100 4 2 2 0 000-4zm-10 0a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span v-if="totalItems > 0" class="cart-badge">{{ totalItems }}</span>
          </router-link>

          <button @click="toggleMenu" class="user-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>

          <div v-if="showMenu" class="dropdown-menu">
            <router-link to="/tienda/pedidos" class="dropdown-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2"/>
              </svg>
              Mis Pedidos
            </router-link>
            <button @click="handleProfileClick" class="dropdown-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ isAuthenticated ? 'Mi Perfil' : 'Iniciar Sesión' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="content-wrapper">
        <div class="section-header">
          <h2>Tienda de Artículos</h2>
          <p>Encuentra artículos únicos a precios accesibles</p>
        </div>

        <div class="filters-container">
          <div class="filter-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Filtros:
          </div>

          <div class="filter-dropdown">
            <button @click="toggleFilter('category')" class="filter-btn">
              Categorías
              <span v-if="activeFilters.categories.length > 0" class="filter-count">
                {{ activeFilters.categories.length }}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            
            <div v-if="showFilters.category" class="filter-panel">
              <div class="filter-panel-header">
                <h4>Categorías</h4>
                <button @click="showFilters.category = false" class="close-panel">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
              <div class="filter-options">
                <label v-for="cat in availableCategories" :key="cat" class="filter-option">
                  <input 
                    type="checkbox" 
                    :checked="activeFilters.categories.includes(cat)"
                    @change="toggleCategory(cat)"
                  >
                  <span>{{ cat }}</span>
                </label>
                <p v-if="availableCategories.length === 0" class="no-options">
                  No hay categorías disponibles
                </p>
              </div>
            </div>
          </div>

          <div class="filter-dropdown">
            <button @click="toggleFilter('condition')" class="filter-btn">
              Condición
              <span v-if="activeFilters.conditions.length > 0" class="filter-count">
                {{ activeFilters.conditions.length }}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>

            <div v-if="showFilters.condition" class="filter-panel">
              <div class="filter-panel-header">
                <h4>Condición</h4>
                <button @click="showFilters.condition = false" class="close-panel">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
              <div class="filter-options">
                <label v-for="cond in availableConditions" :key="cond" class="filter-option">
                  <input 
                    type="checkbox" 
                    :checked="activeFilters.conditions.includes(cond)"
                    @change="toggleCondition(cond)"
                  >
                  <span>{{ cond }}</span>
                </label>
                <p v-if="availableConditions.length === 0" class="no-options">
                  No hay condiciones disponibles
                </p>
              </div>
            </div>
          </div>

          <div class="filter-dropdown">
            <button @click="toggleFilter('price')" class="filter-btn">
              Precio: {{ ecommerceConfig.simboloMoneda }}{{ activeFilters.priceRange[0] }} - {{ ecommerceConfig.simboloMoneda }}{{ activeFilters.priceRange[1] }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>

            <div v-if="showFilters.price" class="filter-panel">
              <div class="filter-panel-header">
                <h4>Rango de Precio</h4>
                <button @click="showFilters.price = false" class="close-panel">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
              <div class="filter-options">
                <div class="price-inputs">
                  <div class="price-input-group">
                    <label>Mínimo</label>
                    <input 
                      type="number" 
                      v-model.number="activeFilters.priceRange[0]"
                      min="0"
                      :max="activeFilters.priceRange[1]"
                      class="price-input"
                    >
                  </div>
                  <div class="price-input-group">
                    <label>Máximo</label>
                    <input 
                      type="number" 
                      v-model.number="activeFilters.priceRange[1]"
                      :min="activeFilters.priceRange[0]"
                      class="price-input"
                    >
                  </div>
                </div>
                <div class="price-range-slider">
                  <input 
                    type="range" 
                    v-model.number="activeFilters.priceRange[0]"
                    min="0" 
                    :max="activeFilters.priceRange[1]"
                    step="100"
                    class="range-slider"
                  >
                  <input 
                    type="range" 
                    v-model.number="activeFilters.priceRange[1]"
                    :min="activeFilters.priceRange[0]"
                    max="10000"
                    step="100"
                    class="range-slider"
                  >
                </div>
              </div>
            </div>
          </div>

          <button v-if="hasActiveFilters" @click="clearFilters" class="clear-btn">
            Limpiar filtros
          </button>
        </div>

        <div class="products-header">
          <p class="results-count">
            Mostrando {{ filteredProducts.length }} de {{ productos.length }} artículos
          </p>
          <select v-model="sortOrder" class="sort-select">
            <option value="recent">Más recientes</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="popular">Más populares</option>
          </select>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando productos...</p>
        </div>

        <div v-else-if="filteredProducts.length > 0" class="products-grid">
          <div v-for="producto in filteredProducts" :key="producto.id" class="product-card">
            <div class="product-image">
              <img :src="producto.imagen || '/placeholder.png'" :alt="producto.nombre" />
              <div v-if="producto.descuento > 0" class="discount-badge">
                -{{ producto.descuento }}%
              </div>
              <div v-if="producto.estado === 'Reservado'" class="status-badge reservado">
                Reservado
              </div>
              <div class="product-overlay">
                <button @click="verDetalle(producto.id)" class="overlay-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button 
                  @click="agregarAlCarrito(producto)" 
                  :disabled="producto.estado !== 'Disponible'"
                  class="overlay-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.4.4-.1 1.2.4 1.2H17" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="product-content">
              <div class="product-badges">
                <span class="badge category">{{ producto.categoria }}</span>
                <span class="badge condition">{{ producto.condicion }}</span>
              </div>
              <h3 class="product-title">{{ producto.nombre }}</h3>
              <div class="product-price">
                <span class="current-price">{{ ecommerceConfig.formatearPrecio(producto.precio) }}</span>
                <span v-if="producto.precioOriginal" class="original-price">
                  {{ ecommerceConfig.formatearPrecio(producto.precioOriginal) }}
                </span>
              </div>
              <button 
                @click="agregarAlCarrito(producto)"
                :disabled="producto.estado !== 'Disponible'"
                class="add-to-cart-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.4.4-.1 1.2.4 1.2H17" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ producto.estado === 'Disponible' ? 'Agregar al Carrito' : 'No Disponible' }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="2"/>
          </svg>
          <h3>No se encontraron artículos</h3>
          <p>Intenta ajustar tus filtros de búsqueda</p>
        </div>
      </div>
    </main>

    <div v-if="notification.show" class="notification" :class="notification.type">
      <div class="notification-content">
        <svg v-if="notification.type === 'success'" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>{{ notification.message }}</span>
      </div>
      <button @click="notification.show = false" class="notification-close">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTiendaStore } from '~/stores/tienda'
import { useCarritoStore } from '~/stores/carrito'
import { useEcommerceConfig } from '~/stores/ecommerceConfig'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'tienda'
})

const router = useRouter()
const tiendaStore = useTiendaStore()
const carritoStore = useCarritoStore()
const ecommerceConfig = useEcommerceConfig()
const { isAuthenticated } = useAuth()

const searchQuery = ref('')
const sortOrder = ref('recent')
const loading = ref(false)
const showMenu = ref(false)

const activeFilters = ref({
  categories: [],
  conditions: [],
  priceRange: [0, 10000]
})

const showFilters = ref({
  category: false,
  condition: false,
  price: false
})

const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

const productos = ref([])
const totalItems = computed(() => carritoStore.totalItems)

const availableCategories = computed(() => {
  const cats = new Set()
  productos.value.forEach(p => {
    if (p.categoria) cats.add(p.categoria)
  })
  return Array.from(cats).sort()
})

const availableConditions = computed(() => {
  const conds = new Set()
  productos.value.forEach(p => {
    if (p.condicion) conds.add(p.condicion)
  })
  return Array.from(conds).sort()
})

const filteredProducts = computed(() => {
  let filtered = [...productos.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.nombre.toLowerCase().includes(query) ||
      p.categoria.toLowerCase().includes(query)
    )
  }

  if (activeFilters.value.categories.length > 0) {
    filtered = filtered.filter(p => 
      activeFilters.value.categories.includes(p.categoria)
    )
  }

  if (activeFilters.value.conditions.length > 0) {
    filtered = filtered.filter(p => 
      activeFilters.value.conditions.includes(p.condicion)
    )
  }

  filtered = filtered.filter(p => 
    p.precio >= activeFilters.value.priceRange[0] && 
    p.precio <= activeFilters.value.priceRange[1]
  )

  switch (sortOrder.value) {
    case 'price-asc':
      filtered.sort((a, b) => a.precio - b.precio)
      break
    case 'price-desc':
      filtered.sort((a, b) => b.precio - a.precio)
      break
    case 'popular':
      filtered.sort((a, b) => b.valoracion - a.valoracion)
      break
  }

  return filtered
})

const hasActiveFilters = computed(() => {
  return activeFilters.value.categories.length > 0 ||
         activeFilters.value.conditions.length > 0 ||
         activeFilters.value.priceRange[0] !== 0 ||
         activeFilters.value.priceRange[1] !== 10000
})

function toggleFilter(type) {
  Object.keys(showFilters.value).forEach(key => {
    if (key !== type) showFilters.value[key] = false
  })
  showFilters.value[type] = !showFilters.value[type]
}

function toggleCategory(category) {
  const index = activeFilters.value.categories.indexOf(category)
  if (index > -1) {
    activeFilters.value.categories.splice(index, 1)
  } else {
    activeFilters.value.categories.push(category)
  }
}

function toggleCondition(condition) {
  const index = activeFilters.value.conditions.indexOf(condition)
  if (index > -1) {
    activeFilters.value.conditions.splice(index, 1)
  } else {
    activeFilters.value.conditions.push(condition)
  }
}

function clearFilters() {
  activeFilters.value = {
    categories: [],
    conditions: [],
    priceRange: [0, 10000]
  }
}

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function handleProfileClick() {
  showMenu.value = false
  if (isAuthenticated.value) {
    router.push('/empeno')
  } else {
    router.push('/login')
  }
}

async function cargarProductos() {
  loading.value = true
  try {
    productos.value = await tiendaStore.fetchProductos()
  } catch (error) {
    mostrarNotificacion('error', 'Error al cargar productos')
  } finally {
    loading.value = false
  }
}

function verDetalle(id) {
  router.push(`/tienda/producto/${id}`)
}

async function agregarAlCarrito(producto) {
  if (producto.estado !== 'Disponible') return
  
  try {
    await carritoStore.agregarItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      categoria: producto.categoria,
      condicion: producto.condicion
    })
    mostrarNotificacion('success', `${producto.nombre} agregado al carrito`)
  } catch (error) {
    mostrarNotificacion('error', 'Error al agregar al carrito')
  }
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

onMounted(async () => {
  await ecommerceConfig.cargarConfiguracion()
  await cargarProductos()
})
</script>

<style scoped>
.tienda-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.tienda-header {
  background: #2c3e50;
  color: white;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
  transition: opacity 0.2s;
}

.logo-container:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: #d4af37;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.logo-text h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.logo-text p {
  font-size: 0.75rem;
  opacity: 0.8;
  margin: 0;
}

.search-bar {
  flex: 1;
  max-width: 28rem;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-bar input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
}

.search-bar input::placeholder {
  color: rgba(255,255,255,0.6);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.cart-btn, .user-btn {
  position: relative;
  padding: 0.5rem;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-btn:hover, .user-btn:hover {
  background: rgba(255,255,255,0.2);
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #d4af37;
  color: #1a1a1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 192px;
  overflow: hidden;
}
.logo-image {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #1a1a1a;
  text-decoration: none;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.main-content {
  padding: 2rem 1rem;
}

.content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 2rem;
}
.price-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.price-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price-input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.price-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 100%;
}

.price-input:focus {
  outline: none;
  border-color: #d4af37;
}

.price-range-slider {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.range-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #d4af37;
  cursor: pointer;
}

.range-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #d4af37;
  cursor: pointer;
  border: none;
}
.section-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.section-header p {
  color: #4a4a4a;
  margin: 0;
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #d4af37;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #1a1a1a;
}

.filter-btn:hover {
  background: #f9fafb;
  border-color: #d4af37;
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #d4af37;
  color: #1a1a1a;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #1a1a1a;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-count {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  color: #1a1a1a;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
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

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border-left: 4px solid transparent;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.product-card:hover {
  border-left-color: #d4af37;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.product-image {
  position: relative;
  aspect-ratio: 1;
  background: #f3f4f6;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.25rem 0.75rem;
  background: #8b0000;
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.reservado {
  background: #d4af37;
  color: #1a1a1a;
}

.product-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.filter-dropdown {
  position: relative;
}

.filter-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  min-width: 250px;
  z-index: 100;
  overflow: hidden;
}

.filter-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.filter-panel-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.close-panel {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  transition: color 0.2s;
}

.close-panel:hover {
  color: #1a1a1a;
}

.filter-options {
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 6px;
}

.filter-option:hover {
  background: #f3f4f6;
}

.filter-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.filter-option span {
  font-size: 0.875rem;
  color: #374151;
}

.no-options {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.overlay-btn {
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  color: #1a1a1a;
}

.overlay-btn:hover {
  transform: scale(1.1);
}

.overlay-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.product-content {
  padding: 1rem;
}

.product-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
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

.product-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.current-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #d4af37;
}

.original-price {
  font-size: 1rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.75rem;
  background: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.empty-state svg {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
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
  gap: 1rem;
  z-index: 100;
  animation: slideIn 0.3s ease-out;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #1a1a1a;
  text-decoration: none;
  transition: background 0.2s;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.price-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.price-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price-input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.price-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 100%;
}

.price-input:focus {
  outline: none;
  border-color: #d4af37;
}

.price-range-slider {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.range-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #d4af37;
  cursor: pointer;
}

.range-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #d4af37;
  cursor: pointer;
  border: none;
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

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-content svg {
  color: #1b4332;
}

.notification.error .notification-content svg {
  color: #8b0000;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
  }
  
  .search-bar {
    order: 3;
    flex-basis: 100%;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-btn {
    width: 100%;
    justify-content: space-between;
  }
}
</style>