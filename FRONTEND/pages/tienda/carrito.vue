<template>
  <div class="carrito-page">
    <header class="page-header">
      <div class="header-content">
        <router-link to="/tienda" class="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
          </svg>
          Continuar comprando
        </router-link>
      </div>
    </header>

    <main class="main-content" v-if="items.length > 0">
      <div class="content-wrapper">
        <div class="cart-section">
          <div class="section-header">
            <h1>Carrito de Compras</h1>
            <button @click="vaciarCarrito" class="clear-cart-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
              </svg>
              Vaciar carrito
            </button>
          </div>

          <div class="cart-items">
            <div v-for="item in items" :key="item.id" class="cart-item">
              <div class="item-image">
                <img :src="item.imagen || '/placeholder.png'" :alt="item.nombre" />
              </div>

              <div class="item-details">
                <div class="item-header">
                  <div class="item-info">
                    <router-link :to="`/tienda/producto/${item.id}`" class="item-name">
                      {{ item.nombre }}
                    </router-link>
                    <div class="item-meta">
                      <span class="meta-badge">{{ item.categoria }}</span>
                      <span class="meta-badge condition">{{ item.condicion }}</span>
                    </div>
                  </div>
                  <button @click="eliminarItem(item.id)" class="remove-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>

                <div class="item-actions">
                  <div class="quantity-controls">
                    <button 
                      @click="actualizarCantidad(item.id, item.cantidad - 1)"
                      class="qty-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                    <span class="quantity">{{ item.cantidad }}</span>
                    <button 
                      @click="actualizarCantidad(item.id, item.cantidad + 1)"
                      class="qty-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                  </div>

                  <div class="item-price">
                    <p class="total-price">{{ ecommerceConfig.formatearPrecio(item.precio * item.cantidad) }}</p>
                    <p v-if="item.cantidad > 1" class="unit-price">
                      {{ ecommerceConfig.formatearPrecio(item.precio) }} c/u
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="summary-section">
          <div class="summary-card">
            <h2>Resumen del Pedido</h2>
            
            <div class="summary-details">
              <div class="summary-row">
                <span>Subtotal ({{ totalItems }} artículos)</span>
                <span class="amount">{{ ecommerceConfig.formatearPrecio(subtotal) }}</span>
              </div>
              <div v-if="!ecommerceConfig.ivaIncluido" class="summary-row">
                <span>IVA ({{ ecommerceConfig.porcentajeIva }}%)</span>
                <span class="amount">{{ ecommerceConfig.formatearPrecio(montoIva) }}</span>
              </div>
              <div v-else class="summary-row tax-included">
                <span>IVA ({{ ecommerceConfig.porcentajeIva }}% incluido)</span>
                <span class="amount">{{ ecommerceConfig.formatearPrecio(montoIva) }}</span>
              </div>
              <div class="summary-row">
                <span>Envío</span>
                <span class="amount free">{{ infoEnvio.esGratis ? 'Gratis' : ecommerceConfig.formatearPrecio(infoEnvio.costo) }}</span>
              </div>
            </div>

            <div v-if="!infoEnvio.esGratis && infoEnvio.faltaParaGratis > 0" class="shipping-promo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
              </svg>
              <p>¡Agrega {{ ecommerceConfig.formatearPrecio(infoEnvio.faltaParaGratis) }} más para envío gratis!</p>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-total">
              <span>Total</span>
              <span class="total-amount">{{ ecommerceConfig.formatearPrecio(totalFinal) }}</span>
            </div>

            <button @click="procederPago" class="checkout-btn">
              Proceder al Pago
            </button>

            <button @click="$router.push('/tienda')" class="continue-btn">
              Continuar Comprando
            </button>

            <div class="summary-features">
              <div class="feature">
                <div class="feature-icon">✓</div>
                <span>{{ ecommerceConfig.diasDevolucion }} días para devoluciones</span>
              </div>
              <div class="feature">
                <div class="feature-icon">✓</div>
                <span>{{ ecommerceConfig.diasGarantia }} días de garantía</span>
              </div>
              <div class="feature">
                <div class="feature-icon">✓</div>
                <span>Pago seguro</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <div v-else class="empty-cart">
      <div class="empty-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.4.4-.1 1.2.4 1.2H17m0 0a2 2 0 100 4 2 2 0 000-4zm-10 0a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h2>Tu carrito está vacío</h2>
      <p>Agrega artículos a tu carrito para continuar con tu compra</p>
      <button @click="$router.push('/tienda')" class="shop-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
        </svg>
        Volver a la Tienda
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarritoStore } from '~/stores/carrito'
import { useEcommerceConfig } from '~/stores/ecommerceConfig'

definePageMeta({
  layout: 'tienda'
})

const router = useRouter()
const carritoStore = useCarritoStore()
const ecommerceConfig = useEcommerceConfig()

const items = computed(() => carritoStore.items)
const totalItems = computed(() => carritoStore.totalItems)
const totalPrice = computed(() => carritoStore.totalPrice)

const subtotal = computed(() => {
  if (ecommerceConfig.ivaIncluido) {
    return totalPrice.value / (1 + ecommerceConfig.porcentajeIva / 100)
  }
  return totalPrice.value
})

const montoIva = computed(() => {
  return subtotal.value * (ecommerceConfig.porcentajeIva / 100)
})

const infoEnvio = computed(() => {
  return ecommerceConfig.obtenerInfoEnvio(totalPrice.value, false)
})

const totalFinal = computed(() => {
  let total = ecommerceConfig.ivaIncluido ? totalPrice.value : subtotal.value + montoIva.value
  total += infoEnvio.value.costo
  return total
})

function eliminarItem(id) {
  carritoStore.eliminarItem(id)
}

function actualizarCantidad(id, cantidad) {
  carritoStore.actualizarCantidad(id, cantidad)
}

function vaciarCarrito() {
  if (confirm('¿Estás seguro de vaciar el carrito?')) {
    carritoStore.vaciarCarrito()
  }
}

function procederPago() {
  router.push('/tienda/pago')
}

onMounted(async () => {
  await ecommerceConfig.cargarConfiguracion()
})
</script>

<style scoped>
.carrito-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
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

.main-content {
  padding: 2rem 1rem;
}

.content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.cart-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.clear-cart-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #8b0000;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s;
}

.clear-cart-btn:hover {
  color: #6b0000;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.item-image {
  width: 96px;
  height: 96px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;
  transition: color 0.2s;
}

.item-name:hover {
  color: #d4af37;
}

.item-meta {
  display: flex;
  gap: 0.5rem;
}

.meta-badge {
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.meta-badge.condition {
  background: rgba(27, 67, 50, 0.1);
  color: #1b4332;
  border-color: rgba(27, 67, 50, 0.2);
}

.remove-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: #8b0000;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.remove-btn:hover {
  background: rgba(139, 0, 0, 0.1);
}

.item-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: #f9fafb;
  border-color: #d4af37;
}

.quantity {
  min-width: 48px;
  text-align: center;
  font-weight: 600;
}

.item-price {
  text-align: right;
}

.total-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #d4af37;
  margin: 0 0 0.25rem 0;
}

.unit-price {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.summary-section {
  position: sticky;
  top: 24px;
  height: fit-content;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.summary-card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1.5rem 0;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.summary-row .amount {
  font-weight: 600;
}

.summary-row .amount.free {
  color: #1b4332;
}

.summary-row.tax-included {
  color: #9ca3af;
  font-size: 0.8rem;
}

.shipping-promo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fefce8, #fef9e7);
  border-radius: 8px;
  margin: 0.5rem 0;
}

.shipping-promo svg {
  color: #d4af37;
  flex-shrink: 0;
}

.shipping-promo p {
  margin: 0;
  color: #92400e;
  font-weight: 600;
  font-size: 0.875rem;
}

.summary-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1rem 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1.5rem;
}

.summary-total span:first-child {
  font-size: 1.125rem;
  font-weight: 600;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #d4af37;
}

.checkout-btn {
  width: 100%;
  padding: 0.875rem;
  background: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 0.75rem;
}

.checkout-btn:hover {
  background: #c9a532;
}

.continue-btn {
  width: 100%;
  padding: 0.875rem;
  background: transparent;
  color: #1a1a1a;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.continue-btn:hover {
  background: #f9fafb;
  border-color: #d4af37;
}

.summary-features {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.feature-icon {
  width: 16px;
  height: 16px;
  background: #1b4332;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 700;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  width: 120px;
  height: 120px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon svg {
  color: #9ca3af;
}

.empty-cart h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.empty-cart p {
  color: #6b7280;
  margin: 0 0 2rem 0;
}

.shop-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #d4af37;
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.shop-btn:hover {
  background: #c9a532;
}

@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .summary-section {
    position: static;
  }
}
</style>