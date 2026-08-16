<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'

const route = useRoute()
const theme = useThemeStore()
const mobileOpen = ref(false)
const isAdmin = computed(() => route.path.startsWith('/admin'))

function closeMenu() {
  mobileOpen.value = false
}
</script>

<template>
  <nav class="navbar">
    <div class="container">
      <router-link to="/" class="navbar-brand" @click="closeMenu">
        <img src="/pngtree-barbershop-logo-png-image_8090194.png" alt="Logo" class="navbar-logo" />
        Corte &amp; Estilo
      </router-link>
      <button class="hamburger" :class="{ open: mobileOpen }" @click="mobileOpen = !mobileOpen" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div class="navbar-links" :class="{ open: mobileOpen }">
        <template v-if="!isAdmin">
          <router-link to="/" @click="closeMenu">Início</router-link>
          <router-link to="/agendar" @click="closeMenu">Agendar</router-link>
          <router-link to="/admin" @click="closeMenu">Admin</router-link>
        </template>
        <template v-else>
          <router-link to="/admin" @click="closeMenu">Dashboard</router-link>
          <router-link to="/admin/agendamentos" @click="closeMenu">Agendamentos</router-link>
          <router-link to="/admin/barbeiros" @click="closeMenu">Barbeiros</router-link>
          <router-link to="/admin/servicos" @click="closeMenu">Serviços</router-link>
          <router-link to="/" @click="closeMenu" class="nav-link-home">← Site</router-link>
        </template>
        <button class="theme-btn" @click="theme.toggle" :title="theme.isDark ? 'Modo claro' : 'Modo escuro'" aria-label="Alternar tema">
          <svg v-if="theme.isDark" class="theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
          <svg v-else class="theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </div>
    </div>
  </nav>
</template>
