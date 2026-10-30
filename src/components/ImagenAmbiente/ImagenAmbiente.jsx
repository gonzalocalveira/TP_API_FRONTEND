import { useState } from 'react'
import { urlAmbiente } from '../../utils/imagenes.js'
import estilos from './ImagenAmbiente.module.css'

// Foto de ambiente (sala, butacas, pochoclos, candy). Es decorativa: alt="" para que el lector de pantalla la saltee.
// Si el archivo no existe o falla, no se muestra nada y el diseño sigue igual.
export default function ImagenAmbiente({ nombre, className = '' }) {
  const url = urlAmbiente(nombre)
  const [fallo, setFallo] = useState(false)
  if (!url || fallo) return null
  return (
    <img
      src={url}
      alt=""
      width="1600"
      height="900"
      loading="lazy"
      decoding="async"
      className={`${estilos.imagen} ${className}`}
      onError={() => setFallo(true)}
    />
  )
}
