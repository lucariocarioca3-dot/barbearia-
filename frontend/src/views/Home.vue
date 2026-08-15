<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const heroVideo = 'https://res.cloudinary.com/znu84vmw/video/upload/q_auto,f_auto,w_1920/v1786821294/barbearia.mp4'
const videoReady = ref(false)
const videoError = ref(false)

const videoEl = ref<HTMLVideoElement | null>(null)
let fallbackTimer: ReturnType<typeof setTimeout> | null = null

function setReady() {
  if (videoReady.value) return
  videoReady.value = true
  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
    fallbackTimer = null
  }
}

function onVideoCanPlay() {
  setReady()
}

function onVideoLoadedData() {
  setReady()
}

function onVideoLoadedMetadata() {
  setReady()
}

function onVideoError() {
  videoError.value = true
  setReady()
}

function startFallback() {
  fallbackTimer = setTimeout(() => {
    setReady()
  }, 3000)
}

onMounted(async () => {
  await nextTick()
  if (videoEl.value) {
    // Check multiple ready states for cached loads
    if (videoEl.value.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      setReady()
    } else {
      startFallback()
    }
  } else {
    startFallback()
  }
})

onUnmounted(() => {
  if (fallbackTimer) clearTimeout(fallbackTimer)
})
</script>

<template>
  <section class="hero">
    <video
      ref="videoEl"
      class="hero-video"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/imagens/hero-poster.png"
      @canplay="onVideoCanPlay"
      @loadeddata="onVideoLoadedData"
      @loadedmetadata="onVideoLoadedMetadata"
      @error="onVideoError"
    >
      <source :src="heroVideo" />
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