<template>
  <div class="detalle-content">
    <div class="financiero-section">
      <div class="section-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
            <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Resumen Financiero
        </h2>
      </div>

      <div class="financiero-resumen">
        <div class="montos-principales">
          <div class="monto-card principal" v-if="prestamo?.montoSolicitado">
            <div class="monto-icono">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="monto-info">
              <span class="monto-label">Monto Solicitado</span>
              <span class="monto-valor">{{ formatCurrency(prestamo.montoSolicitado) }}</span>
            </div>
          </div>

          <div class="monto-card" v-if="prestamo?.tasaInteres">
            <div class="monto-icono">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M8 14S9.5 16 12 16S16 14 16 14" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="monto-info">
              <span class="monto-label">Tasa de Interés</span>
              <span class="monto-valor">{{ prestamo.tasaInteres }}% mensual</span>
            </div>
          </div>

          <div class="monto-card destacada" v-if="prestamo?.totalAPagar">
            <div class="monto-icono">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4H8" stroke="currentColor" stroke-width="2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2"/>
                <path d="M9 14L11 16L15 12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="monto-info">
              <span class="monto-label">Total a Pagar</span>
              <span class="monto-valor">{{ formatCurrency(prestamo.totalAPagar) }}</span>
            </div>
          </div>

          <div class="monto-card" v-if="prestamo?.modalidadPago">
            <div class="monto-icono">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="monto-info">
              <span class="monto-label">Modalidad de Pago</span>
              <span class="monto-valor">{{ formatModalidadPago(prestamo.modalidadPago) }}</span>
            </div>
          </div>
        </div>

        <div v-if="prestamo?.modalidadPago !== 'contado' && planPagosCalculado.length > 0" class="plan-pagos-section">
          <div class="plan-header">
            <h3>Plan de Pagos</h3>
            <div class="plan-resumen">
              <span class="numero-pagos">{{ planPagosCalculado.length }} pagos</span>
              <span class="monto-por-pago">{{ formatCurrency(montoPorPago) }} cada {{ frequenciaPago }}</span>
            </div>
          </div>

          <div class="tabla-pagos">
            <div class="tabla-header">
              <div class="col-cuota">Cuota</div>
              <div class="col-fecha">Fecha</div>
              <div class="col-capital">Capital</div>
              <div class="col-interes">Interés</div>
              <div class="col-total">Total</div>
              <div class="col-saldo">Saldo</div>
            </div>
            
            <div 
              v-for="pago in planPagosCalculado" 
              :key="pago.numero"
              class="tabla-row"
              :class="{ 'row-final': pago.numero === planPagosCalculado.length }"
            >
              <div class="col-cuota">
                <span class="cuota-numero">{{ pago.numero }}</span>
              </div>
              <div class="col-fecha">
                <span class="fecha-corta">{{ formatDateShort(pago.fecha) }}</span>
              </div>
              <div class="col-capital">
                <span class="monto capital">{{ formatCurrency(pago.capital) }}</span>
              </div>
              <div class="col-interes">
                <span class="monto interes">{{ formatCurrency(pago.interes) }}</span>
              </div>
              <div class="col-total">
                <span class="monto total">{{ formatCurrency(pago.totalCuota) }}</span>
              </div>
              <div class="col-saldo">
                <span class="monto saldo" :class="{ 'saldo-cero': pago.saldoPendiente === 0 }">
                  {{ formatCurrency(pago.saldoPendiente) }}
                </span>
              </div>
            </div>
          </div>

          <div class="plan-totales">
            <div class="total-item">
              <span class="total-label">Total Capital:</span>
              <span class="total-valor">{{ formatCurrency(prestamo?.montoSolicitado) }}</span>
            </div>
            <div class="total-item">
              <span class="total-label">Total Intereses:</span>
              <span class="total-valor">{{ formatCurrency(totalIntereses) }}</span>
            </div>
            <div class="total-item destacado">
              <span class="total-label">Total a Pagar:</span>
              <span class="total-valor">{{ formatCurrency(prestamo?.totalAPagar) }}</span>
            </div>
          </div>
        </div>

        <div class="info-adicional" v-if="prestamo?.plazoMeses">
          <div class="info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Plazo: {{ prestamo.plazoMeses }} {{ prestamo.plazoMeses === 1 ? 'mes' : 'meses' }}</span>
          </div>
          
          <div class="info-item" v-if="fechaVencimientoCalculada">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Vencimiento: {{ formatDateLong(fechaVencimientoCalculada) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  prestamo: {
    type: Object,
    required: true
  },
  fechaSolicitud: {
    type: String,
    default: null
  }
})

const { formatCurrency, formatDateShort, formatDateLong, formatModalidadPago } = useFormatters()

const planPagosCalculado = computed(() => {
  if (!props.prestamo?.planPagos || !Array.isArray(props.prestamo.planPagos)) {
    return []
  }

  return props.prestamo.planPagos.map(pago => ({
    numero: pago.numeroPago,
    fecha: new Date(pago.fechaPago),
    capital: pago.capital,
    interes: pago.interes,
    totalCuota: pago.montoPago,
    saldoPendiente: pago.saldoPendiente,
    comision: pago.comision || 0
  }))
})

const montoPorPago = computed(() => {
  return props.prestamo?.resumenFinanciero?.montoPorPago || 0
})

const frequenciaPago = computed(() => {
  if (!props.prestamo?.modalidadPago) return ''
  
  const frecuencias = {
    'mensual': 'mes',
    'quincenal': '15 días',
    'semanal': 'semana',
    'contado': 'pago único'
  }
  
  return frecuencias[props.prestamo.modalidadPago] || ''
})

const totalIntereses = computed(() => {
  return props.prestamo?.resumenFinanciero?.interesTotal || 0
})

const fechaVencimientoCalculada = computed(() => {
  if (!props.fechaSolicitud || !props.prestamo?.plazoMeses) return null
  
  const fechaInicio = new Date(props.fechaSolicitud)
  fechaInicio.setMonth(fechaInicio.getMonth() + parseInt(props.prestamo.plazoMeses))
  
  return fechaInicio
})
</script>

<style scoped>
.financiero-section {
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.section-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0;
}

.section-header h2 svg {
  color: var(--color-dorado-vintage);
}

.financiero-resumen {
  padding: 2rem;
}

.montos-principales {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.monto-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, white, #f8fafc);
  border-radius: var(--border-radius);
  border: 2px solid transparent;
  transition: var(--transition);
}

.monto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.15);
}

.monto-card.principal {
  border-color: var(--color-dorado-vintage);
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.monto-card.destacada {
  border-color: var(--color-verde-bosque);
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.monto-icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius);
  color: white;
  flex-shrink: 0;
}

.monto-card.principal .monto-icono {
  background: var(--color-dorado-vintage);
}

.monto-card.destacada .monto-icono {
  background: var(--color-verde-bosque);
}

.monto-card:not(.principal):not(.destacada) .monto-icono {
  background: var(--color-azul-marino);
}

.monto-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.monto-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gris-acero);
}

.monto-valor {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.monto-card.principal .monto-valor {
  color: var(--color-dorado-vintage);
  font-size: 1.5rem;
}

.monto-card.destacada .monto-valor {
  color: var(--color-verde-bosque);
  font-size: 1.5rem;
}

.plan-pagos-section {
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-top: 2rem;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--color-azul-marino), var(--color-gris-acero));
  color: white;
}

.plan-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.plan-resumen {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: right;
}

.numero-pagos {
  font-size: 0.875rem;
  font-weight: 600;
}

.monto-por-pago {
  font-size: 0.75rem;
  opacity: 0.9;
}

.tabla-pagos {
  overflow-x: auto;
}

.tabla-header,
.tabla-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr 1fr 1fr;
  gap: 0.5rem;
  align-items: center;
  min-width: 600px;
}

.tabla-header {
  background: var(--color-dorado-vintage);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 1rem;
}

.tabla-row {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  transition: var(--transition);
}

.tabla-row:hover {
  background: #f8fafc;
}

.tabla-row.row-final {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  font-weight: 600;
}

.tabla-row:last-child {
  border-bottom: none;
}

.col-cuota,
.col-fecha,
.col-capital,
.col-interes,
.col-total,
.col-saldo {
  text-align: center;
  padding: 0.25rem;
}

.cuota-numero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-dorado-vintage);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.75rem;
}

.fecha-corta {
  font-weight: 500;
  color: var(--color-gris-acero);
}

.monto {
  font-weight: 600;
}

.monto.capital {
  color: var(--color-azul-marino);
}

.monto.interes {
  color: var(--color-rojo-granate);
}

.monto.total {
  color: var(--color-negro-carbon);
}

.monto.saldo {
  color: var(--color-gris-acero);
}

.monto.saldo.saldo-cero {
  color: var(--color-verde-bosque);
  font-weight: 700;
}

.plan-totales {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.total-item.destacado {
  border-color: var(--color-verde-bosque);
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.total-label {
  font-weight: 500;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.total-valor {
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.total-item.destacado .total-label {
  color: var(--color-verde-bosque);
}

.total-item.destacado .total-valor {
  color: var(--color-verde-bosque);
  font-size: 1.125rem;
}

.info-adicional {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
}

.info-adicional .info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-gris-acero);
}

.info-adicional .info-item svg {
  color: var(--color-dorado-vintage);
}

@media (max-width: 768px) {
  .montos-principales {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .monto-card {
    padding: 1rem;
  }
  
  .monto-icono {
    width: 48px;
    height: 48px;
  }
  
  .tabla-header,
  .tabla-row {
    grid-template-columns: 60px 1fr 1fr 1fr;
    gap: 0.25rem;
    font-size: 0.75rem;
  }
  
  .col-capital,
  .col-interes {
    display: none;
  }
  
  .plan-totales {
    grid-template-columns: 1fr;
  }
  
  .info-adicional {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .tabla-header,
  .tabla-row {
    grid-template-columns: 50px 1fr 80px;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
  }
  
  .col-fecha,
  .col-capital,
  .col-interes,
  .col-saldo {
    display: none;
  }
}
</style>