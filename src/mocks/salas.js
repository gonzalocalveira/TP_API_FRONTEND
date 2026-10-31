// Salas y butacas, generadas igual que en database/02_datos.sql:
//   Sala 1: filas A-E x números 1-8  -> ids 1 a 40
//   Sala 2: filas A-C x números 1-10 -> ids 41 a 70
// La Sala 3 existe SOLO en el mock (no está en el back-end): filas A-F x 1-10 -> ids 71 a 130.
// Se agregó para que la cartelera simulada tenga funciones suficientes en los 7 días.

export const salas = [
  { id: 1, nombre: 'Sala 1', capacidad: 40 },
  { id: 2, nombre: 'Sala 2', capacidad: 40 },
  { id: 3, nombre: 'Sala 3', capacidad: 60 },
]

function generarButacas(salaId, filas, butacasPorFila, primerId) {
  return filas.flatMap((fila, indiceFila) =>
    Array.from({ length: butacasPorFila }, (_, i) => ({
      id: primerId + indiceFila * butacasPorFila + i,
      numeroAsiento: i + 1,
      filaAsiento: fila,
      salaId,
    })),
  )
}

// Misma forma que GET /api/asientos: { id, numeroAsiento, filaAsiento, salaId }
export const asientos = [
  ...generarButacas(1, ['A', 'B', 'C', 'D', 'E'], 8, 1),
  ...generarButacas(2, ['A', 'B', 'C'], 10, 41),
  ...generarButacas(3, ['A', 'B', 'C', 'D', 'E', 'F'], 10, 71),
]
