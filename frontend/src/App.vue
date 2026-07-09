<script setup lang="ts">
import AppNavbar from './components/AppNavbar.vue'
</script>

<template>
  <AppNavbar />
  <main class="container" style="min-height: 80vh; padding-top: 30px; padding-bottom: 60px;">
    <router-view />
  </main>
  <footer>
    <div class="container">
      Corte &amp; Estilo &copy; 2026
    </div>
  </footer>
</template>
