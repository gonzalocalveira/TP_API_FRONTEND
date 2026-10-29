import { Outlet, useLocation } from 'react-router-dom'
import Stepper from '../components/Stepper/Stepper.jsx'
import { useCompra } from '../hooks/useCompra.js'

// Pantallas del flujo de compra: muestra el stepper arriba y la pantalla del paso abajo.
// El paso actual se deduce de la URL.
function pasoSegunRuta(pathname) {
  if (pathname.endsWith('/butacas')) return 1
  if (pathname.endsWith('/candy')) return 2
  if (pathname.endsWith('/pago')) return 3
  return 4 // confirmación
}

export default function CompraLayout() {
  const { pathname } = useLocation()
  const { funcion } = useCompra()
  return (
    <div className="contenedor">
      <Stepper pasoActual={pasoSegunRuta(pathname)} funcion={funcion} />
      <Outlet />
    </div>
  )
}
