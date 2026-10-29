import PosterArt from '../../components/PosterArt/PosterArt.jsx'
import Button from '../../components/Button/Button.jsx'
import { Clasificacion, Formato } from '../../components/Etiquetas/Etiquetas.jsx'
import { formatearDuracion } from '../../utils/formato.js'
import estilos from './Cartelera.module.css'

// Estreno destacado arriba de la cartelera.
export default function Destacado({ pelicula, formatos }) {
  return (
    <section className={estilos.destacado} aria-labelledby="destacado-titulo">
      <div className={`contenedor ${estilos.destacadoContenido}`}>
        <div className={estilos.destacadoTexto}>
          <p className={estilos.antetitulo}>Estreno destacado</p>
          <h2 id="destacado-titulo" className={estilos.destacadoTitulo}>
            {pelicula.nombre}
          </h2>
          <p className={estilos.destacadoMeta}>
            <Clasificacion valor={pelicula.clasificacionEdad} />
            <span>{formatearDuracion(pelicula.duracion)}</span>
            <span aria-hidden="true">·</span>
            <span>{pelicula.genero}</span>
            {formatos.map((formato) => (
              <Formato key={formato} valor={formato} />
            ))}
          </p>
          <p className={estilos.destacadoSinopsis}>{pelicula.sinopsis}</p>
          <p className={estilos.destacadoDirector}>Dirigida por {pelicula.director}</p>
          <div>
            <Button to={`/peliculas/${pelicula.id}`} tamano="lg">
              Comprá tus entradas
              <span className="visually-hidden"> para {pelicula.nombre}</span>
            </Button>
          </div>
        </div>
        <PosterArt pelicula={pelicula} tamano="grande" className={estilos.destacadoPoster} />
      </div>
    </section>
  )
}
