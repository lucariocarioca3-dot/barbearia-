<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const heroVideo = '/imagens/barbearia.mp4'
const heroVideoWebm = '/imagens/barbearia.webm'
const videoReady = ref(false)
const videoError = ref(false)

function onVideoCanPlay() {
  videoReady.value = true
}

function onVideoError() {
  videoError.value = true
  videoReady.value = true
}
</script>

<template>
  <section class="hero">
    <video
      class="hero-video"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/imagens/hero-poster.png"
      @canplay="onVideoCanPlay"
      @error="onVideoError"
    >
      <source :src="heroVideoWebm" type="video/webm" />
      <source :src="heroVideo" type="video/mp4" />
      Seu navegador não suporta vídeo.
    </video>
    <div class="hero-overlay"></div>
    <div v-if="!videoReady" class="hero-loading" aria-hidden="true">
      <div class="spinner"></div>
    </div>
    <div class="hero-content">
      <h1>Corte & Estilo</h1>
      <p>Agende seu horário com os melhores barbeiros da cidade. Praticidade e estilo em um só lugar.</p>
      <div class="hero-actions">
        <button class="btn btn-primary" @click="router.push('/agendar')">
          Agendar Horário
        </button>
        <button class="btn btn-secondary" @click="router.push('/admin/login')">
          Área do Barbeiro
        </button>
      </div>
    </div>
  </section>

  <section class="features">
    <div class="container">
      <div class="section-title">Como funciona</div>
      <div class="features-grid">
        <div class="card feature-card">
          <div class="feature-icon">1.</div>
          <h3>Escolha o barbeiro</h3>
          <p>Selecione o profissional da sua preferência.</p>
        </div>
        <div class="card feature-card">
          <div class="feature-icon">2.</div>
          <h3>Selecione o serviço</h3>
          <p>Corte, barba, hidratação e muito mais.</p>
        </div>
        <div class="card feature-card">
          <div class="feature-icon">3.</div>
          <h3>Confirme o horário</h3>
          <p>Veja os horários disponíveis e agende em segundos.</p>
        </div>
      </div>
    </div>
  </section>
</template>