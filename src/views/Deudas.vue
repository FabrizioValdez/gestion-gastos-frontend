<template>
  <div>
    <div class="sm:flex sm:items-center sm:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Servicios Vencidos (Deudas)</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Regulariza los pagos pendientes para mantener tus servicios activos</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="cargando" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Empty State (No deudas) -->
    <div v-else-if="deudas.length === 0" class="text-center py-12 premium-card">
      <svg class="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">¡Al día!</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">No tienes servicios vencidos pendientes de pago.</p>
    </div>

    <!-- Lista de Deudas -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="deuda in deudas" :key="deuda.id" class="premium-card p-6 border-l-4 border-l-red-500">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">
              {{ deuda.nombre }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Cat: {{ deuda.tipo_servicio }}
            </p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              Vencido hace {{ deuda.dias_vencido }} días
          </span>
        </div>

        <div class="mb-5 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
             <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Día de vencimiento:</p>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-200">Día {{ deuda.dia_vencimiento }} de cada mes</p>
             </div>
             <div class="text-right">
                <p class="text-xs text-gray-500 dark:text-gray-400">Monto a pagar</p>
                <p class="text-xl font-bold text-red-600 dark:text-red-400">${{ formatCurrency(deuda.monto) }}</p>
             </div>
        </div>

        <button @click="abrirModalPago(deuda)" class="w-full btn-primary flex justify-center items-center py-2 px-4 shadow-sm bg-red-600 hover:bg-red-700 dark:hover:bg-red-500">
             <span class="font-medium text-sm">Pagar Ahora</span>
        </button>
      </div>
    </div>

    <!-- Modal Pago Rápido -->
    <div v-if="modalAbierto" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="cerrarModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <form @submit.prevent="ejecutarPago">
            <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4" id="modal-title">
                Registrar Pago: {{ formulario.nombre_display }}
              </h3>

              <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto Pagado (S/)</label>
                    <input v-model="formulario.monto_pagado" type="number" step="0.01" required class="mt-1 input-field p-2" placeholder="0.00">
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Precio de referencia: S/ {{ formulario.monto_referencia }}</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha del Pago</label>
                    <input v-model="formulario.fecha_pago" type="date" required class="mt-1 input-field p-2">
                </div>
              </div>
            </div>
            
            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" :disabled="guardando" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm transition-all disabled:opacity-50">
                {{ guardando ? 'Registrando...' : 'Confirmar Pago' }}
              </button>
              <button type="button" @click="cerrarModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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

// State
const deudas = computed(() => serviciosStore.deudas)
const cargando = ref(true)
const guardando = ref(false)

// Modal State
const modalAbierto = ref(false)
const formulario = ref({
  servicio_id: null,
  nombre_display: '',
  fecha_pago: '',
  monto_pagado: '',
  monto_referencia: ''
})

const formatCurrency = (value) => parseFloat(value).toFixed(2)
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const finalStr = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`
  const date = new Date(finalStr)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

const cargarDeudas = async () => {
    cargando.value = true
    await serviciosStore.fetchDeudas()
    cargando.value = false
}

const abrirModalPago = (deuda) => {
  const hoy = new Date()
  const tzoffset = (hoy).getTimezoneOffset() * 60000 
  const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0]

  formulario.value = {
    servicio_id: deuda.id,
    nombre_display: deuda.nombre,
    fecha_pago: localISOTime,
    monto_pagado: deuda.monto,
    monto_referencia: deuda.monto
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
     
     // Recargar todo después de cerrar el modal
     await serviciosStore.fetchDeudas()
     await serviciosStore.fetchServicios()
     await serviciosStore.fetchResumen()
     await serviciosStore.fetchPagos()

  } catch (err) {
     alert('Ocurrió un error al registrar el pago de la deuda.')
     console.error(err)
  } finally {
     guardando.value = false
  }
}

onMounted(() => {
  cargarDeudas()
})
</script>
