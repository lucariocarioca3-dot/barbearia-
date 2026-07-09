<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AppointmentAPI } from '../../api/client'
import { useAuthStore } from '../../stores/auth'
import type { DashboardData } from '../../types'

const router = useRouter()
const auth = useAuthStore()

const data = ref<DashboardData>({ todayCount: 0, pendingCount: 0, upcoming: [] })
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await AppointmentAPI.getDashboard()
    data.value = res.data
  } finally {
    loading.value = false
  }
})

const STATUS_MAP: Record<string, string> = {
  scheduled: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

function statusClass(status: string) {
  return `badge badge-${status}`
}

function formatDate(date: string) {
  if (!date) return ''
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Dashboard</h1>
      <button class="btn btn-outline btn-sm" @click="auth.logout(); router.push('/')">
        Sair
      </button>
    </div>

    <div v-if="loading" class="loading">Carregando...</div>

    <div v-else>
      <div class="grid-3" style="margin-bottom: 32px;">
        <div class="card" style="text-align: center;">
          <div style="font-size: 2rem; font-weight: 800;">{{ data.todayCount }}</div>
          <div style="font-size: 0.85rem; color: var(--gray-500);">Agendamentos Hoje</div>
        </div>
        <div class="card" style="text-align: center;">
          <div style="font-size: 2rem; font-weight: 800;">{{ data.pendingCount }}</div>
          <div style="font-size: 0.85rem; color: var(--gray-500);">Pendentes</div>
        </div>
        <div class="card" style="text-align: center;">
          <div style="font-size: 2rem; font-weight: 800;">{{ data.upcoming.length }}</div>
          <div style="font-size: 0.85rem; color: var(--gray-500);">Próximos</div>
        </div>
      </div>

      <div class="grid-3" style="margin-bottom: 32px;">
        <div class="card" style="text-align: center; cursor: pointer;" @click="router.push('/admin/barbeiros')">
          <div style="font-size: 2rem; margin-bottom: 4px;">💈</div>
          <div style="font-size: 0.85rem; color: var(--gray-500);">Gerenciar Barbeiros</div>
        </div>
        <div class="card" style="text-align: center; cursor: pointer;" @click="router.push('/admin/servicos')">
          <div style="font-size: 2rem; margin-bottom: 4px;">✂️</div>
          <div style="font-size: 0.85rem; color: var(--gray-500);">Gerenciar Serviços</div>
        </div>
        <div class="card" style="text-align: center; cursor: pointer;" @click="router.push('/admin/agendamentos')">
          <div style="font-size: 2rem; margin-bottom: 4px;">📅</div>
          <div style="font-size: 0.85rem; color: var(--gray-500);">Ver Agendamentos</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">Próximos Agendamentos</div>
        <div v-if="data.upcoming.length === 0" style="color: var(--gray-500);">
          Nenhum agendamento futuro.
        </div>
        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Barbeiro</th>
                <th>Serviço</th>
                <th>Data</th>
                <th>Horário</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in data.upcoming" :key="a.id">
                <td data-label="Cliente">{{ a.client_name }}</td>
                <td data-label="Barbeiro">{{ a.barber_name }}</td>
                <td data-label="Serviço">{{ a.service_name }}</td>
                <td data-label="Data">{{ formatDate(a.date) }}</td>
                <td data-label="Horário">{{ a.time }}</td>
                <td data-label="Status"><span :class="statusClass(a.status)">{{ STATUS_MAP[a.status] || a.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
