<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AppointmentAPI, BarberAPI } from '../../api/client'
import type { Appointment, Barber } from '../../types'

const appointments = ref<Appointment[]>([])
const barbers = ref<Barber[]>([])
const loading = ref(true)
const filterBarber = ref<number | ''>('')
const filterDate = ref('')
const filterStatus = ref<string>('')

async function loadAppointments() {
  loading.value = true
  try {
    const params: any = {}
    if (filterBarber.value) params.barber_id = filterBarber.value
    if (filterDate.value) params.date = filterDate.value
    if (filterStatus.value) params.status = filterStatus.value
    const res = await AppointmentAPI.list(params)
    appointments.value = res.data
  } finally {
    loading.value = false
  }
}

async function loadBarbers() {
  const res = await BarberAPI.listAll()
  barbers.value = res.data
}

async function changeStatus(appointment: Appointment, status: string) {
  await AppointmentAPI.updateStatus(appointment.id, status)
  await loadAppointments()
}

async function confirmDelete(id: number) {
  if (confirm('Tem certeza que deseja excluir este agendamento?')) {
    await AppointmentAPI.remove(id)
    await loadAppointments()
  }
}

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

onMounted(() => {
  loadBarbers()
  loadAppointments()
})
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Agendamentos</h1>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end;">
        <div class="form-group" style="margin-bottom: 0; min-width: 150px;">
          <label>Barbeiro</label>
          <select class="form-control" v-model="filterBarber" @change="loadAppointments">
            <option value="">Todos</option>
            <option v-for="b in barbers" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0; min-width: 150px;">
          <label>Data</label>
          <input type="date" class="form-control" v-model="filterDate" @change="loadAppointments" />
        </div>
        <div class="form-group" style="margin-bottom: 0; min-width: 130px;">
          <label>Status</label>
          <select class="form-control" v-model="filterStatus" @change="loadAppointments">
            <option value="">Todos</option>
            <option value="scheduled">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <button class="btn btn-outline btn-sm" @click="filterBarber = ''; filterDate = ''; filterStatus = ''; loadAppointments()">
          Limpar Filtros
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Carregando...</div>

    <div v-else class="card">
      <div v-if="appointments.length === 0" style="color: var(--gray-500);">
        Nenhum agendamento encontrado.
      </div>
      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Telefone</th>
              <th>Barbeiro</th>
              <th>Serviço</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Horário</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in appointments" :key="a.id">
              <td data-label="Cliente">{{ a.client_name }}</td>
              <td data-label="Telefone">{{ a.client_phone }}</td>
              <td data-label="Barbeiro">{{ a.barber_name }}</td>
              <td data-label="Serviço">{{ a.service_name }}</td>
              <td data-label="Valor">R$ {{ a.service_price?.toFixed(2) }}</td>
              <td data-label="Data">{{ formatDate(a.date) }}</td>
              <td data-label="Horário">{{ a.time }}</td>
              <td data-label="Status"><span :class="statusClass(a.status)">{{ STATUS_MAP[a.status] || a.status }}</span></td>
              <td data-label="Ações">
                <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                  <button
                    v-if="a.status === 'scheduled'"
                    class="btn btn-sm btn-outline"
                    @click="changeStatus(a, 'confirmed')"
                  >Confirmar</button>
                  <button
                    v-if="a.status === 'confirmed'"
                    class="btn btn-sm btn-outline"
                    @click="changeStatus(a, 'completed')"
                  >Concluir</button>
                  <button
                    v-if="a.status !== 'cancelled'"
                    class="btn btn-sm btn-outline"
                    @click="changeStatus(a, 'cancelled')"
                  >Cancelar</button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(a.id)">Excluir</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
