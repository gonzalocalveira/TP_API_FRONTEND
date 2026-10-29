import Icon from '../Icon/Icon.jsx'
import estilos from './Toast.module.css'

const iconos = { exito: 'check', error: 'alerta', info: 'info' }

// Región aria-live: los lectores de pantalla anuncian cada notificación nueva sin mover el foco.
export default function ToastRegion({ toasts, onCerrar }) {
  return (
    <div className={estilos.region} aria-live="polite" aria-label="Notificaciones">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${estilos.toast} ${estilos[toast.tipo]}`}>
          <Icon nombre={iconos[toast.tipo]} />
          <p className={estilos.mensaje}>{toast.mensaje}</p>
          <button type="button" className={estilos.cerrar} onClick={() => onCerrar(toast.id)} aria-label="Cerrar notificación">
            <Icon nombre="cerrar" tamano={18} />
          </button>
        </div>
      ))}
    </div>
  )
}
