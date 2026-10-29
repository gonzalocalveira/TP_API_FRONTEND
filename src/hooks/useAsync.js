import { useEffect, useState } from 'react'

// Ejecuta una función asincrónica (un pedido a la API) y expone sus estados de carga, error y datos.
// La función tiene que venir envuelta en useCallback: el pedido se repite cada vez que cambia.
//
// "cargando" no se guarda aparte: se deriva comparando el último resultado con el pedido actual.
// Si el resultado guardado corresponde a otra función o a otro intento, todavía estamos cargando.
export function useAsync(funcion) {
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState({ funcion: null, intento: -1, datos: null, error: null })

  useEffect(() => {
    let vigente = true // evita guardar la respuesta de un pedido viejo si el componente cambió o se desmontó
    funcion()
      .then((datos) => vigente && setResultado({ funcion, intento, datos, error: null }))
      .catch((error) => vigente && setResultado({ funcion, intento, datos: null, error }))
    return () => {
      vigente = false
    }
  }, [funcion, intento])

  const cargando = resultado.funcion !== funcion || resultado.intento !== intento

  return {
    datos: cargando ? null : resultado.datos,
    error: cargando ? null : resultado.error,
    cargando,
    reintentar: () => setIntento((i) => i + 1),
    // Permite actualizar los datos en pantalla sin volver a pedirlos (por ejemplo, después de cancelar una compra).
    actualizarDatos: (cambiar) => setResultado((r) => ({ ...r, datos: cambiar(r.datos) })),
  }
}
