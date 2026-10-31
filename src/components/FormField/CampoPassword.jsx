import { useState } from 'react'
import FormField from './FormField.jsx'
import Icon from '../Icon/Icon.jsx'
import estilos from './FormField.module.css'

// Campo de contraseña con un botón para mostrarla u ocultarla (botón de alternar con aria-pressed).
export default function CampoPassword(props) {
  const [visible, setVisible] = useState(false)
  return (
    <FormField
      {...props}
      type={visible ? 'text' : 'password'}
      adorno={
        <button
          type="button"
          className={estilos.adorno}
          aria-pressed={visible}
          aria-label={`Mostrar ${props.etiqueta.toLowerCase()}`}
          onClick={() => setVisible((v) => !v)}
        >
          <Icon nombre={visible ? 'ojoTachado' : 'ojo'} />
        </button>
      }
    />
  )
}
