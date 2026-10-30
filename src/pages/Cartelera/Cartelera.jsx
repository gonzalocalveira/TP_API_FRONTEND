import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import Carrusel from '../../components/Carrusel/Carrusel.jsx'
import BuscadorFunciones from './BuscadorFunciones.jsx'
import PosterCard from '../../components/PosterCard/PosterCard.jsx'
import PromoCard from '../../components/PromoCard/PromoCard.jsx'
import FiltroChips from '../../components/FiltroChips/FiltroChips.jsx'
import Button from '../../components/Button/Button.jsx'
import { Cargando, Skeleton, ErrorState, EmptyState } from '../../components/Estados/Estados.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getPeliculas, getFunciones, getPromociones } from '../../services/api.js'
import { separarCartelera, funcionesVigentes, formatosDePelicula, filtrarPeliculas, elegirDestacadas } from '../../utils/cartelera.js'
import { FORMATOS, etiquetaFormato, proximosDias, describirDia, formatearFechaLarga } from '../../utils/formato.js'
import estilos from './Cartelera.module.css'

const TODOS_LOS_DIAS = 'TODOS'

export default function Cartelera() {
  useDocumentTitle('Cartelera')
  const cargarCartelera = useCallback(() => Promise.all([getPeliculas(), getFunciones(), getPromociones()]), [])
  const { datos, error, cargando, reintentar } = useAsync(cargarCartelera)

  return (
    <>
      <h1 className="visually-hidden">CineManagerPro: cartelera y venta de entradas</h1>
      {cargando && <CarteleraCargando />}
      {error && (
        <div className="contenedor">
          <ErrorState titulo="No pudimos cargar la cartelera" error={error} onReintentar={reintentar} />
        </div>
      )}
      {datos && <CarteleraContenido peliculas={datos[0]} funciones={datos[1]} promociones={datos[2]} />}
    </>
  )
}

function CarteleraContenido({ peliculas, funciones, promociones }) {
  const [formatos, setFormatos] = useState([])
  const [dia, setDia] = useState(null)

  const vigentes = funcionesVigentes(funciones)
  const { enCartelera, proximamente } = separarCartelera(peliculas)
  const destacadas = elegirDestacadas(enCartelera, vigentes)
  const formatosPorPelicula = Object.fromEntries(enCartelera.map((p) => [p.id, formatosDePelicula(vigentes, p.id)]))
  const filtradas = filtrarPeliculas(enCartelera, vigentes, { formatos, dia })
  const hayFiltros = formatos.length > 0 || dia !== null

  function alternarFormato(formato) {
    setFormatos((actuales) => (actuales.includes(formato) ? actuales.filter((f) => f !== formato) : [...actuales, formato]))
  }

  function elegirDia(valor) {
    setDia(valor === TODOS_LOS_DIAS ? null : valor)
  }

  function limpiarFiltros() {
    setFormatos([])
    setDia(null)
  }

  const opcionesDia = [
    { valor: TODOS_LOS_DIAS, texto: 'Todos' },
    ...proximosDias(7).map((fecha) => {
      const { nombre, numero } = describirDia(fecha)
      return { valor: fecha, texto: `${nombre} ${numero}`, etiquetaAccesible: formatearFechaLarga(fecha) }
    }),
  ]

  return (
    <>
      {destacadas.length > 0 && <Carrusel peliculas={destacadas} formatosPorPelicula={formatosPorPelicula} />}

      <div className={`contenedor ${estilos.secciones}`}>
        <BuscadorFunciones peliculas={enCartelera} />

        <section aria-labelledby="cartelera-titulo">
          <div className={estilos.cabeceraSeccion}>
            <h2 id="cartelera-titulo" className={estilos.tituloSeccion}>
              En cartelera
            </h2>
            <p className={estilos.contador} aria-live="polite">
              {filtradas.length === 1 ? '1 película' : `${filtradas.length} películas`}
            </p>
          </div>

          <div className={estilos.filtros}>
            <FiltroChips
              etiqueta="Formato"
              opciones={FORMATOS.map((f) => ({ valor: f, texto: etiquetaFormato(f) }))}
              seleccionados={formatos}
              onAlternar={alternarFormato}
            />
            <FiltroChips etiqueta="Día" opciones={opcionesDia} seleccionados={[dia ?? TODOS_LOS_DIAS]} onAlternar={elegirDia} />
            {hayFiltros && (
              <Button variante="texto" tamano="sm" onClick={limpiarFiltros} className={estilos.limpiar}>
                Limpiar filtros
              </Button>
            )}
          </div>

          {filtradas.length > 0 ? (
            <ul className={estilos.grilla}>
              {filtradas.map((pelicula) => (
                <li key={pelicula.id}>
                  <PosterCard pelicula={pelicula} formatos={formatosPorPelicula[pelicula.id]} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icono="buscar"
              titulo="No hay películas con esos filtros"
              descripcion="Probá con otro formato u otro día."
              nivelTitulo={3}
            >
              <Button variante="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            </EmptyState>
          )}
        </section>

        <section aria-labelledby="promos-titulo">
          <div className={estilos.cabeceraSeccion}>
            <h2 id="promos-titulo" className={estilos.tituloSeccion}>
              Promociones
            </h2>
            <Link to="/promociones" className={estilos.verTodas}>
              Ver todas las promociones
            </Link>
          </div>
          <ul className={estilos.grillaPromos}>
            {promociones
              .filter((p) => p.destacada)
              .map((promocion) => (
                <li key={promocion.id}>
                  <PromoCard promocion={promocion} />
                </li>
              ))}
          </ul>
        </section>

        {proximamente.length > 0 && (
          <section aria-labelledby="proximamente-titulo">
            <div className={estilos.cabeceraSeccion}>
              <h2 id="proximamente-titulo" className={estilos.tituloSeccion}>
                Próximamente
              </h2>
            </div>
            <ul className={estilos.grilla}>
              {proximamente.map((pelicula) => (
                <li key={pelicula.id}>
                  <PosterCard pelicula={pelicula} detalle={`Se estrena el ${formatearFechaLarga(pelicula.fechaEstreno)}`} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}

function CarteleraCargando() {
  return (
    <div className="contenedor">
      <Cargando texto="Cargando la cartelera...">
        <div className={estilos.destacadoSkeleton}>
          <Skeleton alto="2.5rem" ancho="60%" />
          <Skeleton alto="1rem" ancho="40%" />
          <Skeleton alto="4rem" />
          <Skeleton alto="3rem" ancho="12rem" redondo />
        </div>
        <ul className={estilos.grilla}>
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <Skeleton alto="auto" className={estilos.posterSkeleton} />
              <Skeleton alto="1rem" ancho="80%" />
            </li>
          ))}
        </ul>
      </Cargando>
    </div>
  )
}
