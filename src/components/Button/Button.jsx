import { Link } from 'react-router-dom'
import estilos from './Button.module.css'

// Botón único de la app. Variantes: primario, secundario, texto, peligro.
// Si recibe "to", se renderiza como Link (navega); si no, como <button> (ejecuta una acción).
export default function Button({
  variante = 'primario',
  tamano = 'md',
  bloque = false,
  cargando = false,
  textoCargando = 'Procesando...',
  disabled = false,
  type = 'button',
  to,
  className = '',
  children,
  ...props
}) {
  const clases = [estilos.boton, estilos[variante], estilos[tamano], bloque && estilos.bloque, className]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link to={to} className={clases} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={clases} disabled={disabled || cargando} aria-busy={cargando || undefined} {...props}>
      {cargando ? (
        <>
          <span className={estilos.spinner} aria-hidden="true" />
          {textoCargando}
        </>
      ) : (
        children
      )}
    </button>
  )
}
