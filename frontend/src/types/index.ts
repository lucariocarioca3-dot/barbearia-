export interface Barber {
  id: number
  name: string
  photo: string | null
  active: number
  created_at?: string
}

export interface Service {
  id: number
  name: string
  description: string | null
  duration: number
  price: number
  active: number
  created_at?: string
}

export interface Appointment {
  id: number
  barber_id: number
  service_id: number
  client_name: string
  client_phone: string
  client_email: string | null
  date: string
  time: string
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  created_at?: string
  barber_name?: string
  service_name?: string
  service_duration?: number
  service_price?: number
}

export interface WorkingHours {
  id?: number
  barber_id: number
  day_of_week: number
  start_time: string
  end_time: string
}

export interface Admin {
  id: number
  name: string
  email: string
}

export interface DashboardData {
  todayCount: number
  pendingCount: number
  upcoming: Appointment[]
}
