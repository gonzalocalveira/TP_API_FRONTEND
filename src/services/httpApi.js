// Implementación REAL de la API, con fetch contra el back-end (Spring Boot).
// Todavía NO se usa: se activa con VITE_USE_MOCKS=false (ver api.js y .env.example).
// Tiene las mismas funciones y devuelve lo mismo que mockApi.js, así los componentes no cambian.
import { ApiError } from './ApiError.js'
import * as mockApi from './mockApi.js'

const URL_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// Hace el pedido HTTP y convierte las respuestas de error del back-end en ApiError.
async function pedir(path, { method = 'GET', body } = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${URL_BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    // fetch solo falla así cuando no hay conexión o el servidor está apagado.
    throw new ApiError({ status: 0, message: 'No pudimos conectarnos con el servidor. Revisá tu conexión.', path })
  }

  if (respuesta.status === 204) return null
  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    // El back-end responde { timestamp, status, error, message, path, detalles }
    throw new ApiError({ ...datos, status: respuesta.status, message: datos?.message ?? 'Ocurrió un error inesperado.', path })
  }
  return datos
}

function armarQuery(parametros) {
  const query = new URLSearchParams()
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== null && valor !== '') query.set(clave, valor)
  }
  const texto = query.toString()
  return texto ? `?${texto}` : ''
}

export const getPeliculas = () => pedir('/api/clientes/cartelera')
export const getPelicula = (id) => pedir(`/api/peliculas/${id}`)
export const getFunciones = ({ peliculaId, fecha } = {}) => pedir(`/api/funciones${armarQuery({ peliculaId, fecha })}`)
export const getFuncion = (id) => pedir(`/api/funciones/${id}`)
export const getButacas = (funcionId) => pedir(`/api/funciones/${funcionId}/butacas`)
export const comprar = ({ usuarioId, funcionId, asientoIds }) =>
  pedir('/api/clientes/compras', { method: 'POST', body: { usuarioId, funcionId, asientoIds } })
export const cancelarCompra = (compraId) => pedir(`/api/clientes/compras/${compraId}/cancelar`, { method: 'PATCH' })
export const getHistorial = (usuarioId) => pedir(`/api/clientes/${usuarioId}/historial`)
export const getMembresia = (usuarioId) => pedir(`/api/clientes/${usuarioId}/membresia`)
export const login = ({ mail, password }) => pedir('/api/usuarios/login', { method: 'POST', body: { mail, password } })
export const registrar = ({ nombreApellido, dni, fechaNacimiento, mail, password }) =>
  pedir('/api/usuarios', { method: 'POST', body: { nombreApellido, dni: Number(dni), fechaNacimiento, mail, password } })

// SIMULADO EN EL FRONT, SIN ENDPOINT EN EL BACK: aunque se use la API real, candy, promociones
// y pago siguen saliendo del mock hasta que el back-end los implemente.
export const { getProductosCandy, getPromociones, procesarPago } = mockApi
