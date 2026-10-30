import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PosterImagen from '../../components/PosterImagen/PosterImagen.jsx'
import FiltroChips from '../../components/FiltroChips/FiltroChips.jsx'
import Button from '../../components/Button/Button.jsx'
import { Clasificacion } from '../../components/Etiquetas/Etiquetas.jsx'
import { Cargando, Skeleton, ErrorState, EmptyState } from '../../components/Estados/Estados.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getPelicula, getFunciones } from '../../services/api.js'
import { funcionesVigentes } from '../../utils/cartelera.js'
import { agruparPorFormato, precioDesde } from '../../utils/compra.js'
import {
  describirDia,
  etiquetaDiaCompleta,
  etiquetaFormato,
  FORMATOS,
  formatearDuracion,
  formatearFechaLarga,
  formatearHora,
  formatearPrecio,
  proximosDias,
  aFechaISO,
} from '../../utils/formato.js'
import estilos from './Pelicula.module.css'

export default function Pelicula() {
  const { id } = useParams()
  const cargarPelicula = useCallback(() => Promise.all([getPelicula(id), getFunciones({ peliculaId: id })]), [id])
  const { datos, error, cargando, reintentar } = useAsync(cargarPelicula)
  useDocumentTitle(datos ? datos[0].nombre : error?.status === 404 ? 'Película no encontrada' : 'Película')

  if (cargando) return <PeliculaCargando />

  if (error) {
    const noExiste = error.status === 404
    return (
      <div className="contenedor">
        <h1 className="visually-hidden">{noExiste ? 'Película no encontrada' : 'Error al cargar la película'}</h1>
        <div className={estilos.espacio}>
          <ErrorState
            titulo={noExiste ? 'No encontramos esa película' : 'No pudimos cargar la película'}
            error={error}
            onReintentar={noExiste ? undefined : reintentar}
            accion={<Button to="/" variante={noExiste ? 'primario' : 'texto'}>Volver a la cartelera</Button>}
          />
        </div>
      </div>
    )
  }

  const [pelicula, funciones] = datos
  return <FichaPelicula pelicula={pelicula} funciones={funcionesVigentes(funciones)} />
}

function FichaPelicula({ pelicula, funciones }) {
  const dias = proximosDias(7)
  const diasConFunciones = dias.filter((dia) => funciones.some((f) => f.fechaFuncion === dia))
  // Si el usuario todavía no eligió un día, se muestra el primero que tenga funciones (valor derivado, sin efecto).
  const [diaElegido, setDiaElegido] = useState(null)
  const dia = diaElegido ?? diasConFunciones[0] ?? null
  const funcionesDelDia = funciones.filter((f) => f.fechaFuncion === dia)
  const grupos = agruparPorFormato(funcionesDelDia)
  const estrenada = pelicula.fechaEstreno <= aFechaISO(new Date())

  const opcionesDia = dias.map((fecha) => {
    const { nombre, numero, mes } = describirDia(fecha)
    const cantidad = funciones.filter((f) => f.fechaFuncion === fecha).length
    return {
      valor: fecha,
      deshabilitado: cantidad === 0,
      etiquetaAccesible: `${etiquetaDiaCompleta(fecha)}, ${cantidad === 0 ? 'sin funciones' : `${cantidad} funciones`}`,
      contenido: (
        <>
          <span>{nombre}</span>
          <strong>{numero}</strong>
          <span>{mes}</span>
        </>
      ),
    }
  })

  return (
    <div className="contenedor">
      <nav aria-label="Ruta de navegación" className={estilos.migas}>
        <Link to="/">Cartelera</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{pelicula.nombre}</span>
      </nav>

      <article className={estilos.ficha}>
        <PosterImagen pelicula={pelicula} tamano="grande" prioridad className={estilos.poster} />
        <div className={estilos.info}>
          <h1 className={estilos.titulo}>{pelicula.nombre}</h1>
          <p className={estilos.meta}>
            <Clasificacion valor={pelicula.clasificacionEdad} />
            <span>{formatearDuracion(pelicula.duracion)}</span>
            <span aria-hidden="true">·</span>
            <span>{pelicula.genero}</span>
            <span aria-hidden="true">·</span>
            <span>{pelicula.idioma}</span>
          </p>
          <p className={estilos.sinopsis}>{pelicula.sinopsis}</p>
          <dl className={estilos.datos}>
            <div>
              <dt>Dirección</dt>
              <dd>{pelicula.director}</dd>
            </div>
            <div>
              <dt>Estreno</dt>
              <dd>{formatearFechaLarga(pelicula.fechaEstreno)} de {pelicula.fechaEstreno.slice(0, 4)}</dd>
            </div>
          </dl>
        </div>
      </article>

      <section aria-labelledby="funciones-titulo" className={estilos.funciones}>
        <h2 id="funciones-titulo" className={estilos.tituloSeccion}>
          Funciones
        </h2>

        {funciones.length === 0 ? (
          <EmptyState
            icono="calendario"
            titulo={estrenada ? 'No hay funciones en los próximos días' : 'Todavía no hay funciones'}
            descripcion={
              estrenada
                ? 'Volvé a mirar en unos días: la cartelera se renueva todas las semanas.'
                : `Se estrena el ${formatearFechaLarga(pelicula.fechaEstreno)}. Las entradas salen a la venta unos días antes.`
            }
            nivelTitulo={3}
          >
            <Button to="/" variante="secundario">
              Ver otras películas
            </Button>
          </EmptyState>
        ) : (
          <>
            <FiltroChips
              etiqueta="Elegí el día"
              variante="dia"
              opciones={opcionesDia}
              seleccionados={[dia]}
              onAlternar={setDiaElegido}
            />
            <p className={estilos.diaElegido} aria-live="polite">
              Funciones del <span className={estilos.capitalizar}>{formatearFechaLarga(dia)}</span>
            </p>
            <div className={estilos.grupos}>
              {FORMATOS.filter((formato) => grupos[formato]).map((formato) => (
                <section key={formato} className={estilos.grupo} aria-labelledby={`formato-${formato}`}>
                  <div className={estilos.grupoCabecera}>
                    <h3 id={`formato-${formato}`} className={estilos.formato}>
                      {etiquetaFormato(formato)}
                    </h3>
                    <p className={estilos.desde}>Desde {formatearPrecio(precioDesde(grupos[formato]))}</p>
                  </div>
                  <ul className={estilos.horarios}>
                    {grupos[formato].map((funcion) => (
                      <li key={funcion.id}>
                        <Link
                          to={`/compra/${funcion.id}/butacas`}
                          className={estilos.horario}
                          aria-label={`${formatearHora(funcion.horaFuncion)} h, ${funcion.salaNombre}, ${etiquetaFormato(formato)}, ${formatearPrecio(funcion.precio)}. Elegir butacas`}
                        >
                          <span className={estilos.hora}>{formatearHora(funcion.horaFuncion)}</span>
                          <span className={estilos.sala}>{funcion.salaNombre}</span>
                          <span className={estilos.precio}>{formatearPrecio(funcion.precio)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function PeliculaCargando() {
  return (
    <div className="contenedor">
      <h1 className="visually-hidden">Cargando película</h1>
      <Cargando texto="Cargando la película...">
        <div className={`${estilos.ficha} ${estilos.espacio}`}>
          <Skeleton alto="auto" className={estilos.posterSkeleton} />
          <div className={estilos.info}>
            <Skeleton alto="3rem" ancho="70%" />
            <Skeleton alto="1rem" ancho="50%" />
            <Skeleton alto="5rem" />
            <Skeleton alto="1rem" ancho="40%" />
          </div>
        </div>
      </Cargando>
    </div>
  )
}
