import { useEffect, useState } from 'react'

const prefiereMenosMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

// Lógica del carrusel: slide actual, navegación y avance automático.
// El avance automático:
//  - arranca apagado si el usuario pidió menos movimiento (prefers-reduced-motion);
//  - se detiene mientras el mouse está encima o el foco está adentro (pausaTemporal);
//  - se puede pausar y reanudar con un botón (reproduciendo).
export function useCarrusel(cantidad, intervaloMs = 7000) {
  const [actual, setActual] = useState(0)
  const [reproduciendo, setReproduciendo] = useState(() => !prefiereMenosMovimiento())
  const [pausaTemporal, setPausaTemporal] = useState(false)
  const avanzando = reproduciendo && !pausaTemporal && cantidad > 1

  useEffect(() => {
    if (!avanzando) return
    const id = setInterval(() => setActual((a) => (a + 1) % cantidad), intervaloMs)
    // Limpieza: al pausar o al desmontar se corta el intervalo, si no seguiría corriendo.
    return () => clearInterval(id)
  }, [avanzando, cantidad, intervaloMs])

  return {
    actual,
    avanzando,
    reproduciendo,
    irA: (indice) => setActual((indice + cantidad) % cantidad),
    siguiente: () => setActual((a) => (a + 1) % cantidad),
    anterior: () => setActual((a) => (a - 1 + cantidad) % cantidad),
    alternarReproduccion: () => setReproduciendo((r) => !r),
    setPausaTemporal,
  }
}
