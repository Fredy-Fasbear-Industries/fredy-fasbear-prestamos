export const useFormatters = () => {
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00'
    return new Intl.NumberFormat('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha'
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateLong = (dateString) => {
    if (!dateString) return 'Sin fecha'
    return new Date(dateString).toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateShort = (dateString) => {
    if (!dateString) return 'Sin fecha'
    return new Date(dateString).toLocaleDateString('es-GT', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatearEstado = (estado) => {
    const estados = {
      'Pendiente': 'Pendiente de Evaluación',
      'Evaluando': 'En Proceso de Evaluación', 
      'Aprobada': 'Aprobada - Lista para Firma',
      'Rechazada': 'Rechazada',
      'Completada': 'Completada'
    }
    return estados[estado] || estado
  }

  const formatearEstadoFisico = (estado) => {
    const estados = {
      'Excelente': 'Excelente',
      'Bueno': 'Buen Estado',
      'Regular': 'Estado Regular',
      'Malo': 'Estado Deficiente'
    }
    return estados[estado] || estado || 'No especificado'
  }

  const formatModalidadPago = (modalidad) => {
    const modalidades = {
      'contado': 'Pago al Contado',
      'mensual': 'Pagos Mensuales',
      'quincenal': 'Pagos Quincenales',
      'semanal': 'Pagos Semanales'
    }
    return modalidades[modalidad] || modalidad
  }

  const getColorHex = (colorName) => {
    if (!colorName) return '#CCCCCC'
    
    const colores = {
      'rojo': '#FF0000',
      'azul': '#0000FF',
      'verde': '#008000',
      'amarillo': '#FFFF00',
      'negro': '#000000',
      'blanco': '#FFFFFF',
      'gris': '#808080',
      'rosa': '#FFC0CB',
      'morado': '#800080',
      'naranja': '#FFA500',
      'plata': '#C0C0C0',
      'oro': '#FFD700',
      'bronce': '#CD7F32',
      'azul marino': '#000080',
      'verde oscuro': '#006400',
      'rojo oscuro': '#8B0000',
      'gris oscuro': '#2F2F2F',
      'gris claro': '#D3D3D3',
      'beige': '#F5F5DC',
      'café': '#A0522D',
      'marrón': '#A0522D'
    }
    
    return colores[colorName.toLowerCase()] || '#CCCCCC'
  }

  const obtenerTipoDocumento = (tipoMime) => {
    const tipos = {
      'application/pdf': 'PDF',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'text/plain': 'Texto',
      'image/jpeg': 'Imagen',
      'image/jpg': 'Imagen',
      'image/png': 'Imagen',
      'image/gif': 'Imagen',
      'image/webp': 'Imagen'
    }
    return tipos[tipoMime] || 'Documento'
  }

  return {
    formatCurrency,
    formatDate,
    formatDateLong,
    formatDateShort,
    formatFileSize,
    formatearEstado,
    formatearEstadoFisico,
    formatModalidadPago,
    getColorHex,
    obtenerTipoDocumento
  }
}