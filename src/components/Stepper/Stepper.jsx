import { Link } from 'react-router-dom'
import Icon from '../Icon/Icon.jsx'
import estilos from './Stepper.module.css'

// Pasos de la compra. Los pasos anteriores al actual son links para volver;
// el actual se marca con aria-current="step"; los siguientes son solo texto.
// Una vez terminada la compra (paso "Listo") ya no se puede volver.
export default function Stepper({ pasoActual, funcion }) {
  const pasos = [
    { nombre: 'Función', ruta: funcion ? `/peliculas/${funcion.peliculaId}` : null },
    { nombre: 'Butacas', ruta: funcion ? `/compra/${funcion.id}/butacas` : null },
    { nombre: 'Candy', ruta: '/compra/candy' },
    { nombre: 'Pago', ruta: '/compra/pago' },
    { nombre: 'Listo', ruta: null },
  ]
  const compraTerminada = pasoActual === pasos.length - 1

  return (
    <nav aria-label="Pasos de la compra" className={estilos.stepper}>
      <ol className={estilos.lista}>
        {pasos.map((paso, indice) => {
          const completo = indice < pasoActual
          const actual = indice === pasoActual
          const clase = `${estilos.paso} ${completo ? estilos.completo : ''} ${actual ? estilos.actual : ''}`
          const contenido = (
            <>
              <span className={estilos.numero} aria-hidden="true">
                {completo ? <Icon nombre="check" tamano={14} /> : indice + 1}
              </span>
              <span className={estilos.nombre}>{paso.nombre}</span>
              {completo && <span className="visually-hidden"> (completado)</span>}
            </>
          )
          return (
            <li key={paso.nombre} className={clase} aria-current={actual ? 'step' : undefined}>
              {completo && paso.ruta && !compraTerminada ? (
                <Link to={paso.ruta} className={estilos.enlace}>
                  {contenido}
                </Link>
              ) : (
                <span className={estilos.enlace}>{contenido}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
