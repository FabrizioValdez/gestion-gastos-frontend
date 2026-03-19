<template>
  <div>
    <div class="sm:flex sm:items-center sm:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Pagos Realizados</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Historial y control de los pagos de tus servicios</p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <!-- Selector de Mes/Año para PDF -->
        <div class="flex space-x-2">
          <select v-model="selectedYear" @change="cargarPagos" class="input-field py-2 px-3">
            <option v-for="year in añosDisponibles" :key="year" :value="year">{{ year }}</option>
          </select>
          <select v-model="selectedMonth" @change="cargarPagos" class="input-field py-2 px-3">
            <option v-for="(month, index) in meses" :key="index" :value="index">{{ month }}</option>
          </select>
          <button @click="descargarPdf" :disabled="descargandoPdf" class="btn-primary flex items-center space-x-2 px-4">
            <svg v-if="descargandoPdf" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <span>PDF</span>
          </button>
        </div>

        <!-- Filtros Rápidos -->
        <select v-model="filtroEstado" @change="cargarPagos" class="input-field py-2 px-3">
          <option value="">Todos los Estados</option>
          <option value="pagado">Pagados</option>
          <option value="pendiente">Pendientes</option>
        </select>

        <button @click="abrirModal()" class="btn-primary flex items-center space-x-2">
          <span>+</span>
          <span>Registrar Pago</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="serviciosStore.isLoading" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="pagos.length === 0" class="text-center py-12 premium-card">
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay pagos registrados</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Registra un nuevo pago para comenzar a llevar el control.</p>
    </div>

    <!-- Tabla de Pagos -->
    <div v-else class="premium-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha de Pago</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Servicio</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Período Cubierto</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto</th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="pago in pagos" :key="pago.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                {{ formatDate(pago.fecha_pago) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ getServiceName(pago) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(pago.fecha_vencimiento_cubierta) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                ${{ formatCurrency(pago.monto_pagado) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span :class="pago.estado === 'pagado' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                  {{ pago.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nuevo Pago -->
    <div v-if="modalAbierto" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="cerrarModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="guardarPago">
            <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4" id="modal-title">
                Registrar Nuevo Pago
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Servicio</label>
                  <select v-model="formulario.servicio_usuario" required class="mt-1 input-field p-2" @change="autocompletarMonto">
                    <option value="" disabled>Seleccione un servicio</option>
                    <option v-for="servicio in serviciosActivos" :key="servicio.id" :value="servicio.id">
                      {{ servicio.nombre_servicio || (servicio.catalogo_detalle ? servicio.catalogo_detalle.nombre : 'Sin nombre') }}
                    </option>
                  </select>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto del Pago</label>
                    <input v-model="formulario.monto_pagado" type="number" step="0.01" required class="mt-1 input-field p-2" placeholder="0.00">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                    <select v-model="formulario.estado" required class="mt-1 input-field p-2">
                       <option value="pagado">Pagado</option>
                       <option value="pendiente">Pendiente</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Límite / Vencimiento Cubierto</label>
                   <input v-model="formulario.fecha_vencimiento_cubierta" type="date" required class="mt-1 input-field p-2">
                </div>
              </div>
            </div>
            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Guardar Pago
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

// State Data
const pagos = computed(() => serviciosStore.pagos)
const serviciosList = computed(() => serviciosStore.servicios)
const serviciosActivos = computed(() => serviciosList.value.filter(s => s.activo))

// Filtros
const filtroEstado = ref('')

// Mes/Año para PDF
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const añosDisponibles = ref([])
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth()) // 0-indexed para el array
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
    const mesParaApi = selectedMonth.value + 1 // Convertir de 0-indexed a 1-indexed
    const response = await serviciosApi.descargarReportePdf(selectedYear.value, mesParaApi)
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const mesNombre = meses[selectedMonth.value]
    link.setAttribute('download', `Reporte_Gastos_${mesNombre}_${selectedYear.value}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    if (error.response && error.response.status === 404) {
      alert('No hay pagos registrados para este período')
    } else {
      alert('Error al descargar el reporte')
    }
    console.error(error)
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

// Modal State
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
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

const getServiceName = (pago) => {
  // 1. Prioridad: El nombre que ya viene calculado de la API
  if (pago.servicio_usuario_nombre) {
    return pago.servicio_usuario_nombre
  }

  // 2. Fallback: Si por alguna razón no viene, buscar en el listado local del store
  const srv = serviciosList.value.find(s => s.id === pago.servicio_usuario)
  if (srv) {
    return srv.nombre_servicio || (srv.catalogo_detalle ? srv.catalogo_detalle.nombre : 'Sin nombre')
  }

  return 'Servicio no encontrado'
}

const abrirModal = () => {
  formulario.value = {
    servicio_usuario: '',
    monto_pagado: '',
    fecha_vencimiento_cubierta: '',
    estado: 'pagado'
  }
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
    alert('Error al registrar el pago')
    console.error(error)
  }
}

onMounted(() => {
  actualizarMesesDisponibles()
  cargarPagos()
  serviciosStore.fetchTiposServicio()
  if(serviciosList.value.length === 0) {
     serviciosStore.fetchServicios()
  }
})
</script>
