import estilos from './Tabs.module.css'

// Pestañas con el patrón accesible de WAI-ARIA (role="tablist" / "tab" / "tabpanel").
// Se usan cuando cada opción cambia un panel de contenido entero (las categorías del candy).
// Teclado: solo la pestaña activa está en el orden de Tab; con las flechas, Inicio y Fin se cambia de pestaña.
export default function Tabs({ idBase, etiqueta, pestanas, activa, onCambiar, children }) {
  const idTab = (id) => `${idBase}-tab-${id}`
  const idPanel = `${idBase}-panel`

  function manejarTeclado(evento) {
    const indice = pestanas.findIndex((p) => p.id === activa)
    const destinos = {
      ArrowRight: (indice + 1) % pestanas.length,
      ArrowLeft: (indice - 1 + pestanas.length) % pestanas.length,
      Home: 0,
      End: pestanas.length - 1,
    }
    const destino = destinos[evento.key]
    if (destino === undefined) return
    evento.preventDefault()
    const nueva = pestanas[destino].id
    onCambiar(nueva)
    document.getElementById(idTab(nueva))?.focus()
  }

  return (
    <div>
      <div role="tablist" aria-label={etiqueta} className={estilos.lista} onKeyDown={manejarTeclado}>
        {pestanas.map((pestana) => {
          const seleccionada = pestana.id === activa
          return (
            <button
              key={pestana.id}
              id={idTab(pestana.id)}
              type="button"
              role="tab"
              aria-selected={seleccionada}
              aria-controls={idPanel}
              tabIndex={seleccionada ? 0 : -1}
              className={estilos.tab}
              onClick={() => onCambiar(pestana.id)}
            >
              {pestana.nombre}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={idPanel} aria-labelledby={idTab(activa)} tabIndex={0} className={estilos.panel}>
        {children}
      </div>
    </div>
  )
}
