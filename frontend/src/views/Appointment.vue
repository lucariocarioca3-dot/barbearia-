<script setup lang="ts">
import { ref, computed } from 'vue'
import { BarberAPI, ServiceAPI, AppointmentAPI } from '../api/client'
import type { Barber, Service } from '../types'

const step = ref(1)
const loading = ref(false)
const success = ref(false)
const error = ref('')

const barbers = ref<Barber[]>([])
const services = ref<Service[]>([])
const slots = ref<string[]>([])

const selectedBarber = ref<number | null>(null)
const selectedService = ref<number | null>(null)
const selectedDate = ref('')
const selectedTime = ref('')

const clientName = ref('')
const clientPhone = ref('')
const clientEmail = ref('')

const today = new Date().toISOString().split('T')[0]

async function loadBarbers() {
  loading.value = true
  try {
    const res = await BarberAPI.list()
    barbers.value = res.data
  } finally {
    loading.value = false
  }
}

async function loadServices() {
  loading.value = true
  try {
    const res = await ServiceAPI.list()
    services.value = res.data
  } finally {
    loading.value = false
  }
}

async function loadSlots() {
  if (!selectedBarber.value || !selectedDate.value || !selectedService.value) return
  loading.value = true
  slots.value = []
  try {
    const res = await AppointmentAPI.getAvailableSlots(
      selectedBarber.value,
      selectedDate.value,
      selectedService.value
    )
    slots.value = res.data.slots
  } finally {
    loading.value = false
  }
}

function selectBarber(id: number) {
  selectedBarber.value = id
  step.value = 2
}

function selectService(id: number) {
  selectedService.value = id
  selectedTime.value = ''
  step.value = 3
  if (selectedDate.value) loadSlots()
}

function selectDate() {
  selectedTime.value = ''
  if (selectedService.value) loadSlots()
}

function selectTime(time: string) {
  selectedTime.value = time
}

function nextToInfo() {
  if (selectedTime.value) step.value = 4
}

async function confirmAppointment() {
  if (!selectedBarber.value || !selectedService.value || !selectedDate.value || !selectedTime.value || !clientName.value || !clientPhone.value) {
    error.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await AppointmentAPI.create({
      barber_id: selectedBarber.value,
      service_id: selectedService.value,
      client_name: clientName.value,
      client_phone: clientPhone.value,
      client_email: clientEmail.value || undefined,
      date: selectedDate.value,
      time: selectedTime.value,
    })
    success.value = true
    step.value = 5
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Erro ao agendar. Tente novamente.'
  } finally {
    loading.value = false
  }
}

function reset() {
  step.value = 1
  selectedBarber.value = null
  selectedService.value = null
  selectedDate.value = ''
  selectedTime.value = ''
  clientName.value = ''
  clientPhone.value = ''
  clientEmail.value = ''
  success.value = false
  error.value = ''
  slots.value = []
}

loadBarbers()
loadServices()

const selectedServiceObj = computed(() =>
  services.value.find(s => s.id === selectedService.value)
)
</script>

<template>
  <div class="container" style="padding-top: 40px; padding-bottom: 60px;">
    <div v-if="success">
      <div class="card" style="text-align: center; max-width: 480px; margin: 40px auto;">
        <div style="font-size: 3rem; margin-bottom: 12px;">✓</div>
        <h2>Agendamento Confirmado!</h2>
        <p style="color: var(--gray-600); margin: 12px 0 24px;">
          Seu horário foi reservado com sucesso.
        </p>
        <button class="btn btn-primary" @click="reset">Novo Agendamento</button>
      </div>
    </div>

    <div class="stepper">
      <div class="step" :class="{ active: step === 1, completed: step > 1 }">
        <span class="step-number">1</span>
        <span class="step-label">Barbeiro</span>
      </div>
      <div class="step-connector" />
      <div class="step" :class="{ active: step === 2, completed: step > 2 }">
        <span class="step-number">2</span>
        <span class="step-label">Serviço</span>
      </div>
      <div class="step-connector" />
      <div class="step" :class="{ active: step === 3, completed: step > 3 }">
        <span class="step-number">3</span>
        <span class="step-label">Horário</span>
      </div>
      <div class="step-connector" />
      <div class="step" :class="{ active: step === 4, completed: step > 4 }">
        <span class="step-number">4</span>
        <span class="step-label">Confirmar</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Step 1: Barber -->
    <div v-if="step === 1">
      <div class="section-title">Escolha o barbeiro</div>
      <div v-if="loading" class="loading">Carregando...</div>
      <div v-else class="selection-grid">
        <div
          v-for="barber in barbers"
          :key="barber.id"
          class="selection-card"
          :class="{ selected: selectedBarber === barber.id }"
          @click="selectBarber(barber.id)"
        >
          <div style="font-size: 2.5rem; margin-bottom: 8px;">💈</div>
          <h3>{{ barber.name }}</h3>
        </div>
      </div>
    </div>

    <!-- Step 2: Service -->
    <div v-if="step === 2">
      <div class="section-title">Escolha o serviço</div>
      <div v-if="loading" class="loading">Carregando...</div>
      <div v-else class="selection-grid">
        <div
          v-for="service in services"
          :key="service.id"
          class="selection-card"
          :class="{ selected: selectedService === service.id }"
          @click="selectService(service.id)"
        >
          <h3>{{ service.name }}</h3>
          <div class="price">R$ {{ service.price.toFixed(2) }}</div>
          <div class="duration">{{ service.duration }} min</div>
        </div>
      </div>
      <div style="margin-top: 16px;">
        <button class="btn btn-outline btn-sm" @click="step = 1">Voltar</button>
      </div>
    </div>

    <!-- Step 3: Date & Time -->
    <div v-if="step === 3">
      <div class="section-title">Escolha a data e horário</div>

      <div class="form-group" style="max-width: 300px;">
        <label>Data</label>
        <input
          type="date"
          class="form-control"
          v-model="selectedDate"
          :min="today"
          @change="selectDate"
        />
      </div>

      <div v-if="loading && selectedDate" class="loading">Verificando horários...</div>

      <div v-else-if="selectedDate && !loading">
        <div v-if="slots.length === 0" style="color: var(--gray-500); margin: 16px 0;">
          Nenhum horário disponível nesta data.
        </div>
        <div v-else>
          <div class="section-title" style="margin-top: 20px;">Horários disponíveis</div>
          <div class="slots-grid">
            <button
              v-for="slot in slots"
              :key="slot"
              class="slot-btn"
              :class="{ selected: selectedTime === slot }"
              @click="selectTime(slot)"
            >
              {{ slot }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="selectedServiceObj" style="margin-top: 16px; font-size: 0.85rem; color: var(--gray-600);">
        Duração: {{ selectedServiceObj.duration }} min
      </div>

      <div style="margin-top: 20px; display: flex; gap: 12px;">
        <button class="btn btn-outline" @click="step = 2">Voltar</button>
        <button class="btn btn-primary" :disabled="!selectedTime" @click="nextToInfo">Continuar</button>
      </div>
    </div>

    <!-- Step 4: Customer Info & Confirm -->
    <div v-if="step === 4">
      <div class="section-title">Seus dados</div>

      <div style="max-width: 400px;">
        <div class="form-group">
          <label>Nome *</label>
          <input class="form-control" v-model="clientName" placeholder="Seu nome" />
        </div>
        <div class="form-group">
          <label>Telefone *</label>
          <input class="form-control" v-model="clientPhone" placeholder="(11) 99999-9999" />
        </div>
        <div class="form-group">
          <label>Email (opcional)</label>
          <input class="form-control" v-model="clientEmail" placeholder="seu@email.com" type="email" />
        </div>
      </div>

      <div class="card" style="margin: 20px 0; max-width: 400px;">
        <div class="card-header">Resumo</div>
        <div style="display: grid; gap: 8px; font-size: 0.9rem;">
          <div><strong>Barbeiro:</strong> {{ barbers.find(b => b.id === selectedBarber)?.name }}</div>
          <div><strong>Serviço:</strong> {{ selectedServiceObj?.name }}</div>
          <div><strong>Data:</strong> {{ selectedDate }}</div>
          <div><strong>Horário:</strong> {{ selectedTime }}</div>
          <div><strong>Valor:</strong> R$ {{ selectedServiceObj?.price.toFixed(2) }}</div>
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button class="btn btn-outline" @click="step = 3">Voltar</button>
        <button class="btn btn-primary" :disabled="loading" @click="confirmAppointment">
          {{ loading ? 'Agendando...' : 'Confirmar Agendamento' }}
        </button>
      </div>
    </div>
  </div>
</template>
