<template>
  <div class="tienda-layout">
    <slot />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCarritoStore } from '~/stores/carrito'

const carritoStore = useCarritoStore()

onMounted(() => {
  carritoStore.cargarDesdeLocalStorage()
})
</script>

<style>
:root {
  --negro-carbon: #1a1a1a;
  --blanco-perla: #f5f5f5;
  --gris-acero: #4a4a4a;
  --azul-marino: #2c3e50;
  --dorado-vintage: #d4af37;
  --rojo-granate: #8b0000;
  --marron-chocolate: #3e2723;
  --verde-bosque: #1b4332;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--blanco-perla);
  color: var(--negro-carbon);
}

.tienda-layout {
  min-height: 100vh;
}
</style>