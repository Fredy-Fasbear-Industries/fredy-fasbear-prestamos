<template>
  <div class="admin-personal-page">
    <header class="admin-header">
      <div class="header-container">
        <div class="header-left">
          <button @click="regresarAlPanel" class="btn-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5m7-7l-7 7 7 7"/>
            </svg>
            Volver al Panel
          </button>
        </div>
        
        <div class="header-right">
          <button @click="abrirModalCrear" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Empleado
          </button>
        </div>
      </div>
    </header>

    <main class="admin-main">
      <div class="container">
        <section class="page-title">
          <div class="title-content">
            <div class="title-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h1>Gestión de Personal</h1>
              <p>Administración de empleados internos del sistema</p>
            </div>
          </div>
        </section>

        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card administradores">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ estadisticas.administradores }}</h3>
                <p>Administradores</p>
              </div>
            </div>
            
            <div class="stat-card evaluadores">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11H3v9h6v-9zM21 11h-6v9h6v-9zM15 4h-6v7h6V4z"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ estadisticas.evaluadores }}</h3>
                <p>Evaluadores</p>
              </div>
            </div>
            
            <div class="stat-card cobradores">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ estadisticas.cobradores }}</h3>
                <p>Cobradores</p>
              </div>
            </div>
            
            <div class="stat-card activos">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ estadisticas.activos }}</h3>
                <p>Personal Activo</p>
              </div>
            </div>
          </div>
        </section>

        <section class="filtros-section">
          <div class="filtros-card">
            <div class="filtros-group">
              <div class="search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input 
                  v-model="filtros.busqueda"
                  type="text" 
                  placeholder="Buscar por nombre, email o DPI..."
                  @input="filtrarPersonal"
                >
              </div>
              
              <select v-model="filtros.tipoUsuario" @change="filtrarPersonal" class="filter-select">
                <option value="">Todos los tipos</option>
                <option value="Administrador">Administradores</option>
                <option value="Evaluador">Evaluadores</option>
                <option value="Cobrador">Cobradores</option>
              </select>
              
              <select v-model="filtros.estado" @change="filtrarPersonal" class="filter-select">
                <option value="">Todos los estados</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
              </select>
            </div>
          </div>
        </section>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando personal...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <h3>Error al cargar el personal</h3>
          <p>{{ error }}</p>
          <button @click="cargarPersonal" class="btn-retry">Reintentar</button>
        </div>

        <section v-else class="personal-section">
          <div class="section-header">
            <h2>Personal del Sistema ({{ personalFiltrado.length }})</h2>
            <div class="vista-controles">
              <button 
                @click="vistaActual = 'tabla'" 
                :class="['btn-vista', { active: vistaActual === 'tabla' }]"
                title="Vista de tabla"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18v12H3z"/>
                  <path d="M3 10h18M8 6v12"/>
                </svg>
              </button>
              <button 
                @click="vistaActual = 'tarjetas'" 
                :class="['btn-vista', { active: vistaActual === 'tarjetas' }]"
                title="Vista de tarjetas"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="vistaActual === 'tabla'" class="tabla-container">
            <div class="tabla-wrapper">
              <table class="personal-tabla">
                <thead>
                  <tr>
                    <th>EMPLEADO</th>
                    <th>CONTACTO</th>
                    <th>TIPO</th>
                    <th>ESTADO</th>
                    <th>REGISTRO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="empleado in personalFiltrado" :key="empleado.id" class="empleado-row">
                    <td>
                      <div class="empleado-info">
                        <div class="empleado-avatar">
                          {{ obtenerIniciales(empleado.nombre, empleado.apellido) }}
                        </div>
                        <div class="empleado-datos">
                          <strong>{{ empleado.nombre }} {{ empleado.apellido }}</strong>
                          <small>{{ empleado.cedula }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="contacto-info">
                        <div>{{ empleado.email }}</div>
                        <div>{{ empleado.telefono }}</div>
                      </div>
                    </td>
                    <td>
                      <span :class="['badge-tipo', empleado.tipoUsuario.toLowerCase()]">
                        {{ empleado.tipoUsuario }}
                      </span>
                    </td>
                    <td>
                      <span :class="['badge-estado', empleado.estado.toLowerCase()]">
                        {{ empleado.estado }}
                      </span>
                    </td>
                    <td>
                      <div class="fecha-info">
                        {{ formatearFecha(empleado.fechaRegistro) }}
                      </div>
                    </td>
                    <td>
                      <div class="acciones-grupo">
                        <button @click="editarEmpleado(empleado)" class="btn-accion editar" title="Editar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button @click="cambiarEstadoEmpleado(empleado)" class="btn-accion estado" title="Cambiar estado">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                          </svg>
                        </button>
                        <button @click="verDetalleEmpleado(empleado)" class="btn-accion ver" title="Ver detalles">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else class="tarjetas-grid">
            <div v-for="empleado in personalFiltrado" :key="empleado.id" class="empleado-card">
              <div class="card-header">
                <div class="empleado-avatar-large">
                  {{ obtenerIniciales(empleado.nombre, empleado.apellido) }}
                </div>
                <span :class="['badge-estado', empleado.estado.toLowerCase()]">
                  {{ empleado.estado }}
                </span>
              </div>
              <div class="card-body">
                <h3>{{ empleado.nombre }} {{ empleado.apellido }}</h3>
                <p class="empleado-cedula">{{ empleado.cedula }}</p>
                <span :class="['badge-tipo', empleado.tipoUsuario.toLowerCase()]">
                  {{ empleado.tipoUsuario }}
                </span>
                <div class="contacto-card">
                  <div class="contacto-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>{{ empleado.email }}</span>
                  </div>
                  <div class="contacto-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>{{ empleado.telefono }}</span>
                  </div>
                </div>
                <div class="fecha-registro">
                  Registrado: {{ formatearFecha(empleado.fechaRegistro) }}
                </div>
              </div>
              <div class="card-actions">
                <button @click="editarEmpleado(empleado)" class="btn-secondary">
                  Editar
                </button>
                <button @click="verDetalleEmpleado(empleado)" class="btn-primary">
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <div v-if="modalEmpleado.visible" class="modal-overlay" @click="cerrarModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>{{ modalEmpleado.editando ? 'Editar Empleado' : 'Nuevo Empleado' }}</h2>
          <button @click="cerrarModal" class="btn-cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="guardarEmpleado" class="modal-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre</label>
              <input v-model="modalEmpleado.datos.nombre" type="text" required :disabled="modalEmpleado.guardando">
            </div>
            <div class="form-group">
              <label>Apellido</label>
              <input v-model="modalEmpleado.datos.apellido" type="text" required :disabled="modalEmpleado.guardando">
            </div>
            <div class="form-group">
              <label>DPI</label>
              <input v-model="modalEmpleado.datos.cedula" type="text" required :disabled="modalEmpleado.guardando">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="modalEmpleado.datos.email" type="email" required :disabled="modalEmpleado.guardando">
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="modalEmpleado.datos.telefono" type="tel" required :disabled="modalEmpleado.guardando">
            </div>
            <div class="form-group">
              <label>Tipo de Usuario</label>
              <select v-model="modalEmpleado.datos.tipoUsuario" required :disabled="modalEmpleado.guardando">
                <option value="">Seleccionar tipo</option>
                <option value="Administrador">Administrador</option>
                <option value="Evaluador">Evaluador</option>
                <option value="Cobrador">Cobrador</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Dirección</label>
              <textarea v-model="modalEmpleado.datos.direccion" required :disabled="modalEmpleado.guardando" rows="3"></textarea>
            </div>
            <div v-if="!modalEmpleado.editando" class="form-group">
              <label>Contraseña</label>
              <input v-model="modalEmpleado.datos.password" type="password" required :disabled="modalEmpleado.guardando" minlength="8">
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="modalEmpleado.datos.estado" :disabled="modalEmpleado.guardando">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="cerrarModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="modalEmpleado.guardando">
              {{ modalEmpleado.guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="modalDetalle.visible" class="modal-overlay" @click="cerrarModalDetalle">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Detalles del Empleado</h2>
          <button @click="cerrarModalDetalle" class="btn-cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="detalle-content">
          <div class="empleado-perfil">
            <div class="perfil-avatar">
              {{ obtenerIniciales(modalDetalle.empleado.nombre, modalDetalle.empleado.apellido) }}
            </div>
            <div class="perfil-info">
              <h3>{{ modalDetalle.empleado.nombre }} {{ modalDetalle.empleado.apellido }}</h3>
              <p>{{ modalDetalle.empleado.tipoUsuario }}</p>
              <span :class="['badge-estado', modalDetalle.empleado.estado.toLowerCase()]">
                {{ modalDetalle.empleado.estado }}
              </span>
            </div>
          </div>
          
          <div class="detalle-grid">
            <div class="detalle-item">
              <label>DPI:</label>
              <span>{{ modalDetalle.empleado.cedula }}</span>
            </div>
            <div class="detalle-item">
              <label>Email:</label>
              <span>{{ modalDetalle.empleado.email }}</span>
            </div>
            <div class="detalle-item">
              <label>Teléfono:</label>
              <span>{{ modalDetalle.empleado.telefono }}</span>
            </div>
            <div class="detalle-item">
              <label>Fecha de Registro:</label>
              <span>{{ formatearFecha(modalDetalle.empleado.fechaRegistro) }}</span>
            </div>
            <div class="detalle-item full-width">
              <label>Dirección:</label>
              <span>{{ modalDetalle.empleado.direccion }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="editarEmpleado(modalDetalle.empleado)" class="btn-primary">
            Editar Empleado
          </button>
        </div>
      </div>
    </div>

    <div v-if="notificacion.visible" :class="['notificacion', notificacion.tipo]">
      <span>{{ notificacion.mensaje }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

definePageMeta({
  middleware: 'admin'
})

const { api } = useApi()

const loading = ref(false)
const error = ref(null)
const personal = ref([])
const vistaActual = ref('tabla')

const filtros = reactive({
  busqueda: '',
  tipoUsuario: '',
  estado: ''
})

const modalEmpleado = reactive({
  visible: false,
  editando: false,
  guardando: false,
  datos: {
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoUsuario: '',
    estado: 'Activo',
    password: ''
  }
})

const modalDetalle = reactive({
  visible: false,
  empleado: {}
})

const notificacion = reactive({
  visible: false,
  tipo: 'exito',
  mensaje: ''
})

const estadisticas = computed(() => {
  return {
    administradores: personal.value.filter(p => p.tipoUsuario === 'Administrador').length,
    evaluadores: personal.value.filter(p => p.tipoUsuario === 'Evaluador').length,
    cobradores: personal.value.filter(p => p.tipoUsuario === 'Cobrador').length,
    activos: personal.value.filter(p => p.estado === 'Activo').length
  }
})

const personalFiltrado = computed(() => {
  let resultado = personal.value.filter(empleado => 
    ['Administrador', 'Evaluador', 'Cobrador'].includes(empleado.tipoUsuario)
  )

  if (filtros.busqueda) {
    const busqueda = filtros.busqueda.toLowerCase()
    resultado = resultado.filter(empleado =>
      empleado.nombre.toLowerCase().includes(busqueda) ||
      empleado.apellido.toLowerCase().includes(busqueda) ||
      empleado.email.toLowerCase().includes(busqueda) ||
      empleado.cedula.includes(busqueda)
    )
  }

  if (filtros.tipoUsuario) {
    resultado = resultado.filter(empleado => empleado.tipoUsuario === filtros.tipoUsuario)
  }

  if (filtros.estado) {
    resultado = resultado.filter(empleado => empleado.estado === filtros.estado)
  }

  return resultado.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
})

const regresarAlPanel = () => {
  navigateTo('/admin')
}

const cargarPersonal = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await api('/personal', {
      method: 'GET'
    })

    if (response.success) {
      personal.value = response.data.personal || []
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar el personal'
  } finally {
    loading.value = false
  }
}

const filtrarPersonal = () => {
}

const abrirModalCrear = () => {
  modalEmpleado.editando = false
  modalEmpleado.datos = {
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoUsuario: '',
    estado: 'Activo',
    password: ''
  }
  modalEmpleado.visible = true
}

const editarEmpleado = (empleado) => {
  modalEmpleado.editando = true
  modalEmpleado.datos = {
    id: empleado.id,
    nombre: empleado.nombre,
    apellido: empleado.apellido,
    cedula: empleado.cedula,
    email: empleado.email,
    telefono: empleado.telefono,
    direccion: empleado.direccion,
    tipoUsuario: empleado.tipoUsuario,
    estado: empleado.estado
  }
  modalEmpleado.visible = true
  modalDetalle.visible = false
}

const guardarEmpleado = async () => {
  try {
    modalEmpleado.guardando = true
    
    const endpoint = modalEmpleado.editando 
      ? `/personal/${modalEmpleado.datos.id}`
      : '/personal'
    
    const method = modalEmpleado.editando ? 'PUT' : 'POST'
    
    const response = await api(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modalEmpleado.datos)
    })

    if (response.success) {
      mostrarNotificacion(
        modalEmpleado.editando ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente',
        'exito'
      )
      cerrarModal()
      await cargarPersonal()
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    mostrarNotificacion(err.message || 'Error al guardar empleado', 'error')
  } finally {
    modalEmpleado.guardando = false
  }
}

const cambiarEstadoEmpleado = async (empleado) => {
  try {
    const nuevoEstado = empleado.estado === 'Activo' ? 'Inactivo' : 'Activo'
    
    const response = await api(`/personal/${empleado.id}/toggle-status`, {
      method: 'PUT'
    })

    if (response.success) {
      mostrarNotificacion(`Estado cambiado a ${nuevoEstado}`, 'exito')
      await cargarPersonal()
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    mostrarNotificacion(err.message || 'Error al cambiar estado', 'error')
  }
}

const verDetalleEmpleado = (empleado) => {
  modalDetalle.empleado = { ...empleado }
  modalDetalle.visible = true
}

const cerrarModal = () => {
  modalEmpleado.visible = false
  modalEmpleado.guardando = false
}

const cerrarModalDetalle = () => {
  modalDetalle.visible = false
}

const obtenerIniciales = (nombre, apellido) => {
  return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase()
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const mostrarNotificacion = (mensaje, tipo = 'exito') => {
  notificacion.mensaje = mensaje
  notificacion.tipo = tipo
  notificacion.visible = true
  
  setTimeout(() => {
    notificacion.visible = false
  }, 5000)
}

onMounted(() => {
  cargarPersonal()
})
</script>

<style scoped>
.admin-personal-page {
  min-height: 100vh;
  background: #F5F5F5;
}

.admin-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #F5F5F5;
  border: 1px solid #e9ecef;
  color: #4A4A4A;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-back:hover {
  background: #e9ecef;
  color: #2C3E50;
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
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #B8941F;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.admin-main {
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  margin-bottom: 2rem;
}

.title-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #D4AF37, #F4D03F);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.title-content h1 {
  color: #2C3E50;
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.25rem 0;
}

.title-content p {
  color: #4A4A4A;
  margin: 0;
}

.stats-section {
  margin-bottom: 2rem;
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
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.administradores .stat-icon {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.stat-card.evaluadores .stat-icon {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.stat-card.cobradores .stat-icon {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.stat-card.activos .stat-icon {
  background: rgba(155, 89, 182, 0.1);
  color: #9B59B6;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: bold;
  color: #2C3E50;
  margin: 0 0 0.25rem 0;
}

.stat-content p {
  color: #4A4A4A;
  margin: 0;
  font-weight: 500;
}

.filtros-section {
  margin-bottom: 2rem;
}

.filtros-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filtros-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.loading-state, .error-state {
  background: white;
  padding: 4rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
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

.error-state svg {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.btn-retry {
  background: #D4AF37;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
}

.personal-section {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  color: #2C3E50;
  font-size: 1.5rem;
  margin: 0;
}

.vista-controles {
  display: flex;
  gap: 0.25rem;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.25rem;
}

.btn-vista {
  padding: 0.5rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6c757d;
}

.btn-vista.active, .btn-vista:hover {
  background: white;
  color: #D4AF37;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tabla-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.personal-tabla {
  width: 100%;
  border-collapse: collapse;
}

.personal-tabla th {
  background: #2C3E50;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.personal-tabla td {
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
}

.empleado-row:hover {
  background: rgba(212, 175, 55, 0.05);
}

.empleado-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.empleado-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.empleado-datos strong {
  display: block;
  color: #2C3E50;
  font-weight: 600;
}

.empleado-datos small {
  color: #6c757d;
  font-size: 0.8rem;
}

.contacto-info div {
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}

.contacto-info div:first-child {
  font-weight: 500;
  color: #2C3E50;
}

.contacto-info div:last-child {
  color: #6c757d;
}

.badge-tipo, .badge-estado {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-tipo.administrador {
  background: rgba(212, 175, 55, 0.15);
  color: #D4AF37;
}

.badge-tipo.evaluador {
  background: rgba(52, 152, 219, 0.15);
  color: #3498DB;
}

.badge-tipo.cobrador {
  background: rgba(39, 174, 96, 0.15);
  color: #27AE60;
}

.badge-estado.activo {
  background: rgba(39, 174, 96, 0.15);
  color: #27AE60;
}

.badge-estado.inactivo {
  background: rgba(231, 76, 60, 0.15);
  color: #E74C3C;
}

.fecha-info {
  color: #6c757d;
  font-size: 0.8rem;
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

.btn-accion.editar {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.btn-accion.editar:hover {
  background: #D4AF37;
  color: white;
}

.btn-accion.estado {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.btn-accion.estado:hover {
  background: #3498DB;
  color: white;
}

.btn-accion.ver {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.btn-accion.ver:hover {
  background: #27AE60;
  color: white;
}

.tarjetas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.empleado-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.empleado-card:hover {
  transform: translateY(-2px);
}

.card-header {
  padding: 1.5rem;
  background: #2C3E50;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empleado-avatar-large {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.card-body {
  padding: 1.5rem;
}

.card-body h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  color: #2C3E50;
}

.empleado-cedula {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.8rem;
}

.contacto-card {
  margin: 1rem 0;
}

.contacto-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #6c757d;
  font-size: 0.85rem;
}

.contacto-item svg {
  color: #D4AF37;
}

.fecha-registro {
  color: #6c757d;
  font-size: 0.75rem;
}

.card-actions {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  display: flex;
  gap: 0.75rem;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #e9ecef;
  color: #2C3E50;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  background: #2C3E50;
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-cerrar {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(231, 76, 60, 0.2);
  color: #ff6b6b;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-cerrar:hover {
  background: rgba(231, 76, 60, 0.3);
}

.modal-form, .detalle-content {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: #2C3E50;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input, .form-group select, .form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.empleado-perfil {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.perfil-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
}

.perfil-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #2C3E50;
}

.perfil-info p {
  margin: 0 0 0.75rem 0;
  color: #6c757d;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detalle-item.full-width {
  grid-column: 1 / -1;
}

.detalle-item label {
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.9rem;
}

.detalle-item span {
  color: #6c757d;
}

.notificacion {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.notificacion.exito {
  background: #27AE60;
  color: white;
}

.notificacion.error {
  background: #E74C3C;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .header-container {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filtros-group {
    flex-direction: column;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .tarjetas-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>