<!-- =============================================== -->
<!-- Archivo: FRONTEND/pages/admin/AdministracionClientes.vue -->
<!-- Versión final corregida: Sin errores de sintaxis + mejor manejo -->
<!-- =============================================== -->

<template>
  <div class="admin-clientes">
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
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h1>Gestión de Clientes</h1>
          <p>Administra los usuarios clientes de la plataforma</p>
        </div>
      </div>
      
      <button @click="mostrarModalCrear = true" class="btn-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Nuevo Cliente
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando clientes...</p>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>Error al cargar clientes</h3>
        <p>{{ error }}</p>
        <div class="error-details" v-if="errorDetails">
          <p><strong>Detalles del error:</strong></p>
          <p class="error-technical">{{ errorDetails }}</p>
        </div>
        <div class="error-actions">
          <button @click="cargarClientes" class="btn-retry">Reintentar</button>
          <NuxtLink to="/admin" class="btn-back-error">Volver al Panel</NuxtLink>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="stats-section" v-if="stats">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7018C21.7033 16.0495 20.9969 15.5906 20.2 15.3943" stroke="currentColor" stroke-width="2"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stats.totalClientes || 0 }}</h3>
              <p>Total Clientes</p>
            </div>
          </div>

          <div class="stat-card active">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stats.activeClients || 0 }}</h3>
              <p>Clientes Activos</p>
            </div>
          </div>

          <div class="stat-card inactive">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <h3>{{ stats.inactiveClients || 0 }}</h3>
              <p>Clientes Inactivos</p>
            </div>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input 
            v-model="filtros.busqueda" 
            @input="debouncedBuscar"
            type="text" 
            placeholder="Buscar clientes por nombre, email o DPI..."
          />
        </div>

        <div class="filter-controls">
          <select v-model="filtros.estado" @change="aplicarFiltros" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>

          <select v-model="filtros.sortBy" @change="aplicarFiltros" class="filter-select">
            <option value="fechaRegistro">Fecha de Registro</option>
            <option value="nombre">Nombre</option>
            <option value="email">Email</option>
          </select>

          <select v-model="filtros.sortOrder" @change="aplicarFiltros" class="filter-select">
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="clients-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Solicitudes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientes" :key="cliente.id" class="client-row">
              <td>
                <div class="client-info">
                  <div class="client-avatar">
                    {{ getInitials(cliente.nombre, cliente.apellido) }}
                  </div>
                  <div class="client-details">
                    <div class="client-name">{{ cliente.nombre }} {{ cliente.apellido }}</div>
                    <div class="client-cedula">C.I: {{ cliente.cedula }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="email">{{ cliente.email }}</span>
              </td>
              <td>
                <span class="phone">{{ cliente.telefono }}</span>
              </td>
              <td>
                <span :class="['status-badge', cliente.estado.toLowerCase()]">
                  {{ cliente.estado }}
                </span>
              </td>
              <td>
                <span class="date">{{ formatDate(cliente.fechaRegistro) }}</span>
              </td>
              <td>
                <span class="requests-count">
                  {{ cliente._count?.solicitudes || 0 }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="verCliente(cliente)" 
                    class="btn-action view"
                    title="Ver detalles"
                    :disabled="loadingClienteDetalle === cliente.id"
                  >
                    <div v-if="loadingClienteDetalle === cliente.id" class="loading-icon">
                      <div class="mini-spinner"></div>
                    </div>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  <button 
                    @click="editarCliente(cliente)" 
                    class="btn-action edit"
                    title="Editar"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                      <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1215 3.43762 22.1215 4.00023C22.1215 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                  <button 
                    @click="toggleEstadoCliente(cliente)" 
                    :class="['btn-action', cliente.estado === 'Activo' ? 'deactivate' : 'activate']"
                    :title="cliente.estado === 'Activo' ? 'Desactivar' : 'Activar'"
                  >
                    <svg v-if="cliente.estado === 'Activo'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                      <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div v-if="pagination && pagination.pages > 1" class="pagination">
          <button 
            @click="cambiarPagina(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="pagination-btn"
          >
            Anterior
          </button>

          <span class="pagination-info">
            Página {{ pagination.page }} de {{ pagination.pages }}
            ({{ pagination.total }} clientes total)
          </span>

          <button 
            @click="cambiarPagina(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="pagination-btn"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Crear Cliente -->
    <div v-if="mostrarModalCrear" class="modal-overlay" @click="cerrarModalCrear">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Crear Nuevo Cliente</h2>
          <button @click="cerrarModalCrear" class="btn-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="crearCliente" class="client-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre *</label>
              <input 
                v-model="formCliente.nombre" 
                type="text" 
                required
                class="form-input"
                maxlength="100"
              />
            </div>
            
            <div class="form-group">
              <label>Apellido *</label>
              <input 
                v-model="formCliente.apellido" 
                type="text" 
                required
                class="form-input"
                maxlength="100"
              />
            </div>
            
            <div class="form-group">
              <label>Email *</label>
              <input 
                v-model="formCliente.email" 
                type="email" 
                required
                class="form-input"
                maxlength="150"
              />
            </div>
            
            <div class="form-group">
              <label>Teléfono *</label>
              <input 
                v-model="formCliente.telefono" 
                type="tel" 
                required
                class="form-input"
                maxlength="20"
              />
            </div>
            
            <div class="form-group">
              <label>DPI * <span class="field-hint">(Máximo 13 dígitos)</span></label>
              <input 
                v-model="formCliente.cedula" 
                type="text" 
                required
                class="form-input"
                @input="validarCedula"
                @keypress="soloNumeros"
                maxlength="13"
                pattern="[0-9]{1,13}"
                title="Solo se permiten números, máximo 13 dígitos"
                placeholder="Ej: 1234567890123"
              />
              <span v-if="cedulaError" class="field-error">{{ cedulaError }}</span>
            </div>
            
            <div class="form-group">
              <label>Contraseña *</label>
              <input 
                v-model="formCliente.password" 
                type="password" 
                required
                class="form-input"
                minlength="6"
              />
            </div>
            
            <div class="form-group">
              <label>Fecha de Nacimiento</label>
              <input 
                v-model="formCliente.fechaNacimiento" 
                type="date" 
                class="form-input"
                :max="fechaMaximaNacimiento"
              />
            </div>
            
            <div class="form-group">
              <label>Estado</label>
              <select v-model="formCliente.estado" class="form-select">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div class="form-group full-width">
            <label>Dirección *</label>
            <textarea 
              v-model="formCliente.direccion" 
              required
              class="form-textarea"
              rows="3"
              maxlength="500"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="cerrarModalCrear" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" :disabled="guardandoCliente || !!cedulaError" class="btn-primary">
              <span v-if="guardandoCliente">Guardando...</span>
              <span v-else>Crear Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Editar Cliente -->
    <div v-if="mostrarModalEditar" class="modal-overlay" @click="cerrarModalEditar">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Editar Cliente</h2>
          <button @click="cerrarModalEditar" class="btn-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="actualizarCliente" class="client-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre *</label>
              <input 
                v-model="formCliente.nombre" 
                type="text" 
                required
                class="form-input"
                maxlength="100"
              />
            </div>
            
            <div class="form-group">
              <label>Apellido *</label>
              <input 
                v-model="formCliente.apellido" 
                type="text" 
                required
                class="form-input"
                maxlength="100"
              />
            </div>
            
            <div class="form-group">
              <label>Email *</label>
              <input 
                v-model="formCliente.email" 
                type="email" 
                required
                class="form-input"
                maxlength="150"
              />
            </div>
            
            <div class="form-group">
              <label>Teléfono *</label>
              <input 
                v-model="formCliente.telefono" 
                type="tel" 
                required
                class="form-input"
                maxlength="20"
              />
            </div>
            
            <div class="form-group">
              <label>DPI</label>
              <input 
                v-model="formCliente.cedula" 
                type="text" 
                readonly
                class="form-input readonly"
                title="El DPI no puede ser modificado"
              />
              <span class="field-info">El DPI no puede ser modificado</span>
            </div>
            
            <div class="form-group">
              <label>Fecha de Nacimiento</label>
              <input 
                v-model="formCliente.fechaNacimiento" 
                type="date" 
                class="form-input"
                :max="fechaMaximaNacimiento"
              />
            </div>
            
            <div class="form-group">
              <label>Estado</label>
              <select v-model="formCliente.estado" class="form-select">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div class="form-group full-width">
            <label>Dirección *</label>
            <textarea 
              v-model="formCliente.direccion" 
              required
              class="form-textarea"
              rows="3"
              maxlength="500"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="cerrarModalEditar" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" :disabled="guardandoCliente" class="btn-primary">
              <span v-if="guardandoCliente">Actualizando...</span>
              <span v-else>Actualizar Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Ver Cliente -->
    <div v-if="mostrarModalVer && clienteSeleccionado" class="modal-overlay" @click="cerrarModalVer">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h2>Detalles del Cliente</h2>
          <button @click="cerrarModalVer" class="btn-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <div class="client-details">
          <div class="details-grid">
            <div class="detail-section">
              <h3>Información Personal</h3>
              <div class="detail-item">
                <label>Nombre Completo</label>
                <span>{{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido }}</span>
              </div>
              <div class="detail-item">
                <label>DPI</label>
                <span>{{ clienteSeleccionado.cedula }}</span>
              </div>
              <div class="detail-item">
                <label>Fecha de Nacimiento</label>
                <span>{{ formatDate(clienteSeleccionado.fechaNacimiento) || 'No especificada' }}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Información de Contacto</h3>
              <div class="detail-item">
                <label>Email</label>
                <span>{{ clienteSeleccionado.email }}</span>
              </div>
              <div class="detail-item">
                <label>Teléfono</label>
                <span>{{ clienteSeleccionado.telefono }}</span>
              </div>
              <div class="detail-item">
                <label>Dirección</label>
                <span>{{ clienteSeleccionado.direccion }}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Estado y Registro</h3>
              <div class="detail-item">
                <label>Estado</label>
                <span :class="['status-badge', clienteSeleccionado.estado.toLowerCase()]">
                  {{ clienteSeleccionado.estado }}
                </span>
              </div>
              <div class="detail-item">
                <label>Fecha de Registro</label>
                <span>{{ formatDate(clienteSeleccionado.fechaRegistro) }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="clienteSeleccionado.solicitudes && clienteSeleccionado.solicitudes.length > 0" class="solicitudes-section">
            <h3>Solicitudes Recientes</h3>
            <div class="solicitudes-list">
              <div v-for="solicitud in clienteSeleccionado.solicitudes" :key="solicitud.id" class="solicitud-item">
                <div class="solicitud-info">
                  <div class="solicitud-id">Solicitud #{{ solicitud.id }}</div>
                  <div class="solicitud-fecha">{{ formatDate(solicitud.fechaSolicitud) }}</div>
                </div>
                <div class="solicitud-details">
                  <span :class="['status-badge', solicitud.estado.toLowerCase()]">
                    {{ solicitud.estado }}
                  </span>
                  <span class="monto">
                    Q{{ formatNumber(solicitud.montoSolicitado || 0) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-solicitudes">
            <p>Este cliente no tiene solicitudes registradas.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Error Específico para Detalles de Cliente -->
    <div v-if="mostrarErrorDetalle" class="modal-overlay" @click="cerrarErrorDetalle">
      <div class="modal-content error-modal" @click.stop>
        <div class="modal-header error-header">
          <h2>Error al Cargar Cliente</h2>
          <button @click="cerrarErrorDetalle" class="btn-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <div class="error-modal-content">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          
          <h3>No se pudo cargar la información del cliente</h3>
          <p>{{ errorDetalleMessage }}</p>
          
          <div class="error-suggestions">
            <h4>Posibles causas:</h4>
            <ul>
              <li>El cliente podría haber sido eliminado recientemente</li>
              <li>Problema temporal de conectividad con la base de datos</li>
              <li>Error interno del servidor</li>
            </ul>
          </div>
          
          <div class="error-actions">
            <button @click="reintentarCargarDetalle" class="btn-retry" :disabled="loadingClienteDetalle">
              <span v-if="loadingClienteDetalle">Reintentando...</span>
              <span v-else>Reintentar</span>
            </button>
            <button @click="cerrarErrorDetalle" class="btn-secondary">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notificación -->
    <div v-if="notificacion.mostrar" :class="['notification', notificacion.tipo]">
      <div class="notification-content">
        <svg v-if="notificacion.tipo === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
          <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
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
import { ref, onMounted, computed } from 'vue'

definePageMeta({
  middleware: 'admin'
})

const loading = ref(true)
const error = ref(null)
const errorDetails = ref(null)
const stats = ref(null)
const clientes = ref([])
const pagination = ref(null)

const mostrarModalCrear = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalVer = ref(false)
const clienteSeleccionado = ref(null)
const guardandoCliente = ref(false)

// Estados específicos para manejo de errores de detalle de cliente
const loadingClienteDetalle = ref(null)
const mostrarErrorDetalle = ref(false)
const errorDetalleMessage = ref('')
const clientePendienteDetalle = ref(null)

// Validación de DPI
const cedulaError = ref('')

// Sistema de notificaciones
const notificacion = ref({
  mostrar: false,
  mensaje: '',
  tipo: 'success'
})

const filtros = ref({
  busqueda: '',
  estado: '',
  sortBy: 'fechaRegistro',
  sortOrder: 'desc',
  page: 1,
  limit: 50
})

const formCliente = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  cedula: '',
  password: '',
  estado: 'Activo',
  fechaNacimiento: ''
})

// Fecha máxima para nacimiento (18 años atrás)
const fechaMaximaNacimiento = computed(() => {
  const fecha = new Date()
  fecha.setFullYear(fecha.getFullYear() - 18)
  return fecha.toISOString().split('T')[0]
})

const { api } = useApi()
const { user } = useAuth()

// Función para mostrar notificaciones
const mostrarNotificacion = (mensaje, tipo = 'success') => {
  notificacion.value = {
    mostrar: true,
    mensaje,
    tipo
  }
  
  setTimeout(() => {
    notificacion.value.mostrar = false
  }, 4000)
}

// Función para validar DPI
const validarCedula = (event) => {
  const valor = event.target.value
  
  // Limpiar caracteres no numéricos
  const soloNumeros = valor.replace(/\D/g, '')
  
  // Actualizar el valor
  formCliente.value.cedula = soloNumeros
  
  // Validar
  if (soloNumeros.length === 0) {
    cedulaError.value = ''
  } else if (soloNumeros.length > 13) {
    cedulaError.value = 'El DPI no puede tener más de 13 dígitos'
  } else if (soloNumeros.length < 13) {
    cedulaError.value = 'El DPI debe tener al menos 13 dígitos'
  } else {
    cedulaError.value = ''
  }
}

// Función para permitir solo números
const soloNumeros = (event) => {
  const char = String.fromCharCode(event.which)
  if (!/[0-9]/.test(char)) {
    event.preventDefault()
  }
}

const cargarEstadisticas = async () => {
  try {
    const response = await api('/clients/stats')
    if (response.success) {
      stats.value = response.data.stats
    }
  } catch (err) {
    console.error('Error cargando estadísticas:', err)
    // Si hay error, reintentamos una vez después de un delay
    if (err.status === 500) {
      setTimeout(async () => {
        try {
          const retryResponse = await api('/clients/stats')
          if (retryResponse.success) {
            stats.value = retryResponse.data.stats
          }
        } catch (retryErr) {
          console.error('Error en reintento:', retryErr)
        }
      }, 1000)
    }
  }
}

const cargarClientes = async () => {
  try {
    loading.value = true
    error.value = null
    errorDetails.value = null
    
    const params = new URLSearchParams()
    if (filtros.value.busqueda) params.append('busqueda', filtros.value.busqueda)
    if (filtros.value.estado) params.append('estado', filtros.value.estado)
    params.append('sortBy', filtros.value.sortBy)
    params.append('sortOrder', filtros.value.sortOrder)
    params.append('page', filtros.value.page.toString())
    params.append('limit', filtros.value.limit.toString())
    
    const response = await api(`/clients?${params.toString()}`)
    
    if (response.success) {
      clientes.value = response.data.clientes
      pagination.value = response.data.pagination
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    error.value = err.message || 'Error cargando clientes'
    errorDetails.value = err.details || null
    console.error('Error detallado:', err)
  } finally {
    loading.value = false
  }
}

const aplicarFiltros = () => {
  filtros.value.page = 1
  cargarClientes()
}

let timeoutBusqueda = null
const debouncedBuscar = () => {
  clearTimeout(timeoutBusqueda)
  timeoutBusqueda = setTimeout(() => {
    aplicarFiltros()
  }, 500)
}

const cambiarPagina = (nuevaPagina) => {
  if (nuevaPagina >= 1 && nuevaPagina <= pagination.value.pages) {
    filtros.value.page = nuevaPagina
    cargarClientes()
  }
}

const crearCliente = async () => {
  if (cedulaError.value) {
    mostrarNotificacion('Corrige los errores en el formulario', 'error')
    return
  }

  try {
    guardandoCliente.value = true
    
    const response = await api('/clients', {
      method: 'POST',
      body: JSON.stringify(formCliente.value)
    })
    
    if (response.success) {
      cerrarModalCrear()
      cargarClientes()
      cargarEstadisticas()
      mostrarNotificacion('Cliente creado exitosamente', 'success')
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    mostrarNotificacion(err.message || 'Error creando cliente', 'error')
  } finally {
    guardandoCliente.value = false
  }
}

const actualizarCliente = async () => {
  try {
    guardandoCliente.value = true
    
    const response = await api(`/clients/${formCliente.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nombre: formCliente.value.nombre,
        apellido: formCliente.value.apellido,
        email: formCliente.value.email,
        telefono: formCliente.value.telefono,
        direccion: formCliente.value.direccion,
        estado: formCliente.value.estado,
        fechaNacimiento: formCliente.value.fechaNacimiento
      })
    })
    
    if (response.success) {
      cerrarModalEditar()
      cargarClientes()
      cargarEstadisticas()
      mostrarNotificacion('Cliente actualizado exitosamente', 'success')
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    mostrarNotificacion(err.message || 'Error actualizando cliente', 'error')
  } finally {
    guardandoCliente.value = false
  }
}

const toggleEstadoCliente = async (cliente) => {
  try {
    const nuevoEstado = cliente.estado === 'Activo' ? 'Inactivo' : 'Activo'
    const confirmMessage = `¿Estás seguro que deseas ${nuevoEstado.toLowerCase()} este cliente?`
    
    if (confirm(confirmMessage)) {
      const response = await api(`/clients/${cliente.id}/toggle-status`, {
        method: 'PUT'
      })
      
      if (response.success) {
        cargarClientes()
        cargarEstadisticas()
        mostrarNotificacion(`Cliente ${nuevoEstado.toLowerCase()} exitosamente`, 'success')
      } else {
        throw new Error(response.message)
      }
    }
  } catch (err) {
    mostrarNotificacion(err.message || 'Error cambiando estado del cliente', 'error')
  }
}

// Función mejorada para cargar detalles de cliente
const verCliente = async (cliente) => {
  try {
    loadingClienteDetalle.value = cliente.id
    clientePendienteDetalle.value = cliente
    
    const response = await api(`/clients/${cliente.id}`)
    
    if (response.success) {
      clienteSeleccionado.value = response.data.cliente
      mostrarModalVer.value = true
    } else {
      throw new Error(response.message || 'Error obteniendo detalle del cliente')
    }
  } catch (err) {
    console.error('Error detallado:', err)
    
    // Mostrar modal de error específico
    errorDetalleMessage.value = `No se pudo cargar la información del cliente "${cliente.nombre} ${cliente.apellido}". ${err.message || 'Error interno del servidor.'}`
    mostrarErrorDetalle.value = true
  } finally {
    loadingClienteDetalle.value = null
  }
}

// Función para reintentar cargar detalles
const reintentarCargarDetalle = async () => {
  if (clientePendienteDetalle.value) {
    cerrarErrorDetalle()
    await verCliente(clientePendienteDetalle.value)
  }
}

// Función para cerrar modal de error
const cerrarErrorDetalle = () => {
  mostrarErrorDetalle.value = false
  errorDetalleMessage.value = ''
  clientePendienteDetalle.value = null
}

const editarCliente = (cliente) => {
  formCliente.value = {
    id: cliente.id,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    cedula: cliente.cedula,
    estado: cliente.estado,
    fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.split('T')[0] : '',
    password: '' // Nunca pre-llenamos contraseñas
  }
  mostrarModalEditar.value = true
}

const cerrarModalCrear = () => {
  mostrarModalCrear.value = false
  formCliente.value = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    cedula: '',
    password: '',
    estado: 'Activo',
    fechaNacimiento: ''
  }
  cedulaError.value = ''
}

const cerrarModalEditar = () => {
  mostrarModalEditar.value = false
  formCliente.value = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    cedula: '',
    password: '',
    estado: 'Activo',
    fechaNacimiento: ''
  }
  cedulaError.value = ''
}

const cerrarModalVer = () => {
  mostrarModalVer.value = false
  clienteSeleccionado.value = null
}

const getInitials = (nombre, apellido) => {
  return `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase()
}

const formatDate = (fecha) => {
  if (!fecha) return 'N/A'
  try {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Fecha inválida'
  }
}

const formatNumber = (numero) => {
  if (!numero) return '0.00'
  try {
    return parseFloat(numero).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  } catch {
    return '0.00'
  }
}

// Cargar datos al montar el componente - VERSIÓN SIMPLIFICADA
onMounted(async () => {
  console.log('Montando AdministracionClientes...')
  
  // Esperar un poco para que la autenticación se estabilice
  await nextTick()
  
  // Cargar datos con un pequeño delay para evitar problemas de timing
  setTimeout(async () => {
    await cargarEstadisticas()
    await cargarClientes()
  }, 100)
})
</script>

<style scoped>
/* Estilos base */
.admin-clientes {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

/* Botón de navegación de regreso */
.navigation-header {
  max-width: 1400px;
  margin: 0 auto 1rem auto;
  padding: 0 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #D4AF37;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-back:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #D4AF37;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

/* Header section */
.header-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 2rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  padding: 1rem;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 16px;
  color: white;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.page-title h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #2C3E50;
  margin: 0;
}

.page-title p {
  color: #6c757d;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Estados de carga y error */
.loading-state, .error-state {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-spinner, .error-content {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498DB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-content svg {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-content h3 {
  color: #2C3E50;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.error-details {
  margin: 1rem 0;
  padding: 1rem;
  background: #ffeaea;
  border-left: 4px solid #e74c3c;
  border-radius: 4px;
  text-align: left;
}

.error-technical {
  font-family: monospace;
  font-size: 0.9rem;
  color: #c0392b;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
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

.btn-retry:hover:not(:disabled) {
  background: #B8941F;
  transform: translateY(-2px);
}

.btn-retry:disabled {
  background: #d3d3d3;
  cursor: not-allowed;
  transform: none;
}

.btn-back-error {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
}

.btn-back-error:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

/* Contenedor principal */
.admin-clientes > div:last-child {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Estadísticas */
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card .stat-icon {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.stat-card.active .stat-icon {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.stat-card.inactive .stat-icon {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
  color: #2C3E50;
}

.stat-content p {
  color: #4A4A4A;
  margin: 0;
  font-weight: 500;
}

/* Filtros */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 2;
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
  background: #fafbfc;
}

.search-box input:focus {
  outline: none;
  border-color: #D4AF37;
  background: white;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

/* Tabla */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
}

.clients-table thead {
  background: linear-gradient(45deg, #2C3E50, #34495E);
  color: white;
}

.clients-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.client-row {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.3s ease;
}

.client-row:hover {
  background-color: #f8f9fa;
}

.clients-table td {
  padding: 1rem;
  vertical-align: middle;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.client-avatar {
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
  flex-shrink: 0;
}

.client-name {
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.95rem;
}

.client-cedula {
  font-size: 0.8rem;
  color: #6c757d;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.activo {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.status-badge.inactivo {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.status-badge.pendiente {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.status-badge.aprobada {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.status-badge.rechazada {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.requests-count {
  background: #D4AF37;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Botones de acción */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-action.view {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.btn-action.view:hover:not(:disabled) {
  background: rgba(52, 152, 219, 0.2);
}

.btn-action.edit {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.btn-action.edit:hover {
  background: rgba(212, 175, 55, 0.2);
}

.btn-action.activate {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.btn-action.activate:hover {
  background: rgba(39, 174, 96, 0.2);
}

.btn-action.deactivate {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.btn-action.deactivate:hover {
  background: rgba(231, 76, 60, 0.2);
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.pagination-btn {
  background: #D4AF37;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #B8941F;
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  background: #d3d3d3;
  cursor: not-allowed;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 800px;
}

.modal-content.error-modal {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(45deg, #2C3E50, #34495E);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header.error-header {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Modal de Error Específico */
.error-modal-content {
  padding: 2rem;
  text-align: center;
}

.error-modal-content svg {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-modal-content h3 {
  color: #2C3E50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.error-suggestions {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
  text-align: left;
}

.error-suggestions h4 {
  color: #856404;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.error-suggestions ul {
  margin: 0;
  padding-left: 1.2rem;
  color: #856404;
}

.error-suggestions li {
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

/* Formularios */
.client-form {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.9rem;
}

.field-hint {
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: normal;
}

.form-input, .form-select, .form-textarea {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-input.readonly {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.field-error {
  color: #e74c3c;
  font-size: 0.8rem;
  font-weight: 500;
}

.field-info {
  color: #6c757d;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  margin-top: 2rem;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* Detalles del cliente */
.client-details {
  padding: 2rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-section h3 {
  color: #2C3E50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #D4AF37;
  padding-bottom: 0.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.detail-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  color: #2C3E50;
  font-size: 0.95rem;
}

/* Solicitudes */
.solicitudes-section {
  border-top: 1px solid #e9ecef;
  padding-top: 2rem;
}

.solicitudes-section h3 {
  color: #2C3E50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.solicitudes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.solicitud-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid #D4AF37;
}

.solicitud-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.solicitud-id {
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.9rem;
}

.solicitud-fecha {
  color: #6c757d;
  font-size: 0.8rem;
}

.solicitud-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.monto {
  color: #2C3E50;
  font-weight: 600;
  font-size: 0.95rem;
}

.no-solicitudes {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
  border-top: 1px solid #e9ecef;
}

/* Sistema de notificaciones */
.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
  max-width: 400px;
}

.notification.success {
  border-left: 4px solid #27AE60;
}

.notification.error {
  border-left: 4px solid #E74C3C;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
}

.notification.success .notification-content svg {
  color: #27AE60;
}

.notification.error .notification-content svg {
  color: #E74C3C;
}

.notification-content span {
  color: #2C3E50;
  font-weight: 500;
  font-size: 0.9rem;
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

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .clients-table {
    font-size: 0.8rem;
  }
  
  .clients-table th,
  .clients-table td {
    padding: 0.5rem;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .notification {
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style>