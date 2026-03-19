import { defineStore } from 'pinia'
import serviciosApi from '../api/servicios'

export const useServiciosStore = defineStore('servicios', {
  state: () => ({
    servicios: [],
    resumen: {
      total_mensual: 0,
      servicios_activos: 0
    },
    deudas: [],
    pagos: [],
    notificaciones: [],
    tiposServicio: [],
    graficos: null,
    isLoading: false,
    error: null
  }),
  
  getters: {
    notificacionesPendientes: (state) => state.notificaciones.filter(n => !n.leida).length,
    cantidadDeudas: (state) => state.deudas.length
  },
  
  actions: {
    async fetchResumen() {
      try {
        const response = await serviciosApi.getResumenGastos()
        this.resumen = response.data
      } catch (error) {
        console.error('Error fetching resumen:', error)
      }
    },
    
    async fetchServicios() {
      this.isLoading = true
      try {
        const response = await serviciosApi.getServicios()
        this.servicios = response.data
      } catch (error) {
        this.error = 'Error al cargar servicios'
      } finally {
        this.isLoading = false
      }
    },

    async fetchTiposServicio() {
      try {
        const response = await serviciosApi.getTiposServicio()
        this.tiposServicio = response.data
      } catch (error) {
        console.error('Error fetching Tipos de Servicio:', error)
      }
    },
    
    async fetchDeudas() {
      try {
        const response = await serviciosApi.getDeudas()
        this.deudas = response.data
      } catch (error) {
        console.error('Error fetching deudas:', error)
      }
    },
    
    async fetchPagos(filtros = {}) {
      this.isLoading = true
      try {
        const response = await serviciosApi.getPagos(filtros)
        this.pagos = response.data
      } catch (error) {
        this.error = 'Error al cargar pagos'
      } finally {
        this.isLoading = false
      }
    },
    
    async fetchNotificaciones() {
      try {
        const response = await serviciosApi.getNotificaciones()
        this.notificaciones = response.data
      } catch (error) {
        console.error('Error fetching Notificaciones:', error)
      }
    },
    
    async marcarNotificacionLeida(id) {
      try {
         await serviciosApi.marcarNotificacionLeida(id, true)
         const notif = this.notificaciones.find(n => n.id === id)
         if(notif) notif.leida = true
      } catch(error) {
         console.error('Error al marcar notificacion leída', error)
      }
    },

    async fetchDatosGraficos() {
      try {
        const response = await serviciosApi.getDatosGraficos()
        this.graficos = response.data
      } catch (error) {
        console.error('Error fetching config gráficos:', error)
      }
    }
  }
})
