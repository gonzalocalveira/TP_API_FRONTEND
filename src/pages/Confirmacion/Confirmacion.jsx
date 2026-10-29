import { useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import EncabezadoPagina from '../../components/EncabezadoPagina/EncabezadoPagina.jsx'
import QrDecorativo from '../../components/QrDecorativo/QrDecorativo.jsx'
import Button from '../../components/Button/Button.jsx'
import { EstadoCompra } from '../../components/Etiquetas/Etiquetas.jsx'
import { Cargando, Skeleton, ErrorState } from '../../components/Estados/Estados.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useCompra } from '../../hooks/useCompra.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getHistorial, ApiError } from '../../services/api.js'
import { MEDIOS_DE_PAGO } from '../../utils/validaciones.js'
import { subtotalCandy } from '../../utils/compra.js'
import { codigoReserva, formatearFechaLarga, formatearHora, formatearPrecio, listarButacas } from '../../utils/formato.js'
import estilos from './Confirmacion.module.css'

export default function Confirmacion() {
  useDocumentTitle('Compra confirmada')
  const { ticketId } = useParams()
  const { usuario } = useAuth()
  const { ultimaCompra, limpiarSeleccion } = useCompra()

  // La compra terminó: se limpia la selección para que una próxima compra empiece de cero.
  useEffect(() => {
    limpiarSeleccion()
  }, [limpiarSeleccion])

  // Si se acaba de comprar, los datos están en el contexto (incluido el candy, que el back-end no guarda).
  // Si se entra directo a la URL, se busca la compra en el historial del usuario.
  const enContexto = ultimaCompra?.compra.id === Number(ticketId) ? ultimaCompra : null
  const cargarCompra = useCallback(async () => {
    if (enContexto) return enContexto
    const historial = await getHistorial(usuario.id)
    const compra = historial.find((c) => c.id === Number(ticketId))
    if (!compra) throw new ApiError({ status: 404, message: 'No encontramos esa compra entre las tuyas.', path: `/compra/confirmacion/${ticketId}` })
    return { compra, candy: [], medioPago: null }
  }, [enContexto, usuario.id, ticketId])
  const { datos, error, cargando, reintentar } = useAsync(cargarCompra)

  if (cargando) {
    return (
      <>
        <EncabezadoPagina titulo="Tu compra" />
        <Cargando texto="Cargando tu compra...">
          <Skeleton alto="360px" />
        </Cargando>
      </>
    )
  }

  if (error) {
    return (
      <>
        <EncabezadoPagina titulo="Tu compra" />
        <ErrorState
          titulo="No pudimos mostrar la compra"
          error={error}
          onReintentar={error.status === 404 ? undefined : reintentar}
          accion={<Button to="/mis-compras" variante="texto">Ir a Mis compras</Button>}
        />
      </>
    )
  }

  const { compra, candy, medioPago } = datos
  const totalCandy = subtotalCandy(candy)
  const codigo = codigoReserva(compra.id)

  return (
    <>
      <EncabezadoPagina
        antetitulo="Compra confirmada"
        titulo="¡Listo! Ya tenés tus entradas"
        descripcion="Mostrá el código de reserva en la entrada de la sala. También lo vas a encontrar en Mis compras."
      />

      <article className={estilos.ticket} aria-labelledby="ticket-titulo">
        <div className={estilos.cabecera}>
          <div>
            <h2 id="ticket-titulo" className={estilos.pelicula}>
              {compra.peliculaNombre}
            </h2>
            <EstadoCompra estado={compra.estado} />
          </div>
          <div className={estilos.codigo}>
            <QrDecorativo texto={codigo} />
            <p>
              <span className={estilos.etiqueta}>Código de reserva</span>
              <strong className={estilos.codigoTexto}>{codigo}</strong>
            </p>
          </div>
        </div>

        <dl className={estilos.datos}>
          <div>
            <dt>Día</dt>
            <dd className={estilos.capitalizar}>{formatearFechaLarga(compra.fechaFuncion)}</dd>
          </div>
          <div>
            <dt>Hora</dt>
            <dd>{formatearHora(compra.horaFuncion)} h</dd>
          </div>
          <div>
            <dt>Sala</dt>
            <dd>{compra.salaNombre}</dd>
          </div>
          <div>
            <dt>Butacas</dt>
            <dd>{listarButacas(compra.entradas)}</dd>
          </div>
        </dl>

        <dl className={estilos.importes}>
          <div>
            <dt>
              Entradas ({compra.entradas.length} × {formatearPrecio(compra.entradas[0].precioUnitario)})
            </dt>
            <dd>{formatearPrecio(compra.total)}</dd>
          </div>
          {candy.map((item) => (
            <div key={item.id}>
              <dt>
                {item.cantidad} × {item.nombre}
              </dt>
              <dd>{formatearPrecio(item.precio * item.cantidad)}</dd>
            </div>
          ))}
          <div className={estilos.total}>
            <dt>Total pagado</dt>
            <dd>{formatearPrecio(compra.total + totalCandy)}</dd>
          </div>
          {medioPago && (
            <div>
              <dt>Medio de pago</dt>
              <dd>{MEDIOS_DE_PAGO[medioPago]}</dd>
            </div>
          )}
        </dl>
        {candy.length > 0 && <p className={estilos.nota}>Retirá tu candy en el mostrador presentando el código de reserva.</p>}
      </article>

      <div className={estilos.acciones}>
        <Button to="/" tamano="lg">
          Volver a la cartelera
        </Button>
        <Button to="/mis-compras" variante="secundario" tamano="lg">
          Ver mis compras
        </Button>
      </div>
    </>
  )
}
