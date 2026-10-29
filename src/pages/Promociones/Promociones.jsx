import { useCallback } from 'react'
import EncabezadoPagina from '../../components/EncabezadoPagina/EncabezadoPagina.jsx'
import PromoCard from '../../components/PromoCard/PromoCard.jsx'
import Button from '../../components/Button/Button.jsx'
import { Cargando, Skeleton, ErrorState } from '../../components/Estados/Estados.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getPromociones } from '../../services/api.js'
import estilos from './Promociones.module.css'

// Promociones informativas (SIMULADO EN EL FRONT). No se aplican al total de la compra.
export default function Promociones() {
  useDocumentTitle('Promociones')
  const cargarPromociones = useCallback(() => getPromociones(), [])
  const { datos, error, cargando, reintentar } = useAsync(cargarPromociones)

  return (
    <div className="contenedor">
      <EncabezadoPagina
        titulo="Promociones"
        descripcion="Beneficios vigentes en Linterna Cines. Se aplican en la boletería o en el mostrador del candy, no en la compra online."
      >
        <Button to="/">Ver la cartelera</Button>
      </EncabezadoPagina>
      {cargando && (
        <Cargando texto="Cargando promociones...">
          <div className={estilos.grilla}>
            <Skeleton alto="200px" />
            <Skeleton alto="200px" />
            <Skeleton alto="200px" />
          </div>
        </Cargando>
      )}
      {error && <ErrorState titulo="No pudimos cargar las promociones" error={error} onReintentar={reintentar} />}
      {datos && (
        <ul className={estilos.grilla}>
          {datos.map((promocion) => (
            <li key={promocion.id}>
              <PromoCard promocion={promocion} nivelTitulo={2} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
