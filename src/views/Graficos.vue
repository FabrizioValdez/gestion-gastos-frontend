<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Gráficos de Gastos</h2>

    <div v-if="cargando" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="!datosValidos" class="text-center py-12 premium-card">
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Sin datos suficientes</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Registra servicios y pagos para visualizar los gráficos.</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6">
      <div class="premium-card p-4 sm:p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Evolución Anual</h3>
        <div class="relative h-64 sm:h-72">
          <Line :data="lineChartData" :options="lineChartOptions" />
        </div>
      </div>

      <div class="premium-card p-4 sm:p-6">
         <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Distribución por Categoría</h3>
         <div class="relative h-64 sm:h-72">
            <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'
import serviciosApi from '../api/servicios'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, ArcElement)

const cargando = ref(true)
const respuestaBruta = ref(null)

const cargarGraficos = async () => {
   cargando.value = true
   try {
      const response = await serviciosApi.getDatosGraficos()
      respuestaBruta.value = response.data
   } catch (error) {
      console.error('Error cargando gráficos', error)
      respuestaBruta.value = {
         gastos_por_mes: [
           { mes: 'Ene', total: 120 }, { mes: 'Feb', total: 150 }, { mes: 'Mar', total: 135 }
         ],
         gastos_por_tipo: [
           { tipo_nombre: 'Streaming', total: 45 }, { tipo_nombre: 'Internet', total: 60 }, { tipo_nombre: 'Agua', total: 30 }
         ]
      }
   } finally {
      cargando.value = false
   }
}

const datosValidos = computed(() => {
   return respuestaBruta.value && 
          (respuestaBruta.value.gastos_por_mes?.length > 0 || respuestaBruta.value.gastos_por_tipo?.length > 0)
})

const lineChartData = computed(() => {
   if (!respuestaBruta.value || !respuestaBruta.value.gastos_por_mes) return { labels: [], datasets: [] }
   
   const source = respuestaBruta.value.gastos_por_mes
   return {
      labels: source.map(item => item.mes || item.periodo),
      datasets: [
         {
            label: 'Total Gastado ($)',
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            tension: 0.3,
            data: source.map(item => item.total),
            fill: true
         }
      ]
   }
})

const lineChartOptions = {
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
     legend: { display: false }
   },
   scales: {
     y: {
        beginAtZero: true,
        ticks: { callback: function(value) { return '$' + value; } }
     }
   }
}

const doughnutChartData = computed(() => {
   if (!respuestaBruta.value || !respuestaBruta.value.gastos_por_tipo) return { labels: [], datasets: [] }
   
   const source = respuestaBruta.value.gastos_por_tipo
   return {
      labels: source.map(item => item.tipo_nombre || item.tipo || 'Desconocido'),
      datasets: [
         {
            backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'],
            data: source.map(item => item.total)
         }
      ]
   }
})

const doughnutChartOptions = {
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
     legend: { position: 'bottom' }
   }
}

onMounted(() => {
   cargarGraficos()
})
</script>
