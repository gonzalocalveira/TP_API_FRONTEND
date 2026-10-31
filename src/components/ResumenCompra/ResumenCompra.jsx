import { useState } from 'react'
import Icon from '../Icon/Icon.jsx'
import { Formato } from '../Etiquetas/Etiquetas.jsx'
import { capitalizar, formatearPrecio, formatearFechaLarga, formatearHora, listarButacas } from '../../utils/formato.js'
import { subtotalEntradas, subtotalCandy, MAX_BUTACAS } from '../../utils/compra.js'
import estilos from './ResumenCompra.module.css'

// Resumen de la compra en curso (panel lateral en escritorio, barra fija abajo en celular).
// "accion" es el botón principal del paso (Continuar, Pagar...). Los totales se anuncian con aria-live.
export default function ResumenCompra({ funcion, butacas, candy = [], accion, mostrarCandy = true }) {
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const totalEntradas = subtotalEntradas(funcion.precio, butacas.length)
  const totalCandy = subtotalCandy(candy)
  const total = totalEntradas + (mostrarCandy ? totalCandy : 0)

  return (
    <aside className={estilos.resumen} aria-labelledby="resumen-titulo">
      <div className={estilos.cabecera}>
        <h2 id="resumen-titulo" className={estilos.titulo}>
          Tu compra
        </h2>
        {/* En celular el detalle se colapsa; en escritorio el botón se oculta y el detalle se ve siempre */}
        <button
          type="button"
          className={estilos.botonDetalle}
          aria-expanded={detalleAbierto}
          aria-controls="resumen-detalle"
          onClick={() => setDetalleAbierto((abierto) => !abierto)}
        >
          {detalleAbierto ? 'Ocultar detalle' : 'Ver detalle'}
          <Icon nombre={detalleAbierto ? 'flechaDerecha' : 'flechaIzquierda'} tamano={16} className={estilos.flecha} />
        </button>
      </div>

      <div id="resumen-detalle" className={`${estilos.detalle} ${detalleAbierto ? estilos.detalleAbierto : ''}`}>
        <div className={estilos.funcion}>
          <p className={estilos.pelicula}>{funcion.peliculaNombre}</p>
          <p className={estilos.dato}>
            {capitalizar(formatearFechaLarga(funcion.fechaFuncion))}, {formatearHora(funcion.horaFuncion)} h
          </p>
          <p className={estilos.dato}>
            {funcion.salaNombre} · <Formato valor={funcion.formatoFuncion} />
          </p>
        </div>

        <dl className={estilos.lineas}>
          <div className={estilos.linea}>
            <dt>
              Butacas ({butacas.length} de {MAX_BUTACAS})
            </dt>
            <dd>{butacas.length > 0 ? listarButacas(butacas) : 'Ninguna todavía'}</dd>
          </div>
          <div className={estilos.linea}>
            <dt>
              Entradas: {butacas.length} × {formatearPrecio(funcion.precio)}
            </dt>
            <dd>{formatearPrecio(totalEntradas)}</dd>
          </div>
          {mostrarCandy &&
            candy.map((item) => (
              <div key={item.id} className={estilos.linea}>
                <dt>
                  {item.cantidad} × {item.nombre}
                </dt>
                <dd>{formatearPrecio(item.precio * item.cantidad)}</dd>
              </div>
            ))}
        </dl>
      </div>

      <div className={estilos.pie}>
        <p className={estilos.total} aria-live="polite" aria-atomic="true">
          <span>Total</span>
          <strong>{formatearPrecio(total)}</strong>
        </p>
        {accion}
      </div>
    </aside>
  )
}
