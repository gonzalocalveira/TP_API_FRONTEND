// "Base de datos" simulada: lo que cambia durante la demo (compras y usuarios registrados).
// Se guarda en localStorage para que sobreviva a recargar la página.
// Se lee en cada operación (no se cachea en memoria) para que dos pestañas vean los mismos datos:
// así se puede probar que "otra persona" compró una butaca desde otra pestaña.
import { leerJSON, guardarJSON, borrarClave } from '../utils/almacenamiento.js'

const CLAVE = 'cmp-db-v1'

const estadoInicial = {
  compras: [],
  usuariosRegistrados: [],
  // Butacas que "compró otra persona" (las agrega el modo ?error=409): [{ funcionId, asientoId }]
  ocupadasPorOtros: [],
  proximoIdCompra: 1,
  proximoIdEntrada: 1,
  proximoIdUsuario: 4, // 1 a 3 son los usuarios de 02_datos.sql
}

// Copia en memoria por si localStorage no está disponible.
let respaldoEnMemoria = structuredClone(estadoInicial)

export function leerDb() {
  return leerJSON(CLAVE, null) ?? structuredClone(respaldoEnMemoria)
}

export function guardarDb(estado) {
  respaldoEnMemoria = estado
  guardarJSON(CLAVE, estado)
}

export function resetearDb() {
  respaldoEnMemoria = structuredClone(estadoInicial)
  borrarClave(CLAVE)
}
