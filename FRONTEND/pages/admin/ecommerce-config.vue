<template>
  <div class="admin-ecommerce-config">
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
            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V19C17 19.6 16.6 20 16 20H8C7.4 20 7 19.6 7 19V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h1>Configuración E-commerce</h1>
          <p>Gestiona las configuraciones de la tienda en línea y políticas comerciales</p>
        </div>
      </div>
      
      <button @click="cargarConfiguraciones" class="btn-primary" :disabled="loading">
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
        <p>Cargando configuraciones...</p>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>Error al cargar configuraciones</h3>
        <p>{{ error }}</p>
        <button @click="cargarConfiguraciones" class="btn-retry">
          Reintentar
        </button>
      </div>
    </div>

    <div v-else class="content-section">
      <!-- Debug info -->
      <div v-if="showDebugInfo" class="debug-info">
        <h4>Información de debug:</h4>
        <pre>{{ debugData }}</pre>
      </div>

      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ totalConfiguraciones }}</h3>
            <p>Configuraciones</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ totalCategorias }}</h3>
            <p>Categorías</p>
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
            <p>Última modificación</p>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input 
            v-model="filtros.busqueda" 
            type="text" 
            placeholder="Buscar configuraciones por nombre o descripción..."
          >
        </div>

        <div class="filter-controls">
          <select v-model="filtros.categoria" class="filter-select">
            <option value="">Todas las categorías</option>
            <option value="general">General</option>
            <option value="pagos">Métodos de Pago</option>
            <option value="envios">Envíos</option>
            <option value="promociones">Promociones</option>
            <option value="politicas">Políticas</option>
            <option value="apariencia">Apariencia</option>
          </select>

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

      <div class="configuraciones-container">
        <div 
          v-for="categoria in categoriasFiltradas" 
          :key="categoria.nombre"
          class="categoria-section"
        >
          <div class="categoria-header">
            <h2>{{ categoria.titulo }}</h2>
            <p>{{ categoria.descripcion }}</p>
            <span class="configuraciones-count">{{ categoria.configuraciones.length }}</span>
          </div>

          <div class="configuraciones-list">
            <div 
              v-for="config in categoria.configuraciones" 
              :key="config.id"
              class="config-card"
              :class="{ 'editing': configEditando?.id === config.id }"
            >
              <div class="config-header">
                <div class="config-info">
                  <h3>{{ config.nombre }}</h3>
                  <p>{{ config.descripcion }}</p>
                </div>
                <div class="config-meta">
                  <span class="config-type" :class="config.tipo?.toLowerCase()">
                    {{ formatTipoDato(config.tipo) }}
                  </span>
                  <span class="config-category">{{ config.categoria }}</span>
                </div>
              </div>

              <div class="config-content">
                <div v-if="configEditando?.id === config.id" class="config-edit-form">
                  <div class="form-group">
                    <label for="valor">Valor:</label>
                    <input 
                      v-if="config.tipo === 'STRING' || config.tipo === 'INTEGER' || config.tipo === 'DECIMAL'"
                      v-model="configEditando.valor"
                      :type="config.tipo === 'INTEGER' || config.tipo === 'DECIMAL' ? 'number' : 'text'"
                      :step="config.tipo === 'DECIMAL' ? '0.01' : '1'"
                      class="form-input"
                      id="valor"
                    >
                    <select 
                      v-else-if="config.tipo === 'BOOLEAN'"
                      v-model="configEditando.valor"
                      class="form-select"
                      id="valor"
                    >
                      <option value="true">Verdadero</option>
                      <option value="false">Falso</option>
                    </select>
                    <input 
                      v-else-if="config.tipo === 'DATE'"
                      v-model="configEditando.valor"
                      type="date"
                      class="form-input"
                      id="valor"
                    >
                    <textarea 
                      v-else
                      v-model="configEditando.valor"
                      class="form-textarea"
                      id="valor"
                    ></textarea>
                  </div>

                  <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea 
                      v-model="configEditando.descripcion"
                      class="form-textarea"
                      id="descripcion"
                    ></textarea>
                  </div>

                  <div class="form-actions">
                    <button @click="guardarConfiguracion" class="btn-success" :disabled="guardando">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2"/>
                        <polyline points="9,9 9,15 15,15 15,9" stroke="currentColor" stroke-width="2"/>
                      </svg>
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

                <div v-else class="config-view">
                  <div class="config-value">
                    <strong>Valor actual:</strong>
                    <span class="value-display">{{ formatValorConfig(config.valor, config.tipo) }}</span>
                  </div>
                  
                  <div class="config-actions">
                    <button @click="editarConfiguracion(config)" class="btn-edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Editar
                    </button>
                  </div>
                </div>
              </div>

              <div class="config-footer">
                <span class="config-modified">
                  Última modificación: {{ formatFechaRelativa(config.fechaModificacion) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="categoriasFiltradas.length === 0 && !loading" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12L12 16L16 12" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>No se encontraron configuraciones</h3>
        <p>No hay configuraciones que coincidan con los filtros aplicados.</p>
        <button @click="toggleDebugInfo" class="btn-secondary">
          {{ showDebugInfo ? 'Ocultar' : 'Mostrar' }} información de debug
        </button>
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
    </div>
  </div>
</template>

<script setup>
// CORRECCIÓN PARA: FRONTEND/pages/admin/ecommerce-config.vue
// Reemplaza TODO el <script setup> por este código

import { ref, computed, onMounted } from 'vue'

//  AGREGADO: Importar useAuth
const { getToken } = useAuth()

// ===== ESTADO REACTIVO =====
const loading = ref(false)
const guardando = ref(false)
const error = ref(null)
const configuracionesEcommerce = ref([])
const configEditando = ref(null)
const showDebugInfo = ref(false)
const debugData = ref({})

const filtros = ref({
  busqueda: '',
  categoria: '',
  tipoDato: ''
})

const notificacion = ref({
  mostrar: false,
  tipo: 'success',
  mensaje: ''
})

// ===== COMPUTED PROPERTIES =====
const categoriasFiltradas = computed(() => {
  const categorias = {
    general: {
      nombre: 'general',
      titulo: 'Configuración General',
      descripcion: 'Configuraciones básicas de la tienda',
      configuraciones: []
    },
    pagos: {
      nombre: 'pagos',
      titulo: 'Métodos de Pago',
      descripcion: 'Configuración de pagos y transacciones',
      configuraciones: []
    },
    envios: {
      nombre: 'envios',
      titulo: 'Configuración de Envíos',
      descripcion: 'Políticas y métodos de envío',
      configuraciones: []
    },
    promociones: {
      nombre: 'promociones',
      titulo: 'Promociones y Descuentos',
      descripcion: 'Configuración de ofertas y promociones',
      configuraciones: []
    },
    politicas: {
      nombre: 'politicas',
      titulo: 'Políticas Comerciales',
      descripcion: 'Términos y condiciones de la tienda',
      configuraciones: []
    },
    apariencia: {
      nombre: 'apariencia',
      titulo: 'Apariencia de la Tienda',
      descripcion: 'Personalización visual',
      configuraciones: []
    }
  }

  let configsFiltradas = configuracionesEcommerce.value.filter(config => {
    const coincideBusqueda = !filtros.value.busqueda || 
      config.nombre?.toLowerCase().includes(filtros.value.busqueda.toLowerCase()) ||
      config.descripcion?.toLowerCase().includes(filtros.value.busqueda.toLowerCase())
 
    const coincideCategoria = !filtros.value.categoria || 
      config.categoria === filtros.value.categoria

    const coincideTipo = !filtros.value.tipoDato || 
      config.tipo === filtros.value.tipoDato

    return coincideBusqueda && coincideCategoria && coincideTipo
  })

  configsFiltradas.forEach(config => {
    if (categorias[config.categoria]) {
      categorias[config.categoria].configuraciones.push(config)
    }
  })

  return Object.values(categorias).filter(cat => cat.configuraciones.length > 0)
})

const totalConfiguraciones = computed(() => configuracionesEcommerce.value.length)

const totalCategorias = computed(() => {
  const categoriasConConfig = new Set(configuracionesEcommerce.value.map(c => c.categoria))
  return categoriasConConfig.size
})

const ultimaModificacion = computed(() => {
  if (configuracionesEcommerce.value.length === 0) return 'N/A'
  
  const fechas = configuracionesEcommerce.value
    .map(c => new Date(c.fechaModificacion))
    .sort((a, b) => b - a)
  
  return formatFechaRelativa(fechas[0])
})

// ===== MÉTODOS =====

const toggleDebugInfo = () => {
  showDebugInfo.value = !showDebugInfo.value
}

const actualizarDebugData = (data) => {
  const config = useRuntimeConfig()
  
  debugData.value = {
    timestamp: new Date().toISOString(),
    configuracionesCount: configuracionesEcommerce.value.length,
    lastResponse: data,
    apiBase: config.public.apiBase || 'No configurado',
    hasToken: !!getToken()
  }
}

const cargarConfiguraciones = async () => {
  try {
    loading.value = true
    error.value = null

    const token = process.client ? getToken() : null

    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }

    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase
    
    if (!apiBase) {
      throw new Error('NUXT_PUBLIC_API_BASE no está configurado')
    }

    const url = `${apiBase}/admin/ecommerce-config`

    console.log(' Cargando configuraciones desde:', url)

    const response = await $fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    console.log(' Respuesta recibida:', response)
    actualizarDebugData(response)

    if (!response || !response.success) {
      throw new Error(response?.message || 'Error obteniendo configuraciones')
    }

    const data = Array.isArray(response.data) ? response.data : response.data?.configuraciones || []
    
    configuracionesEcommerce.value = data.map(config => ({
      ...config,
      valor: config.valor !== null && config.valor !== undefined ? config.valor : '',
      descripcion: config.descripcion || '',
      fechaModificacion: config.fechaModificacion || config.updatedAt || new Date().toISOString()
    }))

    mostrarNotificacion('success', `${configuracionesEcommerce.value.length} configuraciones cargadas`)
    
  } catch (err) {
    console.error(' Error cargando configuraciones:', err)
    error.value = err.message || 'Error al cargar configuraciones'
    
    mostrarNotificacion(
      'error', 
      `Error: ${err.message || 'No se pudieron cargar las configuraciones'}`
    )
  } finally {
    loading.value = false
  }
}

const editarConfiguracion = (config) => {
  console.log(' Editando configuración:', config)
  
  configEditando.value = {
    id: config.id,
    nombre: config.nombre,
    valor: config.valor,
    descripcion: config.descripcion,
    tipo: config.tipo
  }
}

const cancelarEdicion = () => {
  configEditando.value = null
}

const guardarConfiguracion = async () => {
  try {
    loading.value = true

    const token = process.client ? getToken() : null

    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }

    if (!configEditando.value || !configEditando.value.id) {
      throw new Error('No hay configuración seleccionada para editar')
    }

    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase
    
    if (!apiBase) {
      throw new Error('NUXT_PUBLIC_API_BASE no está configurado')
    }

    const url = `${apiBase}/admin/ecommerce-config/${configEditando.value.id}`

    let valorAEnviar = configEditando.value.valor
    const tipo = configEditando.value.tipo

    console.log(' Preparando valor:', { valorOriginal: valorAEnviar, tipo })

    if (tipo === 'INTEGER') {
      const valorInt = parseInt(valorAEnviar)
      if (isNaN(valorInt)) {
        throw new Error('El valor debe ser un número entero válido')
      }
      valorAEnviar = valorInt
    } else if (tipo === 'DECIMAL') {
      const valorFloat = parseFloat(valorAEnviar)
      if (isNaN(valorFloat)) {
        throw new Error('El valor debe ser un número decimal válido')
      }
      valorAEnviar = valorFloat
    } else if (tipo === 'BOOLEAN') {
      if (typeof valorAEnviar === 'string') {
        valorAEnviar = valorAEnviar === 'true'
      }
      valorAEnviar = Boolean(valorAEnviar)
    } else if (tipo === 'STRING' || tipo === 'TEXT') {
      valorAEnviar = String(valorAEnviar)
    }

    const bodyData = {
      valor: valorAEnviar,
      descripcion: configEditando.value.descripcion || ''
    }

    console.log(' Enviando datos:', { url, bodyData })

    const response = await $fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: bodyData
    })

    console.log(' Respuesta del servidor:', response)

    if (!response || !response.success) {
      throw new Error(response?.message || 'Error actualizando configuración')
    }

    const index = configuracionesEcommerce.value.findIndex(c => c.id === configEditando.value.id)
    if (index !== -1) {
      configuracionesEcommerce.value[index] = {
        ...configuracionesEcommerce.value[index],
        valor: valorAEnviar,
        descripcion: configEditando.value.descripcion,
        fechaModificacion: new Date().toISOString(),
        ...response.data
      }
    }

    mostrarNotificacion('success', 'Configuración actualizada correctamente')
    configEditando.value = null
    
  } catch (err) {
    console.error(' Error guardando configuración:', err)
    
    let mensajeError = 'Error actualizando configuración'
    
    if (err.status === 400) {
      mensajeError = `Datos inválidos: ${err.message || 'Verifica el formato del valor'}`
    } else if (err.status === 401) {
      mensajeError = 'Sesión expirada. Inicia sesión nuevamente'
    } else if (err.status === 403) {
      mensajeError = 'No tienes permisos para realizar esta acción'
    } else {
      mensajeError = err.message || 'Error actualizando configuración'
    }
    
    mostrarNotificacion('error', mensajeError)
  } finally {
    loading.value = false
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

const formatTipoDato = (tipo) => {
  const tipos = {
    'STRING': 'Texto',
    'INTEGER': 'Entero',
    'DECIMAL': 'Decimal',
    'BOOLEAN': 'Booleano',
    'DATE': 'Fecha',
    'TEXT': 'Texto Largo'
  }
  return tipos[tipo] || tipo
}

const formatValorConfig = (valor, tipo) => {
  if (valor === null || valor === undefined) return 'No configurado'
  
  if (tipo === 'BOOLEAN') {
    return valor === 'true' || valor === true ? 'Habilitado' : 'Deshabilitado'
  }
  
  if (tipo === 'DATE') {
    try {
      return new Date(valor).toLocaleDateString('es-ES')
    } catch {
      return valor
    }
  }
  
  return valor
}

const formatFechaRelativa = (fecha) => {
  try {
    const ahora = new Date()
    const fechaObj = new Date(fecha)
    const diferencia = ahora - fechaObj
    
    const minutos = Math.floor(diferencia / (1000 * 60))
    const horas = Math.floor(diferencia / (1000 * 60 * 60))
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
    
    if (minutos < 1) return 'Hace un momento'
    if (minutos < 60) return `Hace ${minutos} minutos`
    if (horas < 24) return `Hace ${horas} horas`
    if (dias < 7) return `Hace ${dias} días`
    
    return fechaObj.toLocaleDateString('es-ES')
  } catch {
    return 'Fecha inválida'
  }
}

// ===== LIFECYCLE =====
onMounted(() => {
  cargarConfiguraciones()
})
</script>

<style scoped>
/* ===== VARIABLES CSS CON PALETA CORPORATIVA ===== */
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
.admin-ecommerce-config {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
  padding: 2rem 0;
}

/* ===== DEBUG INFO ===== */
.debug-info {
  background: var(--color-negro-carbon);
  color: var(--color-blanco-perla);
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.debug-info h4 {
  color: var(--color-dorado-vintage);
  margin: 0 0 1rem 0;
}

.debug-info pre {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
}

/* ===== NAVIGATION HEADER ===== */
.navigation-header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 1rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-blanco-perla);
  color: var(--color-gris-acero);
  text-decoration: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: var(--transition);
  box-shadow: var(--shadow-card);
}

.btn-back:hover {
  background: var(--color-dorado-vintage);
  color: var(--color-blanco-perla);
  transform: translateY(-2px);
}

/* ===== HEADER SECTION ===== */
.header-section {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  border-radius: 50%;
  color: var(--color-blanco-perla);
}

.page-title h1 {
  margin: 0 0 0.25rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.page-title p {
  margin: 0;
  color: var(--color-gris-acero);
  font-size: 1rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  color: var(--color-blanco-perla);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin: 1rem 2rem 2rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-gris-acero);
  color: var(--color-blanco-perla);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 1rem;
}

.btn-secondary:hover {
  background: var(--color-negro-carbon);
  transform: translateY(-2px);
}

/* ===== ESTADOS DE CARGA Y ERROR ===== */
.loading-state,
.error-state {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--color-blanco-perla);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(245, 245, 245, 0.3);
  border-top: 4px solid var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-content {
  background: var(--color-blanco-perla);
  padding: 3rem;
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  color: var(--color-negro-carbon);
}

.error-content svg {
  color: var(--color-rojo-granate);
  margin-bottom: 1rem;
}

.error-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: var(--color-negro-carbon);
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background: var(--color-dorado-vintage);
  color: var(--color-blanco-perla);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 1rem;
}

.btn-retry:hover {
  background: var(--color-dorado-claro);
  transform: translateY(-2px);
}

/* ===== CONTENT SECTION ===== */
.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ===== STATS CARDS ===== */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-blanco-perla);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: var(--transition);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(26, 26, 26, 0.3);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  border-radius: 50%;
  color: var(--color-blanco-perla);
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.stat-content p {
  margin: 0;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

/* ===== FILTROS ===== */
.filters-section {
  background: var(--color-blanco-perla);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-card);
  margin-bottom: 2rem;
}

.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-bar svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gris-acero);
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);
}

.search-bar input:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 1rem;
  background: white;
  transition: var(--transition);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

/* ===== CONFIGURACIONES ===== */
.configuraciones-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.categoria-section {
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.categoria-header {
  background: linear-gradient(135deg, var(--color-azul-marino), var(--color-gris-acero));
  color: var(--color-blanco-perla);
  padding: 1.5rem 2rem;
  position: relative;
}

.categoria-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.categoria-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.875rem;
}

.configuraciones-count {
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  background: var(--color-dorado-vintage);
  color: var(--color-negro-carbon);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.configuraciones-list {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ===== CONFIG CARDS ===== */
.config-card {
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  transition: var(--transition);
  background: white;
}

.config-card:hover {
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.15);
}

.config-card.editing {
  border-color: var(--color-verde-bosque);
  background: #f8fff9;
  box-shadow: 0 8px 25px rgba(27, 67, 50, 0.15);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.config-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  color: var(--color-negro-carbon);
  font-weight: 600;
}

.config-info p {
  margin: 0;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.config-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.config-type,
.config-category {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.config-type {
  background: #e5e7eb;
  color: var(--color-gris-acero);
}

.config-type.string { background: #dbeafe; color: #1e40af; }
.config-type.integer { background: #d1fae5; color: #065f46; }
.config-type.decimal { background: #fef3c7; color: #92400e; }
.config-type.boolean { background: #e0e7ff; color: #3730a3; }
.config-type.date { background: #fce7f3; color: #be185d; }

.config-category {
  background: var(--color-azul-marino);
  color: var(--color-blanco-perla);
}

/* ===== FORMULARIO DE EDICIÓN ===== */
.config-edit-form {
  background: #f8fff9;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  border: 2px solid var(--color-verde-bosque);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-verde-bosque);
  box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-success {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-verde-bosque);
  color: var(--color-blanco-perla);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-success:hover:not(:disabled) {
  background: #2d5a45;
  transform: translateY(-2px);
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-rojo-granate);
  color: var(--color-blanco-perla);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-cancel:hover {
  background: #a50000;
  transform: translateY(-2px);
}

/* ===== CONFIG VIEW ===== */
.config-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.config-value {
  flex: 1;
}

.config-value strong {
  color: var(--color-negro-carbon);
  font-weight: 600;
}

.value-display {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  color: var(--color-gris-acero);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-dorado-vintage);
  color: var(--color-blanco-perla);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.875rem;
}

.btn-edit:hover {
  background: var(--color-dorado-claro);
  transform: translateY(-2px);
}

/* ===== CONFIG FOOTER ===== */
.config-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.config-modified {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
  font-style: italic;
}

/* ===== ESTADO VACÍO ===== */
.empty-state {
  background: var(--color-blanco-perla);
  padding: 4rem 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  text-align: center;
  color: var(--color-gris-acero);
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-negro-carbon);
}

/* ===== NOTIFICACIONES ===== */
.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-card);
  animation: slideIn 0.3s ease-out;
  max-width: 400px;
}

.notification.success {
  background: var(--color-verde-bosque);
  color: var(--color-blanco-perla);
}

.notification.error {
  background: var(--color-rojo-granate);
  color: var(--color-blanco-perla);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  .admin-ecommerce-config {
    padding: 1rem 0;
  }

  .navigation-header,
  .header-section,
  .content-section {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .page-title {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .page-title h1 {
    font-size: 1.5rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .filter-controls {
    grid-template-columns: 1fr;
  }

  .config-header {
    flex-direction: column;
    gap: 1rem;
  }

  .config-meta {
    flex-direction: row;
    align-items: center;
  }

  .config-view {
    flex-direction: column;
    align-items: stretch;
  }

  .form-actions {
    flex-direction: column;
  }

  .notification {
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style>