import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Inyectar access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Renovar token en 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')
        
        // Hacemos un llamado puro a axios (sin usar la instancia "api") para evitar bucles infinitos
        const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
          refresh: refreshToken
        })
        
        const access = response.data.access || response.data.access_token || response.data.tokens?.access
        if (access) {
            localStorage.setItem('access_token', access)
            originalRequest.headers.Authorization = `Bearer ${access}`
        }
        
        return api(originalRequest)
      } catch (refreshError) {
        // Fallo la renovación del token (e.g. refresh token expiró)
        // Disparamos un custom event o limpiamos el storage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
