import { useState } from 'react'
import FormField from '../../components/FormField/FormField.jsx'
import Button from '../../components/Button/Button.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { Formato } from '../../components/Etiquetas/Etiquetas.jsx'
import { EmptyState, ErrorState } from '../../components/Estados/Estados.jsx'
import { useFormulario } from '../../hooks/useFormulario.js'
import { getFunciones } from '../../services/api.js'
import { FRANJAS_HORARIAS, filtrarPorFranja, funcionesVigentes } from '../../utils/cartelera.js'
import { etiquetaDiaCompleta, formatearFechaLarga, formatearHora, formatearPrecio, proximosDias } from '../../utils/formato.js'
import estilos from './Cartelera.module.css'

const valoresIniciales = { peliculaId: '', fecha: '', franja: 'TODAS' }

function validarBusqueda({ peliculaId }) {
  return peliculaId ? {} : { peliculaId: 'Elegí una película para buscar sus funciones.' }
}

// Buscador de funciones: formulario controlado que consulta GET /api/funciones?peliculaId=&fecha=
// y después filtra por franja horaria (el back-end no tiene ese filtro).
export default function BuscadorFunciones({ peliculas }) {
  const { valores, errores, manejarCambio, manejarBlur, validarAlEnviar, setValores } = useFormulario(valoresIniciales, validarBusqueda)
  // estado: 'inicial' | 'cargando' | 'listo' | 'error'
  const [busqueda, setBusqueda] = useState({ estado: 'inicial', funciones: [], error: null })
  const dias = proximosDias(7)

  async function buscar(evento) {
    evento?.preventDefault()
    if (!validarAlEnviar()) return
    setBusqueda({ estado: 'cargando', funciones: [], error: null })
    try {
      const funciones = await getFunciones({ peliculaId: valores.peliculaId, fecha: valores.fecha || undefined })
      setBusqueda({ estado: 'listo', funciones: filtrarPorFranja(funcionesVigentes(funciones), valores.franja), error: null })
    } catch (error) {
      setBusqueda({ estado: 'error', funciones: [], error })
    }
  }

  function limpiar() {
    setValores(valoresIniciales)
    setBusqueda({ estado: 'inicial', funciones: [], error: null })
  }

  return (
    <section className={estilos.buscador} aria-labelledby="buscador-titulo">
      <h2 id="buscador-titulo" className={estilos.tituloSeccion}>
        Buscá tu función
      </h2>
      <form className={estilos.formBuscador} onSubmit={buscar} noValidate>
        <FormField
          como="select"
          id="peliculaId"
          etiqueta="Película"
          obligatorio
          value={valores.peliculaId}
          onChange={manejarCambio}
          onBlur={manejarBlur}
          error={errores.peliculaId}
        >
          <option value="">Elegí una película</option>
          {peliculas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </FormField>
        <FormField como="select" id="fecha" etiqueta="Día" value={valores.fecha} onChange={manejarCambio}>
          <option value="">Cualquier día</option>
          {dias.map((dia) => (
            <option key={dia} value={dia}>
              {etiquetaDiaCompleta(dia)}
            </option>
          ))}
        </FormField>
        <FormField como="select" id="franja" etiqueta="Horario" value={valores.franja} onChange={manejarCambio}>
          {Object.entries(FRANJAS_HORARIAS).map(([clave, franja]) => (
            <option key={clave} value={clave}>
              {franja.texto}
            </option>
          ))}
        </FormField>
        <Button type="submit" cargando={busqueda.estado === 'cargando'} textoCargando="Buscando..." className={estilos.botonBuscar}>
          <Icon nombre="buscar" tamano={18} />
          Buscar funciones
        </Button>
      </form>

      {/* Región viva: anuncia la cantidad de resultados cuando termina la búsqueda */}
      <p className="visually-hidden" aria-live="polite">
        {busqueda.estado === 'listo' ? `${busqueda.funciones.length} funciones encontradas` : ''}
      </p>
      <div className={estilos.resultados}>
        {busqueda.estado === 'error' && <ErrorState titulo="No pudimos buscar las funciones" error={busqueda.error} onReintentar={buscar} />}
        {busqueda.estado === 'listo' && busqueda.funciones.length === 0 && (
          <EmptyState icono="calendario" titulo="No hay funciones para esa búsqueda" descripcion="Probá con otro día u otro horario." nivelTitulo={3}>
            <Button variante="secundario" onClick={limpiar}>
              Limpiar búsqueda
            </Button>
          </EmptyState>
        )}
        {busqueda.estado === 'listo' && busqueda.funciones.length > 0 && (
          <>
            <div className={estilos.resultadosCabecera}>
              <h3>
                {busqueda.funciones.length === 1 ? 'Encontramos 1 función' : `Encontramos ${busqueda.funciones.length} funciones`}
              </h3>
              <Button variante="texto" tamano="sm" onClick={limpiar}>
                Limpiar búsqueda
              </Button>
            </div>
            <ul className={estilos.listaFunciones}>
              {busqueda.funciones.map((funcion) => (
                <li key={funcion.id} className={estilos.filaFuncion}>
                  <span className={estilos.filaHora}>{formatearHora(funcion.horaFuncion)}</span>
                  <span className={estilos.filaDatos}>
                    <span className={estilos.capitalizar}>{formatearFechaLarga(funcion.fechaFuncion)}</span>
                    <span>
                      {funcion.salaNombre} · <Formato valor={funcion.formatoFuncion} /> · {formatearPrecio(funcion.precio)}
                    </span>
                  </span>
                  <Button to={`/compra/${funcion.id}/butacas`} tamano="sm">
                    Elegir butacas
                    <span className="visually-hidden">
                      {' '}
                      para {funcion.peliculaNombre}, {formatearFechaLarga(funcion.fechaFuncion)} a las {formatearHora(funcion.horaFuncion)}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}
