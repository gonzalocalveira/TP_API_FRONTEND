// Rutas protegidas: no muestran nada propio, deciden si se puede entrar a las rutas hijas (<Outlet />)
// o si hay que redirigir. El motivo de la redirección viaja como "aviso" y el layout lo muestra como toast.
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useCompra } from '../hooks/useCompra.js'

// Pide sesión iniciada. Guarda en "from" a dónde quería ir, para volver ahí después del login.
export function RequireAuth() {
  const { usuario } = useAuth()
  const location = useLocation()
  if (!usuario) {
    return (
      <Navigate
        to="/ingresar"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          aviso: { tipo: 'info', mensaje: 'Ingresá con tu cuenta para continuar. Si no tenés, registrate en un minuto.' },
        }}
      />
    )
  }
  return <Outlet />
}

// Pide una función y al menos una butaca elegidas (para entrar a candy y pago).
export function RequireCompra() {
  const { funcion, butacas, funcionVencida } = useCompra()
  if (!funcion) {
    return (
      <Navigate to="/" replace state={{ aviso: { tipo: 'info', mensaje: 'Primero elegí una película y una función.' } }} />
    )
  }
  // Si se venció el tiempo, el diálogo del temporizador ya lo explica: se vuelve a butacas sin otro aviso.
  if (butacas.length === 0 && funcionVencida) return <Navigate to={`/compra/${funcion.id}/butacas`} replace />
  if (butacas.length === 0) {
    return (
      <Navigate
        to={`/compra/${funcion.id}/butacas`}
        replace
        state={{ aviso: { tipo: 'info', mensaje: 'Elegí al menos una butaca para continuar.' } }}
      />
    )
  }
  return <Outlet />
}
