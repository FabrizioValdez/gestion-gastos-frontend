<template>
  <div class="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Sidebar / Menú Lateral Desktop -->
    <div class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-center h-16 shrink-0 px-4 bg-primary-600 text-white">
          <span class="text-lg font-bold truncate">Gestión de Gastos</span>
        </div>
        <div class="flex-1 flex flex-col overflow-y-auto">
          <nav class="flex-1 px-3 py-4 space-y-1">
            <router-link v-for="item in navigation" :key="item.name" :to="item.href"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
              :class="[$route.path.startsWith(item.href) ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white']">
              <component :is="item.icon" class="mr-3 shrink-0 h-6 w-6" 
                :class="[$route.path.startsWith(item.href) ? 'text-primary-700 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300']" 
                aria-hidden="true" />
              {{ item.name }}
              
              <!-- Badge de notificaciones -->
              <span v-if="item.name === 'Notificaciones' && notificacionesPendientes > 0" 
                    class="ml-auto bg-red-500 text-white py-0.5 px-2 rounded-full text-xs">
                {{ notificacionesPendientes }}
              </span>
              <!-- Badge de deudas -->
              <span v-if="item.name === 'Deudas' && deudasPendientes > 0" 
                    class="ml-auto bg-red-600 text-white py-0.5 px-2 rounded-full text-xs animate-pulse">
                {{ deudasPendientes }}
              </span>
            </router-link>
          </nav>
        </div>
        <!-- Footer Sidebar -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-3 mb-4">
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ authStore.user?.nombre || 'Usuario' }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {{ authStore.user?.correo || '' }}
                    </p>
                </div>
            </div>
            <button @click="logout" class="w-full btn-secondary flex items-center justify-center space-x-2">
                <ArrowRightOnRectangleIcon class="h-4 w-4"/>
                <span>Cerrar Sesión</span>
            </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu... (Se omitió por brevedad para añadir después en iteración de responsive) -->

    <!-- Main Column -->
    <div class="flex flex-col w-full flex-1 overflow-hidden">
      <!-- Navbar superior (Mobile Header / Global Controls) -->
      <header class="h-16 shrink-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl font-medium text-gray-800 dark:text-white sm:hidden">App</h2>
        
        <!-- Controls derecho -->
        <div class="flex items-center space-x-4 ml-auto">
           <button @click="toggleTheme" class="p-2 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
             <SunIcon v-if="isDark" class="h-6 w-6" />
             <MoonIcon v-else class="h-6 w-6" />
           </button>
        </div>
      </header>

      <!-- Contenido Principal Dinámico -->
      <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gray-50 dark:bg-gray-900">
        <div class="py-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useServiciosStore } from '../stores/servicios'
import { 
  HomeIcon, 
  RectangleStackIcon, 
  BanknotesIcon, 
  ChartPieIcon, 
  BellAlertIcon, 
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const serviciosStore = useServiciosStore()

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Deudas', href: '/deudas', icon: ExclamationTriangleIcon },
  { name: 'Servicios', href: '/servicios', icon: RectangleStackIcon },
  { name: 'Pagos', href: '/pagos', icon: BanknotesIcon },
  { name: 'Gráficos', href: '/graficos', icon: ChartPieIcon },
  { name: 'Notificaciones', href: '/notificaciones', icon: BellAlertIcon },
  { name: 'Ayuda', href: '/ayuda', icon: QuestionMarkCircleIcon },
]

const notificacionesPendientes = computed(() => serviciosStore.notificacionesPendientes)
const deudasPendientes = computed(() => serviciosStore.cantidadDeudas)

const isDark = ref(document.documentElement.classList.contains('dark'))

const toggleTheme = () => {
    isDark.value = !isDark.value
    if (isDark.value) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
    } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
    }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
    serviciosStore.fetchNotificaciones()
    serviciosStore.fetchDeudas()
    if(!authStore.user) {
        authStore.fetchUser()
    }
})
</script>
