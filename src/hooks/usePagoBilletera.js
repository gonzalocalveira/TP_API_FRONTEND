import { useEffect, useEffectEvent, useState } from 'react'
import { consultarEstadoPago } from '../services/api.js'

const INTERVALO_MS = 2000

// Consulta cada pocos segundos el estado de un pago con billetera (polling).
// Devuelve 'PENDIENTE' mientras espera, y 'APROBADO', 'RECHAZADO' o 'ERROR' cuando termina.
// El intervalo se crea cuando hay un pago pendiente y se limpia en el return del efecto:
// al terminar el pago, al cambiar de pago o al salir de la pantalla. Si no se limpiara, seguiría consultando.
export function usePagoBilletera(idPago, onAprobado) {
  const [resultado, setResultado] = useState({ idPago: null, estado: 'PENDIENTE', error: null })
  // Si el resultado guardado es de otro pago (o todavía no hay), el pago actual está pendiente.
  const actual = resultado.idPago === idPago ? resultado : { idPago, estado: 'PENDIENTE', error: null }
  const terminado = actual.estado !== 'PENDIENTE'
  // useEffectEvent: usa siempre la versión actual de onAprobado sin que sea una dependencia que reinicie el intervalo.
  const avisarAprobado = useEffectEvent(onAprobado)

  useEffect(() => {
    if (!idPago || terminado) return
    let vigente = true
    const intervalo = setInterval(async () => {
      try {
        const { estado } = await consultarEstadoPago(idPago)
        if (!vigente || estado === 'PENDIENTE') return
        setResultado({ idPago, estado, error: null })
        if (estado === 'APROBADO') avisarAprobado()
      } catch (error) {
        if (vigente) setResultado({ idPago, estado: 'ERROR', error })
      }
    }, INTERVALO_MS)
    return () => {
      vigente = false
      clearInterval(intervalo)
    }
  }, [idPago, terminado])

  return { estado: idPago ? actual.estado : null, error: actual.error }
}
