<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mis Notificaciones</h2>

    <div v-if="serviciosStore.isLoading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="notificaciones.length === 0" class="text-center py-12 premium-card">
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Muy pronto habran notificaciones.</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Estás al día con todos tus servicios.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="notificacion in notificaciones" :key="notificacion.id" 
           :class="['premium-card p-4 sm:flex sm:items-start sm:justify-between transition-colors', 
                    !notificacion.leida ? 'border-l-4 border-l-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'opacity-75']">
        <div class="flex-1">
          <h4 class="text-base font-medium text-gray-900 dark:text-white">{{ notificacion.titulo }}</h4>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">{{ notificacion.mensaje }}</p>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ formatDate(notificacion.fecha_creacion) }}</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex items-center space-x-2">
           <button v-if="notificacion.servicio_vinculado" 
                   @click="router.push('/pagos')" 
                   class="btn-secondary text-xs">
              Ver Pagos
           </button>
           <button v-if="!notificacion.leida" 
                   @click="marcarLeida(notificacion.id)" 
                   class="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
             Marcar como leída
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServiciosStore } from '../stores/servicios'

const serviciosStore = useServiciosStore()
const router = useRouter()

const notificaciones = computed(() => serviciosStore.notificaciones)

const marcarLeida = async (id) => {
  await serviciosStore.marcarNotificacionLeida(id)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('es-ES', { 
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute:'2-digit'
  }).format(date)
}

onMounted(() => {
  serviciosStore.fetchNotificaciones()
})
</script>
