// Autoverificación de la lógica sin dependencias extra. Se corre con: npm test
import { pasaLuhn, vencimientoValido, validarPago, validarRegistro, formatearNumeroTarjeta, formatearVencimiento } from './validaciones.js'
import { subtotalEntradas, subtotalCandy, puedeCancelarse } from './compra.js'
import { listarButacas, formatearDuracion, codigoReserva } from './formato.js'

let fallas = 0
function verificar(condicion, descripcion) {
  if (!condicion) {
    fallas++
    console.error(`FALLA: ${descripcion}`)
  }
}

const hoy = new Date(2026, 9, 29) // 29/10/2026

verificar(pasaLuhn('4509 9535 6623 3704'), 'Luhn acepta una tarjeta válida')
verificar(!pasaLuhn('4509 9535 6623 3705'), 'Luhn rechaza un dígito cambiado')
verificar(vencimientoValido('10/26', hoy), 'Vence a fin de mes: 10/26 todavía vale el 29/10/2026')
verificar(!vencimientoValido('09/26', hoy), '09/26 ya venció')
verificar(!vencimientoValido('13/30', hoy), 'El mes 13 no existe')
verificar(formatearNumeroTarjeta('4509953566233704') === '4509 9535 6623 3704', 'Formatea de a 4 dígitos')
verificar(formatearVencimiento('0829') === '08/29', 'Formatea el vencimiento')

const pagoValido = { medioPago: 'CREDITO', numeroTarjeta: '4509 9535 6623 3704', titular: 'Ana Gomez', vencimiento: '08/29', cvv: '123', mail: 'ana@mail.com' }
verificar(Object.keys(validarPago(pagoValido, hoy)).length === 0, 'Un pago completo no tiene errores')
verificar('cvv' in validarPago({ ...pagoValido, cvv: '12' }, hoy), 'CVV de 2 dígitos es inválido')
verificar(Object.keys(validarPago({ medioPago: 'BILLETERA', numeroTarjeta: '', titular: '', vencimiento: '', cvv: '', mail: 'a@b.com' }, hoy)).length === 0, 'La billetera solo pide mail')

const registro = { nombreApellido: 'Carla Ruiz', dni: '40111222', fechaNacimiento: '2001-05-05', mail: 'carla@mail.com', password: 'carla1234', confirmarPassword: 'carla1234' }
verificar(Object.keys(validarRegistro(registro, hoy)).length === 0, 'Registro válido')
verificar('password' in validarRegistro({ ...registro, password: 'abc', confirmarPassword: 'abc' }, hoy), 'Password de 3 caracteres es inválida (el back pide 4 a 100)')

verificar(subtotalEntradas(4500, 2) === 9000, 'Entradas: precio x cantidad, igual que el back')
verificar(subtotalCandy([{ precio: 1000, cantidad: 2 }, { precio: 500, cantidad: 1 }]) === 2500, 'Subtotal de candy')
verificar(puedeCancelarse({ estado: 'CONFIRMADA', fechaFuncion: '2026-10-30', horaFuncion: '18:00:00' }, hoy), 'Se puede cancelar antes de la función')
verificar(!puedeCancelarse({ estado: 'CANCELADA', fechaFuncion: '2026-10-30', horaFuncion: '18:00:00' }, hoy), 'No se cancela dos veces')
verificar(!puedeCancelarse({ estado: 'CONFIRMADA', fechaFuncion: '2026-10-28', horaFuncion: '18:00:00' }, hoy), 'No se cancela si la función ya empezó')

verificar(listarButacas([{ filaAsiento: 'A', numeroAsiento: 1 }, { filaAsiento: 'A', numeroAsiento: 2 }, { filaAsiento: 'B', numeroAsiento: 4 }]) === 'A1, A2 y B4', 'Lista de butacas')
verificar(formatearDuracion(169) === '2 h 49 min', 'Duración')
verificar(codigoReserva(12) === 'LC-000012', 'Código de reserva')

if (fallas > 0) {
  throw new Error(`${fallas} verificación(es) fallaron`)
}
console.log('Todas las verificaciones pasaron.')
