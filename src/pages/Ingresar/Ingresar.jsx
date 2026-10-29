import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField/FormField.jsx'
import CampoPassword from '../../components/FormField/CampoPassword.jsx'
import ErrorSummary from '../../components/FormField/ErrorSummary.jsx'
import Button from '../../components/Button/Button.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { useFormulario } from '../../hooks/useFormulario.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { validarLogin } from '../../utils/validaciones.js'
import estilos from './Ingresar.module.css'

const ETIQUETAS = { mail: 'Mail', password: 'Contraseña' }

// Usuario de prueba de database/02_datos.sql (Ana es socia GOLD).
const USUARIO_DEMO = { mail: 'ana@mail.com', password: 'ana1234' }

export default function Ingresar() {
  useDocumentTitle('Ingresar')
  const navigate = useNavigate()
  const location = useLocation()
  const { iniciarSesion } = useAuth()
  const { mostrarToast } = useToast()
  const { valores, errores, intentosEnvio, manejarCambio, manejarBlur, validarAlEnviar, setValores } = useFormulario(
    { mail: '', password: '' },
    validarLogin,
  )
  const [procesando, setProcesando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)
  // Si llegó redirigido (por ejemplo, desde el pago), después del login vuelve a esa pantalla.
  const destino = location.state?.from ?? '/'

  async function ingresar(evento) {
    evento.preventDefault()
    setErrorServidor(null)
    if (!validarAlEnviar()) return
    setProcesando(true)
    try {
      const usuario = await iniciarSesion(valores)
      mostrarToast({ tipo: 'exito', mensaje: `¡Hola, ${usuario.nombreApellido.split(' ')[0]}! Ya iniciaste sesión.` })
      navigate(destino, { replace: true })
    } catch (error) {
      setErrorServidor(error.status === 401 ? 'El mail o la contraseña no son correctos. Revisalos y probá de nuevo.' : error.message)
      setProcesando(false)
    }
  }

  return (
    <div className={`contenedor ${estilos.pagina}`}>
      <div className={estilos.tarjeta}>
        <h1 className={estilos.titulo}>Ingresá a tu cuenta</h1>
        <p className={estilos.bajada}>Necesitás una cuenta para pagar tus entradas y ver tus compras.</p>

        <aside className={estilos.demo} aria-labelledby="demo-titulo">
          <h2 id="demo-titulo" className={estilos.demoTitulo}>
            <Icon nombre="info" tamano={18} />
            Usuario de prueba
          </h2>
          <p>
            Mail <strong>{USUARIO_DEMO.mail}</strong> · Contraseña <strong>{USUARIO_DEMO.password}</strong> (socia GOLD del club).
          </p>
          <Button variante="texto" tamano="sm" onClick={() => setValores(USUARIO_DEMO)}>
            Completar con el usuario de prueba
          </Button>
        </aside>

        <form className={estilos.formulario} onSubmit={ingresar} noValidate>
          <ErrorSummary errores={errores} etiquetas={ETIQUETAS} visible={intentosEnvio} />
          {errorServidor && (
            <p className={estilos.errorServidor} role="alert">
              <Icon nombre="alerta" />
              {errorServidor}
            </p>
          )}
          <FormField
            id="mail"
            etiqueta={ETIQUETAS.mail}
            type="email"
            obligatorio
            autoComplete="email"
            value={valores.mail}
            onChange={manejarCambio}
            onBlur={manejarBlur}
            error={errores.mail}
          />
          <CampoPassword
            id="password"
            etiqueta={ETIQUETAS.password}
            obligatorio
            autoComplete="current-password"
            value={valores.password}
            onChange={manejarCambio}
            onBlur={manejarBlur}
            error={errores.password}
          />
          <Button type="submit" bloque tamano="lg" cargando={procesando} textoCargando="Ingresando...">
            Ingresar
          </Button>
        </form>

        <p className={estilos.alternativa}>
          ¿No tenés cuenta?{' '}
          <Link to="/registro" state={{ from: destino }}>
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
