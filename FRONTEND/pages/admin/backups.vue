<template>
  <div class="backups-page">
    <div class="backups-container">
      <div class="navigation-header">
        <NuxtLink to="/admin" class="btn-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver al Panel
        </NuxtLink>
      </div>

      <div class="backups-header">
        <div class="header-content">
          <div class="header-info">
            <h1>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Gestión de Respaldos
            </h1>
            <p>Administra los respaldos de tu sistema y base de datos</p>
          </div>
          <div class="header-actions">
            <button @click="mostrarModalCrear = true" :disabled="loading" class="btn-primary">
              <svg v-if="!loading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ loading ? 'Procesando...' : 'Crear Respaldo' }}
            </button>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-box">
            <div class="stat-icon" style="background: rgba(212, 175, 55, 0.1); color: #D4AF37;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3>{{ estadisticas.total || 0 }}</h3>
              <p>Respaldos Totales</p>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon" style="background: rgba(39, 174, 96, 0.1); color: #27AE60;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3>{{ estadisticas.ultimo || 'N/A' }}</h3>
              <p>Último Respaldo</p>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon" style="background: rgba(52, 152, 219, 0.1); color: #3498DB;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3>{{ estadisticas.tamanoTotal || '0 MB' }}</h3>
              <p>Espacio Utilizado</p>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="alerta.mostrar" :class="['alerta', alerta.tipo]">
          <svg v-if="alerta.tipo === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else-if="alerta.tipo === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <svg v-else-if="alerta.tipo === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span>{{ alerta.mensaje }}</span>
          <button @click="cerrarAlerta" class="btn-close-alert">×</button>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="creandoBackup" class="backup-progress-container">
          <div class="backup-progress-card">
            <div class="progress-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <h3>Creando Respaldo...</h3>
            </div>
            <p class="progress-description">
              El respaldo se está procesando en segundo plano. Esto puede tomar hasta 3 minutos.
            </p>
            <div class="progress-bar-container">
              <div class="progress-bar" :style="{ width: `${progresoBackup}%` }"></div>
            </div>
            <p class="progress-percentage">{{ Math.round(progresoBackup) }}%</p>
          </div>
        </div>
      </transition>

      <div class="backups-table-container">
        <div class="table-header">
          <h2>Historial de Respaldos</h2>
          <div class="filtros-grupo">
            <select v-model="filtroTipo" class="filter-select">
              <option value="todos">Todos los tipos</option>
              <option value="database">Base de Datos</option>
              <option value="files">Archivos</option>
              <option value="full">Completo</option>
            </select>
            <button @click="cargarRespaldos" class="btn-refresh" :disabled="cargando">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Actualizar
            </button>
          </div>
        </div>

        <div v-if="cargando" class="loading-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <p>Cargando respaldos...</p>
        </div>

        <div v-else-if="respaldosFiltrados.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <h3>No hay respaldos disponibles</h3>
          <p>Crea tu primer respaldo del sistema</p>
        </div>

        <table v-else class="backups-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Fecha de Creación</th>
              <th>Tamaño</th>
              <th>Estado</th>
              <th>Creado Por</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="backup in respaldosFiltrados" :key="backup.id" class="backup-row">
              <td>
                <span class="backup-id">{{ backup.nombre }}</span>
              </td>
              <td>
                <span :class="['badge-tipo', backup.tipo]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path v-if="backup.tipo === 'database'" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <path v-else-if="backup.tipo === 'files'" d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline v-else points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  {{ backup.tipoLabel }}
                </span>
              </td>
              <td>
                <div class="fecha-info">
                  <strong>{{ formatearFecha(backup.fecha) }}</strong>
                  <small>{{ formatearHora(backup.fecha) }}</small>
                </div>
              </td>
              <td>
                <span class="tamano-info">{{ backup.tamano }}</span>
              </td>
              <td>
                <span :class="['badge-estado', backup.estado]">{{ backup.estadoLabel }}</span>
              </td>
              <td>
                <div class="usuario-info">
                  <div class="usuario-avatar">{{ obtenerIniciales(backup.usuario) }}</div>
                  <span>{{ backup.usuario }}</span>
                </div>
              </td>
              <td>
                <div class="acciones-grupo">
                  <button @click="descargarRespaldo(backup.id)" class="btn-accion descargar" title="Descargar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                  <button @click="verDetalles(backup)" class="btn-accion ver" title="Ver detalles">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button @click="confirmarEliminar(backup.id)" class="btn-accion eliminar" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <transition name="modal">
        <div v-if="mostrarModalCrear" class="modal-overlay" @click="cerrarModalCrear">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Crear Nuevo Respaldo</h3>
              <button @click="cerrarModalCrear" class="btn-close">×</button>
            </div>
            <div class="modal-body">
              <p>Selecciona el tipo de respaldo que deseas crear:</p>
              <div class="tipo-respaldo-opciones">
                <label class="tipo-opcion">
                  <input type="radio" v-model="tipoRespaldo" value="database" />
                  <div class="opcion-contenido">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                    <h4>Base de Datos</h4>
                    <p>Respaldo completo de PostgreSQL</p>
                  </div>
                </label>
                <label class="tipo-opcion">
                  <input type="radio" v-model="tipoRespaldo" value="files" />
                  <div class="opcion-contenido">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    </svg>
                    <h4>Archivos</h4>
                    <p>Respaldo de uploads y archivos del sistema</p>
                  </div>
                </label>
                <label class="tipo-opcion">
                  <input type="radio" v-model="tipoRespaldo" value="full" />
                  <div class="opcion-contenido">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    <h4>Completo</h4>
                    <p>Base de datos + Archivos (Recomendado)</p>
                  </div>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button @click="cerrarModalCrear" class="btn-secondary">Cancelar</button>
              <button @click="crearRespaldo" :disabled="!tipoRespaldo || loading" class="btn-primary">
                {{ loading ? 'Creando...' : 'Crear Respaldo' }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="modal">
        <div v-if="modalDetalles.mostrar" class="modal-overlay" @click="cerrarModalDetalles">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Detalles del Respaldo</h3>
              <button @click="cerrarModalDetalles" class="btn-close">×</button>
            </div>
            <div class="modal-body detalles-body">
              <div class="detalle-row">
                <strong>ID:</strong>
                <span>{{ modalDetalles.backup?.id }}</span>
              </div>
              <div class="detalle-row">
                <strong>Nombre:</strong>
                <span>{{ modalDetalles.backup?.nombre }}</span>
              </div>
              <div class="detalle-row">
                <strong>Tipo:</strong>
                <span :class="['badge-tipo', modalDetalles.backup?.tipo]">
                  {{ modalDetalles.backup?.tipoLabel }}
                </span>
              </div>
              <div class="detalle-row">
                <strong>Tamaño:</strong>
                <span>{{ modalDetalles.backup?.tamano }}</span>
              </div>
              <div class="detalle-row">
                <strong>Fecha:</strong>
                <span>{{ formatearFecha(modalDetalles.backup?.fecha) }} {{ formatearHora(modalDetalles.backup?.fecha) }}</span>
              </div>
              <div class="detalle-row">
                <strong>Estado:</strong>
                <span :class="['badge-estado', modalDetalles.backup?.estado]">
                  {{ modalDetalles.backup?.estadoLabel }}
                </span>
              </div>
              <div class="detalle-row">
                <strong>Usuario:</strong>
                <span>{{ modalDetalles.backup?.usuario }}</span>
              </div>
              <div v-if="modalDetalles.backup?.checksum" class="detalle-row">
                <strong>Checksum:</strong>
                <span class="checksum">{{ modalDetalles.backup?.checksum }}</span>
              </div>
            </div>
            <div class="modal-footer">
              <button @click="cerrarModalDetalles" class="btn-secondary">Cerrar</button>
              <button @click="descargarRespaldo(modalDetalles.backup?.id)" class="btn-primary">
                Descargar
              </button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="modal">
        <div v-if="modalEliminar.mostrar" class="modal-overlay" @click="cerrarModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Confirmar Eliminación</h3>
              <button @click="cerrarModal" class="btn-close">×</button>
            </div>
            <div class="modal-body">
              <div class="warning-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <p>¿Estás seguro de que deseas eliminar este respaldo?</p>
              <p class="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer">
              <button @click="cerrarModal" class="btn-secondary">Cancelar</button>
              <button @click="eliminarRespaldo" :disabled="loading" class="btn-danger">
                {{ loading ? 'Eliminando...' : 'Eliminar Respaldo' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  middleware: 'admin'
})

useHead({
  title: 'Gestión de Respaldos - Admin',
  meta: [
    { name: 'description', content: 'Administra los respaldos del sistema' }
  ]
})

const { api } = useApi()

const respaldos = ref([])
const cargando = ref(false)
const loading = ref(false)
const filtroTipo = ref('todos')
const tipoRespaldo = ref('full')
const mostrarModalCrear = ref(false)
const creandoBackup = ref(false)
const progresoBackup = ref(0)

const alerta = ref({
  mostrar: false,
  tipo: 'success',
  mensaje: ''
})

const modalEliminar = ref({
  mostrar: false,
  backupId: null
})

const modalDetalles = ref({
  mostrar: false,
  backup: null
})

const estadisticas = computed(() => {
  const total = respaldos.value.length
  let ultimo = 'N/A'
  
  if (total > 0) {
    const ultimoBackup = respaldos.value[0]
    const fechaUltimo = new Date(ultimoBackup.fecha)
    const ahora = new Date()
    const diffMs = ahora - fechaUltimo
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      ultimo = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      ultimo = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    } else {
      ultimo = 'Hace menos de 1 hora'
    }
  }
  
  const tamanoTotal = calcularTamanoTotal()
  
  return {
    total,
    ultimo,
    tamanoTotal
  }
})

const respaldosFiltrados = computed(() => {
  if (filtroTipo.value === 'todos') {
    return respaldos.value
  }
  return respaldos.value.filter(b => b.tipo === filtroTipo.value)
})

const cargarRespaldos = async () => {
  cargando.value = true
  try {
    const response = await api('/admin/backups', {
      method: 'GET'
    })
    
    if (response.success) {
      respaldos.value = response.data.backups
    } else {
      throw new Error(response.message || 'Error cargando respaldos')
    }
  } catch (error) {
    console.error('Error al cargar respaldos:', error)
    mostrarAlerta('error', 'Error al cargar los respaldos')
  } finally {
    cargando.value = false
  }
}

const crearRespaldo = async () => {
  if (!tipoRespaldo.value) {
    mostrarAlerta('error', 'Por favor selecciona un tipo de respaldo')
    return
  }
  
  loading.value = true
  creandoBackup.value = true
  progresoBackup.value = 0
  
  try {
    const tipoSeleccionado = tipoRespaldo.value
    cerrarModalCrear()
    
    mostrarAlerta('info', 'Creando respaldo en segundo plano... Por favor espera.')
    
    const backupsAntesCount = respaldos.value.length
    const { getToken } = useAuth()
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase || 'http://localhost:3001/api'
    
    fetch(`${baseURL}/admin/backups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ tipo: tipoSeleccionado })
    }).then(() => {
      console.log('Backup request sent successfully')
    }).catch((err) => {
      console.log('Backup initiated (connection closed, this is normal)')
    })
    
    const intervaloProgreso = setInterval(() => {
      if (progresoBackup.value < 90) {
        progresoBackup.value += Math.random() * 10
      }
    }, 2000)
    
    let intentos = 0
    const maxIntentos = 40
    
    const verificarBackup = async () => {
      try {
        intentos++
        await cargarRespaldos()
        
        if (respaldos.value.length > backupsAntesCount) {
          clearInterval(intervaloProgreso)
          progresoBackup.value = 100
          creandoBackup.value = false
          mostrarAlerta('success', 'Respaldo creado exitosamente')
          return true
        }
        
        if (intentos < maxIntentos) {
          setTimeout(verificarBackup, 5000)
        } else {
          clearInterval(intervaloProgreso)
          creandoBackup.value = false
          mostrarAlerta('warning', 'El backup está tomando más tiempo. Actualiza en unos minutos.')
        }
        
      } catch (error) {
        if (intentos < maxIntentos) {
          setTimeout(verificarBackup, 5000)
        } else {
          clearInterval(intervaloProgreso)
          creandoBackup.value = false
        }
      }
    }
    
    setTimeout(verificarBackup, 5000)
    
  } catch (error) {
    console.error('Error al crear respaldo:', error)
    creandoBackup.value = false
    mostrarAlerta('error', 'Error al iniciar el respaldo')
  } finally {
    loading.value = false
  }
}

const descargarRespaldo = async (id) => {
  try {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase || 'http://localhost:3001/api'
    const { getToken } = useAuth()
    const token = getToken()
    
    const url = `${baseURL}/admin/backups/${id}/download`
    const link = document.createElement('a')
    link.href = url
    link.download = id
    
    if (token) {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        link.href = blobUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
        
        mostrarAlerta('success', 'Descarga iniciada')
      } else {
        throw new Error('Error al descargar el archivo')
      }
    } else {
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  } catch (error) {
    console.error('Error al descargar respaldo:', error)
    mostrarAlerta('error', 'Error al descargar el respaldo')
  }
}

const verDetalles = async (backup) => {
  try {
    const response = await api(`/admin/backups/${backup.id}`, {
      method: 'GET'
    })
    
    if (response.success) {
      modalDetalles.value = {
        mostrar: true,
        backup: response.data.backup
      }
    } else {
      throw new Error(response.message || 'Error obteniendo detalles')
    }
  } catch (error) {
    console.error('Error al obtener detalles:', error)
    mostrarAlerta('error', 'Error al obtener detalles del respaldo')
  }
}

const confirmarEliminar = (id) => {
  modalEliminar.value = {
    mostrar: true,
    backupId: id
  }
}

const eliminarRespaldo = async () => {
  loading.value = true
  try {
    const id = modalEliminar.value.backupId
    
    const response = await api(`/admin/backups/${id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      mostrarAlerta('success', 'Respaldo eliminado exitosamente')
      cerrarModal()
      await cargarRespaldos()
    } else {
      throw new Error(response.message || 'Error eliminando respaldo')
    }
  } catch (error) {
    console.error('Error al eliminar respaldo:', error)
    mostrarAlerta('error', 'Error al eliminar el respaldo')
  } finally {
    loading.value = false
  }
}

const cerrarModal = () => {
  modalEliminar.value = {
    mostrar: false,
    backupId: null
  }
}

const cerrarModalCrear = () => {
  mostrarModalCrear.value = false
  tipoRespaldo.value = 'full'
}

const cerrarModalDetalles = () => {
  modalDetalles.value = {
    mostrar: false,
    backup: null
  }
}

const mostrarAlerta = (tipo, mensaje) => {
  alerta.value = {
    mostrar: true,
    tipo,
    mensaje
  }
  
  const delay = tipo === 'warning' ? 10000 : 5000
  
  setTimeout(() => {
    alerta.value.mostrar = false
  }, delay)
}

const cerrarAlerta = () => {
  alerta.value.mostrar = false
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatearHora = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const obtenerIniciales = (nombre) => {
  if (!nombre) return 'U'
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const calcularTamanoTotal = () => {
  if (respaldos.value.length === 0) return '0 MB'
  
  const totalBytes = respaldos.value.reduce((acc, b) => {
    return acc + (b.tamanoBytes || 0)
  }, 0)
  
  if (totalBytes >= 1024 * 1024 * 1024) {
    return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  } else if (totalBytes >= 1024 * 1024) {
    return `${(totalBytes / (1024 * 1024)).toFixed(0)} MB`
  } else if (totalBytes >= 1024) {
    return `${(totalBytes / 1024).toFixed(0)} KB`
  }
  return `${totalBytes} Bytes`
}

onMounted(() => {
  cargarRespaldos()
})
</script>

<style scoped>
.backups-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 50%, #1A1A1A 100%);
  padding: 2rem 0;
}

.backups-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.navigation-header {
  margin-bottom: 2rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid rgba(212, 175, 55, 0.5);
  color: #D4AF37;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-back:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #D4AF37;
}

.backups-header {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.header-info h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2C3E50;
}

.header-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
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
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #f8f9fa;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2C3E50;
}

.stat-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
}

.alerta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.alerta.success {
  border-left: 4px solid #27AE60;
  color: #27AE60;
}

.alerta.error {
  border-left: 4px solid #E74C3C;
  color: #E74C3C;
}

.alerta.warning {
  border-left: 4px solid #F39C12;
  color: #F39C12;
}

.alerta.info {
  border-left: 4px solid #3498DB;
  color: #3498DB;
}

.btn-close-alert {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.btn-close-alert:hover {
  opacity: 1;
}

.backup-progress-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  animation: slideInUp 0.3s ease;
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.backup-progress-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 350px;
  max-width: 400px;
  border-left: 4px solid #D4AF37;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.progress-header h3 {
  margin: 0;
  color: #2C3E50;
  font-size: 1rem;
  font-weight: 600;
}

.progress-header svg {
  color: #D4AF37;
}

.progress-description {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
}

.progress-bar-container {
  height: 8px;
  background: #f1f3f4;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #D4AF37, #F4D03F);
  border-radius: 4px;
  transition: width 0.5s ease;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.progress-percentage {
  margin: 0;
  text-align: right;
  color: #2C3E50;
  font-weight: 600;
  font-size: 0.9rem;
}

.backups-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.table-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2C3E50;
}

.filtros-grupo {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #D4AF37;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border: 1px solid rgba(212, 175, 55, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: rgba(212, 175, 55, 0.2);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.loading-state svg,
.empty-state svg {
  color: #D4AF37;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: #2C3E50;
}

.backups-tabla {
  width: 100%;
  border-collapse: collapse;
}

.backups-tabla thead th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
}

.backups-tabla td {
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.backup-row:hover {
  background: rgba(212, 175, 55, 0.05);
}

.backup-id {
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.85rem;
}

.badge-tipo,
.badge-estado {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-tipo.database {
  background: rgba(212, 175, 55, 0.15);
  color: #D4AF37;
}

.badge-tipo.files {
  background: rgba(155, 89, 182, 0.15);
  color: #9B59B6;
}

.badge-tipo.full {
  background: rgba(52, 152, 219, 0.15);
  color: #3498DB;
}

.badge-estado.completado {
  background: rgba(39, 174, 96, 0.15);
  color: #27AE60;
}

.fecha-info strong {
  display: block;
  color: #2C3E50;
  font-weight: 600;
  font-size: 0.9rem;
}

.fecha-info small {
  color: #6c757d;
  font-size: 0.8rem;
}

.tamano-info {
  font-weight: 600;
  color: #2C3E50;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.usuario-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.7rem;
}

.acciones-grupo {
  display: flex;
  gap: 0.5rem;
}

.btn-accion {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-accion.descargar {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.btn-accion.descargar:hover {
  background: #D4AF37;
  color: white;
  transform: scale(1.1);
}

.btn-accion.ver {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.btn-accion.ver:hover {
  background: #27AE60;
  color: white;
  transform: scale(1.1);
}

.btn-accion.eliminar {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.btn-accion.eliminar:hover {
  background: #E74C3C;
  color: white;
  transform: scale(1.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2C3E50;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #2C3E50;
}

.modal-body {
  padding: 2rem;
}

.tipo-respaldo-opciones {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.tipo-opcion {
  cursor: pointer;
}

.tipo-opcion input[type="radio"] {
  display: none;
}

.opcion-contenido {
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.tipo-opcion input[type="radio"]:checked + .opcion-contenido {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.05);
}

.opcion-contenido:hover {
  border-color: #D4AF37;
  transform: translateY(-2px);
}

.opcion-contenido svg {
  color: #D4AF37;
  margin-bottom: 0.75rem;
}

.opcion-contenido h4 {
  margin: 0.5rem 0;
  color: #2C3E50;
  font-size: 1rem;
}

.opcion-contenido p {
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
}

.detalles-body {
  padding: 1.5rem;
}

.detalle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.detalle-row:last-child {
  border-bottom: none;
}

.detalle-row strong {
  color: #2C3E50;
  font-weight: 600;
}

.checksum {
  font-family: monospace;
  font-size: 0.8rem;
  color: #6c757d;
  word-break: break-all;
}

.warning-icon {
  margin-bottom: 1rem;
  text-align: center;
}

.warning-icon svg {
  color: #E74C3C;
}

.modal-body p {
  margin: 0.5rem 0;
  color: #2C3E50;
  text-align: center;
}

.warning-text {
  color: #E74C3C !important;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: 1px solid #e9ecef;
  background: white;
  color: #2C3E50;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  background: #E74C3C;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn-danger:hover:not(:disabled) {
  background: #C0392B;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .backups-container {
    padding: 0 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .backups-tabla {
    font-size: 0.85rem;
  }
  
  .backups-tabla td,
  .backups-tabla th {
    padding: 0.75rem 0.5rem;
  }
  
  .tipo-respaldo-opciones {
    grid-template-columns: 1fr;
  }
}
</style>