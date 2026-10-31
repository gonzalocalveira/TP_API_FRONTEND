import { useCallback, useState } from 'react'
import EncabezadoPagina from '../../components/EncabezadoPagina/EncabezadoPagina.jsx'
import Button from '../../components/Button/Button.jsx'
import { ConfirmDialog } from '../../components/Dialog/Dialog.jsx'
import { Cargando, Skeleton, ErrorState, EmptyState } from '../../components/Estados/Estados.jsx'
import CompraItem from './CompraItem.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getHistorial, cancelarCompra } from '../../services/api.js'
import { codigoReserva, formatearFechaLarga, formatearHora } from '../../utils/formato.js'
import estilos from './MisCompras.module.css'

export default function MisCompras() {
  useDocumentTitle('Mis compras')
  const { usuario } = useAuth()
  const { mostrarToast } = useToast()
  const cargarHistorial = useCallback(() => getHistorial(usuario.id), [usuario.id])
  const { datos: compras, error, cargando, reintentar, actualizarDatos } = useAsync(cargarHistorial)
  const [compraACancelar, setCompraACancelar] = useState(null)
  const [cancelando, setCancelando] = useState(false)

  // PATCH /api/clientes/compras/{id}/cancelar. Se reemplaza la compra en la lista con la respuesta del servidor.
  async function confirmarCancelacion() {
    setCancelando(true)
    try {
      const actualizada = await cancelarCompra(compraACancelar.id)
      actualizarDatos((lista) => lista.map((c) => (c.id === actualizada.id ? actualizada : c)))
      mostrarToast({ tipo: 'exito', mensaje: `Cancelaste la compra ${codigoReserva(actualizada.id)}. Las butacas quedaron libres.` })
    } catch (errorCancelacion) {
      mostrarToast({ tipo: 'error', mensaje: `No se pudo cancelar: ${errorCancelacion.message}` })
    } finally {
      setCancelando(false)
      setCompraACancelar(null)
    }
  }

  return (
    <div className="contenedor">
      <EncabezadoPagina titulo="Mis compras" descripcion="Tus entradas, de la más nueva a la más vieja. Podés cancelar una compra hasta que empiece la función." />

      {cargando && (
        <Cargando texto="Cargando tus compras...">
          <div className={estilos.lista}>
            <Skeleton alto="160px" />
            <Skeleton alto="160px" />
          </div>
        </Cargando>
      )}

      {error && <ErrorState titulo="No pudimos cargar tus compras" error={error} onReintentar={reintentar} />}

      {compras && compras.length === 0 && (
        <EmptyState icono="ticket" titulo="Todavía no tenés compras" descripcion="Cuando compres entradas, las vas a ver acá con su código de reserva.">
          <Button to="/">Ver la cartelera</Button>
        </EmptyState>
      )}

      {compras && compras.length > 0 && (
        <ul className={estilos.lista}>
          {compras.map((compra) => (
            <li key={compra.id}>
              <CompraItem compra={compra} onCancelar={setCompraACancelar} />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        abierto={compraACancelar !== null}
        titulo="¿Cancelar esta compra?"
        mensaje={
          compraACancelar &&
          `Vas a cancelar ${compraACancelar.entradas.length === 1 ? 'la entrada' : `las ${compraACancelar.entradas.length} entradas`} de ${compraACancelar.peliculaNombre} del ${formatearFechaLarga(compraACancelar.fechaFuncion)} a las ${formatearHora(compraACancelar.horaFuncion)} h. Las butacas se liberan y no se puede deshacer.`
        }
        textoConfirmar="Sí, cancelar compra"
        textoCancelar="No, mantenerla"
        procesando={cancelando}
        onConfirmar={confirmarCancelacion}
        onCerrar={() => setCompraACancelar(null)}
        idFocoAlternativo={compraACancelar ? `compra-${compraACancelar.id}` : undefined}
      />
    </div>
  )
}
