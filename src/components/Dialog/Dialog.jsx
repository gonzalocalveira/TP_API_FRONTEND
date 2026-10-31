import { useEffect, useId, useRef } from 'react'
import Button from '../Button/Button.jsx'
import estilos from './Dialog.module.css'

// Diálogo modal con el elemento nativo <dialog> y showModal():
// el navegador ya atrapa el foco adentro, oscurece el fondo y cierra con Esc.
// Al cerrarse, el foco vuelve al botón que lo abrió. Si ese botón ya no existe (por ejemplo, "Cancelar compra"
// desaparece porque la compra quedó cancelada), el foco va al elemento con id "idFocoAlternativo" o al <main>.
export default function Dialog({ abierto, onCerrar, titulo, idFocoAlternativo, children }) {
  const ref = useRef(null)
  const idTitulo = useId()

  useEffect(() => {
    if (!abierto) return
    const dialogo = ref.current
    const elementoPrevio = document.activeElement
    dialogo.showModal()
    return () => {
      if (dialogo.open) dialogo.close()
      if (elementoPrevio?.isConnected) elementoPrevio.focus()
      else (document.getElementById(idFocoAlternativo) ?? document.getElementById('contenido'))?.focus()
    }
  }, [abierto, idFocoAlternativo])

  return (
    // onClose se dispara al cerrar con Esc; se avisa al padre para que actualice su estado.
    <dialog ref={ref} className={estilos.dialogo} aria-labelledby={idTitulo} aria-modal="true" onClose={onCerrar}>
      {abierto && (
        <div className={estilos.contenido}>
          <h2 id={idTitulo} className={estilos.titulo}>
            {titulo}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  )
}

// Diálogo para confirmar acciones destructivas (cancelar una compra, vaciar el carrito).
export function ConfirmDialog({ abierto, titulo, mensaje, textoConfirmar, textoCancelar = 'Volver', procesando = false, onConfirmar, onCerrar, idFocoAlternativo }) {
  return (
    <Dialog abierto={abierto} onCerrar={onCerrar} titulo={titulo} idFocoAlternativo={idFocoAlternativo}>
      <p className={estilos.mensaje}>{mensaje}</p>
      <div className={estilos.acciones}>
        <Button variante="secundario" onClick={onCerrar} disabled={procesando}>
          {textoCancelar}
        </Button>
        <Button variante="primario" onClick={onConfirmar} cargando={procesando}>
          {textoConfirmar}
        </Button>
      </div>
    </Dialog>
  )
}
