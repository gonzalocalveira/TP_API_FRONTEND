import { useRef } from 'react'
import Icon from '../Icon/Icon.jsx'
import estilos from './SeatMap.module.css'

const DIRECCIONES = {
  ArrowRight: [0, 1],
  ArrowLeft: [0, -1],
  ArrowDown: [1, 0],
  ArrowUp: [-1, 0],
}

// Agrupa las butacas por fila: { A: [...], B: [...] }
function agruparPorFila(butacas) {
  const filas = {}
  for (const butaca of butacas) {
    filas[butaca.filaAsiento] ??= []
    filas[butaca.filaAsiento].push(butaca)
  }
  return Object.entries(filas)
}

// Mapa de la sala. Cada butaca es un <button>:
//  - aria-label con fila, número y estado ("Fila B, butaca 4, disponible")
//  - aria-pressed indica si está en tu selección; disabled si está ocupada
//  - el estado se ve por color Y por forma: tu selección lleva un tilde y la ocupada una cruz con borde punteado
// Teclado: Tab recorre las butacas libres y las flechas mueven el foco por la grilla (saltando las ocupadas).
export default function SeatMap({ butacas, seleccionadas, onAlternar }) {
  const mapaRef = useRef(null)
  const filas = agruparPorFila(butacas)
  const idsSeleccionados = new Set(seleccionadas.map((b) => b.id))

  function moverFoco(evento) {
    const direccion = DIRECCIONES[evento.key]
    const actual = evento.target.closest('button[data-fila]')
    if (!direccion || !actual) return
    evento.preventDefault()
    let fila = Number(actual.dataset.fila)
    let columna = Number(actual.dataset.columna)
    // Avanza en esa dirección hasta encontrar una butaca libre o salir del mapa.
    while (true) {
      fila += direccion[0]
      columna += direccion[1]
      const siguiente = mapaRef.current.querySelector(`[data-fila="${fila}"][data-columna="${columna}"]`)
      if (!siguiente) return
      if (!siguiente.disabled) {
        siguiente.focus()
        return
      }
    }
  }

  return (
    <div className={estilos.contenedor}>
      <div className={estilos.pantalla} aria-hidden="true">
        Pantalla
      </div>
      {/* El mapa tiene scroll horizontal propio en pantallas chicas, así las butacas no se achican */}
      <div className={estilos.scroll}>
        <div ref={mapaRef} className={estilos.mapa} onKeyDown={moverFoco} role="group" aria-label="Butacas de la sala">
          {filas.map(([letra, butacasDeLaFila], indiceFila) => {
            const mitad = Math.ceil(butacasDeLaFila.length / 2)
            return (
              <div key={letra} className={estilos.fila}>
                <span className={estilos.letra} aria-hidden="true">
                  {letra}
                </span>
                {butacasDeLaFila.map((butaca, indiceColumna) => {
                  const seleccionada = idsSeleccionados.has(butaca.id)
                  const estado = butaca.ocupada ? 'ocupada' : seleccionada ? 'seleccionada' : 'disponible'
                  return (
                    <button
                      key={butaca.id}
                      type="button"
                      className={`${estilos.butaca} ${estilos[estado]} ${indiceColumna === mitad ? estilos.pasillo : ''}`}
                      data-fila={indiceFila}
                      data-columna={indiceColumna}
                      disabled={butaca.ocupada}
                      aria-pressed={butaca.ocupada ? undefined : seleccionada}
                      aria-label={`Fila ${butaca.filaAsiento}, butaca ${butaca.numeroAsiento}, ${estado}`}
                      onClick={() => onAlternar(butaca)}
                    >
                      {butaca.ocupada ? (
                        <Icon nombre="cerrar" tamano={16} />
                      ) : seleccionada ? (
                        <Icon nombre="check" tamano={18} />
                      ) : (
                        <span aria-hidden="true">{butaca.numeroAsiento}</span>
                      )}
                    </button>
                  )
                })}
                <span className={estilos.letra} aria-hidden="true">
                  {letra}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Leyenda de los estados, con las mismas formas que el mapa.
export function SeatLegend() {
  return (
    <ul className={estilos.leyenda} aria-label="Referencias del mapa">
      <li>
        <span className={`${estilos.muestra} ${estilos.disponible}`} aria-hidden="true" />
        Disponible
      </li>
      <li>
        <span className={`${estilos.muestra} ${estilos.seleccionada}`} aria-hidden="true">
          <Icon nombre="check" tamano={14} />
        </span>
        Tu selección
      </li>
      <li>
        <span className={`${estilos.muestra} ${estilos.ocupada}`} aria-hidden="true">
          <Icon nombre="cerrar" tamano={12} />
        </span>
        Ocupada
      </li>
    </ul>
  )
}
