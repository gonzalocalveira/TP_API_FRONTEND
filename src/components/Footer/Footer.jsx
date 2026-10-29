import { startTransition, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../Button/Button.jsx'
import { ConfirmDialog } from '../Dialog/Dialog.jsx'
import { USANDO_MOCKS, resetearDatosPrueba } from '../../services/api.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useCompra } from '../../hooks/useCompra.js'
import estilos from './Footer.module.css'

export default function Footer() {
  const [confirmando, setConfirmando] = useState(false)
  const { cerrarSesion } = useAuth()
  const { reiniciarCompra } = useCompra()
  const navigate = useNavigate()

  // Borra las compras y usuarios creados durante la demo y vuelve a la cartelera.
  // La sesión se cierra dentro de una transición, igual que la navegación, para que React aplique los dos cambios
  // juntos; si no, estando en una página protegida (Mis compras) RequireAuth redirigiría a /ingresar.
  function resetear() {
    setConfirmando(false)
    resetearDatosPrueba()
    navigate('/', { state: { aviso: { tipo: 'exito', mensaje: 'Listo: se restablecieron los datos de prueba.' } } })
    startTransition(() => {
      cerrarSesion()
      reiniciarCompra()
    })
  }

  return (
    <footer className={estilos.footer}>
      <div className={`contenedor ${estilos.grilla}`}>
        <section aria-labelledby="footer-marca">
          <h2 id="footer-marca" className={estilos.marca}>
            Linterna <span className={estilos.acento}>Cines</span>
          </h2>
          <p className={estilos.texto}>Av. de los Proyectores 1895, CABA.</p>
          <p className={estilos.texto}>Boletería abierta todos los días de 12 a 24 h.</p>
        </section>

        <nav aria-labelledby="footer-nav">
          <h2 id="footer-nav" className={estilos.titulo}>
            Explorá
          </h2>
          <ul className={estilos.lista}>
            <li>
              <Link to="/">Cartelera</Link>
            </li>
            <li>
              <Link to="/promociones">Promociones</Link>
            </li>
            <li>
              <Link to="/candy">Candy</Link>
            </li>
            <li>
              <Link to="/mis-compras">Mis compras</Link>
            </li>
          </ul>
        </nav>

        {USANDO_MOCKS && (
          <section aria-labelledby="footer-demo">
            <h2 id="footer-demo" className={estilos.titulo}>
              Datos de prueba
            </h2>
            <p className={estilos.texto}>
              La app usa datos simulados. Las compras y los usuarios nuevos se guardan en este navegador.
            </p>
            <Button variante="secundario" tamano="sm" onClick={() => setConfirmando(true)} className={estilos.boton}>
              Restablecer datos de prueba
            </Button>
          </section>
        )}
      </div>
      <p className={`contenedor ${estilos.legal}`}>
        Cine ficticio. Proyecto académico de Aplicaciones Interactivas, UADE, 2026. Las películas nuevas, los precios y las
        promociones son inventados.
      </p>

      <ConfirmDialog
        abierto={confirmando}
        titulo="¿Restablecer los datos de prueba?"
        mensaje="Se van a borrar todas las compras y los usuarios que creaste en esta demo, y se va a cerrar tu sesión."
        textoConfirmar="Sí, restablecer"
        onConfirmar={resetear}
        onCerrar={() => setConfirmando(false)}
      />
    </footer>
  )
}
