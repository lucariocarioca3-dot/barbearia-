import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/agendar',
      name: 'Agendamento',
      component: () => import('../views/Appointment.vue'),
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('../views/admin/Login.vue'),
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: () => import('../views/admin/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/agendamentos',
      name: 'AdminAppointments',
      component: () => import('../views/admin/Appointments.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/barbeiros',
      name: 'AdminBarbers',
      component: () => import('../views/admin/Barbers.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/servicos',
      name: 'AdminServices',
      component: () => import('../views/admin/Services.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/admin/login')
  } else {
    next()
  }
})

export default router
