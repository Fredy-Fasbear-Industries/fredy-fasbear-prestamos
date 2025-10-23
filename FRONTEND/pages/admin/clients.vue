<template>
  <div>
    <AdministracionClientes />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

useHead({
  title: 'Gestión de Clientes - Freddy Fasbear Industries'
})

import AdministracionClientes from '~/pages/admin/AdministracionClientes.vue'
</script>