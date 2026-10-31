import { useId } from 'react'
import estilos from './FiltroChips.module.css'

// Grupo de botones de filtro con aria-pressed (botones de alternar).
// Se usa para filtrar una lista que no cambia de lugar (formatos, días), por eso no son pestañas.
// opciones: [{ valor, texto, contenido?, etiquetaAccesible?, deshabilitado? }]
export default function FiltroChips({ etiqueta, opciones, seleccionados, onAlternar, variante = 'chip', etiquetaVisible = true }) {
  const idEtiqueta = useId()
  return (
    <div className={estilos.grupo} role="group" aria-labelledby={idEtiqueta}>
      <span id={idEtiqueta} className={etiquetaVisible ? estilos.etiqueta : 'visually-hidden'}>
        {etiqueta}
      </span>
      <div className={estilos.opciones}>
        {opciones.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            className={`${estilos[variante]} ${estilos.boton}`}
            aria-pressed={seleccionados.includes(opcion.valor)}
            aria-label={opcion.etiquetaAccesible}
            disabled={opcion.deshabilitado}
            onClick={() => onAlternar(opcion.valor)}
          >
            {opcion.contenido ?? opcion.texto}
          </button>
        ))}
      </div>
    </div>
  )
}
