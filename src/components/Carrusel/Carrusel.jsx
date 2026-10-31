import { useRef, useState } from 'react'
import PosterImagen from '../PosterImagen/PosterImagen.jsx'
import Button from '../Button/Button.jsx'
import Icon from '../Icon/Icon.jsx'
import { Clasificacion, Formato } from '../Etiquetas/Etiquetas.jsx'
import { useCarrusel } from '../../hooks/useCarrusel.js'
import { formatearDuracion } from '../../utils/formato.js'
import { urlBanner } from '../../utils/imagenes.js'
import estilos from './Carrusel.module.css'

const UMBRAL_DESLIZAR = 50 // px que hay que deslizar el dedo para cambiar de slide

// Carrusel de películas destacadas, con el patrón accesible de WAI-ARIA:
//  - la sección tiene aria-roledescription="carrusel" y cada slide "diapositiva" con "1 de 5: Nombre";
//  - el botón de pausa va primero; después anterior, siguiente y los puntos para ir a cada slide;
//  - los slides que no se ven quedan inert (no reciben foco ni los lee el lector de pantalla);
//  - mientras avanza solo, la región es aria-live="off" para no interrumpir; al pausar pasa a "polite".
// Teclado: flechas izquierda y derecha cuando el foco está dentro del carrusel. En celular se puede deslizar.
export default function Carrusel({ peliculas, formatosPorPelicula }) {
  const cantidad = peliculas.length
  const carrusel = useCarrusel(cantidad)
  const inicioToque = useRef(null)
  const [bannersFallidos, setBannersFallidos] = useState([])

  function manejarTeclado(evento) {
    if (evento.key === 'ArrowRight') carrusel.siguiente()
    else if (evento.key === 'ArrowLeft') carrusel.anterior()
  }

  function finToque(evento) {
    if (inicioToque.current === null) return
    const distancia = evento.changedTouches[0].clientX - inicioToque.current
    if (distancia < -UMBRAL_DESLIZAR) carrusel.siguiente()
    else if (distancia > UMBRAL_DESLIZAR) carrusel.anterior()
    inicioToque.current = null
  }

  // El avance automático se pausa mientras el foco está adentro; se reanuda cuando el foco sale del carrusel.
  function manejarBlur(evento) {
    if (!evento.currentTarget.contains(evento.relatedTarget)) carrusel.setPausaTemporal(false)
  }

  return (
    <section
      className={estilos.carrusel}
      aria-roledescription="carrusel"
      aria-label="Películas destacadas"
      onMouseEnter={() => carrusel.setPausaTemporal(true)}
      onMouseLeave={() => carrusel.setPausaTemporal(false)}
      onFocus={() => carrusel.setPausaTemporal(true)}
      onBlur={manejarBlur}
      onKeyDown={manejarTeclado}
      onTouchStart={(e) => (inicioToque.current = e.touches[0].clientX)}
      onTouchEnd={finToque}
    >
      <div className={estilos.slides} aria-live={carrusel.avanzando ? 'off' : 'polite'}>
        {peliculas.map((pelicula, indice) => {
          const visible = indice === carrusel.actual
          const banner = pelicula.bannerUrl ?? urlBanner(pelicula.id)
          const conBanner = banner && !bannersFallidos.includes(pelicula.id)
          return (
            <div
              key={pelicula.id}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${indice + 1} de ${cantidad}: ${pelicula.nombre}`}
              inert={!visible}
              className={`${estilos.slide} ${visible ? estilos.visible : ''}`}
            >
              {conBanner && (
                <img
                  src={banner}
                  alt=""
                  width="1600"
                  height="900"
                  loading={indice === 0 ? 'eager' : 'lazy'}
                  fetchPriority={indice === 0 ? 'high' : undefined}
                  className={estilos.banner}
                  onError={() => setBannersFallidos((fallidos) => [...fallidos, pelicula.id])}
                />
              )}
              <div className={`contenedor ${estilos.contenido}`}>
                <div className={estilos.texto}>
                  <p className={estilos.antetitulo}>En cartelera</p>
                  <h2 className={estilos.titulo}>{pelicula.nombre}</h2>
                  <p className={estilos.meta}>
                    <Clasificacion valor={pelicula.clasificacionEdad} />
                    <span>{formatearDuracion(pelicula.duracion)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{pelicula.genero}</span>
                    {formatosPorPelicula[pelicula.id].map((formato) => (
                      <Formato key={formato} valor={formato} />
                    ))}
                  </p>
                  <p className={estilos.sinopsis}>{pelicula.sinopsis}</p>
                  <div>
                    <Button to={`/peliculas/${pelicula.id}`} tamano="lg">
                      Comprá tus entradas
                      <span className="visually-hidden"> para {pelicula.nombre}</span>
                    </Button>
                  </div>
                </div>
                <PosterImagen pelicula={pelicula} tamano="grande" prioridad={indice === 0} className={estilos.poster} />
              </div>
            </div>
          )
        })}
      </div>

      <div className={`contenedor ${estilos.controles}`}>
        <button
          type="button"
          className={estilos.control}
          aria-pressed={!carrusel.reproduciendo}
          aria-label="Pausar el carrusel"
          onClick={carrusel.alternarReproduccion}
        >
          <Icon nombre={carrusel.reproduciendo ? 'pausa' : 'reproducir'} tamano={18} />
        </button>
        <button type="button" className={estilos.control} aria-label="Película anterior" onClick={carrusel.anterior}>
          <Icon nombre="flechaIzquierda" tamano={18} />
        </button>
        <ul className={estilos.puntos}>
          {peliculas.map((pelicula, indice) => (
            <li key={pelicula.id}>
              <button
                type="button"
                className={estilos.punto}
                aria-label={`Ir a la película ${indice + 1}: ${pelicula.nombre}`}
                aria-current={indice === carrusel.actual ? 'true' : undefined}
                onClick={() => carrusel.irA(indice)}
              />
            </li>
          ))}
        </ul>
        <button type="button" className={estilos.control} aria-label="Película siguiente" onClick={carrusel.siguiente}>
          <Icon nombre="flechaDerecha" tamano={18} />
        </button>
      </div>
    </section>
  )
}
