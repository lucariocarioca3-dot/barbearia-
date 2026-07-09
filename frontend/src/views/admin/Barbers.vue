<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BarberAPI } from '../../api/client'
import type { Barber, WorkingHours } from '../../types'

const barbers = ref<Barber[]>([])
const loading = ref(true)
const showModal = ref(false)
const editing = ref(false)
const form = ref({ id: 0, name: '', photo: '' })
const hoursModal = ref(false)
const hoursBarber = ref<Barber | null>(null)
const hoursData = ref<{ day_of_week: number; start_time: string; end_time: string; active: boolean }[]>([])

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

async function loadBarbers() {
  loading.value = true
  try {
    const res = await BarberAPI.listAll()
    barbers.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  form.value = { id: 0, name: '', photo: '' }
  showModal.value = true
}

function openEdit(barber: Barber) {
  editing.value = true
  form.value = { id: barber.id, name: barber.name, photo: barber.photo || '' }
  showModal.value = true
}

async function save() {
  if (editing.value) {
    await BarberAPI.update(form.value.id, { name: form.value.name, photo: form.value.photo || null })
  } else {
    await BarberAPI.create({ name: form.value.name, photo: form.value.photo || null })
  }
  showModal.value = false
  await loadBarbers()
}

async function confirmDelete(id: number) {
  if (confirm('Excluir barbeiro?')) {
    await BarberAPI.remove(id)
    await loadBarbers()
  }
}

async function openHours(barber: Barber) {
  hoursBarber.value = barber
  try {
    const res = await BarberAPI.getHours(barber.id)
    hoursData.value = DAYS.map((_, i) => {
      const existing = res.data.find((h: WorkingHours) => h.day_of_week === i)
      return { day_of_week: i, start_time: existing?.start_time || '09:00', end_time: existing?.end_time || '18:00', active: !!existing }
    })
  } catch {
    hoursData.value = DAYS.map((_, i) => ({ day_of_week: i, start_time: '09:00', end_time: '18:00', active: true }))
  }
  hoursModal.value = true
}

async function saveHours() {
  if (!hoursBarber.value) return
  await BarberAPI.setHours(hoursBarber.value.id, hoursData.value.filter(h => h.active && h.start_time && h.end_time))
  hoursModal.value = false
  await loadBarbers()
}

onMounted(loadBarbers)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Barbeiros</h1>
      <button class="btn btn-primary btn-sm" @click="openCreate">Novo Barbeiro</button>
    </div>

    <div v-if="loading" class="loading">Carregando...</div>

    <div v-else-if="barbers.length === 0" class="card" style="color: var(--gray-500);">
      Nenhum barbeiro cadastrado.
    </div>

    <div v-else class="grid-3">
      <div v-for="b in barbers" :key="b.id" class="card">
        <div style="font-size: 2rem; text-align: center; margin-bottom: 8px;">💈</div>
        <h3 style="text-align: center;">{{ b.name }}</h3>
        <div style="text-align: center; margin: 8px 0;">
          <span v-if="b.active" class="badge badge-confirmed">Ativo</span>
          <span v-else class="badge badge-cancelled">Inativo</span>
        </div>
        <div style="display: flex; gap: 8px; justify-content: center; margin-top: 12px;">
          <button class="btn btn-sm btn-outline" @click="openHours(b)">Horários</button>
          <button class="btn btn-sm btn-secondary" @click="openEdit(b)">Editar</button>
          <button class="btn btn-sm btn-danger" @click="confirmDelete(b.id)">Excluir</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>{{ editing ? 'Editar Barbeiro' : 'Novo Barbeiro' }}</h2>
        <div class="form-group">
          <label>Nome</label>
          <input class="form-control" v-model="form.name" />
        </div>
        <div class="form-group">
          <label>URL da Foto (opcional)</label>
          <input class="form-control" v-model="form.photo" placeholder="https://..." />
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="save">Salvar</button>
        </div>
      </div>
    </div>

    <!-- Hours Modal -->
    <div v-if="hoursModal" class="modal-overlay" @click.self="hoursModal = false">
      <div class="modal" style="max-width: 600px;">
        <h2>Horários - {{ hoursBarber?.name }}</h2>
        <div v-for="(h, i) in hoursData" :key="i" style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; width: 70px; font-size: 0.85rem; font-weight: 600;">
            <input type="checkbox" v-model="h.active" />
            {{ DAYS[i] }}
          </label>
          <template v-if="h.active">
            <input type="time" class="form-control" v-model="h.start_time" style="width: 120px;" />
            <span style="color: var(--gray-500);">até</span>
            <input type="time" class="form-control" v-model="h.end_time" style="width: 120px;" />
          </template>
          <span v-else style="color: var(--gray-400); font-size: 0.85rem;">Folga</span>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="hoursModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="saveHours">Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>
