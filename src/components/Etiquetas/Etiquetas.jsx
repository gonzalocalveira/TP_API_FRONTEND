// Etiquetas chicas reutilizables: clasificación, formato y estado de una compra.
import { etiquetaFormato } from '../../utils/formato.js'
import estilos from './Etiquetas.module.css'

function describirClasificacion(clasificacion) {
  if (clasificacion === 'ATP') return 'Apta para todo público'
  const edad = clasificacion.replace('+', '')
  return `Solo para mayores de ${edad} años`
}

export function Clasificacion({ valor }) {
  return (
    <span className={`${estilos.etiqueta} ${estilos.clasificacion}`} title={describirClasificacion(valor)}>
      <span aria-hidden="true">{valor}</span>
      <span className="visually-hidden">{describirClasificacion(valor)}</span>
    </span>
  )
}

export function Formato({ valor }) {
  return <span className={`${estilos.etiqueta} ${estilos.formato}`}>{etiquetaFormato(valor)}</span>
}

// El estado no se comunica solo con color: el texto siempre dice CONFIRMADA o CANCELADA y lleva un símbolo.
export function EstadoCompra({ estado }) {
  const confirmada = estado === 'CONFIRMADA'
  return (
    <span className={`${estilos.etiqueta} ${confirmada ? estilos.confirmada : estilos.cancelada}`}>
      <span aria-hidden="true">{confirmada ? '✓ ' : '✕ '}</span>
      {confirmada ? 'Confirmada' : 'Cancelada'}
    </span>
  )
}
