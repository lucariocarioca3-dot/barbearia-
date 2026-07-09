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
        <button class="theme-btn" @click="theme.toggle" :title="theme.isDark ? 'Modo claro' : 'Modo escuro'">
          <span v-if="theme.isDark">&#9728;&#65039;</span>
          <span v-else>&#127769;</span>
        </button>
      </div>
    </div>
  </nav>
</template>
