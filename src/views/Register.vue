<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 premium-card p-10">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Crea tu cuenta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          O
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500 transition-colors">
            inicia sesión aquí
          </router-link>
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="nombre" class="sr-only">Nombre completo</label>
            <input id="nombre" name="nombre" type="text" required v-model="form.nombre" class="input-field px-4 py-3" placeholder="Nombre completo">
          </div>
          <div>
            <label for="email-address" class="sr-only">Correo electrónico</label>
            <input id="email-address" name="email" type="email" autocomplete="email" required v-model="form.correo" class="input-field px-4 py-3" placeholder="Correo electrónico">
          </div>
          <div>
            <label for="password" class="sr-only">Contraseña</label>
            <input id="password" name="password" type="password" required v-model="form.password" class="input-field px-4 py-3" placeholder="Contraseña">
          </div>
          <div>
            <label for="password_confirm" class="sr-only">Confirmar Contraseña</label>
            <input id="password_confirm" name="password_confirm" type="password" required v-model="form.password_confirm" class="input-field px-4 py-3" placeholder="Confirmar Contraseña">
          </div>
        </div>

        <div v-if="errorMsg" class="text-sm text-red-600 dark:text-red-400 text-center">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="text-sm text-green-600 dark:text-green-400 text-center">
          {{ successMsg }}
        </div>

        <div>
          <button type="submit" :disabled="authStore.isLoading" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg v-if="authStore.isLoading" class="animate-spin h-5 w-5 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ authStore.isLoading ? 'Registrando...' : 'Registrarse' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  nombre: '',
  correo: '',
  password: '',
  password_confirm: ''
})

const errorMsg = ref('')
const successMsg = ref('')

const handleRegister = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  
  if (form.value.password !== form.value.password_confirm) {
    errorMsg.value = 'Las contraseñas no coinciden'
    return
  }
  
  try {
    await authStore.register(form.value)
    successMsg.value = 'Registro exitoso. Redirigiendo a inicio de sesión...'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (err) {
    if (typeof authStore.error === 'object') {
       errorMsg.value = Object.values(authStore.error).join(', ')
    } else {
       errorMsg.value = authStore.error || 'Ocurrió un error en el registro.'
    }
  }
}
</script>
