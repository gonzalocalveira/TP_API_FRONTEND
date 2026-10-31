import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../Button/Button.jsx'
import Dialog from '../Dialog/Dialog.jsx'
import Icon from '../Icon/Icon.jsx'
import { useCompra } from '../../hooks/useCompra.js'
import { useCuentaRegresiva } from '../../hooks/useCuentaRegresiva.js'
import { useToast } from '../../hooks/useToast.js'
import { retenerButacas } from '../../services/api.js'
import { formatearCuentaRegresiva, hitoDelTemporizador, SEGUNDOS_AVISO } from '../../utils/compra.js'
import estilos from './TemporizadorCompra.module.css'

// Mensajes para el lector de pantalla: solo en momentos clave, nunca cada segundo.
const ANUNCIOS = {
  CINCO_MINUTOS: 'Te quedan 5 minutos para completar tu compra.',
  UN_MINUTO: 'Te queda 1 minuto para completar tu compra.',
  VENCIDO: 'Se terminó el tiempo para completar tu compra.',
}

// Tiempo para completar la compra. Se muestra debajo del header en todas las páginas mientras haya una compra
// en curso (butacas, candy, ingresar o registrarse, pago). Al vencer, vacía la compra y avisa con un diálogo.
export default function TemporizadorCompra() {
  const compra = useCompra()
  const { vencimiento, extensionUsada, funcion, butacas, idReserva, pagando, expirarCompra, funcionVencida, cerrarAvisoVencimiento } = compra
  const { segundosRestantes, vencido } = useCuentaRegresiva(vencimiento)
  const { mostrarToast } = useToast()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const barraRef = useRef(null)

  // Al vencer se vacía la compra. Si en ese momento se está procesando un pago, no se corta:
  // el control se hace antes de empezar a pagar.
  useEffect(() => {
    if (vencido && !pagando) expirarCompra()
  }, [vencido, pagando, expirarCompra])

  async function pedirMasTiempo() {
    const nuevoVencimiento = compra.extenderTiempo()
    if (!nuevoVencimiento) return
    mostrarToast({ tipo: 'exito', mensaje: 'Listo: sumaste 5 minutos para completar tu compra.' })
    barraRef.current?.focus() // el botón desaparece: el foco pasa a la barra para no perderse
    // La retención de las butacas también se extiende.
    retenerButacas({ idReserva, funcionId: funcion.id, asientoIds: butacas.map((b) => b.id), vencimiento: nuevoVencimiento }).catch(() => {})
  }

  function volverAElegir() {
    const funcionId = funcionVencida
    cerrarAvisoVencimiento()
    navigate(`/compra/${funcionId}/butacas`)
  }

  const urgente = segundosRestantes !== null && segundosRestantes <= SEGUNDOS_AVISO
  const enLaCompra = pathname.startsWith('/compra/')

  return (
    <>
      {segundosRestantes !== null && (
        <section
          ref={barraRef}
          tabIndex={-1}
          className={`${estilos.barra} ${urgente ? estilos.urgente : ''}`}
          aria-label="Tiempo para completar la compra"
        >
          <div className={`contenedor ${estilos.contenido}`}>
            <p className={estilos.texto}>
              <Icon nombre={urgente ? 'alerta' : 'reloj'} tamano={18} />
              <span>
                Tenés <strong className={estilos.tiempo}>{formatearCuentaRegresiva(segundosRestantes)}</strong> para completar tu
                compra
                {urgente && '. Si no terminás a tiempo, se liberan las butacas.'}
              </span>
            </p>
            <div className={estilos.acciones}>
              {urgente && !extensionUsada && (
                <Button variante="secundario" tamano="sm" onClick={pedirMasTiempo}>
                  Necesito más tiempo
                </Button>
              )}
              {!enLaCompra && funcion && (
                <Link to="/compra/candy" className={estilos.volver}>
                  Seguir con tu compra
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Región viva siempre presente: el texto cambia solo en los hitos (5 min, 1 min y vencido) */}
      <p className="visually-hidden" aria-live="polite">
        {ANUNCIOS[hitoDelTemporizador(segundosRestantes)] ?? ''}
      </p>

      <Dialog abierto={funcionVencida !== null} onCerrar={cerrarAvisoVencimiento} titulo="Se terminó el tiempo">
        <p className={estilos.mensaje}>Se terminó el tiempo para completar tu compra. Las butacas se liberaron.</p>
        <p className={estilos.mensaje}>Si querés, podés volver a elegir butacas para la misma función.</p>
        <div className={estilos.botonesDialogo}>
          <Button variante="secundario" onClick={cerrarAvisoVencimiento}>
            Cerrar
          </Button>
          <Button onClick={volverAElegir}>Volver a elegir butacas</Button>
        </div>
      </Dialog>
    </>
  )
}
