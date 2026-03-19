import { defineStore } from 'pinia'
import authApi from '../api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    isLoading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
  
  actions: {
    setTokens(data) {
      const access = data.access || data.access_token || data.accessToken || data.tokens?.access
      const refresh = data.refresh || data.refresh_token || data.refreshToken || data.tokens?.refresh

      this.accessToken = access
      if (access) {
        localStorage.setItem('access_token', access)
      }
      
      if (refresh) {
        this.refreshToken = refresh
        localStorage.setItem('refresh_token', refresh)
      }
    },
    
    clearAuth() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
    
    async login(credentials) {
      this.isLoading = true
      this.error = null
      try {
        const response = await authApi.login(credentials)
        this.setTokens(response.data)
        
        // El backend devuelve los datos del usuario anidados en "cliente"
        if (response.data.cliente) {
           this.user = response.data.cliente
        } else if (response.data.user) {
           this.user = response.data.user
        }
        
        await this.fetchUser()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Error al iniciar sesión'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async register(userData) {
      this.isLoading = true
      this.error = null
      try {
        const response = await authApi.register(userData)
        return response.data
      } catch (error) {
        this.error = error.response?.data || 'Error al registrarse'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchUser() {
      if (!this.accessToken) return
      this.isLoading = true
      try {
        const response = await authApi.me()
        this.user = response.data
      } catch (error) {
        console.error('Error al obtener usuario en fetchUser:', error)
        // Eliminado clearAuth() temporalmente para evitar que un 404 o fallo del
        // endpoint /me cause que el usuario sea expulsado silenciosamente durante el login
      } finally {
        this.isLoading = false
      }
    },
    
    logout() {
      this.clearAuth()
    }
  }
})
