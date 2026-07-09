<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <section class="hero">
    <h1>Corte &amp; Estilo</h1>
    <p>Agende seu horário com os melhores barbeiros da cidade. Praticidade e estilo em um só lugar.</p>
    <div class="hero-actions">
      <button class="btn btn-primary" @click="router.push('/agendar')">
        Agendar Horário
      </button>
      <button class="btn btn-secondary" @click="router.push('/admin/login')">
        Área do Barbeiro
      </button>
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
