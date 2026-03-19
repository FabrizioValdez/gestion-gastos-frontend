import api from './axios'

export default {
  login(credentials) {
    return api.post('auth/login/', credentials)
  },
  register(userData) {
    return api.post('auth/register/', userData)
  },
  refreshToken(token) {
    return api.post('auth/token/refresh/', { refresh: token })
  },
  me() {
    return api.get('auth/me/')
  }
}
