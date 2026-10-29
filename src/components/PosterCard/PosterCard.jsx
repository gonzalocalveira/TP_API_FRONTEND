import { Link } from 'react-router-dom'
import PosterArt from '../PosterArt/PosterArt.jsx'
import { Clasificacion, Formato } from '../Etiquetas/Etiquetas.jsx'
import { formatearDuracion } from '../../utils/formato.js'
import estilos from './PosterCard.module.css'

// Tarjeta de película. Toda la tarjeta es clickeable, pero el único elemento interactivo es el link del título
// (se estira con CSS), así el lector de pantalla y el teclado encuentran un solo link por película.
export default function PosterCard({ pelicula, formatos = [], detalle, nivelTitulo = 3 }) {
  const Titulo = `h${nivelTitulo}`
  return (
    <article className={estilos.tarjeta}>
      <PosterArt pelicula={pelicula} />
      <div className={estilos.cuerpo}>
        <Titulo className={estilos.titulo}>
          <Link to={`/peliculas/${pelicula.id}`} className={estilos.enlace}>
            {pelicula.nombre}
          </Link>
        </Titulo>
        <p className={estilos.meta}>
          <Clasificacion valor={pelicula.clasificacionEdad} />
          <span>{formatearDuracion(pelicula.duracion)}</span>
          <span aria-hidden="true">·</span>
          <span>{pelicula.genero}</span>
        </p>
        {formatos.length > 0 && (
          <ul className={estilos.formatos} aria-label="Formatos disponibles">
            {formatos.map((formato) => (
              <li key={formato}>
                <Formato valor={formato} />
              </li>
            ))}
          </ul>
        )}
        {detalle && <p className={estilos.detalle}>{detalle}</p>}
      </div>
    </article>
  )
}
