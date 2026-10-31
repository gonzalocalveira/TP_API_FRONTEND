// Funciones con la forma "base" del back-end: { id, fechaFuncion, horaFuncion, formatoFuncion, precio, peliculaId, salaId }.
// mockApi.js les agrega peliculaNombre, duracion y salaNombre, igual que la respuesta del back.
//
// - Los ids 1 a 6 son las funciones de database/02_datos.sql (mismos días relativos, horarios, salas y precios).
// - Desde el id 101 se generan funciones para los próximos 7 días, así la demo siempre tiene funciones futuras.
//   Los horarios de cada sala están separados 3 h 30 min para que ninguna función se superponga
//   (la película más larga dura 2 h 49 min).
import { aFechaISO, sumarDias } from '../utils/formato.js'

const hoy = new Date()
const dia = (dias) => aFechaISO(sumarDias(hoy, dias))

const funcionesDelSql = [
  { id: 1, fechaFuncion: dia(1), horaFuncion: '18:00:00', formatoFuncion: 'DOS_D', precio: 4500, peliculaId: 1, salaId: 1 },
  { id: 2, fechaFuncion: dia(1), horaFuncion: '21:30:00', formatoFuncion: 'DOS_D', precio: 4000, peliculaId: 2, salaId: 1 },
  { id: 3, fechaFuncion: dia(1), horaFuncion: '19:00:00', formatoFuncion: 'DOS_D', precio: 3800, peliculaId: 3, salaId: 2 },
  { id: 4, fechaFuncion: dia(2), horaFuncion: '20:00:00', formatoFuncion: 'TRES_D', precio: 5500, peliculaId: 4, salaId: 2 },
  { id: 5, fechaFuncion: dia(2), horaFuncion: '16:00:00', formatoFuncion: 'CUATRO_DX', precio: 7000, peliculaId: 1, salaId: 1 },
  { id: 6, fechaFuncion: dia(3), horaFuncion: '15:00:00', formatoFuncion: 'DOS_D', precio: 4000, peliculaId: 2, salaId: 2 },
]

// Grilla de horarios y formatos por sala.
const grilla = {
  1: [
    { hora: '14:00:00', formato: 'DOS_D' },
    { hora: '17:30:00', formato: 'CUATRO_DX' },
    { hora: '21:00:00', formato: 'DOS_D' },
  ],
  2: [
    { hora: '15:00:00', formato: 'DOS_D' },
    { hora: '18:30:00', formato: 'TRES_D' },
    { hora: '22:00:00', formato: 'TRES_D' },
  ],
  3: [
    { hora: '13:30:00', formato: 'DOS_D' },
    { hora: '17:00:00', formato: 'DOS_D' },
    { hora: '20:30:00', formato: 'TRES_D' },
  ],
}

const precios = { DOS_D: 4500, TRES_D: 5500, CUATRO_DX: 7000 }

// Películas en cartelera (las 8, 9 y 10 todavía no se estrenaron).
const peliculasEnCartelera = [1, 2, 3, 4, 5, 6, 7]

function generarFunciones() {
  const generadas = []
  let id = 101
  let turno = 0
  for (let d = 0; d < 7; d++) {
    const fecha = dia(d)
    for (const [salaId, horarios] of Object.entries(grilla)) {
      // Si ese día la sala ya tiene funciones del SQL, no se generan otras para no superponerlas.
      const ocupadaPorSql = funcionesDelSql.some((f) => f.fechaFuncion === fecha && f.salaId === Number(salaId))
      if (ocupadaPorSql) continue
      for (const { hora, formato } of horarios) {
        // Las funciones de 2D antes de las 16 h son más baratas (precio de matiné).
        const precio = formato === 'DOS_D' && hora < '16:00:00' ? 4000 : precios[formato]
        generadas.push({
          id: id++,
          fechaFuncion: fecha,
          horaFuncion: hora,
          formatoFuncion: formato,
          precio,
          peliculaId: peliculasEnCartelera[turno++ % peliculasEnCartelera.length],
          salaId: Number(salaId),
        })
      }
    }
  }
  return generadas
}

export const funciones = [...funcionesDelSql, ...generarFunciones()]

// Ocupación inicial simulada: cada función arranca con ~25% de butacas vendidas, siempre las mismas
// (sale de un cálculo con los ids, no de Math.random), así la demo es predecible.
export function estabaOcupada(funcionId, asientoId) {
  let h = Math.imul(funcionId, 374761393) + Math.imul(asientoId, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) % 100 < 25
}
