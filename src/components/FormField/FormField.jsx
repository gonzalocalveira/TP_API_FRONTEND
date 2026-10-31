import estilos from './FormField.module.css'

// Campo de formulario con su <label>, texto de ayuda y mensaje de error asociados.
// aria-describedby conecta el control con la ayuda y el error, así el lector de pantalla los lee al enfocarlo.
// como="select" renderiza un <select> (las opciones van como children).
// "adorno" permite agregar un botón dentro del campo (por ejemplo, mostrar u ocultar la contraseña).
export default function FormField({ id, etiqueta, error, ayuda, obligatorio = false, adorno, como = 'input', className = '', children, ...propsControl }) {
  const idAyuda = ayuda ? `${id}-ayuda` : null
  const idError = error ? `${id}-error` : null
  const describedBy = [idAyuda, idError].filter(Boolean).join(' ') || undefined
  const Control = como

  return (
    <div className={`${estilos.campo} ${className}`}>
      <label htmlFor={id} className={estilos.etiqueta}>
        {etiqueta}
        {obligatorio && (
          <span className={estilos.obligatorio} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {ayuda && (
        <p id={idAyuda} className={estilos.ayuda}>
          {ayuda}
        </p>
      )}
      <div className={estilos.contenedorInput}>
        <Control
          id={id}
          name={id}
          className={`${estilos.input} ${adorno ? estilos.conAdorno : ''} ${error ? estilos.inputConError : ''}`}
          aria-invalid={error ? true : undefined}
          aria-required={obligatorio || undefined}
          aria-describedby={describedBy}
          {...propsControl}
        >
          {children}
        </Control>
        {adorno}
      </div>
      {error && (
        <p id={idError} className={estilos.error}>
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  )
}
