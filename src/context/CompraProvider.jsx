import { useCallback, useEffect, useState } from 'react'
import { CompraContext } from './CompraContext.js'
import { leerJSON, guardarJSON } from '../utils/almacenamiento.js'
import { MAX_BUTACAS } from '../utils/compra.js'

const CLAVE = 'cmp-compra'

const compraVacia = {
  funcion: null, // FuncionDTO elegida
  butacas: [], // [{ id, filaAsiento, numeroAsiento }]
  candy: [], // [{ id, nombre, precio, cantidad }]  (simulado en el front)
  ultimaCompra: null, // { compra, candy, medioPago } para mostrar en la confirmación
}

const ordenarButacas = (butacas) =>
  [...butacas].sort((a, b) => a.filaAsiento.localeCompare(b.filaAsiento) || a.numeroAsiento - b.numeroAsiento)

// Guarda la compra en curso. Se persiste en sessionStorage para no perderla si se recarga la página.
// Las funciones que se usan dentro de un useEffect van con useCallback para que no cambien en cada render.
export function CompraProvider({ children }) {
  const [compra, setCompra] = useState(() => leerJSON(CLAVE, compraVacia, 'session'))

  useEffect(() => {
    guardarJSON(CLAVE, compra, 'session')
  }, [compra])

  // Se llama al cargar el mapa de butacas: si es otra función se empieza de cero;
  // si es la misma, se quitan de la selección las butacas que ahora figuran ocupadas.
  const sincronizarFuncion = useCallback((funcion, mapaButacas) => {
    setCompra((actual) => {
      if (actual.funcion?.id !== funcion.id) return { ...actual, funcion, butacas: [] }
      const libres = actual.butacas.filter((b) => !mapaButacas.find((m) => m.id === b.id)?.ocupada)
      return { ...actual, funcion, butacas: libres }
    })
  }, [])

  function alternarButaca({ id, filaAsiento, numeroAsiento }) {
    setCompra((actual) => {
      const yaEstaba = actual.butacas.some((b) => b.id === id)
      if (yaEstaba) return { ...actual, butacas: actual.butacas.filter((b) => b.id !== id) }
      if (actual.butacas.length >= MAX_BUTACAS) return actual
      return { ...actual, butacas: ordenarButacas([...actual.butacas, { id, filaAsiento, numeroAsiento }]) }
    })
  }

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

  // Al confirmarse la compra se guarda el resultado (con una copia del candy) para la pantalla de confirmación.
  function finalizarCompra({ compra: compraConfirmada, medioPago }) {
    setCompra((actual) => ({ ...actual, ultimaCompra: { compra: compraConfirmada, candy: actual.candy, medioPago } }))
  }

  // La pantalla de confirmación limpia la selección cuando se muestra. No se limpia en finalizarCompra porque,
  // mientras se navega, la ruta de pago se quedaría sin butacas y su guard redirigiría a otro lado.
  const limpiarSeleccion = useCallback(() => {
    setCompra((actual) => ({ ...compraVacia, ultimaCompra: actual.ultimaCompra }))
  }, [])

  const reiniciarCompra = useCallback(() => setCompra(compraVacia), [])

  const valor = {
    ...compra,
    sincronizarFuncion,
    alternarButaca,
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
