import estilos from './PosterArt.module.css'

// Póster ilustrado solo con CSS (degradados y formas). No hay imágenes reales de películas.
// Es decorativo (aria-hidden): el título real de la película siempre está como texto fuera del póster.
// La paleta sale del id y el dibujo del género, así cada película tiene siempre el mismo póster.
const motivoPorGenero = {
  'ciencia ficción': 'planeta',
  animación: 'estrellas',
  drama: 'sol',
  suspenso: 'ondas',
  comedia: 'franjas',
  terror: 'luna',
}

const CANTIDAD_PALETAS = 8

export default function PosterArt({ pelicula, tamano = 'normal', className = '' }) {
  const paleta = `paleta${(pelicula.id % CANTIDAD_PALETAS) + 1}`
  const motivo = motivoPorGenero[pelicula.genero.toLowerCase()] ?? 'sol'

  return (
    <div className={`${estilos.poster} ${estilos[paleta]} ${estilos[tamano]} ${className}`} aria-hidden="true">
      <span className={`${estilos.motivo} ${estilos[motivo]}`} />
      <span className={estilos.titulo}>{pelicula.nombre}</span>
      <span className={estilos.pie}>Linterna Cines</span>
    </div>
  )
}
