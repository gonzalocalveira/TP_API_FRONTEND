// Acceso a localStorage / sessionStorage envuelto en try/catch:
// en una ventana privada o con el almacenamiento bloqueado, el acceso puede tirar error.
// En ese caso la app sigue funcionando, solo que no recuerda nada al recargar.

function obtenerStorage(tipo) {
  try {
    return tipo === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}

export function leerJSON(clave, valorPorDefecto, tipo = 'local') {
  try {
    const texto = obtenerStorage(tipo)?.getItem(clave)
    return texto ? JSON.parse(texto) : valorPorDefecto
  } catch {
    return valorPorDefecto
  }
}

export function guardarJSON(clave, valor, tipo = 'local') {
  try {
    obtenerStorage(tipo)?.setItem(clave, JSON.stringify(valor))
  } catch {
    // Sin almacenamiento disponible: se ignora y los datos quedan solo en memoria.
  }
}

export function borrarClave(clave, tipo = 'local') {
  try {
    obtenerStorage(tipo)?.removeItem(clave)
  } catch {
    // Igual que arriba.
  }
}
