// Funciones de formateo para mostrar datos del back-end en la interfaz.

const formateadorPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

export function formatearPrecio(monto) {
  return formateadorPrecio.format(monto)
}

// El back-end usa el enum FormatoFuncion; en pantalla se muestran etiquetas legibles.
export const ETIQUETAS_FORMATO = {
  DOS_D: '2D',
  TRES_D: '3D',
  CUATRO_DX: '4DX',
}

export const FORMATOS = Object.keys(ETIQUETAS_FORMATO)

export function etiquetaFormato(formato) {
  return ETIQUETAS_FORMATO[formato] ?? formato
}

// Fechas -----------------------------------------------------------------------
// El back-end trabaja con fechas 'yyyy-MM-dd' y horas 'HH:mm:ss'.
// Se arman con la fecha local (no con toISOString) para que no se corra un día por la zona horaria.

const dosDigitos = (n) => String(n).padStart(2, '0')

export function aFechaISO(fecha) {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`
}

export function aFechaHoraISO(fecha) {
  const hora = `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}:${dosDigitos(fecha.getSeconds())}`
  return `${aFechaISO(fecha)}T${hora}`
}

export function desdeFechaISO(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

export function sumarDias(fecha, dias) {
  const copia = new Date(fecha)
  copia.setDate(copia.getDate() + dias)
  return copia
}

// Devuelve las fechas ISO de hoy y los días siguientes.
export function proximosDias(cantidad = 7, desde = new Date()) {
  return Array.from({ length: cantidad }, (_, i) => aFechaISO(sumarDias(desde, i)))
}

const formateadorFechaLarga = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
const formateadorDiaCorto = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const formateadorMesCorto = new Intl.DateTimeFormat('es-AR', { month: 'short' })
const formateadorFechaNumerica = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// "jueves 30 de octubre"
export function formatearFechaLarga(fechaISO) {
  return formateadorFechaLarga.format(desdeFechaISO(fechaISO))
}

// "30/10/2026"
export function formatearFechaNumerica(fechaISO) {
  return formateadorFechaNumerica.format(desdeFechaISO(fechaISO.slice(0, 10)))
}

// Datos para los botones de día: { nombre: 'Hoy' | 'Mañana' | 'vie', numero: 31, mes: 'oct' }
export function describirDia(fechaISO, hoy = new Date()) {
  const fecha = desdeFechaISO(fechaISO)
  let nombre = formateadorDiaCorto.format(fecha).replace('.', '')
  if (fechaISO === aFechaISO(hoy)) nombre = 'Hoy'
  else if (fechaISO === aFechaISO(sumarDias(hoy, 1))) nombre = 'Mañana'
  return { nombre, numero: fecha.getDate(), mes: formateadorMesCorto.format(fecha).replace('.', '') }
}

// "Hoy, jueves 29 de octubre" / "sábado 31 de octubre"
export function etiquetaDiaCompleta(fechaISO, hoy = new Date()) {
  const { nombre } = describirDia(fechaISO, hoy)
  const larga = formatearFechaLarga(fechaISO)
  return nombre === 'Hoy' || nombre === 'Mañana' ? `${nombre}, ${larga}` : larga
}

// "viernes" -> "Viernes"
export function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// "18:00:00" -> "18:00"
export function formatearHora(hora) {
  return hora.slice(0, 5)
}

// "2026-10-27T19:41:44.66" -> "27/10/2026 19:41"
export function formatearFechaHora(fechaHoraISO) {
  const [fecha, hora] = fechaHoraISO.split('T')
  return `${formatearFechaNumerica(fecha)} ${formatearHora(hora)}`
}

// 169 -> "2 h 49 min"
export function formatearDuracion(minutos) {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas === 0) return `${resto} min`
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`
}

// Código de reserva legible a partir del id de la compra: 12 -> "LC-000012"
export function codigoReserva(compraId) {
  return `LC-${String(compraId).padStart(6, '0')}`
}

// Une una lista de butacas en texto: "A1, A2 y B4"
export function listarButacas(butacas) {
  const nombres = butacas.map((b) => `${b.filaAsiento}${b.numeroAsiento}`)
  if (nombres.length <= 1) return nombres.join('')
  return `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`
}
