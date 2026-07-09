<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ServiceAPI } from '../../api/client'
import type { Service } from '../../types'

const services = ref<Service[]>([])
const loading = ref(true)
const showModal = ref(false)
const editing = ref(false)
const form = ref({ id: 0, name: '', description: '', duration: 30, price: 0 })

async function loadServices() {
  loading.value = true
  try {
    const res = await ServiceAPI.listAll()
    services.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  form.value = { id: 0, name: '', description: '', duration: 30, price: 0 }
  showModal.value = true
}

function openEdit(s: Service) {
  editing.value = true
  form.value = { id: s.id, name: s.name, description: s.description || '', duration: s.duration, price: s.price }
  showModal.value = true
}

async function save() {
  if (editing.value) {
    await ServiceAPI.update(form.value.id, {
      name: form.value.name,
      description: form.value.description || null,
      duration: form.value.duration,
      price: form.value.price,
    })
  } else {
    await ServiceAPI.create({
      name: form.value.name,
      description: form.value.description || null,
      duration: form.value.duration,
      price: form.value.price,
    })
  }
  showModal.value = false
  await loadServices()
}

async function toggleActive(s: Service) {
  await ServiceAPI.update(s.id, { active: s.active ? 0 : 1 })
  await loadServices()
}

async function confirmDelete(id: number) {
  if (confirm('Excluir serviço?')) {
    await ServiceAPI.remove(id)
    await loadServices()
  }
}

onMounted(loadServices)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Serviços</h1>
      <button class="btn btn-primary btn-sm" @click="openCreate">Novo Serviço</button>
    </div>

    <div v-if="loading" class="loading">Carregando...</div>

    <div v-else-if="services.length === 0" class="card" style="color: var(--gray-500);">
      Nenhum serviço cadastrado.
    </div>

    <div v-else class="card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Duração</th>
              <th>Preço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in services" :key="s.id">
              <td data-label="Nome">{{ s.name }}</td>
              <td data-label="Descrição" style="color: var(--gray-600);">{{ s.description }}</td>
              <td data-label="Duração">{{ s.duration }} min</td>
              <td data-label="Preço">R$ {{ s.price.toFixed(2) }}</td>
              <td data-label="Status">
                <span v-if="s.active" class="badge badge-confirmed">Ativo</span>
                <span v-else class="badge badge-cancelled">Inativo</span>
              </td>
              <td data-label="Ações">
                <div style="display: flex; gap: 4px;">
                  <button class="btn btn-sm btn-outline" @click="toggleActive(s)">
                    {{ s.active ? 'Desativar' : 'Ativar' }}
                  </button>
                  <button class="btn btn-sm btn-secondary" @click="openEdit(s)">Editar</button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(s.id)">Excluir</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>{{ editing ? 'Editar Serviço' : 'Novo Serviço' }}</h2>
        <div class="form-group">
          <label>Nome</label>
          <input class="form-control" v-model="form.name" />
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <input class="form-control" v-model="form.description" />
        </div>
        <div class="form-group">
          <label>Duração (minutos)</label>
          <input class="form-control" v-model="form.duration" type="number" min="5" max="240" />
        </div>
        <div class="form-group">
          <label>Preço (R$)</label>
          <input class="form-control" v-model="form.price" type="number" step="0.5" min="0" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="save">Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>
