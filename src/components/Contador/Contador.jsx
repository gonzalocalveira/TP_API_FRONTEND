import Icon from '../Icon/Icon.jsx'
import estilos from './Contador.module.css'

// Botones − cantidad + para un producto. Los aria-label dicen qué producto se suma o se resta.
export default function Contador({ nombre, cantidad, onSumar, onRestar }) {
  return (
    <div className={estilos.contador} role="group" aria-label={`Cantidad de ${nombre}`}>
      <button
        type="button"
        className={estilos.boton}
        onClick={onRestar}
        aria-label={cantidad === 1 ? `Quitar ${nombre}` : `Restar un ${nombre}`}
      >
        <Icon nombre={cantidad === 1 ? 'papelera' : 'menos'} tamano={18} />
      </button>
      <span className={estilos.cantidad} aria-live="polite">
        {cantidad}
      </span>
      <button type="button" className={estilos.boton} onClick={onSumar} aria-label={`Sumar un ${nombre}`}>
        <Icon nombre="mas" tamano={18} />
      </button>
    </div>
  )
}
