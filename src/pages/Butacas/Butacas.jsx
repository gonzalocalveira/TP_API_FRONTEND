import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SeatMap, { SeatLegend } from '../../components/SeatMap/SeatMap.jsx'
import ResumenCompra from '../../components/ResumenCompra/ResumenCompra.jsx'
import EncabezadoPagina from '../../components/EncabezadoPagina/EncabezadoPagina.jsx'
import Button from '../../components/Button/Button.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { Cargando, Skeleton, ErrorState, EmptyState } from '../../components/Estados/Estados.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useCompra } from '../../hooks/useCompra.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getFuncion, getButacas } from '../../services/api.js'
import { MAX_BUTACAS, funcionYaEmpezo } from '../../utils/compra.js'
import { etiquetaFormato, formatearFechaLarga, formatearHora } from '../../utils/formato.js'
import estilosCompra from '../../layouts/CompraLayout.module.css'
import estilos from './Butacas.module.css'

export default function Butacas() {
  useDocumentTitle('Elegí tus butacas')
  const { funcionId } = useParams()
  const cargarSala = useCallback(() => Promise.all([getFuncion(funcionId), getButacas(funcionId)]), [funcionId])
  const { datos, error, cargando, reintentar } = useAsync(cargarSala)
  const { sincronizarFuncion } = useCompra()

  // Cuando llega el mapa, se guarda la función en la compra en curso y se descartan
  // las butacas elegidas que ahora figuran ocupadas (por ejemplo, después de un error 409 al pagar).
  useEffect(() => {
    if (datos) sincronizarFuncion(datos[0], datos[1])
  }, [datos, sincronizarFuncion])

  if (cargando) {
    return (
      <>
        <EncabezadoPagina titulo="Elegí tus butacas" />
        <Cargando texto="Cargando el mapa de la sala...">
          <Skeleton alto="420px" />
        </Cargando>
      </>
    )
  }

  if (error) {
    const noExiste = error.status === 404
    return (
      <>
        <EncabezadoPagina titulo="Elegí tus butacas" />
        <ErrorState
          titulo={noExiste ? 'Esa función no existe' : 'No pudimos cargar el mapa de la sala'}
          error={error}
          onReintentar={noExiste ? undefined : reintentar}
          accion={<Button to="/" variante="texto">Volver a la cartelera</Button>}
        />
      </>
    )
  }

  const [funcion, mapa] = datos
  if (funcionYaEmpezo(funcion)) {
    return (
      <>
        <EncabezadoPagina titulo="Elegí tus butacas" />
        <EmptyState icono="reloj" titulo="Esta función ya empezó" descripcion="Elegí otro horario para la misma película.">
          <Button to={`/peliculas/${funcion.peliculaId}`}>Ver otros horarios</Button>
        </EmptyState>
      </>
    )
  }

  return <SeleccionButacas funcion={funcion} mapa={mapa} />
}

function SeleccionButacas({ funcion, mapa }) {
  const navigate = useNavigate()
  const compra = useCompra()
  const [aviso, setAviso] = useState('')
  // Mientras el efecto de sincronización no corrió, la compra puede tener otra función: no se muestra su selección.
  const seleccion = compra.funcion?.id === funcion.id ? compra.butacas : []

  function manejarButaca(butaca) {
    const yaElegida = seleccion.some((b) => b.id === butaca.id)
    if (!yaElegida && seleccion.length >= MAX_BUTACAS) {
      setAviso(`Llegaste al máximo de ${MAX_BUTACAS} butacas por compra. Para cambiar una, primero tocá una de las elegidas para liberarla.`)
      return
    }
    setAviso('')
    compra.alternarButaca(butaca)
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Elegí tus butacas"
        descripcion={`${funcion.peliculaNombre} · ${formatearFechaLarga(funcion.fechaFuncion)}, ${formatearHora(funcion.horaFuncion)} h · ${funcion.salaNombre} · ${etiquetaFormato(funcion.formatoFuncion)}`}
      >
        <Link to={`/peliculas/${funcion.peliculaId}`} className={estilos.cambiar}>
          Cambiar de función
        </Link>
      </EncabezadoPagina>

      <div className={estilosCompra.grilla}>
        <section className={estilosCompra.principal} aria-labelledby="mapa-titulo">
          <h2 id="mapa-titulo" className="visually-hidden">
            Mapa de la sala
          </h2>
          <p className={estilos.instrucciones}>
            Tocá una butaca para elegirla y otra vez para liberarla. Podés elegir hasta {MAX_BUTACAS}. Con el teclado, usá Tab o
            las flechas para moverte y Enter o Espacio para elegir.
          </p>
          <div aria-live="polite" className={estilosCompra.aviso}>
            {aviso && (
              <>
                <Icon nombre="alerta" />
                <span>{aviso}</span>
              </>
            )}
          </div>
          <SeatMap butacas={mapa} seleccionadas={seleccion} onAlternar={manejarButaca} />
          <SeatLegend />
        </section>

        <ResumenCompra
          funcion={funcion}
          butacas={seleccion}
          candy={compra.candy}
          accion={
            <>
              <Button bloque tamano="lg" disabled={seleccion.length === 0} onClick={() => navigate('/compra/candy')}>
                Continuar
              </Button>
              {seleccion.length === 0 && <p className={estilos.ayuda}>Elegí al menos una butaca para continuar.</p>}
            </>
          }
        />
      </div>
    </>
  )
}
