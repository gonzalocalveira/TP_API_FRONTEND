import { useState } from 'react'
import Contador from '../Contador/Contador.jsx'
import Button from '../Button/Button.jsx'
import Icon from '../Icon/Icon.jsx'
import { ConfirmDialog } from '../Dialog/Dialog.jsx'
import { formatearPrecio } from '../../utils/formato.js'
import { subtotalCandy, cantidadCandy } from '../../utils/compra.js'
import estilos from './Carrito.module.css'

// Carrito de candy: sumar, restar, quitar y vaciar (con confirmación). El subtotal se anuncia con aria-live.
export default function Carrito({ items, onSumar, onRestar, onQuitar, onVaciar }) {
  const [confirmandoVaciar, setConfirmandoVaciar] = useState(false)

  function vaciar() {
    onVaciar()
    setConfirmandoVaciar(false)
  }

  return (
    <section className={estilos.carrito} aria-labelledby="carrito-titulo">
      <h2 id="carrito-titulo" className={estilos.titulo}>
        Tu candy
      </h2>

      {items.length === 0 ? (
        <p className={estilos.vacio}>Todavía no agregaste nada. Es opcional: podés seguir sin candy.</p>
      ) : (
        <ul className={estilos.lista}>
          {items.map((item) => (
            <li key={item.id} className={estilos.item}>
              <div className={estilos.itemTexto}>
                <span className={estilos.nombre}>{item.nombre}</span>
                <span className={estilos.precio}>{formatearPrecio(item.precio * item.cantidad)}</span>
              </div>
              <div className={estilos.itemAcciones}>
                <Contador nombre={item.nombre} cantidad={item.cantidad} onSumar={() => onSumar(item)} onRestar={() => onRestar(item.id)} />
                <button type="button" className={estilos.quitar} onClick={() => onQuitar(item.id)} aria-label={`Quitar ${item.nombre} del carrito`}>
                  <Icon nombre="papelera" tamano={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className={estilos.subtotal} aria-live="polite" aria-atomic="true">
        <span>
          Subtotal candy ({cantidadCandy(items)} {cantidadCandy(items) === 1 ? 'producto' : 'productos'})
        </span>
        <strong>{formatearPrecio(subtotalCandy(items))}</strong>
      </p>

      {items.length > 0 && (
        <Button variante="peligro" tamano="sm" onClick={() => setConfirmandoVaciar(true)}>
          Vaciar carrito
        </Button>
      )}

      <ConfirmDialog
        abierto={confirmandoVaciar}
        titulo="¿Vaciar el carrito?"
        mensaje="Se van a quitar todos los productos de candy que agregaste. Tus butacas siguen elegidas."
        textoConfirmar="Sí, vaciar"
        onConfirmar={vaciar}
        onCerrar={() => setConfirmandoVaciar(false)}
      />
    </section>
  )
}
