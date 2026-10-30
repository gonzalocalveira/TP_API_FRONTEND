import { useState } from 'react'
import { urlFotoEquipo } from '../../utils/imagenes.js'
import estilos from './Avatar.module.css'

// "Uriel Garmendia" -> "UG"
const iniciales = (nombre) =>
  nombre
    .split(' ')
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

// Foto de un integrante del equipo, o un círculo con sus iniciales si la foto no existe o falla al cargar.
export default function Avatar({ nombre, archivo }) {
  const url = urlFotoEquipo(archivo)
  const [fallo, setFallo] = useState(false)

  if (!url || fallo) {
    return (
      <span className={`${estilos.avatar} ${estilos.iniciales}`} role="img" aria-label={nombre}>
        <span aria-hidden="true">{iniciales(nombre)}</span>
      </span>
    )
  }

  return (
    <img src={url} alt={nombre} width="400" height="400" loading="lazy" className={estilos.avatar} onError={() => setFallo(true)} />
  )
}
