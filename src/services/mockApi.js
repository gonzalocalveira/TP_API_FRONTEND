// Implementación SIMULADA de la API.
// Tiene las mismas funciones que httpApi.js y devuelve exactamente la misma forma de JSON que el back-end
// (ver ../TP--API-UADE/docs/ENDPOINTS.md). Para simular la red:
//   - cada función devuelve una Promesa que se resuelve después de una demora de 300 a 800 ms;
//   - los errores se tiran como ApiError, con el mismo formato y código HTTP que usaría el back-end.
// Las reglas de negocio (total = precio x cantidad, cuándo se puede cancelar, etc.) copian las del back.
import { peliculas } from '../mocks/peliculas.js'
import { salas, asientos } from '../mocks/salas.js'
import { funciones as funcionesBase, estabaOcupada } from '../mocks/funciones.js'
import { usuarios as usuariosBase, membresias } from '../mocks/usuarios.js'
import { categoriasCandy, productosCandy } from '../mocks/candy.js'
import { promociones } from '../mocks/promociones.js'
import { ApiError } from './ApiError.js'
import { leerDb, guardarDb, resetearDb } from './mockDb.js'
import { leerModoError, MODOS_ERROR, desactivarModoError } from './simulacion.js'
import { aFechaHoraISO } from '../utils/formato.js'
import { ordenarPorFechaYHora } from '../utils/compra.js'

// Utilidades internas -------------------------------------------------------------

function demora(minimo = 300, maximo = 800) {
  const ms = minimo + Math.random() * (maximo - minimo)
  return new Promise((resolver) => setTimeout(resolver, ms))
}

// Simula un GET: espera, y si está activo el modo ?error=1 responde 500.
async function responderLectura(path, obtenerDatos) {
  await demora()
  if (leerModoError() === MODOS_ERROR.LECTURA) {
    throw new ApiError({ status: 500, message: 'Error simulado para la demo: el servidor no respondió.', path })
  }
  return obtenerDatos()
}

const sinPassword = ({ password, ...usuario }) => usuario

function todosLosUsuarios() {
  return [...usuariosBase, ...leerDb().usuariosRegistrados]
}

function buscarUsuario(usuarioId, path) {
  const usuario = todosLosUsuarios().find((u) => u.id === Number(usuarioId))
  if (!usuario) throw new ApiError({ status: 404, message: `No existe el usuario con id ${usuarioId}`, path })
  return usuario
}

function verificarCliente(usuario, path) {
  if (usuario.rol !== 'CLIENTE') {
    throw new ApiError({ status: 409, message: 'El usuario no es CLIENTE', path })
  }
}

// Agrega los campos que el back-end suma a cada función (peliculaNombre, duracion, salaNombre).
function aFuncionDTO(funcion) {
  const pelicula = peliculas.find((p) => p.id === funcion.peliculaId)
  const sala = salas.find((s) => s.id === funcion.salaId)
  return {
    id: funcion.id,
    fechaFuncion: funcion.fechaFuncion,
    horaFuncion: funcion.horaFuncion,
    formatoFuncion: funcion.formatoFuncion,
    precio: funcion.precio,
    peliculaId: funcion.peliculaId,
    peliculaNombre: pelicula.nombre,
    duracion: pelicula.duracion,
    salaId: funcion.salaId,
    salaNombre: sala.nombre,
  }
}

function buscarFuncion(funcionId, path) {
  const funcion = funcionesBase.find((f) => f.id === Number(funcionId))
  if (!funcion) throw new ApiError({ status: 404, message: `No existe la función con id ${funcionId}`, path })
  return funcion
}

// Retenciones que todavía no vencieron. Las vencidas se ignoran solas, aunque nadie las haya liberado.
function retencionesVigentes(db, ahora = Date.now()) {
  return db.retenciones.filter((r) => r.vencimiento > ahora)
}

// Butacas ocupadas de una función: la ocupación inicial simulada + las compras confirmadas + las de "otros"
// + las retenidas por OTRAS compras en curso (las de la propia reserva no cuentan como ocupadas).
function idsOcupados(funcionId, db, idReservaPropia = null) {
  const ocupados = new Set(
    asientos.filter((a) => estabaOcupada(funcionId, a.id)).map((a) => a.id),
  )
  for (const compra of db.compras) {
    if (compra.funcionId === funcionId && compra.estado === 'CONFIRMADA') {
      compra.entradas.forEach((e) => ocupados.add(e.asientoId))
    }
  }
  db.ocupadasPorOtros.filter((o) => o.funcionId === funcionId).forEach((o) => ocupados.add(o.asientoId))
  retencionesVigentes(db)
    .filter((r) => r.funcionId === funcionId && r.idReserva !== idReservaPropia)
    .forEach((r) => r.asientoIds.forEach((id) => ocupados.add(id)))
  return ocupados
}

function empezo(funcion) {
  return new Date(`${funcion.fechaFuncion}T${funcion.horaFuncion}`) <= new Date()
}

// Películas -------------------------------------------------------------------------

// GET /api/clientes/cartelera
export function getPeliculas() {
  return responderLectura('/api/clientes/cartelera', () => structuredClone(peliculas))
}

// GET /api/peliculas/{id}
export function getPelicula(id) {
  const path = `/api/peliculas/${id}`
  return responderLectura(path, () => {
    const pelicula = peliculas.find((p) => p.id === Number(id))
    if (!pelicula) throw new ApiError({ status: 404, message: `No existe la película con id ${id}`, path })
    return structuredClone(pelicula)
  })
}

// Funciones -------------------------------------------------------------------------

// GET /api/funciones?peliculaId=&fecha=  (ordenadas por fecha y hora, como el back)
export function getFunciones({ peliculaId, fecha } = {}) {
  return responderLectura('/api/funciones', () => {
    const filtradas = funcionesBase.filter(
      (f) => (!peliculaId || f.peliculaId === Number(peliculaId)) && (!fecha || f.fechaFuncion === fecha),
    )
    return ordenarPorFechaYHora(filtradas).map(aFuncionDTO)
  })
}

// GET /api/funciones/{id}
export function getFuncion(id) {
  const path = `/api/funciones/${id}`
  return responderLectura(path, () => aFuncionDTO(buscarFuncion(id, path)))
}

// GET /api/funciones/{id}/butacas  -> [{ id, filaAsiento, numeroAsiento, ocupada }]
// idReserva es solo del mock: sirve para que las butacas que retiene tu propia compra no se vean ocupadas.
export function getButacas(funcionId, { idReserva = null } = {}) {
  const path = `/api/funciones/${funcionId}/butacas`
  return responderLectura(path, () => {
    const funcion = buscarFuncion(funcionId, path)
    const ocupados = idsOcupados(funcion.id, leerDb(), idReserva)
    return asientos
      .filter((a) => a.salaId === funcion.salaId)
      .map((a) => ({ id: a.id, filaAsiento: a.filaAsiento, numeroAsiento: a.numeroAsiento, ocupada: ocupados.has(a.id) }))
  })
}

// Compras ---------------------------------------------------------------------------

// POST /api/clientes/compras  body: { usuarioId, funcionId, asientoIds }
// idReserva es solo del mock: la retención de esa compra no bloquea sus propias butacas y se libera al comprar.
export async function comprar({ usuarioId, funcionId, asientoIds, idReserva = null }) {
  const path = '/api/clientes/compras'
  await demora()

  const detalles = []
  if (!usuarioId) detalles.push('usuarioId: El usuario es obligatorio')
  if (!funcionId) detalles.push('funcionId: La funcion es obligatoria')
  if (!asientoIds?.length) detalles.push('asientoIds: Hay que elegir al menos una butaca')
  if (detalles.length) throw new ApiError({ status: 400, message: 'Datos de entrada invalidos', path, detalles })

  const usuario = buscarUsuario(usuarioId, path)
  const funcion = buscarFuncion(funcionId, path)
  verificarCliente(usuario, path)
  if (empezo(funcion)) throw new ApiError({ status: 409, message: 'La función ya empezó', path })
  if (new Set(asientoIds).size !== asientoIds.length) {
    throw new ApiError({ status: 409, message: 'La misma butaca se pidió dos veces', path })
  }

  const db = leerDb()

  // Modo ?error=409: justo antes de comprar, "otra persona" se queda con la primera butaca elegida.
  // Pasa una sola vez y después el modo se apaga, así el reintento funciona.
  if (leerModoError() === MODOS_ERROR.CONFLICTO) {
    db.ocupadasPorOtros.push({ funcionId: funcion.id, asientoId: asientoIds[0] })
    guardarDb(db)
    desactivarModoError()
  }

  const ocupados = idsOcupados(funcion.id, db, idReserva)
  const butacas = asientoIds.map((asientoId) => {
    const asiento = asientos.find((a) => a.id === asientoId)
    if (!asiento) throw new ApiError({ status: 404, message: `No existe la butaca con id ${asientoId}`, path })
    if (asiento.salaId !== funcion.salaId) {
      throw new ApiError({ status: 409, message: `La butaca ${asiento.filaAsiento}${asiento.numeroAsiento} no pertenece a la sala de la función`, path })
    }
    if (ocupados.has(asientoId)) {
      // Mismo mensaje que el back-end
      throw new ApiError({ status: 409, message: `La butaca ${asiento.filaAsiento}${asiento.numeroAsiento} ya esta ocupada para esta funcion`, path })
    }
    return asiento
  })

  const compra = {
    id: db.proximoIdCompra++,
    fechaCompra: aFechaHoraISO(new Date()),
    estado: 'CONFIRMADA',
    total: funcion.precio * butacas.length, // como el back: precio x cantidad
    usuarioId: usuario.id,
    funcionId: funcion.id,
    peliculaNombre: aFuncionDTO(funcion).peliculaNombre,
    salaNombre: aFuncionDTO(funcion).salaNombre,
    fechaFuncion: funcion.fechaFuncion,
    horaFuncion: funcion.horaFuncion,
    entradas: butacas.map((asiento) => ({
      id: db.proximoIdEntrada++,
      asientoId: asiento.id,
      filaAsiento: asiento.filaAsiento,
      numeroAsiento: asiento.numeroAsiento,
      precioUnitario: funcion.precio,
      estado: 'OCUPADA',
    })),
  }
  db.compras.push(compra)
  db.retenciones = db.retenciones.filter((r) => r.idReserva !== idReserva)
  guardarDb(db)
  return structuredClone(compra)
}

// PATCH /api/clientes/compras/{id}/cancelar
export async function cancelarCompra(compraId) {
  const path = `/api/clientes/compras/${compraId}/cancelar`
  await demora()
  const db = leerDb()
  const compra = db.compras.find((c) => c.id === Number(compraId))
  if (!compra) throw new ApiError({ status: 404, message: `No existe la compra con id ${compraId}`, path })
  if (compra.estado === 'CANCELADA') throw new ApiError({ status: 409, message: 'La compra ya estaba cancelada', path })
  if (empezo(compra)) throw new ApiError({ status: 409, message: 'No se puede cancelar: la función ya empezó', path })

  compra.estado = 'CANCELADA'
  compra.entradas.forEach((e) => (e.estado = 'CANCELADA'))
  guardarDb(db) // al quedar CANCELADA, sus butacas dejan de contar como ocupadas
  return structuredClone(compra)
}

// GET /api/clientes/{usuarioId}/historial  (de la más nueva a la más vieja)
export function getHistorial(usuarioId) {
  const path = `/api/clientes/${usuarioId}/historial`
  return responderLectura(path, () => {
    verificarCliente(buscarUsuario(usuarioId, path), path)
    return leerDb()
      .compras.filter((c) => c.usuarioId === Number(usuarioId))
      .sort((a, b) => b.fechaCompra.localeCompare(a.fechaCompra) || b.id - a.id)
  })
}

// GET /api/clientes/{usuarioId}/membresia  (404 si no es socio)
export function getMembresia(usuarioId) {
  const path = `/api/clientes/${usuarioId}/membresia`
  return responderLectura(path, () => {
    verificarCliente(buscarUsuario(usuarioId, path), path)
    const membresia = membresias.find((m) => m.usuarioId === Number(usuarioId))
    if (!membresia) throw new ApiError({ status: 404, message: 'El usuario no tiene membresía', path })
    return structuredClone(membresia)
  })
}

// Usuarios --------------------------------------------------------------------------

// POST /api/usuarios/login
export async function login({ mail, password }) {
  const path = '/api/usuarios/login'
  await demora()
  if (!mail || !password) {
    throw new ApiError({ status: 400, message: 'Datos de entrada invalidos', path, detalles: ['mail y password son obligatorios'] })
  }
  const usuario = todosLosUsuarios().find((u) => u.mail === mail.trim().toLowerCase() && u.password === password)
  if (!usuario) throw new ApiError({ status: 401, message: 'Mail o contraseña incorrectos', path })
  return sinPassword(usuario)
}

// POST /api/usuarios  -> registra un CLIENTE no socio
export async function registrar({ nombreApellido, dni, fechaNacimiento, mail, password }) {
  const path = '/api/usuarios'
  await demora()
  const detalles = []
  if (!nombreApellido?.trim()) detalles.push('nombreApellido: El nombre es obligatorio')
  if (!(Number(dni) > 0)) detalles.push('dni: El DNI debe ser mayor a 0')
  if (!fechaNacimiento) detalles.push('fechaNacimiento: La fecha de nacimiento es obligatoria')
  if (!mail?.includes('@')) detalles.push('mail: El mail no tiene un formato valido')
  if (!password || password.length < 4 || password.length > 100) detalles.push('password: La password debe tener entre 4 y 100 caracteres')
  if (detalles.length) throw new ApiError({ status: 400, message: 'Datos de entrada invalidos', path, detalles })

  const mailNormalizado = mail.trim().toLowerCase()
  const existentes = todosLosUsuarios()
  if (existentes.some((u) => u.mail === mailNormalizado)) {
    throw new ApiError({ status: 409, message: `Ya existe un usuario con el mail ${mailNormalizado}`, path })
  }
  if (existentes.some((u) => u.dni === Number(dni))) {
    throw new ApiError({ status: 409, message: `Ya existe un usuario con el DNI ${dni}`, path })
  }

  const db = leerDb()
  // Solo en la simulación se guarda la password (para poder hacer login después).
  const usuario = {
    id: db.proximoIdUsuario++,
    nombreApellido: nombreApellido.trim(),
    dni: Number(dni),
    fechaNacimiento,
    mail: mailNormalizado,
    password,
    isSocio: false,
    rol: 'CLIENTE',
  }
  db.usuariosRegistrados.push(usuario)
  guardarDb(db)
  return sinPassword(usuario)
}

// Solo front (SIN ENDPOINT EN EL BACK) -------------------------------------------------

// Candy: el back-end no tiene productos de candy.
export function getProductosCandy() {
  return responderLectura('(simulado) candy', () => ({
    categorias: structuredClone(categoriasCandy),
    productos: structuredClone(productosCandy),
  }))
}

// Promociones: solo informativas.
export function getPromociones() {
  return responderLectura('(simulado) promociones', () => structuredClone(promociones))
}

// Pago: el back-end no procesa pagos. Esta función NUNCA recibe ni guarda datos de tarjeta:
// solo el medio de pago, el monto y los últimos 4 dígitos (para simular un rechazo).
// La tarjeta terminada en 0002 se rechaza siempre, para poder mostrar el error en la demo.
export async function procesarPago({ medioPago, monto, ultimos4 }) {
  await demora()
  if (ultimos4 === '0002') {
    throw new ApiError({ status: 402, error: 'Payment Required', message: 'El pago fue rechazado por el emisor de la tarjeta. Probá con otra tarjeta u otro medio de pago.', path: '(simulado) pago' })
  }
  return { aprobado: true, medioPago, monto, codigoAutorizacion: `AUT-${Date.now().toString().slice(-6)}` }
}

// Retención temporal de butacas (SOLO EN EL MOCK, el back-end no la tiene) ----------------
// Mientras corre el tiempo de la compra, las butacas elegidas quedan reservadas para esa compra:
// en otra pestaña se ven ocupadas. Se liberan al vencer, al sacarlas o al comprar.

export async function retenerButacas({ idReserva, funcionId, asientoIds, vencimiento }) {
  const path = '(simulado) retener butacas'
  await demora(100, 150) // demora corta: así los pedidos de clicks seguidos llegan en orden
  const db = leerDb()
  const ocupados = idsOcupados(Number(funcionId), db, idReserva)
  const tomada = asientoIds.find((id) => ocupados.has(id))
  if (tomada) {
    const asiento = asientos.find((a) => a.id === tomada)
    throw new ApiError({
      status: 409,
      message: `La butaca ${asiento.filaAsiento}${asiento.numeroAsiento} ya está ocupada o reservada por otra persona`,
      path,
    })
  }
  db.retenciones = retencionesVigentes(db).filter((r) => r.idReserva !== idReserva)
  db.retenciones.push({ idReserva, funcionId: Number(funcionId), asientoIds, vencimiento })
  guardarDb(db)
  return { idReserva, funcionId: Number(funcionId), asientoIds, vencimiento }
}

export async function liberarButacas(idReserva) {
  await demora(100, 150)
  const db = leerDb()
  db.retenciones = db.retenciones.filter((r) => r.idReserva !== idReserva)
  guardarDb(db)
  return null
}

// Pago con billetera virtual por QR (SIMULADO EN EL FRONT, SIN ENDPOINT EN EL BACK) ----------
// Los pagos viven en memoria (como si los guardara la billetera). Un pago arranca PENDIENTE y queda así
// hasta que se usa un control de demo (simularResultadoPago) o vence el tiempo de la compra.
const pagosBilletera = new Map()
let proximoIdPago = 1

export async function crearPagoBilletera({ monto }) {
  await demora()
  if (!(monto > 0)) throw new ApiError({ status: 400, message: 'El monto del pago tiene que ser mayor a 0', path: '(simulado) pagos' })
  const id = proximoIdPago++
  const pago = {
    id,
    codigoOperacion: `CMP-OP-${String(Date.now()).slice(-5)}${id}`,
    monto,
    estado: 'PENDIENTE',
    creadoEn: aFechaHoraISO(new Date()),
  }
  pagosBilletera.set(id, pago)
  return { ...pago }
}

// Lo que el front consultaría al back cada pocos segundos (polling).
export async function consultarEstadoPago(id) {
  await demora(150, 300)
  const pago = pagosBilletera.get(Number(id))
  if (!pago) throw new ApiError({ status: 404, message: 'No encontramos ese pago. Generá un código QR nuevo.', path: `(simulado) pagos/${id}` })
  return { id: pago.id, estado: pago.estado }
}

// SOLO PARA LA DEMO: simula que la persona aprobó o rechazó el pago desde su billetera.
export async function simularResultadoPago(id, estado) {
  await demora(100, 200)
  const pago = pagosBilletera.get(Number(id))
  if (pago) pago.estado = estado
  return pago ? { ...pago } : null
}

// Borra las compras y los usuarios registrados durante la demo.
export function resetearDatosPrueba() {
  resetearDb()
}
