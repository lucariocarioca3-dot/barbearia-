import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AuthAPI } from '../api/client'
import type { Admin } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const admin = ref<Admin | null>(JSON.parse(localStorage.getItem('admin') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token'))

  async function login(email: string, password: string) {
    const res = await AuthAPI.login(email, password)
    admin.value = res.data.admin
    token.value = res.data.token
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('admin', JSON.stringify(res.data.admin))
  }

  function logout() {
    admin.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
  }

  function isAuthenticated() {
    return !!token.value
  }

  return { admin, token, login, logout, isAuthenticated }
})
