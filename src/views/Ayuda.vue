<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Centro de Ayuda</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Preguntas frecuentes</p>
      </div>
      <select v-model="categoriaFiltro" @change="cargarAyuda" class="input-field py-2 px-3 w-full sm:w-auto">
        <option value="">Todas</option>
        <option value="pagos">Pagos</option>
        <option value="servicios">Servicios</option>
        <option value="cuenta">Cuenta</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="cargando" class="flex justify-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- FAQ List -->
    <div v-else class="space-y-4">
      <div v-for="(item, index) in dudas" :key="item.id || index" class="premium-card overflow-hidden">
        <button @click="toggleFAQ(index)" class="w-full text-left px-6 py-4 focus:outline-none flex justify-between items-center bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 transition-colors">
          <span class="font-medium text-gray-900 dark:text-white">{{ item.pregunta }}</span>
          <svg class="h-5 w-5 text-gray-500 transition-transform duration-200" 
               :class="{'transform rotate-180': openIndex === index}"
               xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <div v-show="openIndex === index" class="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
           <p class="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">{{ item.respuesta }}</p>
        </div>
      </div>

      <div v-if="dudas.length === 0" class="text-center py-12 premium-card">
         <p class="text-gray-500 dark:text-gray-400">No se encontraron artículos de ayuda para esta categoría.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import serviciosApi from '../api/servicios'

const categoriaFiltro = ref('')
const dudas = ref([])
const openIndex = ref(-1)
const cargando = ref(false)

const cargarAyuda = async () => {
  cargando.value = true
  openIndex.value = -1
  try {
    const response = await serviciosApi.getAyuda(categoriaFiltro.value)
    dudas.value = response.data
  } catch (error) {
    console.error('Error cargando FAQs:', error)
    // Fallback data para mostrar UI si backend no tiene datos yet
    if (dudas.value.length === 0) {
      dudas.value = [
        { id: 1, pregunta: '¿Cómo registro un pago?', respuesta: 'Ve a la sección Pagos, haz clic en el botón "+ Registrar Pago" y rellena los datos requeridos.' },
        { id: 2, pregunta: '¿Qué es un catálogo de servicios?', respuesta: 'Es una lista predefinida de servicios comunes (Netflix, Spotify, etc.) para facilitar su registro.' }
      ]
    }
  } finally {
    cargando.value = false
  }
}

const toggleFAQ = (index) => {
  openIndex.value = openIndex.value === index ? -1 : index
}

onMounted(() => {
  cargarAyuda()
})
</script>
