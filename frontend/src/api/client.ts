import axios from 'axios'
import type { Barber, Service, Appointment, WorkingHours, DashboardData } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export const AuthAPI = {
  login(email: string, password: string) {
    return api.post<{ token: string; admin: { id: number; name: string; email: string } }>('/auth/login', { email, password })
  },
  me() {
    return api.get('/auth/me')
  }
}

export const BarberAPI = {
  list() {
    return api.get<Barber[]>('/barbers')
  },
  listAll() {
    return api.get<Barber[]>('/barbers/all')
  },
  getById(id: number) {
    return api.get<Barber>(`/barbers/${id}`)
  },
  create(data: Partial<Barber>) {
    return api.post<Barber>('/barbers', data)
  },
  update(id: number, data: Partial<Barber>) {
    return api.put<Barber>(`/barbers/${id}`, data)
  },
  remove(id: number) {
    return api.delete(`/barbers/${id}`)
  },
  getHours(id: number) {
    return api.get<WorkingHours[]>(`/barbers/${id}/hours`)
  },
  setHours(id: number, hours: Omit<WorkingHours, 'id' | 'barber_id'>[]) {
    return api.put<WorkingHours[]>(`/barbers/${id}/hours`, { hours })
  }
}

export const ServiceAPI = {
  list() {
    return api.get<Service[]>('/services')
  },
  listAll() {
    return api.get<Service[]>('/services/all')
  },
  getById(id: number) {
    return api.get<Service>(`/services/${id}`)
  },
  create(data: Partial<Service>) {
    return api.post<Service>('/services', data)
  },
  update(id: number, data: Partial<Service>) {
    return api.put<Service>(`/services/${id}`, data)
  },
  remove(id: number) {
    return api.delete(`/services/${id}`)
  }
}

export const AppointmentAPI = {
  list(params?: { date?: string; barber_id?: number; status?: string }) {
    return api.get<Appointment[]>('/appointments', { params })
  },
  getById(id: number) {
    return api.get<Appointment>(`/appointments/${id}`)
  },
  create(data: { barber_id: number; service_id: number; client_name: string; client_phone: string; client_email?: string; date: string; time: string }) {
    return api.post<Appointment>('/appointments', data)
  },
  updateStatus(id: number, status: string) {
    return api.put<Appointment>(`/appointments/${id}/status`, { status })
  },
  update(id: number, data: Partial<Appointment>) {
    return api.put<Appointment>(`/appointments/${id}`, data)
  },
  remove(id: number) {
    return api.delete(`/appointments/${id}`)
  },
  getAvailableSlots(barber_id: number, date: string, service_id: number) {
    return api.get<{ slots: string[] }>('/appointments/slots', { params: { barber_id, date, service_id } })
  },
  getDashboard() {
    return api.get<DashboardData>('/appointments/dashboard')
  }
}
