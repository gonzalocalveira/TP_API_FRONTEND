// Lógica de la cartelera (sin React): separar estrenos, filtrar por formato/día y buscar funciones.
import { aFechaISO } from './formato.js'
import { funcionYaEmpezo } from './compra.js'

// En cartelera: ya estrenadas. Próximamente: con fecha de estreno futura, de la más cercana a la más lejana.
export function separarCartelera(peliculas, hoy = new Date()) {
  const hoyISO = aFechaISO(hoy)
  return {
    enCartelera: peliculas.filter((p) => p.fechaEstreno <= hoyISO),
    proximamente: peliculas.filter((p) => p.fechaEstreno > hoyISO).sort((a, b) => a.fechaEstreno.localeCompare(b.fechaEstreno)),
  }
}

// Solo las funciones que todavía no empezaron se pueden comprar.
export function funcionesVigentes(funciones, ahora = new Date()) {
  return funciones.filter((f) => !funcionYaEmpezo(f, ahora))
}

// Formatos distintos en los que se da una película, en el orden 2D, 3D, 4DX.
export function formatosDePelicula(funciones, peliculaId) {
  const orden = ['DOS_D', 'TRES_D', 'CUATRO_DX']
  const formatos = new Set(funciones.filter((f) => f.peliculaId === peliculaId).map((f) => f.formatoFuncion))
  return orden.filter((f) => formatos.has(f))
}

// Una película pasa el filtro si tiene al menos una función que cumpla el formato (si se eligió alguno)
// y el día (si se eligió uno).
export function filtrarPeliculas(peliculas, funciones, { formatos = [], dia = null }) {
  return peliculas.filter((pelicula) =>
    funciones.some(
      (f) =>
        f.peliculaId === pelicula.id &&
        (formatos.length === 0 || formatos.includes(f.formatoFuncion)) &&
        (!dia || f.fechaFuncion === dia),
    ),
  )
}

// Destacadas del carrusel: las películas en cartelera estrenadas más recientemente que tengan funciones.
export function elegirDestacadas(enCartelera, funciones, cantidad = 5) {
  return [...enCartelera]
    .filter((p) => funciones.some((f) => f.peliculaId === p.id))
    .sort((a, b) => b.fechaEstreno.localeCompare(a.fechaEstreno))
    .slice(0, cantidad)
}

export const FRANJAS_HORARIAS = {
  TODAS: { texto: 'Cualquier horario', cumple: () => true },
  TARDE: { texto: 'Hasta las 18 h', cumple: (hora) => hora < '18:00:00' },
  NOCHE: { texto: 'Desde las 18 h', cumple: (hora) => hora >= '18:00:00' },
}

export function filtrarPorFranja(funciones, franja) {
  return funciones.filter((f) => FRANJAS_HORARIAS[franja].cumple(f.horaFuncion))
}
