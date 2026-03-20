<template>
  <div>
    <div class="flex flex-col gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Pagos Realizados</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Historial de tus pagos</p>
      </div>
      <button @click="abrirModal()" class="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto">
        <span>+</span>
        <span>Registrar Pago</span>
      </button>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="flex flex-col sm:flex-row gap-2 flex-1">
        <select v-model="selectedYear" @change="cargarPagos" class="input-field py-2 px-3 w-full sm:w-auto">
          <option v-for="year in añosDisponibles" :key="year" :value="year">{{ year }}</option>
        </select>
        <select v-model="selectedMonth" @change="cargarPagos" class="input-field py-2 px-3 w-full sm:w-auto">
          <option v-for="(month, index) in meses" :key="index" :value="index">{{ month }}</option>
        </select>
        <select v-model="filtroEstado" @change="cargarPagos" class="input-field py-2 px-3 w-full sm:w-auto">
          <option value="">Todos</option>
          <option value="pagado">Pagados</option>
          <option value="pendiente">Pendientes</option>
        </select>
      </div>
      <button @click="descargarPdf" :disabled="descargandoPdf" class="btn-secondary flex items-center justify-center space-x-2 px-4 w-full sm:w-auto">
        <svg v-if="descargandoPdf" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>PDF</span>
      </button>
    </div>

    <div v-if="serviciosStore.isLoading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="pagos.length === 0" class="text-center py-12 premium-card">
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay pagos registrados</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Registra un nuevo pago para comenzar.</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="pago in pagos" :key="pago.id" class="premium-card p-4">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div class="flex-1 min-w-0">
            <h4 class="text-base font-medium text-gray-900 dark:text-white truncate">
              {{ getServiceName(pago) }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(pago.fecha_vencimiento_cubierta) }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="text-lg font-semibold text-gray-900 dark:text-white">${{ formatCurrency(pago.monto_pagado) }}</p>
              <span :class="pago.estado === 'pagado' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                {{ pago.estado }}
              </span>
            </div>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Pago: {{ formatDate(pago.fecha_pago) }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="modalAbierto" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-4 sm:pb-20 text-center sm:block">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="cerrarModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom sm:align-middle sm:max-w-lg sm:w-full w-full bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all">
          <form @submit.prevent="guardarPago">
            <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Registrar Pago
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Servicio</label>
                  <select v-model="formulario.servicio_usuario" required class="mt-1 input-field p-2.5 sm:p-2 w-full" @change="autocompletarMonto">
                    <option value="" disabled>Seleccione</option>
                    <option v-for="servicio in serviciosActivos" :key="servicio.id" :value="servicio.id">
                      {{ servicio.nombre_servicio || (servicio.catalogo_detalle ? servicio.catalogo_detalle.nombre : 'Sin nombre') }}
                    </option>
                  </select>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
                    <input v-model="formulario.monto_pagado" type="number" step="0.01" required class="mt-1 input-field p-2.5 sm:p-2 w-full" placeholder="0.00">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                    <select v-model="formulario.estado" required class="mt-1 input-field p-2.5 sm:p-2 w-full">
                       <option value="pagado">Pagado</option>
                       <option value="pendiente">Pendiente</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Límite</label>
                   <input v-model="formulario.fecha_vencimiento_cubierta" type="date" required class="mt-1 input-field p-2.5 sm:p-2 w-full">
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

const pagos = computed(() => serviciosStore.pagos)
const serviciosList = computed(() => serviciosStore.servicios)
const serviciosActivos = computed(() => serviciosList.value.filter(s => s.activo))

const filtroEstado = ref('')
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const añosDisponibles = ref([])
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth())
const descargandoPdf = ref(false)

const actualizarMesesDisponibles = () => {
  const currentYear = new Date().getFullYear()
  añosDisponibles.value = []
  for (let year = currentYear - 2; year <= currentYear; year++) {
    añosDisponibles.value.push(year)
  }
}

const descargarPdf = async () => {
  descargandoPdf.value = true
  try {
    const response = await serviciosApi.descargarReportePdf(selectedYear.value, selectedMonth.value + 1)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Reporte_Gastos_${meses[selectedMonth.value]}_${selectedYear.value}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    if (error.response?.status === 404) {
      alert('No hay pagos para este período')
    } else {
      alert('Error al descargar')
    }
  } finally {
    descargandoPdf.value = false
  }
}

const cargarPagos = () => {
  const filtros = {}
  if(filtroEstado.value) filtros.estado = filtroEstado.value
  if(selectedYear.value) filtros.anio = selectedYear.value
  if(selectedMonth.value !== null) filtros.mes = selectedMonth.value + 1
  serviciosStore.fetchPagos(filtros)
}

const modalAbierto = ref(false)
const formulario = ref({
  servicio_usuario: '',
  monto_pagado: '',
  fecha_vencimiento_cubierta: '',
  estado: 'pagado'
})

const formatCurrency = (value) => parseFloat(value).toFixed(2)
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const finalStr = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`
  const date = new Date(finalStr)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const getServiceName = (pago) => {
  if (pago.servicio_usuario_nombre) return pago.servicio_usuario_nombre
  const srv = serviciosList.value.find(s => s.id === pago.servicio_usuario)
  if (srv) return srv.nombre_servicio || (srv.catalogo_detalle ? srv.catalogo_detalle.nombre : 'Sin nombre')
  return 'Servicio no encontrado'
}

const abrirModal = () => {
  formulario.value = { servicio_usuario: '', monto_pagado: '', fecha_vencimiento_cubierta: '', estado: 'pagado' }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const autocompletarMonto = () => {
  if (formulario.value.servicio_usuario) {
    const srv = serviciosActivos.value.find(s => s.id === formulario.value.servicio_usuario)
    if (srv) {
       formulario.value.monto_pagado = srv.monto_mensual
       const hoy = new Date()
       const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
       const diaVencimiento = Math.min(srv.dia_vencimiento, ultimoDia)
       const fechaVenc = new Date(hoy.getFullYear(), hoy.getMonth(), diaVencimiento)
       formulario.value.fecha_vencimiento_cubierta = fechaVenc.toISOString().split('T')[0]
    }
  }
}

const guardarPago = async () => {
  try {
    const data = {
      servicio_usuario: formulario.value.servicio_usuario,
      monto_pagado: parseFloat(formulario.value.monto_pagado),
      fecha_vencimiento_cubierta: formulario.value.fecha_vencimiento_cubierta,
      estado: formulario.value.estado
    }
    await serviciosApi.crearPago(data)
    await cargarPagos()
    cerrarModal()
  } catch (error) {
    alert('Error al registrar')
  }
}

onMounted(() => {
  actualizarMesesDisponibles()
  cargarPagos()
  serviciosStore.fetchTiposServicio()
  if(serviciosList.value.length === 0) serviciosStore.fetchServicios()
})
</script>
