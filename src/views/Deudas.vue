<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Servicios Vencidos</h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Regulariza tus pagos pendientes</p>
    </div>

    <div v-if="cargando" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="deudas.length === 0" class="text-center py-12 premium-card">
      <svg class="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">¡Al día!</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No tienes servicios vencidos.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="deuda in deudas" :key="deuda.id" class="premium-card p-4 border-l-4 border-l-red-500">
        <div class="flex flex-col gap-3">
          <div class="flex justify-between items-start">
            <div class="min-w-0 flex-1">
              <h3 class="text-base font-bold text-gray-900 dark:text-white truncate">
                {{ deuda.nombre }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ deuda.tipo_servicio }}</p>
            </div>
            <span class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {{ deuda.dias_vencido }} días
            </span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Día: {{ deuda.dia_vencimiento }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-red-600 dark:text-red-400">${{ formatCurrency(deuda.monto) }}</p>
              </div>
            </div>
          </div>

          <button @click="abrirModalPago(deuda)" class="w-full btn-primary py-2.5 text-sm bg-red-600 hover:bg-red-700 dark:hover:bg-red-500">
            Pagar Ahora
          </button>
        </div>
      </div>
    </div>

    <div v-if="modalAbierto" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-4 sm:pb-20 text-center sm:block">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="cerrarModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom sm:align-middle sm:max-w-md sm:w-full w-full bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform">
          <form @submit.prevent="ejecutarPago">
            <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Pagar: {{ formulario.nombre_display }}
              </h3>
              <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
                    <input v-model="formulario.monto_pagado" type="number" step="0.01" required class="mt-1 input-field p-2.5 w-full" placeholder="0.00">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha del Pago</label>
                    <input v-model="formulario.fecha_pago" type="date" required class="mt-1 input-field p-2.5 w-full">
                </div>
              </div>
            </div>
            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
              <button type="submit" :disabled="guardando" class="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2.5 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:text-sm disabled:opacity-50">
                {{ guardando ? 'Registrando...' : 'Confirmar' }}
              </button>
              <button type="button" @click="cerrarModal" class="mt-2 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 sm:text-sm">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useServiciosStore } from '../stores/servicios'
import serviciosApi from '../api/servicios'

const serviciosStore = useServiciosStore()
const deudas = computed(() => serviciosStore.deudas)
const cargando = ref(true)
const guardando = ref(false)
const modalAbierto = ref(false)
const formulario = ref({
  servicio_id: null,
  nombre_display: '',
  fecha_pago: '',
  monto_pagado: '',
})

const formatCurrency = (value) => parseFloat(value).toFixed(2)

const cargarDeudas = async () => {
    cargando.value = true
    await serviciosStore.fetchDeudas()
    cargando.value = false
}

const abrirModalPago = (deuda) => {
  const hoy = new Date()
  const tzoffset = hoy.getTimezoneOffset() * 60000 
  const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0]
  formulario.value = {
    servicio_id: deuda.id,
    nombre_display: deuda.nombre,
    fecha_pago: localISOTime,
    monto_pagado: deuda.monto,
  }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const ejecutarPago = async () => {
  guardando.value = true
  try {
     const payload = {
        fecha_pago: formulario.value.fecha_pago,
        monto_pagado: parseFloat(formulario.value.monto_pagado)
     }
     await serviciosApi.pagarDeuda(formulario.value.servicio_id, payload)
     cerrarModal()
     await Promise.all([
       serviciosStore.fetchDeudas(),
       serviciosStore.fetchServicios(),
       serviciosStore.fetchResumen(),
       serviciosStore.fetchPagos()
     ])
  } catch (err) {
     alert('Error al registrar el pago.')
  } finally {
     guardando.value = false
  }
}

onMounted(() => {
  cargarDeudas()
})
</script>
