<template>
  <div class="admin-panel">
    <header class="admin-header">
      <div class="header-container">
        <div class="header-left">
          <NuxtLink to="/" class="logo">
            <img src="~/assets/images/logo.png" alt="Logo">
            <div>
              <h1>Fredy Fasbear</h1>
              <span class="admin-badge">Panel Admin</span>
            </div>
          </NuxtLink>
        </div>
        
        <div class="header-right">
          <div class="admin-info">
            <span class="welcome-text">{{ userDisplayName }}</span>
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
          </div>
          
          <div class="admin-actions">
            <button class="btn-logout" @click="handleLogout" title="Cerrar Sesión">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando panel de administración...</p>
      </div>
    </div>

    <div v-if="error && !loading" class="error-state">
      <div class="container">
        <div class="error-content">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          <h3>Error al cargar el dashboard</h3>
          <p>{{ error }}</p>
          <button @click="loadDashboardData" class="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    </div>

    <main v-if="!loading && !error" class="admin-main">
      <div class="container">
        
        <section class="dashboard-overview">
          <div class="section-header">
            <h2>Panel de Administración del Sistema</h2>
            <p>Configuración, parámetros y gestión general de Fredy Fasbear Industries</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card users">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21V19C17 17.9 16.1 17 15 17H9C7.9 17 7 17.9 7 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M23 21V19C23 18.1 22.1 17 21 17C20.4 17 19.9 17.2 19.6 17.5" stroke="currentColor" stroke-width="2"/>
                  <path d="M1 21V19C1 18.1 1.9 17 3 17C3.6 17 4.1 17.2 4.4 17.5" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ formatNumber(dashboardStats.totalUsers) }}</h3>
                <p>Usuarios Totales</p>
                <span class="stat-change positive">{{ formatNumber(dashboardStats.clientsCount) }} Clientes</span>
              </div>
            </div>

            <div class="stat-card staff">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ formatNumber(dashboardStats.activeStaff) }}</h3>
                <p>Personal Activo</p>
                <span class="stat-change neutral">{{ formatNumber(dashboardStats.evaluators) }} Evaluadores, {{ formatNumber(dashboardStats.collectors) }} Cobradores</span>
              </div>
            </div>

            <div class="stat-card parameters">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.10405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ formatNumber(dashboardStats.systemParameters) }}</h3>
                <p>Parámetros Configurados</p>
                <span class="stat-change neutral">Tasa actual: {{ formatPercentage(dashboardStats.currentRate) }}</span>
              </div>
            </div>

            <div class="stat-card security">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22S8 18 8 13V7L12 5L16 7V13C16 18 12 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ formatNumber(dashboardStats.activeSessions) }}</h3>
                <p>Registros de Auditoría</p>
                <span class="stat-change positive">Sistema seguro</span>
              </div>
            </div>
          </div>
        </section>

        <section class="admin-modules">
          <div class="section-header">
            <h2>Módulos de Administración del Sistema</h2>
            <p>Gestión de configuraciones, usuarios y parámetros del negocio</p>
          </div>

          <div class="modules-grid">
            <div class="module-card" @click="navigateToModule('/admin/staff')">
              <div class="module-icon staff">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21V19C17 17.9 16.1 17 15 17H9C7.9 17 7 17.9 7 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M23 21V19C23 18.1 22.1 17 21 17C20.4 17 19.9 17.2 19.6 17.5" stroke="currentColor" stroke-width="2"/>
                  <path d="M1 21V19C1 18.1 1.9 17 3 17C3.6 17 4.1 17.2 4.4 17.5" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="module-content">
                <h3>Personal Interno</h3>
                <p>Crear y gestionar evaluadores, cobradores y administradores</p>
                <div class="module-stats">
                  <span>{{ formatNumber(dashboardStats.activeStaff) }} usuarios internos activos</span>
                </div>
              </div>
              <div class="module-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>

            <div class="module-card" @click="navigateToModule('/admin/parameters')">
              <div class="module-icon parameters">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.10405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="module-content">
                <h3>Parámetros del Sistema</h3>
                <p>Configurar tasas, porcentajes, plazos y reglas de negocio</p>
                <div class="module-stats">
                  <span>{{ formatNumber(dashboardStats.systemParameters) }} parámetros configurados</span>
                </div>
              </div>
              <div class="module-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>

            <div class="module-card" @click="navigateToModule('/admin/article-types')">
              <div class="module-icon articles">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M6 3H8L12 7L16 3H18L12 11L18 21H16L12 17L8 21H6L12 11L6 3Z" fill="currentColor"/>
                </svg>
              </div>
              <div class="module-content">
                <h3>Tipos de Artículos</h3>
                <p>Configurar categorías y porcentajes de avalúo por tipo</p>
                <div class="module-stats">
                  <span>{{ formatNumber(dashboardStats.articleTypes) }} tipos configurados</span>
                </div>
              </div>
              <div class="module-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>

            <div class="module-card" @click="navigateToModule('/admin/clients')">
              <div class="module-icon clients">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="module-content">
                <h3>Gestión de Clientes</h3>
                <p>Administrar información y estado de clientes</p>
                <div class="module-stats">
                  <span>{{ formatNumber(dashboardStats.clientsCount) }} clientes registrados</span>
                </div>
              </div>
              <div class="module-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>

            <div class="module-card" @click="navigateToModule('/admin/ecommerce-config')">
              <div class="module-icon ecommerce">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V19C17 19.6 16.6 20 16 20H8C7.4 20 7 19.6 7 19V13" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="module-content">
                <h3>Configuración E-commerce</h3>
                <p>Reglas de transferencia de artículos a tienda</p>
                <div class="module-stats">
                  <span>{{ formatNumber(dashboardStats.storeProducts) }} productos en tienda</span>
                </div>
              </div>
              <div class="module-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>

            <div class="module-card" @click="navigateToModule('/admin/system-reports')">
              <div class="module-icon reports">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" stroke-width="2"/>
                  <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="module-content">
                <h3>Reportes del Sistema</h3>
                <p>Estadísticas generales y reportes de configuración</p>
                <div class="module-stats">
                  <span>Informes administrativos</span>
                </div>
              </div>
              <div class="module-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>

            <div class="module-card" @click="navigateToModule('/admin/audit-logs')">
              <div class="module-icon audit">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22S8 18 8 13V7L12 5L16 7V13C16 18 12 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="module-content">
                <h3>Auditoría y Seguridad</h3>
                <p>Logs de actividad y auditoría del sistema</p>
                <div class="module-stats">
                  <span>{{ formatNumber(dashboardStats.activeSessions) }} registros recientes</span>
                </div>
              </div>
              <div class="module-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>

            <div class="module-card" @click="navigateToModule('/admin/backups')">
              <div class="module-icon backups">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="module-content">
                <h3>Respaldos del Sistema</h3>
                <p>Gestión de copias de seguridad y recuperación</p>
                <div class="module-stats">
                  <span>Último respaldo exitoso</span>
                </div>
              </div>
              <div class="module-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>

            <div class="module-card" @click="navigateToModule('/admin/pedidos')">
              <div class="module-icon orders">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="module-content">
                <h3>Gestión de Pedidos</h3>
                <p>Administrar estados y seguimiento de pedidos de tienda</p>
                <div class="module-stats">
                  <span>Controlar preparación, envío y entrega</span>
                </div>
              </div>
              <div class="module-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section class="recent-activity">
          <div class="section-header">
            <h2>Actividad Administrativa Reciente</h2>
            <button class="btn-secondary" @click="loadRecentActivity" :disabled="loadingActivity">
              {{ loadingActivity ? 'Actualizando...' : 'Ver Historial Completo' }}
            </button>
          </div>

          <div class="activity-list">
            <div v-if="loadingActivity" style="text-align: center; padding: 2rem; color: #95a5a6;">
              Cargando actividad reciente...
            </div>
            
            <div v-else-if="recentActivity.length === 0" style="text-align: center; padding: 2rem; color: #95a5a6;">
              No hay actividad reciente para mostrar
            </div>

            <div v-else class="activity-item" v-for="activity in recentActivity" :key="activity.id">
              <div class="activity-icon" :class="activity.type">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle v-if="activity.type === 'parameter'" cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  <path v-else-if="activity.type === 'user'" d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" stroke-width="2"/>
                  <path v-else-if="activity.type === 'system'" d="M12 22S8 18 8 13V7L12 5L16 7V13C16 18 12 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                  <circle v-else cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="activity-content">
                <p class="activity-text">{{ activity.description }}</p>
                <span class="activity-time">{{ formatTimeAgo(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'admin'
})

useHead({
  title: 'Panel de Administración - Fredy Fasbear',
  meta: [
    { name: 'description', content: 'Panel de administración del sistema' }
  ]
})

const { user, logout } = useAuth()
const { 
  loading, 
  error, 
  getAdminStats,
  getRecentActivity,
  formatNumber, 
  formatPercentage 
} = useAdminDashboard()

const dashboardStats = ref({
  totalUsers: 0,
  clientsCount: 0,
  activeStaff: 0,
  evaluators: 0,
  collectors: 0,
  systemParameters: 0,
  currentRate: 0,
  activeSessions: 0,
  articleTypes: 0,
  storeProducts: 0,
  newUsersToday: 0,
  pendingRequests: 0,
  overdueLoans: 0
})

const refreshInterval = ref(null)
const recentActivity = ref([])
const loadingActivity = ref(false)

const userDisplayName = computed(() => {
  if (!user.value) return 'Administrador'
  
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido || ''
  
  if (nombre && apellido) {
    return `${nombre} ${apellido}`
  } else if (nombre) {
    return nombre
  } else if (user.value.email) {
    return user.value.email.split('@')[0]
  }
  
  return 'Administrador'
})

const transformActivityData = (activityData) => {
  const activities = []
  
  if (activityData.recentSessions && activityData.recentSessions.length > 0) {
    activityData.recentSessions.forEach(session => {
      activities.push({
        id: `session-${session.id}`,
        type: 'user',
        description: `Inicio de sesión: ${session.usuario.nombre} ${session.usuario.apellido} (${session.usuario.tipoUsuario})`,
        timestamp: new Date(session.fechaInicio)
      })
    })
  }
  
  if (activityData.recentRequests && activityData.recentRequests.length > 0) {
    activityData.recentRequests.forEach(request => {
      const userName = `${request.usuario.nombre} ${request.usuario.apellido}`
      activities.push({
        id: `request-${request.solicitudPrestamoId}`,
        type: 'system',
        description: `Nueva solicitud de préstamo por ${userName} - Estado: ${request.estadoSolicitud}`,
        timestamp: new Date(request.fechaSolicitud)
      })
    })
  }
  
  if (activityData.recentPayments && activityData.recentPayments.length > 0) {
    activityData.recentPayments.forEach(payment => {
      const solicitud = payment.prestamo?.contrato?.solicitud
      const userName = solicitud?.usuario
        ? `${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`
        : 'Usuario'

      const monto = parseFloat(payment.montoPago) || 0

      activities.push({
        id: `payment-${payment.pagoId}`,
        type: 'parameter',
        description: `Pago registrado de Q${monto.toFixed(2)} por ${userName}`,
        timestamp: new Date(payment.fechaPago)
      })
    })
  }
  
  activities.sort((a, b) => b.timestamp - a.timestamp)
  
  return activities.slice(0, 8)
}

const loadRecentActivity = async () => {
  try {
    loadingActivity.value = true
    
    const activityData = await getRecentActivity(15)
    recentActivity.value = transformActivityData(activityData)
    
  } catch (err) {
    console.error('Error cargando actividad reciente:', err)
    
    recentActivity.value = [{
      id: 'error-1',
      type: 'system',
      description: 'No se pudo cargar la actividad reciente. Intente refrescar.',
      timestamp: new Date()
    }]
  } finally {
    loadingActivity.value = false
  }
}

const loadDashboardData = async () => {
  try {
    console.log('Cargando panel de administración...')
    
    const stats = await getAdminStats()
    dashboardStats.value = stats
    
    await loadRecentActivity()
    
    console.log('Panel cargado exitosamente')
    
  } catch (err) {
    console.error('Error cargando panel:', err)
  }
}

const startAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    console.log('Actualizando estadísticas...')
    loadDashboardData()
  }, 5 * 60 * 1000)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const handleLogout = () => {
  stopAutoRefresh()
  logout()
  navigateTo('/')
}

const getUserInitials = () => {
  if (!user.value) return 'A'
  
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido || ''
  
  const inicialNombre = nombre.charAt(0).toUpperCase()
  const inicialApellido = apellido.charAt(0).toUpperCase()
  
  return `${inicialNombre}${inicialApellido}` || 'A'
}

const navigateToModule = (path) => {
  console.log(`Navegando a: ${path}`)
  navigateTo(path)
}

const formatTimeAgo = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes}m`
  if (hours < 24) return `Hace ${hours}h`
  return timestamp.toLocaleDateString('es-GT')
}

onMounted(() => {
  loadDashboardData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.admin-panel {
  min-height: 100vh;
  background: #F5F5F5;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(245, 245, 245, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #F5F5F5;
  border-top: 4px solid #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #4A4A4A;
  font-weight: 500;
  margin: 0;
}

.error-state {
  padding: 4rem 0;
}

.error-content {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 500px;
  margin: 0 auto;
}

.error-content svg {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-content h3 {
  color: #2C3E50;
  margin-bottom: 0.5rem;
}

.error-content p {
  color: #4A4A4A;
  margin-bottom: 2rem;
}

.btn-retry {
  background: #D4AF37;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #B8941F;
  transform: translateY(-2px);
}

.admin-header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
}

.logo img {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  line-height: 1;
}

.admin-badge {
  background: #D4AF37;
  color: #1A1A1A;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.welcome-text {
  font-weight: 500;
  color: #D4AF37;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A1A1A;
  font-weight: bold;
  font-size: 0.9rem;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-logout {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #ff6b6b;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: rgba(231, 76, 60, 0.3);
  color: white;
}

.admin-main {
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  color: #2C3E50;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: #4A4A4A;
  margin: 0;
}

.dashboard-overview {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stat-card.users { border-left-color: #3498DB; }
.stat-card.staff { border-left-color: #27AE60; }
.stat-card.parameters { border-left-color: #D4AF37; }
.stat-card.security { border-left-color: #9B59B6; }

.stat-icon {
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.users .stat-icon {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.stat-card.staff .stat-icon {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.stat-card.parameters .stat-icon {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.stat-card.security .stat-icon {
  background: rgba(155, 89, 182, 0.1);
  color: #9B59B6;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
  color: #2C3E50;
}

.stat-content p {
  color: #4A4A4A;
  margin: 0 0 0.5rem;
  font-weight: 500;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.stat-change.positive {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.stat-change.neutral {
  background: rgba(149, 165, 166, 0.1);
  color: #95A5A6;
}

.admin-modules {
  margin-bottom: 3rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.module-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-color: #D4AF37;
}

.module-icon {
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.module-icon.staff {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.module-icon.parameters {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.module-icon.articles {
  background: rgba(155, 89, 182, 0.1);
  color: #9B59B6;
}

.module-icon.clients {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.module-icon.ecommerce {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.module-icon.reports {
  background: rgba(26, 188, 156, 0.1);
  color: #1ABC9C;
}

.module-icon.audit {
  background: rgba(52, 73, 94, 0.1);
  color: #34495E;
}

.module-icon.backups {
  background: rgba(243, 156, 18, 0.1);
  color: #F39C12;
}

.module-icon.orders {
  background: rgba(41, 128, 185, 0.1);
  color: #2980B9;
}

.module-content {
  flex: 1;
}

.module-content h3 {
  color: #2C3E50;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
}

.module-content p {
  color: #4A4A4A;
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
}

.module-stats {
  font-size: 0.8rem;
  color: #95a5a6;
  font-weight: 500;
}

.module-arrow {
  color: #bdc3c7;
  transition: all 0.3s ease;
}

.module-card:hover .module-arrow {
  color: #D4AF37;
  transform: translateX(4px);
}

.recent-activity .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-secondary {
  background: #F5F5F5;
  border: 1px solid #e9ecef;
  color: #4A4A4A;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #e9ecef;
  color: #2C3E50;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.activity-list {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #F5F5F5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.parameter {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.activity-icon.user {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.activity-icon.system {
  background: rgba(52, 73, 94, 0.1);
  color: #34495E;
}

.activity-icon.backup {
  background: rgba(243, 156, 18, 0.1);
  color: #F39C12;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #2C3E50;
  font-weight: 500;
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
}

.activity-time {
  color: #95a5a6;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .header-container {
    padding: 0 1rem;
  }
  
  .recent-activity .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .admin-main {
    padding: 1rem 0;
  }
  
  .section-header h2 {
    font-size: 1.5rem;
  }
  
  .module-card {
    padding: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
}
</style>