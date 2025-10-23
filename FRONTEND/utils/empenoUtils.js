export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatEstado = (estado) => {
  const estados = {
    'Pendiente': 'Pendiente',
    'Evaluando': 'En Evaluación',
    'Aprobada': 'Aprobada',
    'Rechazada': 'Rechazada',
    'Activo': 'Activo',
    'Vencido': 'Vencido', 
    'En_Mora': 'En Mora',
    'Pagado': 'Pagado'
  }
  return estados[estado] || estado
}

export const isVencido = (fechaVencimiento) => {
  if (!fechaVencimiento) return false
  return new Date(fechaVencimiento) < new Date()
}

export const getItemTitulo = (item) => {
  if (item.tipo === 'solicitud') {
    return item.descripcion || 'Solicitud de empéño'
  }
  return item.descripcion || 'Préstamo activo'
}

export const getItemFecha = (item) => {
  if (item.tipo === 'solicitud') {
    return `Solicitud: ${formatDate(item.fecha)}`
  }
  return `Fecha inicio: ${formatDate(item.fecha)}`
}

export const calcularDiasRestantes = (item) => {
  if (!item.fechaVencimiento) return 0
  
  const hoy = new Date()
  const vencimiento = new Date(item.fechaVencimiento)
  const diferencia = vencimiento - hoy
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))
  
  return Math.max(0, dias)
}

export const calcularPorcentajeTiempo = (item) => {
  if (!item.fecha || !item.fechaVencimiento) return 0
  
  const inicio = new Date(item.fecha)
  const vencimiento = new Date(item.fechaVencimiento)
  const hoy = new Date()
  
  const tiempoTotal = vencimiento - inicio
  const tiempoTranscurrido = hoy - inicio
  
  const porcentaje = Math.min(100, Math.max(0, (tiempoTranscurrido / tiempoTotal) * 100))
  return Math.round(porcentaje)
}

export const getUserInitials = (user) => {
  if (!user) return 'U'
  
  const nombre = user.nombre || ''
  const apellido = user.apellido || ''
  
  const inicialNombre = nombre.charAt(0).toUpperCase()
  const inicialApellido = apellido.charAt(0).toUpperCase()
  
  return `${inicialNombre}${inicialApellido}` || 'U'
}