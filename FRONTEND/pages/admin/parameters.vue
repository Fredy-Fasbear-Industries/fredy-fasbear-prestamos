  <template>
  <div class="admin-parametros">
    <!-- Botón de regreso al panel de administración -->
    <div class="navigation-header">
      <NuxtLink to="/admin" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="12,19 5,12 12,5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver al Panel de Administración
      </NuxtLink>
    </div>

    <div class="header-section">
      <div class="page-title">
        <div class="title-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2"/>
            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2569 9.77251 19.9859C9.5799 19.7148 9.31074 19.5063 9 19.38C8.69838 19.2469 8.36381 19.2072 8.03941 19.266C7.71502 19.3248 7.41568 19.4795 7.18 19.71L7.12 19.77C6.93425 19.956 6.71368 20.1035 6.47088 20.2041C6.22808 20.3048 5.96783 20.3566 5.705 20.3566C5.44217 20.3566 5.18192 20.3048 4.93912 20.2041C4.69632 20.1035 4.47575 19.956 4.29 19.77C4.10405 19.5843 3.95653 19.3637 3.85588 19.1209C3.75523 18.8781 3.70343 18.6178 3.70343 18.355C3.70343 18.0922 3.75523 17.8319 3.85588 17.5891C3.95653 17.3463 4.10405 17.1257 4.29 16.94L4.35 16.88C4.58054 16.6443 4.73519 16.345 4.794 16.0206C4.85282 15.6962 4.81312 15.3616 4.68 15.06C4.55324 14.7642 4.34276 14.512 4.07447 14.3343C3.80618 14.1566 3.49179 14.0613 3.17 14.06H3C2.46957 14.06 1.96086 13.8493 1.58579 13.4742C1.21071 13.0991 1 12.5904 1 12.06C1 11.5296 1.21071 11.0209 1.58579 10.6458C1.96086 10.2707 2.46957 10.06 3 10.06H3.09C3.42099 10.0523 3.742 9.94512 4.01309 9.75251C4.28417 9.5599 4.49265 9.29074 4.62 8.98C4.75312 8.67838 4.79282 8.34381 4.734 8.01941C4.67519 7.69502 4.52054 7.39568 4.29 7.16L4.23 7.1C4.04405 6.91425 3.89653 6.69368 3.79588 6.45088C3.69523 6.20808 3.64343 5.94783 3.64343 5.685C3.64343 5.42217 3.69523 5.16192 3.79588 4.91912C3.89653 4.67632 4.04405 4.45575 4.23 4.27C4.41575 4.08405 4.63632 3.93653 4.87912 3.83588C5.12192 3.73523 5.38217 3.68343 5.645 3.68343C5.90783 3.68343 6.16808 3.73523 6.41088 3.83588C6.65368 3.93653 6.87425 4.08405 7.06 4.27L7.12 4.33C7.35568 4.56054 7.65502 4.71519 7.97941 4.774C8.30381 4.83282 8.63838 4.79312 8.94 4.66C9.23579 4.53324 9.48797 4.32276 9.66569 4.05447C9.84342 3.78618 9.93871 3.47179 9.94 3.15V3C9.94 2.46957 10.1507 1.96086 10.5258 1.58579C10.9009 1.21071 11.4096 1 11.94 1C12.4704 1 12.9791 1.21071 13.3542 1.58579C13.7293 1.96086 13.94 2.46957 13.94 3V3.09C13.9413 3.41179 14.0366 3.72618 14.2143 3.99447C14.392 4.26276 14.6442 4.47324 14.94 4.6C15.2416 4.73312 15.5762 4.77282 15.9006 4.714C16.225 4.65519 16.5243 4.50054 16.76 4.27L16.82 4.21C17.0057 4.02405 17.2263 3.87653 17.4691 3.77588C17.7119 3.67523 17.9722 3.62343 18.235 3.62343C18.4978 3.62343 18.7581 3.67523 19.0009 3.77588C19.2437 3.87653 19.4643 4.02405 19.65 4.21C19.836 4.39575 19.9835 4.61632 20.0841 4.85912C20.1848 5.10192 20.2366 5.36217 20.2366 5.625C20.2366 5.88783 20.1848 6.14808 20.0841 6.39088C19.9835 6.63368 19.836 6.85425 19.65 7.04L19.59 7.1C19.3595 7.33568 19.2048 7.63502 19.146 7.95941C19.0872 8.28381 19.1269 8.61838 19.26 8.92C19.3868 9.21579 19.5972 9.46797 19.8655 9.64569C20.1338 9.82342 20.4482 9.91871 20.77 9.92H20.93C21.4604 9.92 21.9691 10.1307 22.3442 10.5058C22.7193 10.8809 22.93 11.3896 22.93 11.92C22.93 12.4504 22.7193 12.9591 22.3442 13.3342C21.9691 13.7093 21.4604 13.92 20.93 13.92H20.84C20.5182 13.9213 20.2038 14.0166 19.9355 14.1943C19.6672 14.372 19.4568 14.6242 19.33 14.92C19.1969 15.2216 19.1572 15.5562 19.216 15.8806C19.2748 16.205 19.4295 16.5043 19.66 16.74L19.72 16.8C19.906 16.9857 20.0535 17.2063 20.1541 17.4491C20.2548 17.7019 20.3066 17.9622 20.3066 18.225C20.3066 18.4878 20.2548 18.7481 20.1541 18.9909C20.0535 19.2337 19.906 19.4543 19.72 19.64C19.5343 19.826 19.3137 19.9735 19.0709 20.0741C18.8281 20.1748 18.5678 20.2266 18.305 20.2266C18.0422 20.2266 17.7819 20.1748 17.5391 20.0741C17.2963 19.9735 17.0757 19.826 16.89 19.64L16.83 19.58C16.5943 19.3495 16.295 19.1948 15.9706 19.136C15.6462 19.0772 15.3116 19.1169 15.01 19.25C14.7142 19.3768 14.462 19.5872 14.2843 19.8555C14.1066 20.1238 14.0113 20.4382 14.01 20.76V20.92C14.01 21.4504 13.7993 21.9591 13.4242 22.3342C13.0491 22.7093 12.5404 22.92 12.01 22.92C11.4796 22.92 10.9709 22.7093 10.5958 22.3342C10.2207 21.9591 10.01 21.4504 10.01 20.92V20.83C10.0087 20.5082 9.91342 20.1938 9.73569 19.9255C9.55797 19.6572 9.30579 19.4468 9.01 19.32C8.70838 19.1869 8.37381 19.1472 8.04941 19.206C7.72502 19.2648 7.42568 19.4195 7.19 19.65L7.13 19.71C6.94425 19.896 6.72368 20.0435 6.48088 20.1441C6.23808 20.2448 5.97783 20.2966 5.715 20.2966C5.45217 20.2966 5.19192 20.2448 4.94912 20.1441C4.70632 20.0435 4.48575 19.896 4.3 19.71C4.11405 19.5243 3.96653 19.3037 3.86588 19.0609C3.76523 18.8181 3.71343 18.5578 3.71343 18.295C3.71343 18.0322 3.76523 17.7719 3.86588 17.5291C3.96653 17.2863 4.11405 17.0657 4.3 16.88L4.36 16.82C4.59054 16.5843 4.74519 16.285 4.804 15.9606C4.86282 15.6362 4.82312 15.3016 4.69 15C4.56324 14.7042 4.35276 14.452 4.08447 14.2743C3.81618 14.0966 3.50179 14.0013 3.18 14H3C2.46957 14 1.96086 13.7893 1.58579 13.4142C1.21071 13.0391 1 12.5304 1 12C1 11.4696 1.21071 10.9609 1.58579 10.5858C1.96086 10.2107 2.46957 10 3 10H3.09C3.41179 9.99871 3.72618 9.90342 3.99447 9.72569C4.26276 9.54797 4.47324 9.29579 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29579 4.55324 9.54797 4.34276 9.72569 4.07447C9.90342 3.80618 9.99871 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29579 19.6572 9.54797 19.9255 9.72569C20.1938 9.90342 20.5082 9.99871 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15V15Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div>
          <h1>Parámetros del Sistema</h1>
          <p>Configuración y gestión de los parámetros operativos</p>
        </div>
      </div>
      
      <button @click="cargarParametros" class="btn-primary" :disabled="loading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Actualizar
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando parámetros del sistema...</p>
      </div>
    </div>

    <div v-if="error && !loading" class="error-state">
      <div class="error-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>Error al cargar parámetros</h3>
        <p>{{ error }}</p>
        <button @click="cargarParametros" class="btn-retry">
          Reintentar
        </button>
      </div>
    </div>

    <div v-if="!loading && !error" class="parametros-content">
      <!-- Estadísticas resumen -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
          <h3>{{ totalParametrosSistema }}</h3>
            <p>Parámetros Configurados</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ ultimaModificacion }}</h3>
            <p>Última Modificación</p>
          </div>
        </div>
      </div>

      <!-- Filtros de búsqueda -->
      <div class="filtros-section">
        <div class="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input 
            v-model="filtros.busqueda" 
            type="text" 
            placeholder="Buscar parámetros por nombre o descripción..."
          >
        </div>

        <div class="filter-controls">
          <select v-model="filtros.tipoDato" class="filter-select">
            <option value="">Todos los tipos</option>
            <option value="STRING">Texto</option>
            <option value="INTEGER">Entero</option>
            <option value="DECIMAL">Decimal</option>
            <option value="BOOLEAN">Booleano</option>
            <option value="DATE">Fecha</option>
          </select>
        </div>
      </div>

      <!-- Lista de parámetros -->
      <div class="parametros-grid">
        <div 
          v-for="parametro in parametrosFiltrados" 
          :key="parametro.id" 
          class="parametro-card"
          :class="{ 'editando': parametroEditando?.id === parametro.id }"
        >
          <div class="parametro-header">
            <div class="parametro-info">
              <h3>{{ parametro.nombreParametro }}</h3>
              <span class="tipo-badge" :class="parametro.tipoDato.toLowerCase()">
                {{ formatTipoDato(parametro.tipoDato) }}
              </span>
            </div>
            <div class="parametro-actions">
              <button 
                v-if="parametroEditando?.id !== parametro.id"
                @click="iniciarEdicion(parametro)" 
                class="btn-edit"
                title="Editar parámetro"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                  <path d="M18.5 2.50001C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.50001C21.8978 2.89784 22.1213 3.43739 22.1213 4.00001C22.1213 4.56262 21.8978 5.10218 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="parametro-content">
            <div v-if="parametroEditando?.id !== parametro.id" class="parametro-display">
              <div class="valor-actual">
                <label>Valor actual:</label>
                <div class="valor-display" :class="parametro.tipoDato.toLowerCase()">
                  {{ formatValorParametro(parametro.valorParametro, parametro.tipoDato) }}
                </div>
              </div>
              
              <div v-if="parametro.descripcion" class="descripcion">
                <label>Descripción:</label>
                <p>{{ parametro.descripcion }}</p>
              </div>

              <div class="metadata">
                <div class="metadata-item">
                  <span class="label">Modificado por:</span>
                  <span class="value">{{ formatUsuarioModifico(parametro.usuarioModifico) }}</span>
                </div>
                <div class="metadata-item">
                  <span class="label">Fecha:</span>
                  <span class="value">{{ formatFecha(parametro.fechaModificacion) }}</span>
                </div>
              </div>
            </div>

            <!-- Formulario de edición -->
            <div v-else class="parametro-edit-form">
              <div class="form-group">
                <label>Nuevo valor:</label>
                <input 
                  v-if="parametro.tipoDato === 'STRING'"
                  v-model="parametroEditando.valorParametro"
                  type="text"
                  class="form-input"
                  :placeholder="parametro.valorParametro"
                >
                <input 
                  v-else-if="parametro.tipoDato === 'INTEGER'"
                  v-model.number="parametroEditando.valorParametro"
                  type="number"
                  step="1"
                  class="form-input"
                  :placeholder="parametro.valorParametro"
                >
                <input 
                  v-else-if="parametro.tipoDato === 'DECIMAL'"
                  v-model.number="parametroEditando.valorParametro"
                  type="number"
                  step="0.01"
                  class="form-input"
                  :placeholder="parametro.valorParametro"
                >
                <select 
                  v-else-if="parametro.tipoDato === 'BOOLEAN'"
                  v-model="parametroEditando.valorParametro"
                  class="form-input"
                >
                  <option value="true">Verdadero</option>
                  <option value="false">Falso</option>
                </select>
                <input 
                  v-else-if="parametro.tipoDato === 'DATE'"
                  v-model="parametroEditando.valorParametro"
                  type="date"
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label>Descripción:</label>
                <textarea 
                  v-model="parametroEditando.descripcion"
                  class="form-textarea"
                  rows="2"
                  :placeholder="parametro.descripcion || 'Descripción del parámetro...'"
                ></textarea>
              </div>

              <div class="form-actions">
                <button @click="guardarParametro" class="btn-save" :disabled="guardando">
                  <svg v-if="!guardando" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2"/>
                    <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2"/>
                    <polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <div v-else class="mini-spinner"></div>
                  {{ guardando ? 'Guardando...' : 'Guardar' }}
                </button>
                <button @click="cancelarEdicion" class="btn-cancel">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="parametrosFiltrados.length === 0 && !loading" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12L12 16L16 12" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>No se encontraron parámetros</h3>
        <p>No hay parámetros que coincidan con los filtros aplicados.</p>
      </div>
    </div>

    <!-- Notificación -->
    <div v-if="notificacion.mostrar" class="notification" :class="notificacion.tipo">
      <div class="notification-content">
        <svg v-if="notificacion.tipo === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>{{ notificacion.mensaje }}</span>
      </div>
      <button @click="cerrarNotificacion" class="notification-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'admin'
})

useHead({
  title: 'Administración de Parámetros - Fredy Fasbear',
  meta: [
    { name: 'description', content: 'Gestión de parámetros del sistema' }
  ]
})

const { getSystemParameters, updateSystemParameter } = useAdminDashboard()

const loading = ref(false)
const error = ref(null)
const guardando = ref(false)

const parametrosData = ref([])
const parametroEditando = ref(null)

const filtros = ref({
  busqueda: '',
  tipoDato: ''
})

const notificacion = ref({
  mostrar: false,
  tipo: 'success',
  mensaje: ''
})

const parametrosFiltrados = computed(() => {
  let resultado = [...parametrosData.value]
   
  resultado = resultado.filter(parametro => 
    !parametro.nombreParametro.startsWith('ECOMMERCE_')
  )


  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(parametro => 
      parametro.nombreParametro.toLowerCase().includes(busqueda) ||
      (parametro.descripcion && parametro.descripcion.toLowerCase().includes(busqueda))
    )
  }

  if (filtros.value.tipoDato) {
    resultado = resultado.filter(parametro => 
      parametro.tipoDato === filtros.value.tipoDato
    )
  }

  return resultado
})


const ultimaModificacion = computed(() => {
  if (parametrosData.value.length === 0) return 'N/A'
  
  const fechas = parametrosData.value
    .map(p => new Date(p.fechaModificacion))
    .sort((a, b) => b - a)
  
  return formatFechaRelativa(fechas[0])
})

const cargarParametros = async () => {
  try {
    loading.value = true
    error.value = null
    
    const parametros = await getSystemParameters()
    parametrosData.value = parametros
    
  } catch (err) {
    error.value = err.message || 'Error cargando parámetros'
  } finally {
    loading.value = false
  }
}

const iniciarEdicion = (parametro) => {
  parametroEditando.value = {
    id: parametro.id,
    valorParametro: parametro.valorParametro,
    descripcion: parametro.descripcion || ''
  }
}

const cancelarEdicion = () => {
  parametroEditando.value = null
}

const guardarParametro = async () => {
  if (!parametroEditando.value) return

  try {
    guardando.value = true
    
    const parametroActualizado = await updateSystemParameter(
      parametroEditando.value.id,
      parametroEditando.value.valorParametro,
      parametroEditando.value.descripcion
    )

    const index = parametrosData.value.findIndex(p => p.id === parametroActualizado.id)
    if (index !== -1) {
      parametrosData.value[index] = {
        ...parametrosData.value[index],
        ...parametroActualizado
      }
    }

    mostrarNotificacion('success', 'Parámetro actualizado correctamente')
    parametroEditando.value = null
    
  } catch (err) {
    mostrarNotificacion('error', err.message || 'Error actualizando parámetro')
  } finally {
    guardando.value = false
  }
}

const mostrarNotificacion = (tipo, mensaje) => {
  notificacion.value = {
    mostrar: true,
    tipo,
    mensaje
  }

  setTimeout(() => {
    notificacion.value.mostrar = false
  }, 5000)
}

const cerrarNotificacion = () => {
  notificacion.value.mostrar = false
}

const formatTipoDato = (tipo) => {
  const tipos = {
    STRING: 'Texto',
    INTEGER: 'Entero',
    DECIMAL: 'Decimal',
    BOOLEAN: 'Booleano',
    DATE: 'Fecha'
  }
  return tipos[tipo] || tipo
}

const totalParametrosSistema = computed(() => {
  // Filtrar parámetros excluyendo los de ecommerce
  return parametrosData.value.filter(parametro => 
    !parametro.nombreParametro.startsWith('ECOMMERCE_')
  ).length
})

const formatValorParametro = (valor, tipo) => {
  if (!valor) return 'No definido'
  
  switch (tipo) {
    case 'BOOLEAN':
      return valor === 'true' ? 'Verdadero' : 'Falso'
    case 'DECIMAL':
      return parseFloat(valor).toLocaleString('es-GT', { minimumFractionDigits: 2 })
    case 'INTEGER':
      return parseInt(valor).toLocaleString('es-GT')
    case 'DATE':
      return new Date(valor).toLocaleDateString('es-GT')
    default:
      return valor
  }
}

const formatUsuarioModifico = (usuario) => {
  if (!usuario) return 'Sistema'
  return `${usuario.nombre} ${usuario.apellido}`
}

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFechaRelativa = (fecha) => {
  const ahora = new Date()
  const diferencia = ahora - fecha
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
  
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`
  return `Hace ${Math.floor(dias / 30)} meses`
}

onMounted(() => {
  cargarParametros()
})
</script>

<style scoped>
.admin-parametros {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.navigation-header {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #f7fafc;
  border-color: #d1d5db;
  color: #2d3748;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title h1 {
  font-size: 1.875rem;
  font-weight: bold;
  color: #2C3E50;
  margin: 0;
}

.page-title p {
  color: #4A4A4A;
  margin: 0.25rem 0 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #D4AF37;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #B8941F;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-content {
  text-align: center;
  max-width: 400px;
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
}

.parametros-content {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content h3 {
  font-size: 1.875rem;
  font-weight: bold;
  color: #2C3E50;
  margin: 0;
}

.stat-content p {
  color: #4A4A4A;
  margin: 0.25rem 0 0;
  font-weight: 500;
}

.filtros-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 300px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar svg {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.parametros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.parametro-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.parametro-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.parametro-card.editando {
  border-color: #D4AF37;
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.2);
}

.parametro-header {
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
}

.parametro-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2C3E50;
  margin: 0 0 0.5rem;
}

.tipo-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.tipo-badge.string { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.tipo-badge.integer { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.tipo-badge.decimal { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.tipo-badge.boolean { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.tipo-badge.date { background: rgba(236, 72, 153, 0.1); color: #ec4899; }

.btn-edit {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit:hover {
  background: rgba(212, 175, 55, 0.2);
}

.parametro-content {
  padding: 1rem 1.5rem 1.5rem;
}

.parametro-display .valor-actual {
  margin-bottom: 1rem;
}

.parametro-display label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.valor-display {
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.875rem;
  color: #2d3748;
}

.valor-display.boolean { color: #8b5cf6; }
.valor-display.integer,
.valor-display.decimal { color: #10b981; }

.descripcion {
  margin-bottom: 1rem;
}

.descripcion p {
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4a5568;
  margin: 0.5rem 0 0;
  line-height: 1.5;
}

.metadata {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-item .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.metadata-item .value {
  font-size: 0.875rem;
  color: #374151;
}

.parametro-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.btn-save:hover:not(:disabled) {
  background: #059669;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.btn-cancel:hover {
  background: #4b5563;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-state svg {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-left: 4px solid;
  z-index: 1000;
  min-width: 300px;
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  border-left-color: #10b981;
}

.notification.error {
  border-left-color: #ef4444;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.notification.success .notification-content svg {
  color: #10b981;
}

.notification.error .notification-content svg {
  color: #ef4444;
}

.notification-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: #f3f4f6;
  color: #374151;
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

@media (max-width: 768px) {
  .admin-parametros {
    padding: 1rem;
  }

  .header-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filtros-section {
    flex-direction: column;
  }

  .search-bar {
    min-width: auto;
  }

  .parametros-grid {
    grid-template-columns: 1fr;
  }

  .metadata {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    min-width: auto;
  }
}
</style>