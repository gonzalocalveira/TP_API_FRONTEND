import { startTransition, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Icon from '../Icon/Icon.jsx'
import Button from '../Button/Button.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import estilos from './Header.module.css'

// Header con la navegación principal. En celular el menú se colapsa detrás de un botón
// con aria-expanded / aria-controls; en pantallas grandes se muestra siempre.
export default function Header() {
  const { usuario, cerrarSesion } = useAuth()
  const { mostrarToast } = useToast()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const botonMenuRef = useRef(null)

  const enlaces = [
    { to: '/', texto: 'Cartelera', end: true },
    { to: '/candy', texto: 'Candy' },
    { to: '/promociones', texto: 'Promociones' },
    ...(usuario
      ? [
          { to: '/mis-compras', texto: 'Mis compras' },
          { to: '/membresia', texto: 'Mi cuenta' },
        ]
      : []),
  ]

  const cerrarMenu = () => setMenuAbierto(false)

  // La navegación de React Router es una transición. Cerrar la sesión dentro de otra transición hace que React
  // aplique los dos cambios juntos; si no, estando en una página protegida RequireAuth mandaría a /ingresar.
  function salir() {
    cerrarMenu()
    navigate('/')
    startTransition(() => cerrarSesion())
    mostrarToast({ tipo: 'info', mensaje: 'Cerraste sesión. ¡Te esperamos pronto!' })
  }

  // Esc cierra el menú en celular y devuelve el foco al botón que lo abrió.
  function manejarTeclado(evento) {
    if (evento.key === 'Escape' && menuAbierto) {
      cerrarMenu()
      botonMenuRef.current?.focus()
    }
  }

  return (
    <header className={estilos.header}>
      <div className={`contenedor ${estilos.barra}`}>
        <Link to="/" className={estilos.logo} onClick={cerrarMenu}>
          <Icon nombre="linterna" tamano={28} className={estilos.logoIcono} />
          <span>
            Linterna <span className={estilos.logoAcento}>Cines</span>
          </span>
        </Link>

        <button
          ref={botonMenuRef}
          type="button"
          className={estilos.botonMenu}
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          <Icon nombre={menuAbierto ? 'cerrar' : 'menu'} tamano={22} />
          <span>Menú</span>
        </button>

        <nav
          id="menu-principal"
          aria-label="Principal"
          className={`${estilos.nav} ${menuAbierto ? estilos.navAbierta : ''}`}
          onKeyDown={manejarTeclado}
        >
          <ul className={estilos.enlaces}>
            {enlaces.map((enlace) => (
              <li key={enlace.to}>
                {/* NavLink agrega aria-current="page" al link de la página actual */}
                <NavLink to={enlace.to} end={enlace.end} className={estilos.enlace} onClick={cerrarMenu}>
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className={estilos.sesion}>
            {usuario ? (
              <>
                <span className={estilos.saludo}>
                  <Icon nombre="usuario" tamano={18} />
                  Hola, {usuario.nombreApellido.split(' ')[0]}
                </span>
                <Button variante="secundario" tamano="sm" onClick={salir}>
                  <Icon nombre="salir" tamano={16} />
                  Salir
                </Button>
              </>
            ) : (
              <Button to="/ingresar" variante="secundario" tamano="sm" onClick={cerrarMenu}>
                <Icon nombre="usuario" tamano={16} />
                Ingresar
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
