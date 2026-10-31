import { useState } from 'react'
import PosterArt from '../PosterArt/PosterArt.jsx'
import { urlPoster } from '../../utils/imagenes.js'
import estilos from './PosterImagen.module.css'

// Póster de una película: la imagen real si existe, o el póster dibujado con CSS si no.
// La URL viene en pelicula.posterUrl (mock) o, si la API real no la manda, se busca en src/assets/img.
// onError es el respaldo: si la imagen no carga, se guarda qué URL falló y se muestra el póster CSS.
export default function PosterImagen({ pelicula, tamano = 'normal', prioridad = false, className = '' }) {
  const url = pelicula.posterUrl ?? urlPoster(pelicula.id)
  const [urlFallida, setUrlFallida] = useState(null)

  if (!url || urlFallida === url) return <PosterArt pelicula={pelicula} tamano={tamano} className={className} />

  return (
    <img
      src={url}
      alt={`Póster de ${pelicula.nombre}`}
      width="600"
      height="900"
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
      className={`${estilos.poster} ${className}`}
      onError={() => setUrlFallida(url)}
    />
  )
}
