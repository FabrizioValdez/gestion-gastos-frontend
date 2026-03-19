import api from './axios'

export default {
  // Tipos de servicio y catálogo
  getTiposServicio() {
    return api.get('services/tipos-servicio/')
  },
  getCatalogo(tipoId = null) {
    const params = tipoId ? { tipo_servicio: tipoId } : {}
    return api.get('services/catalogo/', { params })
  },
  
  // Servicios del usuario (CRUD)
  getServicios() {
    return api.get('services/servicios/')
  },
  getServicio(id) {
    return api.get(`services/servicios/${id}/`)
  },
  crearServicio(data) {
    return api.post('services/servicios/', data)
  },
  actualizarServicio(id, data) {
    return api.put(`services/servicios/${id}/`, data)
  },
  eliminarServicio(id) {
    return api.delete(`services/servicios/${id}/`)
  },
  
  // Resúmenes y Gráficos
  getResumenGastos() {
    return api.get('services/servicios/resumen/')
  },
  getDeudas() {
    return api.get('services/servicios/deudas/')
  },
  pagarDeuda(id, data) {
    return api.post(`services/servicios/${id}/pagar_deuda/`, data)
  },
  getGastosPorTipo() {
    return api.get('services/servicios/por_tipo/')
  },
  getDatosGraficos() {
    return api.get('services/servicios/graficos/')
  },
  
  // Pagos
  getPagos(filtros = {}) {
    // Filtros admitidos: estado (pendiente/pagado), anio, mes
    return api.get('services/pagos/', { params: filtros })
  },
  getPago(id) {
    return api.get(`services/pagos/${id}/`)
  },
  crearPago(data) {
    return api.post('services/pagos/', data)
  },
  actualizarPago(id, data) {
    return api.put(`services/pagos/${id}/`, data)
  },
  descargarReportePdf(anio, mes) {
    return api.get(`services/pagos/reporte-pdf/${anio}/${mes}/`, {
      responseType: 'blob'
    })
  },

  // Notificaciones
  getNotificaciones() {
    return api.get('services/notificaciones/')
  },
  getNotificacionesPendientes() {
    return api.get('services/notificaciones/pendientes/')
  },
  marcarNotificacionLeida(id, leida = true) {
    return api.patch(`services/notificaciones/${id}/`, { leida })
  },

  // Ayuda / FAQ
  getAyuda(categoria = null) {
    const params = categoria ? { categoria } : {}
    return api.get('services/ayuda/', { params })
  }
}
