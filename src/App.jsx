import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider.jsx'
import { CompraProvider } from './context/CompraProvider.jsx'
import { ToastProvider } from './context/ToastProvider.jsx'
import { clienteRoutes } from './routes/clienteRoutes.jsx'

// Cuando se hagan las otras vistas: createBrowserRouter([...clienteRoutes, ...empleadoRoutes, ...adminRoutes])
const router = createBrowserRouter(clienteRoutes)

// Los providers envuelven al router para que sesión, compra en curso y notificaciones
// estén disponibles en todas las páginas.
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CompraProvider>
          <RouterProvider router={router} />
        </CompraProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
