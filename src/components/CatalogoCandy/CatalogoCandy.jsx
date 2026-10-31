import { useState } from 'react'
import Tabs from '../Tabs/Tabs.jsx'
import Button from '../Button/Button.jsx'
import Contador from '../Contador/Contador.jsx'
import Icon from '../Icon/Icon.jsx'
import { formatearPrecio } from '../../utils/formato.js'
import estilos from './CatalogoCandy.module.css'

// Catálogo de candy con pestañas por categoría (SIMULADO EN EL FRONT, sin endpoint en el back).
// modo "compra": cada producto se puede agregar al carrito. modo "menu": solo muestra precios.
export default function CatalogoCandy({ categorias, productos, modo = 'menu', carrito = [], onAgregar, onRestar }) {
  const [categoria, setCategoria] = useState(categorias[0].id)
  const visibles = productos.filter((p) => p.categoria === categoria)

  // Al quitar la última unidad, el contador desaparece: el foco pasa al botón "Agregar" que lo reemplaza
  // para que quien usa teclado no pierda su lugar.
  function restar(producto, cantidad) {
    onRestar(producto.id)
    if (cantidad === 1) requestAnimationFrame(() => document.getElementById(`agregar-${producto.id}`)?.focus())
  }

  return (
    <Tabs idBase="candy" etiqueta="Categorías de candy" pestanas={categorias} activa={categoria} onCambiar={setCategoria}>
      <ul className={estilos.grilla}>
        {visibles.map((producto) => {
          const cantidad = carrito.find((item) => item.id === producto.id)?.cantidad ?? 0
          return (
            <li key={producto.id} className={estilos.producto}>
              <span className={estilos.ilustracion} aria-hidden="true">
                <Icon nombre="pochoclo" tamano={32} />
              </span>
              <div className={estilos.textos}>
                <h3 className={estilos.nombre}>{producto.nombre}</h3>
                <p className={estilos.descripcion}>{producto.descripcion}</p>
                <p className={estilos.precio}>{formatearPrecio(producto.precio)}</p>
              </div>
              {modo === 'compra' && (
                <div className={estilos.accion}>
                  {cantidad === 0 ? (
                    <Button id={`agregar-${producto.id}`} variante="secundario" tamano="sm" onClick={() => onAgregar(producto)}>
                      <Icon nombre="mas" tamano={16} />
                      Agregar
                      <span className="visually-hidden"> {producto.nombre}</span>
                    </Button>
                  ) : (
                    <Contador
                      nombre={producto.nombre}
                      cantidad={cantidad}
                      onSumar={() => onAgregar(producto)}
                      onRestar={() => restar(producto, cantidad)}
                    />
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Tabs>
  )
}
