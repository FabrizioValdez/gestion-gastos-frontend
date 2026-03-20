<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        @click="closeMenu"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <div 
        v-if="isOpen"
        class="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between h-16 px-4 bg-primary-600 text-white shrink-0">
          <span class="text-lg font-bold">Gestión de Gastos</span>
          <button 
            @click="closeMenu"
            class="p-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- User Info -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span class="text-primary-600 dark:text-primary-400 font-semibold text-lg">
                {{ userInitial }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ authStore.user?.nombre || 'Usuario' }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ authStore.user?.correo || '' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <router-link 
            v-for="item in navigation" 
            :key="item.name" 
            :to="item.href"
            @click="closeMenu"
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all"
            :class="[
              $route.path.startsWith(item.href) 
                ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            <component 
              :is="item.icon" 
              class="mr-3 shrink-0 h-5 w-5" 
              :class="[
                $route.path.startsWith(item.href) 
                  ? 'text-primary-700 dark:text-primary-400' 
                  : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
              ]" 
            />
            {{ item.name }}
            
            <!-- Badge notificaciones -->
            <span 
              v-if="item.name === 'Notificaciones' && notificacionesPendientes > 0" 
              class="ml-auto bg-red-500 text-white py-0.5 px-2 rounded-full text-xs"
            >
              {{ notificacionesPendientes }}
            </span>
            <!-- Badge deudas -->
            <span 
              v-if="item.name === 'Deudas' && deudasPendientes > 0" 
              class="ml-auto bg-red-600 text-white py-0.5 px-2 rounded-full text-xs animate-pulse"
            >
              {{ deudasPendientes }}
            </span>
          </router-link>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button 
            @click="handleLogout"
            class="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
            <span class="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
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
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const router = useRouter()
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

const userInitial = computed(() => {
  const name = authStore.user?.nombre || 'U'
  return name.charAt(0).toUpperCase()
})

const closeMenu = () => {
  emit('close')
}

const handleLogout = () => {
  closeMenu()
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
