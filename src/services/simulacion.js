// Modo de errores simulados para la demo (solo afecta a mockApi).
//   ?error=1   -> todas las consultas (GET) fallan con 500, para mostrar el estado de error y "Reintentar".
//   ?error=409 -> al pagar, "otra persona" ocupa una de tus butacas justo antes (conflicto 409).
//   ?error=0   -> desactiva el modo.
// El modo elegido se guarda en sessionStorage, así sigue activo mientras se navega por la app.
// También se puede activar con la variable de entorno VITE_SIMULAR_ERRORES=true (equivale a ?error=1).
import { leerJSON, guardarJSON, borrarClave } from '../utils/almacenamiento.js'

const CLAVE = 'cmp-modo-error'

export const MODOS_ERROR = {
  NINGUNO: 'ninguno',
  LECTURA: 'lectura',
  CONFLICTO: 'conflicto',
}

export function leerModoError() {
  const parametro = new URLSearchParams(window.location.search).get('error')
  if (parametro === '0') borrarClave(CLAVE, 'session')
  if (parametro === '1') guardarJSON(CLAVE, MODOS_ERROR.LECTURA, 'session')
  if (parametro === '409') guardarJSON(CLAVE, MODOS_ERROR.CONFLICTO, 'session')

  const guardado = leerJSON(CLAVE, null, 'session')
  if (guardado) return guardado
  if (parametro !== '0' && import.meta.env.VITE_SIMULAR_ERRORES === 'true') return MODOS_ERROR.LECTURA
  return MODOS_ERROR.NINGUNO
}

export function desactivarModoError() {
  borrarClave(CLAVE, 'session')
  // Si vino por variable de entorno, se recuerda que el usuario lo apagó en esta sesión.
  if (import.meta.env.VITE_SIMULAR_ERRORES === 'true') guardarJSON(CLAVE, MODOS_ERROR.NINGUNO, 'session')
}
