<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="premium-card p-6 border-l-4 border-l-primary-500">
        <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Gasto Mensual Estimado</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${{ formatCurrency(resumen.total_mensual) }}</p>
      </div>
      <div class="premium-card p-6 border-l-4 border-l-secondary-500">
        <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Servicios Activos</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ resumen.servicios_activos }}</p>
      </div>
      <div class="premium-card p-6 border-l-4 border-l-amber-500 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20" @click="router.push('/notificaciones')">
        <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Alertas de Pago</h3>
        <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ notificacionesPendientes }}</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <button @click="router.push('/pagos')" class="premium-card p-4 flex items-center justify-center space-x-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10">
        <span class="font-medium">Registrar Pago Rápido</span>
      </button>
      <button @click="router.push('/servicios')" class="premium-card p-4 flex items-center justify-center space-x-2 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-900/10">
        <span class="font-medium">Añadir Nuevo Servicio</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServiciosStore } from '../stores/servicios'

const router = useRouter()
const serviciosStore = useServiciosStore()

const resumen = computed(() => serviciosStore.resumen)
const notificacionesPendientes = computed(() => serviciosStore.notificacionesPendientes)

const formatCurrency = (value) => {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2)
}

onMounted(() => {
  serviciosStore.fetchResumen()
  serviciosStore.fetchNotificaciones()
})
</script>
