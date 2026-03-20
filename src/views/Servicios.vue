<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Mis Servicios</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Gestiona tus suscripciones y servicios recurrentes</p>
      </div>
      <button @click="abrirModal()" class="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto">
        <span>+</span>
        <span>Nuevo Servicio</span>
      </button>
    </div>

    <div v-if="serviciosStore.isLoading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="servicios.length === 0" class="text-center py-12 premium-card">
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No tienes servicios</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Comienza agregando un nuevo servicio a tu lista.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      <div v-for="servicio in servicios" :key="servicio.id" class="premium-card relative group p-4 sm:p-6" :class="{ 'opacity-60': !servicio.activo }">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div class="flex-1 min-w-0">
            <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
              {{ obtenerNombreServicio(servicio) }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ obtenerNombreTipo(servicio.tipo_servicio) }}
            </p>
          </div>
          <span :class="servicio.activo ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0">
            {{ servicio.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        
        <div class="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Costo Mensual</p>
            <p class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">${{ formatCurrency(servicio.monto_mensual) }}</p>
          </div>
          <div class="text-left sm:text-right">
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Vencimiento</p>
            <p class="text-sm font-medium text-gray-900 dark:text-gray-200">Día {{ servicio.dia_vencimiento }}</p>
          </div>
        </div>

        <div class="absolute inset-0 bg-gray-900/5 dark:bg-gray-100/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-3 sm:space-x-4 rounded-xl">
           <button @click="abrirModal(servicio)" class="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm p-2 sm:p-3 rounded-full hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
             Editar
           </button>
           <button @click="confirmarEliminar(servicio)" class="bg-white dark:bg-gray-800 text-red-600 shadow-sm p-2 sm:p-3 rounded-full hover:text-red-700 transition-colors text-sm">
             Eliminar
           </button>
        </div>
      </div>
    </div>

    <div v-if="modalAbierto" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-4 sm:pb-20 text-center sm:block">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="cerrarModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom sm:align-middle sm:max-w-lg sm:w-full w-full bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all">
          <form @submit.prevent="guardarServicio">
            <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4" id="modal-title">
                {{ formulario.id ? 'Editar' : 'Nuevo' }} Servicio
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Servicio</label>
                  <select v-model="formulario.tipo_servicio" required class="mt-1 input-field p-2.5 sm:p-2 w-full">
                    <option v-for="tipo in tiposServicio" :key="tipo.id" :value="tipo.id">{{ tipo.nombre }}</option>
                  </select>
                </div>

                <div>
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Servicio</label>
                   <input v-model="formulario.nombre_servicio" type="text" class="mt-1 input-field p-2.5 sm:p-2 w-full" required placeholder="Ej: Netflix, Internet">
                </div>
                
                <div class="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto Mensual</label>
                    <input v-model="formulario.monto_mensual" type="number" step="0.01" required class="mt-1 input-field p-2.5 sm:p-2 w-full" placeholder="0.00">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Día (1-31)</label>
                    <input v-model="formulario.dia_vencimiento" type="number" min="1" max="31" required class="mt-1 input-field p-2.5 sm:p-2 w-full" placeholder="15">
                  </div>
                </div>

                <div v-if="formulario.id" class="flex items-center mt-2">
                    <input id="activo" v-model="formulario.activo" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                    <label for="activo" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Servicio Activo
                    </label>
                </div>
              </div>
            </div>
            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
              <button type="submit" class="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2.5 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:text-sm">
                Guardar
              </button>
              <button type="button" @click="cerrarModal" class="mt-2 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2.5 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none sm:text-sm">
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

const servicios = computed(() => serviciosStore.servicios)
const tiposServicio = computed(() => serviciosStore.tiposServicio)

const modalAbierto = ref(false)
const formulario = ref({
  id: null,
  tipo_servicio: '',
  nombre_servicio: '',
  catalogo_servicio: null,
  monto_mensual: '',
  dia_vencimiento: '',
  activo: true
})

const formatCurrency = (value) => parseFloat(value).toFixed(2)

const obtenerNombreTipo = (tipoId) => {
  const tipo = tiposServicio.value.find(t => t.id === tipoId)
  return tipo ? tipo.nombre : 'Desconocido'
}

const obtenerNombreServicio = (servicio) => {
  if (servicio.nombre_servicio) return servicio.nombre_servicio
  if (servicio.catalogo_servicio && servicio.catalogo_detalle) return servicio.catalogo_detalle.nombre
  return 'Servicio sin nombre'
}

const abrirModal = (servicio = null) => {
  if (servicio) {
    formulario.value = { ...servicio }
  } else {
    formulario.value = {
      id: null,
      tipo_servicio: tiposServicio.value.length ? tiposServicio.value[0].id : '',
      nombre_servicio: '',
      catalogo_servicio: null,
      monto_mensual: '',
      dia_vencimiento: '',
      activo: true
    }
  }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const guardarServicio = async () => {
  try {
    const data = {
      tipo_servicio: formulario.value.tipo_servicio,
      nombre_servicio: formulario.value.nombre_servicio,
      monto_mensual: parseFloat(formulario.value.monto_mensual),
      dia_vencimiento: parseInt(formulario.value.dia_vencimiento),
      activo: formulario.value.activo
    }

    if (formulario.value.id) {
      await serviciosApi.actualizarServicio(formulario.value.id, data)
    } else {
      await serviciosApi.crearServicio(data)
    }
    await serviciosStore.fetchServicios()
    cerrarModal()
  } catch (error) {
    alert('Error al guardar el servicio')
    console.error(error)
  }
}

const confirmarEliminar = async (servicio) => {
  if(confirm(`¿Eliminar ${obtenerNombreServicio(servicio)}?`)) {
     try {
       await serviciosApi.eliminarServicio(servicio.id)
       await serviciosStore.fetchServicios()
     } catch(err) {
       alert('Error al eliminar')
     }
  }
}

onMounted(() => {
  serviciosStore.fetchTiposServicio()
  serviciosStore.fetchServicios()
})
</script>
