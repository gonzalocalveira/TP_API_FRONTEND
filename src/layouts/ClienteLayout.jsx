import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header/Header.jsx'
import Footer from '../components/Footer/Footer.jsx'
import BannerSimulacion from '../components/BannerSimulacion/BannerSimulacion.jsx'
import { useToast } from '../hooks/useToast.js'
import estilos from './ClienteLayout.module.css'

// Estructura común de la vista de cliente: skip link, header con la navegación, <main> y footer.
// Más adelante se suman EmpleadoLayout y AdminLayout con su propia navegación.
export default function ClienteLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { mostrarToast } = useToast()
  const mainRef = useRef(null)
  const rutaAnterior = useRef(location.pathname)

  // Al cambiar de página se mueve el foco al <main>, para que el lector de pantalla anuncie el contenido nuevo
  // (junto con el document.title de cada página) y el teclado siga desde el principio del contenido.
  // Se enfoca <main> y no el <h1> porque muchas páginas reemplazan su h1 cuando terminan de cargar
  // y el foco se perdería; <main> es siempre el mismo elemento.
  // Se compara con la ruta anterior (y no con un "es la primera vez") para que funcione aunque StrictMode
  // ejecute el efecto dos veces: al cargar la página, el foco queda al principio, antes del skip link.
  useEffect(() => {
    if (rutaAnterior.current === location.pathname) return
    rutaAnterior.current = location.pathname
    window.scrollTo(0, 0)
    mainRef.current.focus({ preventScroll: true })
  }, [location.pathname])

  // Las redirecciones (por ejemplo, entrar a /compra/pago sin butacas) mandan un aviso en el state de la navegación.
  // Se muestra como toast y se borra del historial para que no vuelva a aparecer al recargar.
  const aviso = location.state?.aviso
  const ultimoAviso = useRef(null)
  useEffect(() => {
    // En desarrollo, StrictMode ejecuta los efectos dos veces: se recuerda la navegación para no repetir el toast.
    if (!aviso || ultimoAviso.current === location.key) return
    ultimoAviso.current = location.key
    mostrarToast(aviso)
    navigate(`${location.pathname}${location.search}`, { replace: true, state: { ...location.state, aviso: undefined } })
  }, [aviso, location.key, location.pathname, location.search, location.state, mostrarToast, navigate])

  return (
    <div className={estilos.pagina}>
      <a href="#contenido" className={estilos.skipLink}>
        Saltar al contenido
      </a>
      <BannerSimulacion />
      <Header />
      <main id="contenido" ref={mainRef} tabIndex={-1} className={estilos.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
