import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      component: () => import('../components/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        { path: 'servicios', name: 'servicios', component: () => import('../views/Servicios.vue') },
        { path: 'deudas', name: 'deudas', component: () => import('../views/Deudas.vue') },
        { path: 'pagos', name: 'pagos', component: () => import('../views/Pagos.vue') },
        { path: 'graficos', name: 'graficos', component: () => import('../views/Graficos.vue') },
        { path: 'notificaciones', name: 'notificaciones', component: () => import('../views/Notificaciones.vue') },
        { path: 'ayuda', name: 'ayuda', component: () => import('../views/Ayuda.vue') }
      ]
    }
  ]
})

// --- CORRECCIÓN AQUÍ ---
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Si la ruta requiere auth y NO está autenticado -> Al Login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  // Si la ruta es para invitados (login/register) y YA está autenticado -> Al Dashboard
  if (to.meta.requiresGuest && isAuthenticated) {
    return { name: 'dashboard' }
  }

  // En cualquier otro caso, permitir la navegación
  return true
})

export default router