import { useCallback, useState } from 'react'
import { ToastContext } from './ToastContext.js'
import ToastRegion from '../components/Toast/ToastRegion.jsx'

const DURACION_MS = 6000
let proximoId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const cerrarToast = useCallback((id) => {
    setToasts((actuales) => actuales.filter((t) => t.id !== id))
  }, [])

  // tipo: 'exito' | 'error' | 'info'
  const mostrarToast = useCallback(
    ({ tipo = 'info', mensaje }) => {
      const id = proximoId++
      setToasts((actuales) => [...actuales, { id, tipo, mensaje }])
      setTimeout(() => cerrarToast(id), DURACION_MS)
    },
    [cerrarToast],
  )

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <ToastRegion toasts={toasts} onCerrar={cerrarToast} />
    </ToastContext.Provider>
  )
}
