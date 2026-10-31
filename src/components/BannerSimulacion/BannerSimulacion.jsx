import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../Button/Button.jsx'
import { USANDO_MOCKS, leerModoError, desactivarModoError, MODOS_ERROR } from '../../services/api.js'
import estilos from './BannerSimulacion.module.css'

const textos = {
  [MODOS_ERROR.LECTURA]: 'Modo demo: las consultas a la API fallan a propósito para mostrar los estados de error.',
  [MODOS_ERROR.CONFLICTO]: 'Modo demo: en el próximo pago, otra persona va a ocupar una de tus butacas (error 409).',
}

// Aviso visible mientras está activo el modo de errores simulados (?error=1 o ?error=409).
export default function BannerSimulacion() {
  // Se re-renderiza en cada navegación (useLocation), así el aviso refleja el modo actual.
  const location = useLocation()
  const navigate = useNavigate()
  const modo = leerModoError()

  if (!USANDO_MOCKS || modo === MODOS_ERROR.NINGUNO) return null

  function desactivar() {
    desactivarModoError()
    // Se saca el ?error=... de la URL para que no se vuelva a activar.
    navigate({ pathname: location.pathname, search: '' }, { replace: true, state: location.state })
  }

  return (
    <div className={estilos.banner} role="status">
      <p className="contenedor">
        <span>{textos[modo]}</span>
        <Button variante="secundario" tamano="sm" onClick={desactivar}>
          Desactivar
        </Button>
      </p>
    </div>
  )
}
