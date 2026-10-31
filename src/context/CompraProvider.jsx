import { useCallback, useEffect, useRef, useState } from 'react'
import { CompraContext } from './CompraContext.js'
import { leerJSON, guardarJSON } from '../utils/almacenamiento.js'
import { MAX_BUTACAS, DURACION_COMPRA_MS, EXTENSION_MS } from '../utils/compra.js'
import { liberarButacas } from '../services/api.js'

const CLAVE = 'cmp-compra'

const sinTiempo = {
  vencimiento: null, // timestamp (ms) en que se termina el tiempo para comprar; null si no hay butacas elegidas
  extensionUsada: false, // "Necesito más tiempo" se puede usar una sola vez por compra
  idReserva: null, // identifica la retención de butacas de esta compra (solo en el mock)
}

const compraVacia = {
  funcion: null, // FuncionDTO elegida
  butacas: [], // [{ id, filaAsiento, numeroAsiento }]
  candy: [], // [{ id, nombre, precio, cantidad }]  (simulado en el front)
  ultimaCompra: null, // { compra, candy, medioPago } para mostrar en la confirmación
  funcionVencida: null, // id de la función cuya compra se venció (para mostrar el aviso)
  ...sinTiempo,
}

const ordenarButacas = (butacas) =>
  [...butacas].sort((a, b) => a.filaAsiento.localeCompare(b.filaAsiento) || a.numeroAsiento - b.numeroAsiento)

const crearIdReserva = () => `R-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

// Guarda la compra en curso. Se persiste en sessionStorage para no perderla si se recarga la página:
// como se guarda el MOMENTO de vencimiento (y no los segundos que faltan), recargar no reinicia el tiempo.
// Las funciones que se usan dentro de un useEffect van con useCallback para que no cambien en cada render.
export function CompraProvider({ children }) {
  const [compra, setCompra] = useState(() => ({ ...compraVacia, ...leerJSON(CLAVE, compraVacia, 'session') }))
  // Mientras se procesa un pago, el vencimiento no lo corta (se controla antes de empezar a pagar).
  const [pagando, setPagando] = useState(false)

  useEffect(() => {
    guardarJSON(CLAVE, compra, 'session')
  }, [compra])

  // Cuando la compra deja de usar una reserva (se sacaron todas las butacas, se cambió de función,
  // venció el tiempo o se terminó la compra), se liberan sus butacas en el servidor simulado.
  const reservaAnterior = useRef(compra.idReserva)
  useEffect(() => {
    const anterior = reservaAnterior.current
    reservaAnterior.current = compra.idReserva
    if (anterior && anterior !== compra.idReserva) liberarButacas(anterior).catch(() => {})
  }, [compra.idReserva])

  // Se llama al cargar el mapa de butacas: si es otra función se empieza de cero;
  // si es la misma, se quitan de la selección las butacas que ahora figuran ocupadas.
  const sincronizarFuncion = useCallback((funcion, mapaButacas) => {
    setCompra((actual) => {
      if (actual.funcion?.id !== funcion.id) return { ...actual, funcion, butacas: [], ...sinTiempo }
      const libres = actual.butacas.filter((b) => !mapaButacas.find((m) => m.id === b.id)?.ocupada)
      return { ...actual, funcion, butacas: libres, ...(libres.length === 0 ? sinTiempo : {}) }
    })
  }, [])

  // Elige o libera una butaca. El tiempo empieza con la primera butaca y se cancela si se sacan todas.
  // Devuelve los datos de la reserva para que la pantalla los mande al servidor (o null si se llegó al máximo).
  function alternarButaca({ id, filaAsiento, numeroAsiento }) {
    const yaEstaba = compra.butacas.some((b) => b.id === id)
    if (!yaEstaba && compra.butacas.length >= MAX_BUTACAS) return null
    const butacas = yaEstaba
      ? compra.butacas.filter((b) => b.id !== id)
      : ordenarButacas([...compra.butacas, { id, filaAsiento, numeroAsiento }])
    const tiempo =
      butacas.length === 0
        ? sinTiempo
        : {
            vencimiento: compra.vencimiento ?? Date.now() + DURACION_COMPRA_MS,
            extensionUsada: compra.extensionUsada,
            idReserva: compra.idReserva ?? crearIdReserva(),
          }
    setCompra({ ...compra, butacas, ...tiempo })
    return { idReserva: tiempo.idReserva, vencimiento: tiempo.vencimiento, asientoIds: butacas.map((b) => b.id) }
  }

  // "Necesito más tiempo": suma 5 minutos, una sola vez por compra. Devuelve el vencimiento nuevo.
  function extenderTiempo() {
    if (compra.extensionUsada || !compra.vencimiento) return null
    const vencimiento = compra.vencimiento + EXTENSION_MS
    setCompra({ ...compra, vencimiento, extensionUsada: true })
    return vencimiento
  }

  // Se terminó el tiempo: se vacía la compra (butacas y candy) y se guarda la función para el aviso.
  // Al cambiar idReserva a null, el efecto de arriba libera las butacas.
  const expirarCompra = useCallback(() => {
    setCompra((actual) => ({ ...actual, butacas: [], candy: [], funcionVencida: actual.funcion?.id ?? null, ...sinTiempo }))
  }, [])

  const cerrarAvisoVencimiento = useCallback(() => setCompra((actual) => ({ ...actual, funcionVencida: null })), [])

  function agregarCandy({ id, nombre, precio }) {
    setCompra((actual) => {
      const item = actual.candy.find((c) => c.id === id)
      const candy = item
        ? actual.candy.map((c) => (c.id === id ? { ...c, cantidad: c.cantidad + 1 } : c))
        : [...actual.candy, { id, nombre, precio, cantidad: 1 }]
      return { ...actual, candy }
    })
  }

  function quitarUnCandy(id) {
    setCompra((actual) => ({
      ...actual,
      candy: actual.candy
        .map((c) => (c.id === id ? { ...c, cantidad: c.cantidad - 1 } : c))
        .filter((c) => c.cantidad > 0),
    }))
  }

  function eliminarCandy(id) {
    setCompra((actual) => ({ ...actual, candy: actual.candy.filter((c) => c.id !== id) }))
  }

  function vaciarCandy() {
    setCompra((actual) => ({ ...actual, candy: [] }))
  }

  // Al confirmarse la compra se guarda el resultado (con una copia del candy) para la pantalla de confirmación
  // y se detiene el tiempo.
  function finalizarCompra({ compra: compraConfirmada, medioPago }) {
    setCompra((actual) => ({
      ...actual,
      ultimaCompra: { compra: compraConfirmada, candy: actual.candy, medioPago },
      ...sinTiempo,
    }))
  }

  // La pantalla de confirmación limpia la selección cuando se muestra. No se limpia en finalizarCompra porque,
  // mientras se navega, la ruta de pago se quedaría sin butacas y su guard redirigiría a otro lado.
  const limpiarSeleccion = useCallback(() => {
    setCompra((actual) => ({ ...compraVacia, ultimaCompra: actual.ultimaCompra }))
  }, [])

  const reiniciarCompra = useCallback(() => setCompra(compraVacia), [])

  const valor = {
    ...compra,
    pagando,
    setPagando,
    sincronizarFuncion,
    alternarButaca,
    extenderTiempo,
    expirarCompra,
    cerrarAvisoVencimiento,
    agregarCandy,
    quitarUnCandy,
    eliminarCandy,
    vaciarCandy,
    finalizarCompra,
    limpiarSeleccion,
    reiniciarCompra,
  }

  return <CompraContext.Provider value={valor}>{children}</CompraContext.Provider>
}
