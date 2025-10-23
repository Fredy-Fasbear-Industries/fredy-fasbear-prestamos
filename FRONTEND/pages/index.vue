<template>
  <div class="homepage">
    <!-- Header -->
    <header class="header">
      <nav class="nav-container">
        <NuxtLink to="/" class="logo">
          <img src="~/assets/images/logo.png" alt="Logo">
        </NuxtLink>
        
        <ul class="nav-menu" :class="{ show: mobileMenuOpen }">
          <li>
            <button @click="handleEmpenoClick" class="nav-link-btn">
              Empeño
            </button>
          </li>
          <li>
            <button @click="handleTiendaClick" class="nav-link-btn">
              Tienda
            </button>
          </li>
          <li>
            <button @click="handleCuentaClick" class="nav-link-btn">
              {{ isLoggedIn ? 'Mi Cuenta' : 'Iniciar Sesión' }}
            </button>
          </li>
          <!-- Mostrar opción de logout si está logueado -->
          <li v-if="isLoggedIn">
            <button @click="handleLogout" class="nav-link-btn logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
              </svg>
              Salir
            </button>
          </li>
        </ul>

        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero" id="inicio">
      <!-- Floating decorative elements -->
      <div class="floating-shape floating-shape-1">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M6 3H8L12 7L16 3H18L12 11L18 21H16L12 17L8 21H6L12 11L6 3Z" fill="currentColor"/>
        </svg>
      </div>
      <div class="floating-shape floating-shape-2">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      </div>
      <div class="floating-shape floating-shape-3">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <h2 class="hero-subtitle">
            {{ isLoggedIn ? `Bienvenido, ${user?.nombre || 'Cliente'}` : 'Bienvenido a nuestro servicio' }}
          </h2>
          <h1 class="hero-title">Empeña y Compra con Confianza</h1>
          <p class="hero-description">
            Te brindamos préstamos por tus artículos y precios accesibles en tus compras. 
            Una experiencia única de empeño y comercio con la confianza y elegancia que nos caracteriza.
          </p>
          
          <div class="cta-buttons">
            <button @click="handleTiendaClick" class="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V19C17 19.6 16.6 20 16 20H8C7.4 20 7 19.6 7 19V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Nuestra Tienda
            </button>
            <button @click="handleEmpenoClick" class="btn btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Empieza A Empeñar Tus Productos
            </button>
          </div>
        </div>

        <div class="hero-image">
          <div class="banner-image"></div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="features-container">
        <h2 class="section-title">¿Por qué elegirnos?</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M6 3H8L12 7L16 3H18L12 11L18 21H16L12 17L8 21H6L12 11L6 3Z" fill="currentColor"/>
              </svg>
            </div>
            <h3 class="feature-title">Avalúo Profesional</h3>
            <p class="feature-description">
              Evaluamos tus artículos con criterios profesionales para ofrecerte el mejor valor por tus pertenencias.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
              </svg>
            </div>
            <h3 class="feature-title">Proceso Rápido</h3>
            <p class="feature-description">
              Obtén tu préstamo en minutos con nuestro sistema digital optimizado y contratos electrónicos.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M12 22S8 18 8 13C8 10.8 9.8 9 12 9S16 10.8 16 13C16 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" fill="none"/>
                <circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <h3 class="feature-title">Máxima Seguridad</h3>
            <p class="feature-description">
              Tus artículos están protegidos con la más alta seguridad mientras gestionamos tu préstamo.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M3 3H21V19H3V3Z" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M9 9H15V15H9V9Z" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M3 9H7M17 9H21M3 15H7M17 15H21" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="feature-title">Tienda Premium</h3>
            <p class="feature-description">
              Encuentra artículos únicos en nuestra tienda con precios accesibles y calidad garantizada.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="feature-title">Plataforma Digital</h3>
            <p class="feature-description">
              Gestiona todo desde tu móvil: solicitudes, pagos, seguimiento y compras en línea.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M16 21V19C16 17.9 15.1 17 14 17H10C8.9 17 8 17.9 8 19V21" stroke="currentColor" stroke-width="2" fill="none"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <h3 class="feature-title">Confianza Total</h3>
            <p class="feature-description">
              Más de una década brindando servicios de empeño con transparencia y profesionalismo.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({
  title: 'Empeña y Compra con Confianza',
  meta: [
    { name: 'description', content: 'Te brindamos préstamos por tus artículos y precios accesibles en tus compras.' }
  ]
})

// Reactive state
const mobileMenuOpen = ref(false)

// Auth composable
const { isLoggedIn, user, logout, requireAuthWithMessage, initAuth } = useAuth()

// Methods
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Función para obtener la ruta según el tipo de usuario
const getRoleBasedRoute = () => {
  if (!isLoggedIn.value || !user.value) {
    return null
  }

  switch (user.value.tipoUsuario) {
    case 'Administrador':
      return '/admin'
    case 'Cliente':
      return '/dashboard'
    case 'Evaluador':
      return '/evaluador'
    case 'Cobrador':
      return '/collector'
    default:
      return '/dashboard'
  }
}

// Auth-protected navigation handlers
const handleEmpenoClick = () => {
  closeMobileMenu()
  
  if (isLoggedIn.value) {
    // Si está logueado, redirigir al panel correspondiente
    const roleRoute = getRoleBasedRoute()
    if (roleRoute) {
      navigateTo(roleRoute)
    }
  } else {
    // Si no está logueado, redirigir al login con mensaje
    requireAuthWithMessage('Para acceder al servicio de empeño, debes iniciar sesión primero')
  }
}

const handleCuentaClick = () => {
  closeMobileMenu()
  
  if (isLoggedIn.value) {
    // Si está logueado, redirigir al panel correspondiente
    const roleRoute = getRoleBasedRoute()
    if (roleRoute) {
      navigateTo(roleRoute)
    }
  } else {
    // Si no está logueado, ir al login
    navigateTo('/login')
  }
}

const handleTiendaClick = () => {
  closeMobileMenu()
  
  if (isLoggedIn.value) {
    navigateTo('/tienda?logged=true')
  } else {
    navigateTo('/tienda')
  }
}

const handleLogout = () => {
  closeMobileMenu()
  logout()
  
  // Mostrar mensaje de confirmación
  if (process.client) {
    alert('Has cerrado sesión exitosamente')
  }
  
  // Recargar la página para actualizar el estado
  window.location.reload()
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// Smooth scrolling function
const smoothScrollTo = (target) => {
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// Header background on scroll
const handleScroll = () => {
  if (process.client) {
    const header = document.querySelector('.header')
    if (header) {
      if (window.scrollY > 100) {
        header.style.background = 'linear-gradient(135deg, rgba(44, 62, 80, 0.95), rgba(26, 26, 26, 0.95))'
      } else {
        header.style.background = 'linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%)'
      }
    }
  }
}

// Lifecycle
onMounted(() => {
  // Inicializar autenticación
  initAuth()
  
  if (process.client) {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        smoothScrollTo(target)
      })
    })

    // Header scroll effect
    window.addEventListener('scroll', handleScroll)

    // Loading animation
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.5s ease'
    setTimeout(() => {
      document.body.style.opacity = '1'
    }, 100)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.homepage {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #1A1A1A;
  overflow-x: hidden;
}

/* Header */
.header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo {
  display: flex;
  align-items: center;
  height: 50px;
}

.logo img {
  height: 100%;
  width: auto;
  object-fit: contain;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  align-items: center;
}

.nav-link-btn {
  background: none;
  border: none;
  color: #F5F5F5;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  padding: 0.5rem 0;
  font-size: 1rem;
  font-family: inherit;
}

.nav-link-btn:hover {
  color: #D4AF37;
}

.nav-link-btn::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #D4AF37;
  transition: width 0.3s ease;
}

.nav-link-btn:hover::after {
  width: 100%;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ff6b6b !important;
}

.logout-btn:hover {
  color: #ff5252 !important;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: #F5F5F5;
  font-size: 1.5rem;
  cursor: pointer;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 50%, #1A1A1A 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding-top: 80px;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23D4AF37" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 2;
}

.hero-content {
  animation: slideInLeft 1s ease-out;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #F5F5F5;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.hero-subtitle {
  font-size: 1.3rem;
  color: #D4AF37;
  margin-bottom: 1rem;
  font-weight: 600;
}

.hero-description {
  font-size: 1.1rem;
  color: #F5F5F5;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  line-height: 1.8;
}

.cta-buttons {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  color: #1A1A1A;
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(212, 175, 55, 0.6);
}

.btn-secondary {
  background: transparent;
  color: #F5F5F5;
  border: 2px solid #D4AF37;
}

.btn-secondary:hover {
  background: #D4AF37;
  color: #1A1A1A;
  transform: translateY(-2px);
}

.hero-image {
  position: relative;
  animation: slideInRight 1s ease-out;
}

.banner-image {
  width: 100%;
  height: 500px;
  background-image: url('~/assets/images/banner.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

/* Features Section */
.features {
  padding: 6rem 0;
  background: #F5F5F5;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
}

.feature-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border-top: 4px solid #D4AF37;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
}

.feature-icon {
  margin-bottom: 1.5rem;
  color: #D4AF37;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 1rem;
}

.feature-description {
  color: #4A4A4A;
  line-height: 1.7;
}

/* Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
    flex-direction: column;
    padding: 1rem;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  }

  .nav-menu.show {
    display: flex;
  }

  .mobile-menu-btn {
    display: block;
  }

  .hero-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .hero-image {
    display: none;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .cta-buttons {
    justify-content: center;
  }

  .btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .feature-card {
    padding: 2rem;
  }

  .nav-container {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

/* Floating Elements */
.floating-shape {
  position: absolute;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
  color: #D4AF37;
}

.floating-shape-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.floating-shape-2 {
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.floating-shape-3 {
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}
</style>