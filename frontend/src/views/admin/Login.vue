<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Preencha email e senha.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push('/admin')
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Erro ao fazer login.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="min-height: 80vh; display: flex; align-items: center; justify-content: center;">
    <div class="card" style="width: 100%; max-width: 400px;">
      <div class="card-header" style="text-align: center; font-size: 1.25rem;">Login Admin</div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input class="form-control" v-model="email" type="email" placeholder="admin@barbearia.com" />
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input class="form-control" v-model="password" type="password" placeholder="admin123" />
        </div>
        <button class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>
