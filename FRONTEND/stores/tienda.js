import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTiendaStore = defineStore('tienda', () => {
  const productos = ref([])
  const loading = ref(false)
  const error = ref(null)

  const config = useRuntimeConfig()
  const API_URL = config.public.apiBase
  const BACKEND_BASE = API_URL.replace('/api', '')

  const construirUrlImagen = (rutaImagen) => {
    if (!rutaImagen) return null
    if (rutaImagen.startsWith('http')) return rutaImagen
    return `${BACKEND_BASE}${rutaImagen}`
  }

  async function fetchProductos() {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`${API_URL}/productos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.success) {
        productos.value = response.data.map(p => ({
          id: p.id_producto,
          articuloId: p.id_articulo,
          nombre: p.articulo?.descripcion || 'Sin nombre',
          precio: parseFloat(p.precio_venta),
          precioOriginal: p.articulo?.valor_estimado ? parseFloat(p.articulo.valor_estimado) : null,
          imagen: p.articulo?.imagenes?.[0] ? construirUrlImagen(p.articulo.imagenes[0]) : null,
          categoria: p.categoria || 'Sin categoría',
          condicion: p.articulo?.condicion || 'Bueno',
          estado: p.estado,
          descuento: p.descuento_aplicado || 0,
          valoracion: parseFloat(p.valoracion_promedio) || 0,
          diasInventario: p.dias_en_inventario || 0,
          descripcion: p.articulo?.descripcion_detallada || '',
          marca: p.articulo?.marca || '',
          modelo: p.articulo?.modelo || '',
          especificaciones: {
            marca: p.articulo?.marca || 'N/A',
            modelo: p.articulo?.modelo || 'N/A',
            condicion: p.articulo?.condicion || 'N/A'
          }
        }))
        
        return productos.value
      }
    } catch (err) {
      error.value = err.message || 'Error al cargar productos'
      console.error('Error fetchProductos:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchProductoDetalle(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`${API_URL}/productos/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.success) {
        const p = response.data
        return {
          id: p.id_producto,
          articuloId: p.id_articulo,
          nombre: p.articulo?.descripcion || 'Sin nombre',
          precio: parseFloat(p.precio_venta),
          precioOriginal: p.articulo?.valor_estimado ? parseFloat(p.articulo.valor_estimado) : null,
          imagenes: p.articulo?.imagenes?.map(img => construirUrlImagen(img)) || [],
          categoria: p.categoria || 'Sin categoría',
          condicion: p.articulo?.condicion || 'Bueno',
          estado: p.estado,
          descuento: p.descuento_aplicado || 0,
          valoracion: parseFloat(p.valoracion_promedio) || 0,
          diasInventario: p.dias_en_inventario || 0,
          descripcion: p.articulo?.descripcion_detallada || '',
          marca: p.articulo?.marca || '',
          modelo: p.articulo?.modelo || '',
          especificaciones: {
            Marca: p.articulo?.marca || 'N/A',
            Modelo: p.articulo?.modelo || 'N/A',
            Condición: p.articulo?.condicion || 'N/A',
            Estado: p.estado || 'N/A'
          },
          enEmpeno: p.articulo?.solicitud_prestamo ? true : false,
          fechaEmpeno: p.articulo?.solicitud_prestamo?.fecha_solicitud || null,
          comentarios: p.comentarios || []
        }
      }
    } catch (err) {
      error.value = err.message || 'Error al cargar producto'
      console.error('Error fetchProductoDetalle:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const productosDisponibles = computed(() => {
    return productos.value.filter(p => p.estado === 'Disponible')
  })

  const productosDestacados = computed(() => {
    return productos.value
      .filter(p => p.estado === 'Disponible')
      .sort((a, b) => b.valoracion - a.valoracion)
      .slice(0, 6)
  })

  return {
    productos,
    loading,
    error,
    productosDisponibles,
    productosDestacados,
    fetchProductos,
    fetchProductoDetalle
  }
})