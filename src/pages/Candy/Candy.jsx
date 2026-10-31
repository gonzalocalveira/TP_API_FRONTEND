import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import EncabezadoPagina from '../../components/EncabezadoPagina/EncabezadoPagina.jsx'
import CatalogoCandy from '../../components/CatalogoCandy/CatalogoCandy.jsx'
import Carrito from '../../components/Carrito/Carrito.jsx'
import ResumenCompra from '../../components/ResumenCompra/ResumenCompra.jsx'
import ImagenAmbiente from '../../components/ImagenAmbiente/ImagenAmbiente.jsx'
import Button from '../../components/Button/Button.jsx'
import { Cargando, Skeleton, ErrorState } from '../../components/Estados/Estados.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useCompra } from '../../hooks/useCompra.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getProductosCandy } from '../../services/api.js'
import estilosCompra from '../../layouts/CompraLayout.module.css'
import estilos from './Candy.module.css'

// Paso opcional de la compra: sumar candy. SIMULADO EN EL FRONT (el back-end no tiene candy).
export default function Candy() {
  useDocumentTitle('Sumá tu candy')
  const navigate = useNavigate()
  const compra = useCompra()
  const cargarCandy = useCallback(() => getProductosCandy(), [])
  const { datos, error, cargando, reintentar } = useAsync(cargarCandy)

  const irAlPago = () => navigate('/compra/pago')

  return (
    <>
      <EncabezadoPagina titulo="Sumá tu candy" descripcion="Este paso es opcional. Si no querés nada, saltealo y seguí al pago.">
        <Button variante="secundario" onClick={irAlPago}>
          Saltear candy e ir al pago
        </Button>
      </EncabezadoPagina>

      <div className={estilosCompra.grilla}>
        <div className={estilosCompra.principal}>
          <ImagenAmbiente nombre="candy" />
          <section aria-labelledby="catalogo-titulo">
            <h2 id="catalogo-titulo" className="visually-hidden">
              Productos
            </h2>
            {cargando && (
              <Cargando texto="Cargando productos...">
                <div className={estilos.skeletons}>
                  <Skeleton alto="44px" />
                  <Skeleton alto="120px" />
                  <Skeleton alto="120px" />
                </div>
              </Cargando>
            )}
            {error && <ErrorState titulo="No pudimos cargar el candy" error={error} onReintentar={reintentar} />}
            {datos && (
              <CatalogoCandy
                modo="compra"
                categorias={datos.categorias}
                productos={datos.productos}
                carrito={compra.candy}
                onAgregar={compra.agregarCandy}
                onRestar={compra.quitarUnCandy}
              />
            )}
          </section>
          <Carrito
            items={compra.candy}
            onSumar={compra.agregarCandy}
            onRestar={compra.quitarUnCandy}
            onQuitar={compra.eliminarCandy}
            onVaciar={compra.vaciarCandy}
          />
        </div>

        <ResumenCompra
          funcion={compra.funcion}
          butacas={compra.butacas}
          candy={compra.candy}
          accion={
            <Button bloque tamano="lg" onClick={irAlPago}>
              {compra.candy.length > 0 ? 'Continuar al pago' : 'Continuar sin candy'}
            </Button>
          }
        />
      </div>
    </>
  )
}
