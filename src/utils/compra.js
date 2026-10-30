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
