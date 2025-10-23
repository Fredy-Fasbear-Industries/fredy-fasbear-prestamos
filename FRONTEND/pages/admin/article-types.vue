<template>
  <div class="admin-tipos-articulos">
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
            <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h1>Tipos de Artículos</h1>
          <p>Gestión de categorías y configuración de avalúos</p>
        </div>
      </div>
      
      <div class="header-actions">
        <button @click="cargarTiposArticulos" class="btn-secondary" :disabled="loading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Actualizar
        </button>
        
        <button @click="mostrarModalCrear = true" class="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Nuevo Tipo
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando tipos de artículos...</p>
      </div>
    </div>

    <div v-if="error && !loading" class="error-state">
      <div class="error-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>Error al cargar tipos de artículos</h3>
        <p>{{ error }}</p>
        <button @click="cargarTiposArticulos" class="btn-retry">
          Reintentar
        </button>
      </div>
    </div>

    <div v-if="!loading && !error" class="tipos-content">
      <!-- Estadísticas resumen -->
      <div class="stats-overview">
        <div class="stat-card active">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ tiposActivos }}</h3>
            <p>Tipos Activos</p>
          </div>
        </div>

        <div class="stat-card total">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 2V6H15V2M9 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2H15M9 2H15" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ tiposArticulosData.length }}</h3>
            <p>Total Configurados</p>
          </div>
        </div>

        <div class="stat-card electronic">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20L18 4H6L4 6ZM4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6M9 10V14M15 10V14" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ tiposElectronicos }}</h3>
            <p>Requieren Info Electrónica</p>
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
            placeholder="Buscar tipos de artículos por nombre..."
          >
        </div>

        <div class="filter-controls">
          <select v-model="filtros.estado" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>

          <select v-model="filtros.requiereElectronico" class="filter-select">
            <option value="">Todos los tipos</option>
            <option value="true">Requiere info electrónica</option>
            <option value="false">No requiere info electrónica</option>
          </select>
        </div>
      </div>

      <!-- Lista de tipos de artículos -->
      <div class="tipos-grid">
        <div 
          v-for="tipo in tiposFiltrados" 
          :key="tipo.id" 
          class="tipo-card"
          :class="{ 
            'inactivo': tipo.estado === 'Inactivo',
            'editando': tipoEditando?.id === tipo.id 
          }"
        >
          <div class="tipo-header">
            <div class="tipo-info">
              <h3>{{ tipo.nombre }}</h3>
              <div class="tipo-badges">
                <span 
                  class="estado-badge" 
                  :class="tipo.estado.toLowerCase()"
                >
                  {{ tipo.estado }}
                </span>
                <span 
                  v-if="tipo.requiereElectronico" 
                  class="electronic-badge"
                >
                  Electrónico
                </span>
              </div>
            </div>
            <div class="tipo-actions">
              <button 
                v-if="tipoEditando?.id !== tipo.id"
                @click="iniciarEdicion(tipo)" 
                class="btn-edit"
                title="Editar tipo de artículo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                  <path d="M18.5 2.50001C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.50001C21.8978 2.89784 22.1213 3.43739 22.1213 4.00001C22.1213 4.56262 21.8978 5.10218 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              
              <button 
                @click="toggleEstado(tipo)" 
                class="btn-toggle"
                :class="tipo.estado.toLowerCase()"
                :title="tipo.estado === 'Activo' ? 'Desactivar' : 'Activar'"
              >
                <svg v-if="tipo.estado === 'Activo'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="tipo-content">
            <div v-if="tipoEditando?.id !== tipo.id" class="tipo-display">
              <div class="porcentajes-avaluo">
                <label>Porcentajes de avalúo:</label>
                <div class="porcentaje-range">
                  <span class="porcentaje-min">{{ tipo.porcentajeMinAvaluo }}%</span>
                  <div class="range-bar">
                    <div 
                      class="range-fill" 
                      :style="{ 
                        left: tipo.porcentajeMinAvaluo + '%',
                        width: (tipo.porcentajeMaxAvaluo - tipo.porcentajeMinAvaluo) + '%'
                      }"
                    ></div>
                  </div>
                  <span class="porcentaje-max">{{ tipo.porcentajeMaxAvaluo }}%</span>
                </div>
              </div>

              <div class="metadata">
                <div class="metadata-item">
                  <span class="label">Información electrónica:</span>
                  <span class="value">{{ tipo.requiereElectronico ? 'Requerida' : 'No requerida' }}</span>
                </div>
                <div class="metadata-item">
                  <span class="label">Creado:</span>
                  <span class="value">{{ formatFecha(tipo.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Formulario de edición -->
            <div v-else class="tipo-edit-form">
              <div class="form-group">
                <label>Nombre del tipo:</label>
                <input 
                  v-model="tipoEditando.nombre"
                  type="text"
                  class="form-input"
                  placeholder="Ej: Joyas, Electrónicos, Herramientas..."
                >
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Porcentaje mínimo de avalúo (%):</label>
                  <input 
                    v-model.number="tipoEditando.porcentajeMinAvaluo"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="form-input"
                  >
                </div>
                <div class="form-group">
                  <label>Porcentaje máximo de avalúo (%):</label>
                  <input 
                    v-model.number="tipoEditando.porcentajeMaxAvaluo"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="form-input"
                  >
                </div>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    v-model="tipoEditando.requiereElectronico"
                    type="checkbox"
                    class="form-checkbox"
                  >
                  <span class="checkbox-text">Requiere información electrónica (serie, modelo, etc.)</span>
                </label>
              </div>

              <div class="form-actions">
                <button @click="guardarTipo" class="btn-save" :disabled="guardando">
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
      <div v-if="tiposFiltrados.length === 0 && !loading" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M9 2V6H15V2M9 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2H15M9 2H15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>No se encontraron tipos de artículos</h3>
        <p>No hay tipos que coincidan con los filtros aplicados.</p>
      </div>
    </div>

    <!-- Modal para crear nuevo tipo -->
    <div v-if="mostrarModalCrear" class="modal-overlay" @click="cerrarModalCrear">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Crear Nuevo Tipo de Artículo</h2>
          <button @click="cerrarModalCrear" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Nombre del tipo:</label>
            <input 
              v-model="nuevoTipo.nombre"
              type="text"
              class="form-input"
              placeholder="Ej: Joyas, Electrónicos, Herramientas..."
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Porcentaje mínimo de avalúo (%):</label>
              <input 
                v-model.number="nuevoTipo.porcentajeMinAvaluo"
                type="number"
                min="0"
                max="100"
                step="0.1"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label>Porcentaje máximo de avalúo (%):</label>
              <input 
                v-model.number="nuevoTipo.porcentajeMaxAvaluo"
                type="number"
                min="0"
                max="100"
                step="0.1"
                class="form-input"
              >
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="nuevoTipo.requiereElectronico"
                type="checkbox"
                class="form-checkbox"
              >
              <span class="checkbox-text">Requiere información electrónica (serie, modelo, etc.)</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="cerrarModalCrear" class="btn-cancel">
            Cancelar
          </button>
          <button @click="crearTipo" class="btn-primary" :disabled="creando">
            <div v-if="creando" class="mini-spinner"></div>
            {{ creando ? 'Creando...' : 'Crear Tipo' }}
          </button>
        </div>
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
  title: 'Tipos de Artículos - Administración',
  meta: [
    { name: 'description', content: 'Gestión de tipos de artículos y configuración de avalúos' }
  ]
})

const { getArticleTypes, updateArticleType, createArticleType, toggleArticleTypeStatus } = useAdminDashboard()

const loading = ref(false)
const error = ref(null)
const guardando = ref(false)
const creando = ref(false)

const tiposArticulosData = ref([])
const tipoEditando = ref(null)
const mostrarModalCrear = ref(false)

const filtros = ref({
  busqueda: '',
  estado: '',
  requiereElectronico: ''
})

const nuevoTipo = ref({
  nombre: '',
  porcentajeMinAvaluo: 60,
  porcentajeMaxAvaluo: 80,
  requiereElectronico: false
})

const notificacion = ref({
  mostrar: false,
  tipo: 'success',
  mensaje: ''
})

const tiposFiltrados = computed(() => {
  let resultado = [...tiposArticulosData.value]

  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(tipo => 
      tipo.nombre.toLowerCase().includes(busqueda)
    )
  }

  if (filtros.value.estado) {
    resultado = resultado.filter(tipo => 
      tipo.estado === filtros.value.estado
    )
  }

  if (filtros.value.requiereElectronico) {
    const requiere = filtros.value.requiereElectronico === 'true'
    resultado = resultado.filter(tipo => 
      tipo.requiereElectronico === requiere
    )
  }

  return resultado
})

const tiposActivos = computed(() => {
  return tiposArticulosData.value.filter(tipo => tipo.estado === 'Activo').length
})

const tiposElectronicos = computed(() => {
  return tiposArticulosData.value.filter(tipo => tipo.requiereElectronico).length
})

const cargarTiposArticulos = async () => {
  try {
    loading.value = true
    error.value = null
    
    const tipos = await getArticleTypes()
    tiposArticulosData.value = tipos
    
  } catch (err) {
    error.value = err.message || 'Error cargando tipos de artículos'
  } finally {
    loading.value = false
  }
}

const iniciarEdicion = (tipo) => {
  tipoEditando.value = {
    id: tipo.id,
    nombre: tipo.nombre,
    porcentajeMinAvaluo: parseFloat(tipo.porcentajeMinAvaluo),
    porcentajeMaxAvaluo: parseFloat(tipo.porcentajeMaxAvaluo),
    requiereElectronico: tipo.requiereElectronico
  }
}

const cancelarEdicion = () => {
  tipoEditando.value = null
}

const guardarTipo = async () => {
  if (!tipoEditando.value) return

  if (!validarDatos(tipoEditando.value)) return

  try {
    guardando.value = true
    
    const tipoActualizado = await updateArticleType(
      tipoEditando.value.id,
      tipoEditando.value
    )

    const index = tiposArticulosData.value.findIndex(t => t.id === tipoActualizado.id)
    if (index !== -1) {
      tiposArticulosData.value[index] = tipoActualizado
    }

    mostrarNotificacion('success', 'Tipo de artículo actualizado correctamente')
    tipoEditando.value = null
    
  } catch (err) {
    mostrarNotificacion('error', err.message || 'Error actualizando tipo de artículo')
  } finally {
    guardando.value = false
  }
}

const crearTipo = async () => {
  if (!validarDatos(nuevoTipo.value)) return

  try {
    creando.value = true
    
    const tipoCreado = await createArticleType(nuevoTipo.value)
    tiposArticulosData.value.push(tipoCreado)

    mostrarNotificacion('success', 'Tipo de artículo creado correctamente')
    cerrarModalCrear()
    
  } catch (err) {
    mostrarNotificacion('error', err.message || 'Error creando tipo de artículo')
  } finally {
    creando.value = false
  }
}

const toggleEstado = async (tipo) => {
  try {
    const tipoActualizado = await toggleArticleTypeStatus(tipo.id)
    
    const index = tiposArticulosData.value.findIndex(t => t.id === tipo.id)
    if (index !== -1) {
      tiposArticulosData.value[index] = tipoActualizado
    }

    const accion = tipoActualizado.estado === 'Activo' ? 'activado' : 'desactivado'
    mostrarNotificacion('success', `Tipo de artículo ${accion} correctamente`)
    
  } catch (err) {
    mostrarNotificacion('error', err.message || 'Error cambiando estado del tipo')
  }
}

const validarDatos = (datos) => {
  if (!datos.nombre?.trim()) {
    mostrarNotificacion('error', 'El nombre es obligatorio')
    return false
  }

  if (datos.porcentajeMinAvaluo < 0 || datos.porcentajeMinAvaluo > 100) {
    mostrarNotificacion('error', 'El porcentaje mínimo debe estar entre 0 y 100')
    return false
  }

  if (datos.porcentajeMaxAvaluo < 0 || datos.porcentajeMaxAvaluo > 100) {
    mostrarNotificacion('error', 'El porcentaje máximo debe estar entre 0 y 100')
    return false
  }

  if (datos.porcentajeMinAvaluo >= datos.porcentajeMaxAvaluo) {
    mostrarNotificacion('error', 'El porcentaje mínimo debe ser menor al máximo')
    return false
  }

  return true
}

const cerrarModalCrear = () => {
  mostrarModalCrear.value = false
  nuevoTipo.value = {
    nombre: '',
    porcentajeMinAvaluo: 60,
    porcentajeMaxAvaluo: 80,
    requiereElectronico: false
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

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  cargarTiposArticulos()
})
</script>

<style scoped>
/* ===== VARIABLES CSS CON PALETA CORPORATIVA EXACTA ===== */
:root {
  /* Colores principales del logo */
  --color-negro-carbon: #1A1A1A;
  --color-blanco-perla: #F5F5F5;
  --color-gris-acero: #4A4A4A;
  --color-azul-marino: #2C3E50;
  
  /* Colores complementarios */
  --color-dorado-vintage: #D4AF37;
  --color-dorado-claro: #F4D03F;
  --color-rojo-granate: #8B0000;
  --color-marron-chocolate: #3E2723;
  --color-verde-bosque: #1B4332;

  /* Utilidades */
  --border-radius: 12px;
  --shadow-card: 0 15px 35px rgba(26, 26, 26, 0.2);
  --transition: all 0.3s ease;
}

/* ===== ESTILOS BASE ===== */
.admin-tipos-articulos {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
  padding: 2rem;
}

/* ===== NAVEGACIÓN ===== */
.navigation-header {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: 1px solid rgba(212, 175, 55, 0.5);
  color: var(--color-dorado-vintage);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.btn-back:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--color-dorado-vintage);
  color: var(--color-dorado-vintage);
  transform: translateY(-2px);
}

/* ===== HEADER PRINCIPAL ===== */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  color: var(--color-dorado-vintage);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title h1 {
  font-size: 1.875rem;
  font-weight: bold;
  color: var(--color-azul-marino);
  margin: 0;
}

.page-title p {
  color: var(--color-gris-acero);
  margin: 0.25rem 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-secondary,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.btn-secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
  color: #495057;
}

.btn-primary {
  background: linear-gradient(45deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  color: var(--color-negro-carbon);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(212, 175, 55, 0.4);
}

.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* ===== ESTADOS DE CARGA Y ERROR ===== */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  border-top: 4px solid var(--color-dorado-vintage);
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
  color: var(--color-rojo-granate);
  margin-bottom: 1rem;
}

.error-content h3 {
  color: var(--color-azul-marino);
  margin-bottom: 0.5rem;
}

.error-content p {
  color: var(--color-gris-acero);
  margin-bottom: 2rem;
}

.btn-retry {
  background: linear-gradient(45deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  color: var(--color-negro-carbon);
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-retry:hover {
  transform: translateY(-2px);
}

/* ===== CONTENIDO PRINCIPAL ===== */
.tipos-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== ESTADÍSTICAS ===== */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: var(--transition);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  padding: 1rem;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.active .stat-icon {
  background: rgba(27, 67, 50, 0.1);
  color: var(--color-verde-bosque);
}

.stat-card.total .stat-icon {
  background: rgba(212, 175, 55, 0.1);
  color: var(--color-dorado-vintage);
}

.stat-card.electronic .stat-icon {
  background: rgba(44, 62, 80, 0.1);
  color: var(--color-azul-marino);
}

.stat-content h3 {
  font-size: 1.875rem;
  font-weight: bold;
  color: var(--color-azul-marino);
  margin: 0;
}

.stat-content p {
  color: var(--color-gris-acero);
  margin: 0.25rem 0 0;
  font-weight: 500;
}

/* ===== FILTROS ===== */
.filtros-section {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.875rem;
  transition: var(--transition);
  background: #fafbfc;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  background: white;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

/* ===== GRID DE TIPOS ===== */
.tipos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.tipo-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid transparent;
  transition: var(--transition);
}

.tipo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.tipo-card.editando {
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.2);
}

.tipo-card.inactivo {
  opacity: 0.7;
}

.tipo-header {
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
}

.tipo-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-azul-marino);
  margin: 0 0 0.5rem;
}

.tipo-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.estado-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.activo {
  background: rgba(27, 67, 50, 0.1);
  color: var(--color-verde-bosque);
}

.estado-badge.inactivo {
  background: rgba(149, 165, 166, 0.1);
  color: #95A5A6;
}

.electronic-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(44, 62, 80, 0.1);
  color: var(--color-azul-marino);
}

.tipo-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-toggle {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  background: rgba(212, 175, 55, 0.1);
  color: var(--color-dorado-vintage);
}

.btn-edit:hover {
  background: rgba(212, 175, 55, 0.2);
}

.btn-toggle.activo {
  background: rgba(139, 0, 0, 0.1);
  color: var(--color-rojo-granate);
}

.btn-toggle.inactivo {
  background: rgba(27, 67, 50, 0.1);
  color: var(--color-verde-bosque);
}

.btn-toggle:hover {
  opacity: 0.8;
}

/* ===== CONTENIDO DE TARJETAS ===== */
.tipo-content {
  padding: 1rem 1.5rem 1.5rem;
}

.porcentajes-avaluo {
  margin-bottom: 1rem;
}

.porcentajes-avaluo label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gris-acero);
  margin-bottom: 0.5rem;
}

.porcentaje-range {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.porcentaje-min,
.porcentaje-max {
  font-weight: 600;
  color: var(--color-azul-marino);
  min-width: 40px;
}

.range-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  position: relative;
}

.range-fill {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--color-dorado-vintage), var(--color-azul-marino));
  border-radius: 4px;
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
  color: var(--color-negro-carbon);
}

/* ===== FORMULARIOS ===== */
.tipo-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gris-acero);
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.875rem;
  transition: var(--transition);
  background: #fafbfc;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  background: white;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--color-dorado-vintage);
}

.checkbox-text {
  font-size: 0.875rem;
  color: var(--color-gris-acero);
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
  background: linear-gradient(45deg, var(--color-verde-bosque), #2d5a3d);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  flex: 1;
  justify-content: center;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(27, 67, 50, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
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
  transition: var(--transition);
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

/* ===== ESTADO VACÍO ===== */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-state svg {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--color-azul-marino);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--color-gris-acero);
  margin: 0;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 26, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(26, 26, 26, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-azul-marino);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: var(--transition);
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* ===== NOTIFICACIONES ===== */
.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(26, 26, 26, 0.2);
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
  border-left-color: var(--color-verde-bosque);
}

.notification.error {
  border-left-color: var(--color-rojo-granate);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.notification.success .notification-content svg {
  color: var(--color-verde-bosque);
}

.notification.error .notification-content svg {
  color: var(--color-rojo-granate);
}

.notification-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: var(--transition);
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

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .admin-tipos-articulos {
    padding: 1rem;
  }

  .header-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: stretch;
  }

  .filtros-section {
    flex-direction: column;
  }

  .search-bar {
    min-width: auto;
  }

  .tipos-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .metadata {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .page-title h1 {
    font-size: 1.5rem;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
}
</style>    