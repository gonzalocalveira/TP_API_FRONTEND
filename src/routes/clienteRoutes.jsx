// Rutas de la vista de cliente. Cada ruta indica qué página (componente) se muestra en cada URL.
// Las rutas de empleado (/empleado) y administrador (/admin) se van a sumar en archivos propios
// (empleadoRoutes.jsx y adminRoutes.jsx) con su layout, y se agregan en App.jsx.
import ClienteLayout from '../layouts/ClienteLayout.jsx'
import CompraLayout from '../layouts/CompraLayout.jsx'
import { RequireAuth, RequireCompra } from './guards.jsx'
import Cartelera from '../pages/Cartelera/Cartelera.jsx'
import Pelicula from '../pages/Pelicula/Pelicula.jsx'
import Promociones from '../pages/Promociones/Promociones.jsx'
import CandyMenu from '../pages/CandyMenu/CandyMenu.jsx'
import Butacas from '../pages/Butacas/Butacas.jsx'
import Candy from '../pages/Candy/Candy.jsx'
import Pago from '../pages/Pago/Pago.jsx'
import Confirmacion from '../pages/Confirmacion/Confirmacion.jsx'
import Ingresar from '../pages/Ingresar/Ingresar.jsx'
import Registro from '../pages/Registro/Registro.jsx'
import MisCompras from '../pages/MisCompras/MisCompras.jsx'
import Membresia from '../pages/Membresia/Membresia.jsx'
import AcercaDe from '../pages/AcercaDe/AcercaDe.jsx'
import NotFound from '../pages/NotFound/NotFound.jsx'

export const clienteRoutes = [
  {
    path: '/',
    element: <ClienteLayout />,
    children: [
      { index: true, element: <Cartelera /> },
      { path: 'peliculas/:id', element: <Pelicula /> },
      { path: 'promociones', element: <Promociones /> },
      { path: 'candy', element: <CandyMenu /> },
      { path: 'acerca-de', element: <AcercaDe /> },
      { path: 'ingresar', element: <Ingresar /> },
      { path: 'registro', element: <Registro /> },
      {
        // Flujo de compra: todas estas pantallas comparten el stepper.
        path: 'compra',
        element: <CompraLayout />,
        children: [
          { path: ':funcionId/butacas', element: <Butacas /> },
          {
            element: <RequireCompra />,
            children: [
              { path: 'candy', element: <Candy /> },
              {
                // Para pagar hace falta sesión: la compra del back-end necesita el usuarioId.
                element: <RequireAuth />,
                children: [{ path: 'pago', element: <Pago /> }],
              },
            ],
          },
          {
            element: <RequireAuth />,
            children: [{ path: 'confirmacion/:ticketId', element: <Confirmacion /> }],
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'mis-compras', element: <MisCompras /> },
          { path: 'membresia', element: <Membresia /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]
