<template>
  <div id="app">
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <NuxtLoadingIndicator />
  </div>
</template>

<script setup>
useHead({
  titleTemplate: '%s - Fredy Fasbear Industries',
  meta: [
    { name: 'description', content: 'Sistema de empeño profesional y confiable' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}
</style>