import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCarritoStore = defineStore('carrito', () => {
  const items = ref([])

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.cantidad, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
  })

  function agregarItem(producto) {
    const existingItem = items.value.find(item => item.id === producto.id)
    
    if (existingItem) {
      existingItem.cantidad += producto.cantidad || 1
    } else {
      items.value.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen || null,
        cantidad: producto.cantidad || 1
      })
    }

    guardarEnLocalStorage()
  }

  function eliminarItem(productoId) {
    items.value = items.value.filter(item => item.id !== productoId)
    guardarEnLocalStorage()
  }

  function actualizarCantidad(productoId, cantidad) {
    if (cantidad <= 0) {
      eliminarItem(productoId)
      return
    }

    const item = items.value.find(item => item.id === productoId)
    if (item) {
      item.cantidad = cantidad
      guardarEnLocalStorage()
    }
  }

  function vaciarCarrito() {
    items.value = []
    guardarEnLocalStorage()
  }

  function guardarEnLocalStorage() {
    if (process.client) {
      try {
        localStorage.setItem('carrito', JSON.stringify(items.value))
      } catch (e) {
        console.error('Error al guardar carrito en localStorage:', e)
      }
    }
  }

  function cargarDesdeLocalStorage() {
    if (process.client) {
      try {
        const stored = localStorage.getItem('carrito')
        if (stored) {
          items.value = JSON.parse(stored)
          console.log('Carrito cargado desde localStorage')
        }
      } catch (e) {
        console.error('Error al cargar carrito desde localStorage:', e)
        items.value = []
      }
    }
  }

  return {
    items,
    totalItems,
    totalPrice,
    agregarItem,
    eliminarItem,
    actualizarCantidad,
    vaciarCarrito,
    guardarEnLocalStorage,
    cargarDesdeLocalStorage
  }
})