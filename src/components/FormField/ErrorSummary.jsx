import { useEffect, useRef } from 'react'
import estilos from './FormField.module.css'
import propios from './ErrorSummary.module.css'

// Resumen de errores que aparece al enviar un formulario inválido.
// Recibe el foco cuando aparece, y cada error es un link que lleva al campo correspondiente.
// "etiquetas" traduce el nombre del campo a su texto visible: { mail: 'Mail', ... }
export default function ErrorSummary({ errores, etiquetas, visible }) {
  const ref = useRef(null)
  const campos = Object.keys(errores)

  // "visible" cambia a un número nuevo en cada intento de envío, así el foco vuelve al resumen.
  useEffect(() => {
    if (visible) ref.current?.focus()
  }, [visible])

  if (!visible || campos.length === 0) return null

  function irAlCampo(evento, campo) {
    evento.preventDefault()
    document.getElementById(campo)?.focus()
  }

  return (
    <div ref={ref} className={propios.resumen} role="alert" tabIndex={-1} aria-labelledby="resumen-errores-titulo">
      <h2 id="resumen-errores-titulo" className={propios.titulo}>
        {campos.length === 1 ? 'Hay 1 dato para revisar' : `Hay ${campos.length} datos para revisar`}
      </h2>
      <ul className={propios.lista}>
        {campos.map((campo) => (
          <li key={campo}>
            <a href={`#${campo}`} onClick={(e) => irAlCampo(e, campo)} className={estilos.error}>
              {etiquetas[campo]}: {errores[campo]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
