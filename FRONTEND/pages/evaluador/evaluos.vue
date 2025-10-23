<template>
  <div class="avaluos-page">
    <!-- NAVEGACIÓN -->
    <div class="navigation-header">
      <NuxtLink to="/evaluador" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <polyline points="12,19 5,12 12,5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Volver al Panel de Evaluador
      </NuxtLink>
    </div>

    <div class="container">
      <!-- HEADER -->
      <div class="page-header">
        <div class="header-content">
          <h1>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
              <path d="M9 12H15M9 16H15" stroke="currentColor" stroke-width="2"/>
            </svg>
            Historial de Avalúos
          </h1>
          <p>Consulta todos los avalúos que has realizado</p>
        </div>
        
        <button @click="cargarAvaluos" class="btn-refresh">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M23 4V10H17" stroke="currentColor" stroke-width="2"/>
            <path d="M1 20V14H7" stroke="currentColor" stroke-width="2"/>
            <path d="M3.51 9C4.15 6.7 5.74 4.75 7.85 3.55C11.85 1.41 16.79 2.74 19.07 6.51L23 10M1 14L4.93 17.49C7.21 21.26 12.15 22.59 16.15 20.45C18.26 19.25 19.85 17.3 20.49 15" stroke="currentColor" stroke-width="2"/>
          </svg>
          Actualizar
        </button>
      </div>

      <!-- ESTADÍSTICAS RÁPIDAS -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Avalúos</span>
            <span class="stat-value">{{ pagination.total || 0 }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Aprobados</span>
            <span class="stat-value">{{ contarPorEstado('Aprobada') }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Rechazados</span>
            <span class="stat-value">{{ contarPorEstado('Rechazada') }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gold">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
              <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Valor Total</span>
            <span class="stat-value">Q{{ formatCurrency(calcularValorTotal()) }}</span>
          </div>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando avalúos...</p>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="avaluos.length === 0" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2"/>
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="16" x2="13" y2="16" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>No hay avalúos registrados</h3>
        <p>Aún no has realizado ningún avalúo</p>
      </div>

      <!-- TABLA DE AVALÚOS -->
      <div v-else class="avaluos-table-container">
        <table class="avaluos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Artículo</th>
              <th>Valor Comercial</th>
              <th>% Aplicado</th>
              <th>Monto Préstamo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="avaluo in avaluos" :key="avaluo.id" class="avaluo-row">
              <td class="id-cell">#{{ avaluo.id }}</td>
              <td>{{ formatDate(avaluo.fechaAvaluo) }}</td>
              <td class="cliente-cell">
                <div class="cliente-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ avaluo.articulo.solicitud.usuario.nombre }} {{ avaluo.articulo.solicitud.usuario.apellido }}
                </div>
              </td>
              <td class="articulo-cell">
                <span class="tipo-badge">{{ avaluo.articulo.tipoArticulo.nombre }}</span>
                <span class="articulo-desc">{{ truncateText(avaluo.articulo.descripcion, 30) }}</span>
              </td>
              <td class="monto-cell">Q{{ formatCurrency(avaluo.valorComercial) }}</td>
              <td class="porcentaje-cell">{{ avaluo.porcentajeAplicado }}%</td>
              <td class="monto-cell destacado">Q{{ formatCurrency(avaluo.montoPrestamo) }}</td>
              <td>
                <span class="estado-badge" :class="avaluo.articulo.solicitud.estado.toLowerCase()">
                  {{ avaluo.articulo.solicitud.estado }}
                </span>
              </td>
              <td class="actions-cell">
                <button 
                  @click="verDetalle(avaluo.articulo.solicitud.id)" 
                  class="btn-ver"
                  title="Ver detalles"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINACIÓN -->
      <div v-if="pagination.totalPaginas > 1" class="pagination">
        <button 
          @click="cambiarPagina(pagination.pagina - 1)"
          :disabled="pagination.pagina === 1"
          class="btn-pagina"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline points="15,18 9,12 15,6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Anterior
        </button>

        <div class="pagina-info">
          Página {{ pagination.pagina }} de {{ pagination.totalPaginas }}
        </div>

        <button 
          @click="cambiarPagina(pagination.pagina + 1)"
          :disabled="pagination.pagina === pagination.totalPaginas"
          class="btn-pagina"
        >
          Siguiente
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline points="9,18 15,12 9,6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEvaluador } from '~/composables/useEvaluador'

definePageMeta({
  middleware: ['evaluador']
})

const router = useRouter()
const { obtenerMisAvaluos, formatearMoneda, formatearFecha } = useEvaluador()

const loading = ref(true)
const avaluos = ref([])
const pagination = ref({
  total: 0,
  pagina: 1,
  limite: 20,
  totalPaginas: 0
})

const cargarAvaluos = async () => {
  try {
    loading.value = true
    const resultado = await obtenerMisAvaluos({
      limite: pagination.value.limite,
      pagina: pagination.value.pagina
    })
    
    avaluos.value = resultado.avaluos
    pagination.value = resultado.pagination
    
    console.log('Avalúos cargados:', avaluos.value.length)
  } catch (error) {
    console.error('Error cargando avalúos:', error)
  } finally {
    loading.value = false
  }
}

const cambiarPagina = (nuevaPagina) => {
  if (nuevaPagina < 1 || nuevaPagina > pagination.value.totalPaginas) return
  pagination.value.pagina = nuevaPagina
  cargarAvaluos()
}

const verDetalle = (solicitudId) => {
  router.push(`/evaluador/solicitudes/${solicitudId}`)
}

const contarPorEstado = (estado) => {
  return avaluos.value.filter(a => a.articulo.solicitud.estado === estado).length
}

const calcularValorTotal = () => {
  return avaluos.value.reduce((total, avaluo) => {
    return total + parseFloat(avaluo.montoPrestamo)
  }, 0)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const truncateText = (text, maxLength) => {
  if (!text) return 'N/A'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

onMounted(() => {
  cargarAvaluos()
})
</script>

<style scoped>
:root {
  --color-negro-carbon: #1A1A1A;
  --color-blanco-perla: #F5F5F5;
  --color-gris-acero: #4A4A4A;
  --color-azul-marino: #2C3E50;
  --color-dorado-vintage: #D4AF37;
  --color-rojo-granate: #8B0000;
}

.avaluos-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
}

.navigation-header {
  background: var(--color-blanco-perla);
  padding: 1rem 2rem;
  border-bottom: 1px solid #E5E7EB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-gris-acero);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: var(--color-dorado-vintage);
  color: white;
  transform: translateX(-4px);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* PAGE HEADER */
.page-header {
  background: var(--color-blanco-perla);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin-bottom: 0.5rem;
}

.header-content h1 svg {
  color: var(--color-dorado-vintage);
}

.header-content p {
  color: var(--color-gris-acero);
  font-size: 1rem;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: #F4D03F;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* STATS CARDS */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
  color: #1E40AF;
}

.stat-icon.green {
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  color: #065F46;
}

.stat-icon.red {
  background: linear-gradient(135deg, #FEE2E2, #FECACA);
  color: var(--color-rojo-granate);
}

.stat-icon.gold {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  color: #92400E;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-gris-acero);
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

/* LOADING & EMPTY */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(212, 175, 55, 0.2);
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  color: #D1D5DB;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--color-negro-carbon);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--color-gris-acero);
}

/* TABLA */
.avaluos-table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.avaluos-table {
  width: 100%;
  border-collapse: collapse;
}

.avaluos-table thead {
  background: linear-gradient(135deg, var(--color-azul-marino), var(--color-gris-acero));
  color: white;
}

.avaluos-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.avaluos-table tbody tr {
  border-bottom: 1px solid #E5E7EB;
  transition: all 0.3s ease;
}

.avaluos-table tbody tr:hover {
  background: var(--color-blanco-perla);
}

.avaluos-table td {
  padding: 1rem;
  font-size: 0.95rem;
  color: var(--color-gris-acero);
}

.id-cell {
  font-weight: 600;
  color: var(--color-azul-marino);
}

.cliente-cell .cliente-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--color-negro-carbon);
}

.articulo-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tipo-badge {
  display: inline-block;
  background: var(--color-azul-marino);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.articulo-desc {
  font-size: 0.875rem;
  color: var(--color-gris-acero);
}

.monto-cell {
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.monto-cell.destacado {
  color: var(--color-dorado-vintage);
  font-size: 1.1rem;
}

.porcentaje-cell {
  font-weight: 600;
  color: var(--color-azul-marino);
}

.estado-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.aprobada {
  background: #D1FAE5;
  color: #065F46;
}

.estado-badge.rechazada {
  background: #FEE2E2;
  color: var(--color-rojo-granate);
}

.estado-badge.pendiente {
  background: #FEF3C7;
  color: #92400E;
}

.actions-cell {
  text-align: center;
}

.btn-ver {
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-ver:hover {
  background: #F4D03F;
  transform: scale(1.1);
}

/* PAGINACIÓN */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.btn-pagina {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-pagina:hover:not(:disabled) {
  background: #F4D03F;
  transform: translateY(-2px);
}

.btn-pagina:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagina-info {
  font-weight: 600;
  color: var(--color-gris-acero);
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .avaluos-table-container {
    overflow-x: auto;
  }

  .avaluos-table {
    min-width: 1000px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>