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
import { validarRegistro, soloDigitos } from '../../utils/validaciones.js'
import { aFechaISO } from '../../utils/formato.js'
import estilos from '../Ingresar/Ingresar.module.css'

const ETIQUETAS = {
  nombreApellido: 'Nombre y apellido',
  dni: 'DNI',
  fechaNacimiento: 'Fecha de nacimiento',
  mail: 'Mail',
  password: 'Contraseña',
  confirmarPassword: 'Repetí la contraseña',
}

const valoresIniciales = { nombreApellido: '', dni: '', fechaNacimiento: '', mail: '', password: '', confirmarPassword: '' }

// Registro de un CLIENTE no socio (POST /api/usuarios). Las reglas de validación son las del back-end.
export default function Registro() {
  useDocumentTitle('Crear cuenta')
  const navigate = useNavigate()
  const location = useLocation()
  const { registrarse } = useAuth()
  const { mostrarToast } = useToast()
  const { valores, errores, intentosEnvio, manejarCambio, manejarBlur, validarAlEnviar, cambiarValor } = useFormulario(
    valoresIniciales,
    validarRegistro,
  )
  const [procesando, setProcesando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)
  const destino = location.state?.from ?? '/'

  async function registrar(evento) {
    evento.preventDefault()
    setErrorServidor(null)
    if (!validarAlEnviar()) return
    setProcesando(true)
    try {
      // confirmarPassword es solo del front: no se manda al back-end.
      const { confirmarPassword, ...datos } = valores
      await registrarse(datos)
      mostrarToast({ tipo: 'exito', mensaje: '¡Listo! Creaste tu cuenta y ya iniciaste sesión.' })
      navigate(destino, { replace: true })
    } catch (error) {
      // 409: el mail o el DNI ya están registrados (mensaje del servidor).
      setErrorServidor(error.message)
      setProcesando(false)
    }
  }

  const propsCampo = (campo) => ({
    id: campo,
    etiqueta: ETIQUETAS[campo],
    obligatorio: true,
    value: valores[campo],
    onChange: manejarCambio,
    onBlur: manejarBlur,
    error: errores[campo],
  })

  return (
    <div className={`contenedor ${estilos.pagina}`}>
      <div className={estilos.tarjeta}>
        <h1 className={estilos.titulo}>Creá tu cuenta</h1>
        <p className={estilos.bajada}>Con tu cuenta comprás entradas y ves tu historial. Los campos con * son obligatorios.</p>

        <form className={estilos.formulario} onSubmit={registrar} noValidate>
          <ErrorSummary errores={errores} etiquetas={ETIQUETAS} visible={intentosEnvio} />
          {errorServidor && (
            <p className={estilos.errorServidor} role="alert">
              <Icon nombre="alerta" />
              {errorServidor}
            </p>
          )}
          <FormField {...propsCampo('nombreApellido')} autoComplete="name" />
          <div className={estilos.fila}>
            <FormField
              {...propsCampo('dni')}
              ayuda="Sin puntos."
              inputMode="numeric"
              autoComplete="off"
              onChange={(e) => cambiarValor('dni', soloDigitos(e.target.value).slice(0, 8))}
            />
            <FormField {...propsCampo('fechaNacimiento')} type="date" max={aFechaISO(new Date())} autoComplete="bday" />
          </div>
          <FormField {...propsCampo('mail')} type="email" autoComplete="email" />
          <CampoPassword {...propsCampo('password')} ayuda="Entre 4 y 100 caracteres." autoComplete="new-password" />
          <CampoPassword {...propsCampo('confirmarPassword')} autoComplete="new-password" />
          <Button type="submit" bloque tamano="lg" cargando={procesando} textoCargando="Creando tu cuenta...">
            Crear cuenta
          </Button>
        </form>

        <p className={estilos.alternativa}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/ingresar" state={{ from: destino }}>
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  )
}
