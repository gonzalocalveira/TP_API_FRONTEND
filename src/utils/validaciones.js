// Validaciones de formularios del lado del cliente.
// Cada función validarX devuelve un objeto { campo: 'mensaje de error' } con solo los campos inválidos.
// Las reglas de usuario copian las del back-end (ver ENDPOINTS.md, sección Usuarios).

export const soloDigitos = (texto) => texto.replace(/\D/g, '')

export function esMailValido(mail) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.trim())
}

export function validarLogin({ mail, password }) {
  const errores = {}
  if (!mail.trim()) errores.mail = 'Ingresá tu mail.'
  else if (!esMailValido(mail)) errores.mail = 'El mail no tiene un formato válido. Ejemplo: nombre@mail.com'
  if (!password) errores.password = 'Ingresá tu contraseña.'
  return errores
}

export function validarRegistro(datos, hoy = new Date()) {
  const errores = {}
  const nombre = datos.nombreApellido.trim()
  if (!nombre) errores.nombreApellido = 'Ingresá tu nombre y apellido.'
  else if (!nombre.includes(' ')) errores.nombreApellido = 'Escribí tu nombre y tu apellido, separados por un espacio.'
  else if (nombre.length > 100) errores.nombreApellido = 'El nombre puede tener hasta 100 caracteres.'

  // El back-end solo pide dni > 0; en el front además se exige el largo de un DNI argentino.
  if (!datos.dni) errores.dni = 'Ingresá tu DNI.'
  else if (!/^\d{7,8}$/.test(datos.dni)) errores.dni = 'El DNI tiene que tener 7 u 8 números, sin puntos.'

  if (!datos.fechaNacimiento) errores.fechaNacimiento = 'Ingresá tu fecha de nacimiento.'
  else if (new Date(`${datos.fechaNacimiento}T00:00:00`) >= hoy) {
    errores.fechaNacimiento = 'La fecha de nacimiento tiene que ser anterior a hoy.'
  }

  if (!datos.mail.trim()) errores.mail = 'Ingresá tu mail.'
  else if (!esMailValido(datos.mail)) errores.mail = 'El mail no tiene un formato válido. Ejemplo: nombre@mail.com'

  if (!datos.password) errores.password = 'Elegí una contraseña.'
  else if (datos.password.length < 4 || datos.password.length > 100) {
    errores.password = 'La contraseña tiene que tener entre 4 y 100 caracteres.'
  }

  if (!datos.confirmarPassword) errores.confirmarPassword = 'Repetí la contraseña.'
  else if (datos.confirmarPassword !== datos.password) errores.confirmarPassword = 'Las contraseñas no coinciden.'
  return errores
}

// Algoritmo de Luhn: detecta errores de tipeo en el número de tarjeta.
export function pasaLuhn(numero) {
  const digitos = soloDigitos(numero)
  let suma = 0
  let duplicar = false
  for (let i = digitos.length - 1; i >= 0; i--) {
    let digito = Number(digitos[i])
    if (duplicar) {
      digito *= 2
      if (digito > 9) digito -= 9
    }
    suma += digito
    duplicar = !duplicar
  }
  return digitos.length > 0 && suma % 10 === 0
}

// "MM/AA" vigente: la tarjeta vale hasta el último día del mes de vencimiento.
export function vencimientoValido(vencimiento, hoy = new Date()) {
  const coincidencia = /^(\d{2})\/(\d{2})$/.exec(vencimiento)
  if (!coincidencia) return false
  const mes = Number(coincidencia[1])
  const anio = 2000 + Number(coincidencia[2])
  if (mes < 1 || mes > 12) return false
  const primerDiaDelMesSiguiente = new Date(anio, mes, 1)
  return primerDiaDelMesSiguiente > hoy
}

export const MEDIOS_DE_PAGO = {
  CREDITO: 'Tarjeta de crédito',
  DEBITO: 'Tarjeta de débito',
  BILLETERA: 'Billetera virtual',
}

export function validarPago(datos, hoy = new Date()) {
  const errores = {}
  if (datos.medioPago !== 'BILLETERA') {
    const numero = soloDigitos(datos.numeroTarjeta)
    if (!numero) errores.numeroTarjeta = 'Ingresá el número de la tarjeta.'
    else if (numero.length < 13 || numero.length > 19) errores.numeroTarjeta = 'El número de tarjeta tiene entre 13 y 19 dígitos.'
    else if (!pasaLuhn(numero)) errores.numeroTarjeta = 'El número de tarjeta no es válido. Revisá que esté bien escrito.'

    if (!datos.titular.trim()) errores.titular = 'Ingresá el nombre tal como figura en la tarjeta.'

    if (!datos.vencimiento) errores.vencimiento = 'Ingresá el vencimiento.'
    else if (!/^\d{2}\/\d{2}$/.test(datos.vencimiento)) errores.vencimiento = 'Usá el formato MM/AA. Ejemplo: 08/29'
    else if (!vencimientoValido(datos.vencimiento, hoy)) errores.vencimiento = 'La tarjeta está vencida o el mes no existe.'

    if (!datos.cvv) errores.cvv = 'Ingresá el código de seguridad.'
    else if (!/^\d{3,4}$/.test(datos.cvv)) errores.cvv = 'El código de seguridad tiene 3 o 4 números.'
  }
  if (!datos.mail.trim()) errores.mail = 'Ingresá un mail para recibir la entrada.'
  else if (!esMailValido(datos.mail)) errores.mail = 'El mail no tiene un formato válido. Ejemplo: nombre@mail.com'
  return errores
}

// Formateo mientras se escribe ------------------------------------------------

// "4509953566233704" -> "4509 9535 6623 3704"
export function formatearNumeroTarjeta(valor) {
  return soloDigitos(valor).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ')
}

// "0829" -> "08/29"
export function formatearVencimiento(valor) {
  const digitos = soloDigitos(valor).slice(0, 4)
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos
}
