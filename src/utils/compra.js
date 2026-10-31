// Reglas y cálculos de la compra que no dependen de React.

export const MAX_BUTACAS = 8

// Igual que el back-end: total de entradas = precio de la función x cantidad. Sin cargos ni descuentos.
export function subtotalEntradas(precio, cantidad) {
  return precio * cantidad
}

// candy: [{ id, nombre, precio, cantidad }]
export function subtotalCandy(candy) {
  return candy.reduce((suma, item) => suma + item.precio * item.cantidad, 0)
}

export function cantidadCandy(candy) {
  return candy.reduce((suma, item) => suma + item.cantidad, 0)
}

export function inicioFuncion({ fechaFuncion, horaFuncion }) {
  return new Date(`${fechaFuncion}T${horaFuncion}`)
}

export function funcionYaEmpezo(funcion, ahora = new Date()) {
  return inicioFuncion(funcion) <= ahora
}

// Misma regla que PATCH /api/clientes/compras/{id}/cancelar
export function puedeCancelarse(compra, ahora = new Date()) {
  return compra.estado === 'CONFIRMADA' && !funcionYaEmpezo(compra, ahora)
}

// Agrupa funciones por formato: { DOS_D: [...], TRES_D: [...] }, manteniendo el orden por hora.
export function agruparPorFormato(funciones) {
  const grupos = {}
  for (const funcion of funciones) {
    grupos[funcion.formatoFuncion] ??= []
    grupos[funcion.formatoFuncion].push(funcion)
  }
  return grupos
}

export function ordenarPorFechaYHora(funciones) {
  return [...funciones].sort((a, b) => inicioFuncion(a) - inicioFuncion(b))
}

// Tiempo para completar la compra -----------------------------------------------------

export const DURACION_COMPRA_MS = 10 * 60 * 1000 // 10 minutos desde la primera butaca
export const EXTENSION_MS = 5 * 60 * 1000 // "Necesito más tiempo": +5 minutos, una sola vez por compra
export const SEGUNDOS_AVISO = 60 // con 1 minuto o menos se muestra la advertencia

export function tiempoVencido(vencimiento, ahora = Date.now()) {
  return vencimiento !== null && vencimiento <= ahora
}

// 572 -> "09:32"
export function formatearCuentaRegresiva(segundos) {
  const minutos = Math.floor(segundos / 60)
  return `${String(minutos).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`
}

// Momentos en los que se avisa al lector de pantalla (no se anuncia cada segundo).
export function hitoDelTemporizador(segundos) {
  if (segundos === null) return null
  if (segundos <= 0) return 'VENCIDO'
  if (segundos <= SEGUNDOS_AVISO) return 'UN_MINUTO'
  if (segundos <= 5 * 60) return 'CINCO_MINUTOS'
  return null
}
