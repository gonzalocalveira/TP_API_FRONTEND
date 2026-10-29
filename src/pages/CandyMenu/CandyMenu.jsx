import { useCallback } from 'react'
import EncabezadoPagina from '../../components/EncabezadoPagina/EncabezadoPagina.jsx'
import CatalogoCandy from '../../components/CatalogoCandy/CatalogoCandy.jsx'
import Button from '../../components/Button/Button.jsx'
import { Cargando, Skeleton, ErrorState } from '../../components/Estados/Estados.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getProductosCandy } from '../../services/api.js'
import estilos from '../Candy/Candy.module.css'

// Menú de candy para consultar precios fuera del flujo de compra.
// El candy se compra junto con las entradas, por eso acá no hay botones de agregar.
export default function CandyMenu() {
  useDocumentTitle('Candy')
  const cargarCandy = useCallback(() => getProductosCandy(), [])
  const { datos, error, cargando, reintentar } = useAsync(cargarCandy)

  return (
    <div className="contenedor">
      <EncabezadoPagina
        titulo="Candy"
        descripcion="Pochoclos, combos y bebidas. Lo sumás cuando comprás tus entradas y lo retirás en el mostrador sin hacer fila."
      >
        <Button to="/">Comprá entradas</Button>
      </EncabezadoPagina>
      {cargando && (
        <Cargando texto="Cargando el menú...">
          <div className={estilos.skeletons}>
            <Skeleton alto="44px" />
            <Skeleton alto="120px" />
          </div>
        </Cargando>
      )}
      {error && <ErrorState titulo="No pudimos cargar el menú" error={error} onReintentar={reintentar} />}
      <h2 className="visually-hidden">Productos</h2>
      {datos && <CatalogoCandy modo="menu" categorias={datos.categorias} productos={datos.productos} />}
    </div>
  )
}
