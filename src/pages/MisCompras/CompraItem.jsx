import { useState } from 'react'
import Button from '../../components/Button/Button.jsx'
import { EstadoCompra } from '../../components/Etiquetas/Etiquetas.jsx'
import { puedeCancelarse, funcionYaEmpezo } from '../../utils/compra.js'
import { codigoReserva, formatearFechaHora, formatearFechaLarga, formatearHora, formatearPrecio, listarButacas } from '../../utils/formato.js'
import estilos from './MisCompras.module.css'

// Una compra del historial, con su detalle desplegable y la acción de cancelar.
export default function CompraItem({ compra, onCancelar }) {
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const idDetalle = `detalle-compra-${compra.id}`
  const cancelada = compra.estado === 'CANCELADA'

  return (
    <article className={`${estilos.compra} ${cancelada ? estilos.compraCancelada : ''}`} aria-labelledby={`compra-${compra.id}`}>
      <div className={estilos.cabecera}>
        {/* tabIndex -1: recibe el foco después de cancelar, cuando el botón "Cancelar compra" desaparece */}
        <h2 id={`compra-${compra.id}`} tabIndex={-1} className={estilos.pelicula}>
          {compra.peliculaNombre}
        </h2>
        <EstadoCompra estado={compra.estado} />
      </div>

      <dl className={estilos.datos}>
        <div>
          <dt>Función</dt>
          <dd className={estilos.capitalizar}>
            {formatearFechaLarga(compra.fechaFuncion)}, {formatearHora(compra.horaFuncion)} h
          </dd>
        </div>
        <div>
          <dt>Sala</dt>
          <dd>{compra.salaNombre}</dd>
        </div>
        <div>
          <dt>Butacas</dt>
          <dd>{listarButacas(compra.entradas)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatearPrecio(compra.total)}</dd>
        </div>
      </dl>

      <div className={estilos.acciones}>
        <Button
          variante="texto"
          tamano="sm"
          aria-expanded={detalleAbierto}
          aria-controls={idDetalle}
          onClick={() => setDetalleAbierto((abierto) => !abierto)}
        >
          {detalleAbierto ? 'Ocultar detalle' : 'Ver detalle'}
        </Button>
        {puedeCancelarse(compra) && (
          <Button variante="peligro" tamano="sm" onClick={() => onCancelar(compra)}>
            Cancelar compra
          </Button>
        )}
        {compra.estado === 'CONFIRMADA' && funcionYaEmpezo(compra) && (
          <p className={estilos.nota}>La función ya empezó: esta compra ya no se puede cancelar.</p>
        )}
      </div>

      <div id={idDetalle} hidden={!detalleAbierto} className={estilos.detalle}>
        <p className={estilos.nota}>
          Código de reserva <strong>{codigoReserva(compra.id)}</strong> · Comprada el {formatearFechaHora(compra.fechaCompra)}
        </p>
        <table className={estilos.tabla}>
          <caption className="visually-hidden">Entradas de la compra {codigoReserva(compra.id)}</caption>
          <thead>
            <tr>
              <th scope="col">Butaca</th>
              <th scope="col">Precio</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {compra.entradas.map((entrada) => (
              <tr key={entrada.id}>
                <td>
                  Fila {entrada.filaAsiento}, butaca {entrada.numeroAsiento}
                </td>
                <td>{formatearPrecio(entrada.precioUnitario)}</td>
                <td>{entrada.estado === 'OCUPADA' ? 'Vigente' : 'Cancelada'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
