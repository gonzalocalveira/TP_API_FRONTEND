// Interfaz pública de la capa de datos. Los componentes importan SIEMPRE desde acá,
// nunca desde mocks/ ni desde mockApi/httpApi directamente.
// Con VITE_USE_MOCKS=false se pasa a la API real sin tocar ningún componente.
import * as mockApi from './mockApi.js'
import * as httpApi from './httpApi.js'

export const USANDO_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

const implementacion = USANDO_MOCKS ? mockApi : httpApi

export const {
  getPeliculas,
  getPelicula,
  getFunciones,
  getFuncion,
  getButacas,
  comprar,
  cancelarCompra,
  getHistorial,
  getMembresia,
  login,
  registrar,
  getProductosCandy,
  getPromociones,
  procesarPago,
} = implementacion

// Solo tiene sentido con los mocks: borra los datos de prueba guardados en el navegador.
export const resetearDatosPrueba = mockApi.resetearDatosPrueba

export { ApiError } from './ApiError.js'
export { leerModoError, desactivarModoError, MODOS_ERROR } from './simulacion.js'
