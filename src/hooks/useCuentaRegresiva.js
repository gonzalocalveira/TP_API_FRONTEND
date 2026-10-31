import { useEffect, useState } from 'react'

// Cuenta regresiva hasta un momento (timestamp en ms). Devuelve los segundos que faltan y si ya venció.
// Se calcula siempre como "vencimiento - ahora", así no se acumula error y recargar la página no la reinicia.
// El intervalo de 1 segundo solo actualiza "ahora"; se crea cuando hay vencimiento y se limpia en el return
// del efecto (al desmontar o cuando cambia el vencimiento), si no quedarían intervalos corriendo.
export function useCuentaRegresiva(vencimiento) {
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    if (!vencimiento) return
    const actualizar = () => setAhora(Date.now())
    const primeraActualizacion = setTimeout(actualizar, 0) // por si "ahora" quedó viejo desde el último render
    const intervalo = setInterval(actualizar, 1000)
    return () => {
      clearTimeout(primeraActualizacion)
      clearInterval(intervalo)
    }
  }, [vencimiento])

  if (!vencimiento) return { segundosRestantes: null, vencido: false }
  const segundosRestantes = Math.max(0, Math.ceil((vencimiento - ahora) / 1000))
  return { segundosRestantes, vencido: segundosRestantes === 0 }
}
