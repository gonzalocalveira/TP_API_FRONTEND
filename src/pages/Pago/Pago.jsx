import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EncabezadoPagina from '../../components/EncabezadoPagina/EncabezadoPagina.jsx'
import FormField from '../../components/FormField/FormField.jsx'
import ErrorSummary from '../../components/FormField/ErrorSummary.jsx'
import ResumenCompra from '../../components/ResumenCompra/ResumenCompra.jsx'
import Button from '../../components/Button/Button.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useCompra } from '../../hooks/useCompra.js'
import { useToast } from '../../hooks/useToast.js'
import { useFormulario } from '../../hooks/useFormulario.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { usePagoBilletera } from '../../hooks/usePagoBilletera.js'
import PanelBilletera from './PanelBilletera.jsx'
import { comprar, crearPagoBilletera, procesarPago } from '../../services/api.js'
import { MEDIOS_DE_PAGO, validarPago, formatearNumeroTarjeta, formatearVencimiento, soloDigitos } from '../../utils/validaciones.js'
import { subtotalEntradas, subtotalCandy, tiempoVencido } from '../../utils/compra.js'
import { formatearPrecio } from '../../utils/formato.js'
import estilosCompra from '../../layouts/CompraLayout.module.css'
import estilos from './Pago.module.css'

const ETIQUETAS = {
  numeroTarjeta: 'Número de tarjeta',
  titular: 'Nombre del titular',
  vencimiento: 'Vencimiento',
  cvv: 'Código de seguridad',
  mail: 'Mail',
}

const ICONOS_MEDIO = { CREDITO: 'tarjeta', DEBITO: 'tarjeta', BILLETERA: 'billetera' }

// Pago SIMULADO: el back-end no procesa pagos.
// Los datos de la tarjeta viven solo en el estado de este formulario: nunca se envían ni se guardan.
// A procesarPago solo le llegan el medio, el monto y los últimos 4 dígitos.
export default function Pago() {
  useDocumentTitle('Pago')
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const compra = useCompra()
  const { mostrarToast } = useToast()
  const [procesando, setProcesando] = useState(false)
  const [errorPago, setErrorPago] = useState(null)
  const [pagoBilletera, setPagoBilletera] = useState(null)

  const formulario = useFormulario(
    { medioPago: 'CREDITO', numeroTarjeta: '', titular: '', vencimiento: '', cvv: '', mail: usuario.mail },
    validarPago,
  )
  const { valores, errores, manejarBlur, cambiarValor } = formulario
  const conTarjeta = valores.medioPago !== 'BILLETERA'
  const total = subtotalEntradas(compra.funcion.precio, compra.butacas.length) + subtotalCandy(compra.candy)

  // Formatea mientras se escribe: espacios cada 4 dígitos, barra en el vencimiento, solo números en el CVV.
  function manejarCambio(evento) {
    const { name, value } = evento.target
    const formateadores = {
      numeroTarjeta: formatearNumeroTarjeta,
      vencimiento: formatearVencimiento,
      cvv: (v) => soloDigitos(v).slice(0, 4),
    }
    cambiarValor(name, formateadores[name] ? formateadores[name](value) : value)
  }

  // POST /api/clientes/compras: el back-end calcula el total de las entradas.
  async function registrarCompra() {
    const compraConfirmada = await comprar({
      usuarioId: usuario.id,
      funcionId: compra.funcion.id,
      asientoIds: compra.butacas.map((b) => b.id),
      idReserva: compra.idReserva,
    })
    compra.finalizarCompra({ compra: compraConfirmada, medioPago: valores.medioPago })
    mostrarToast({ tipo: 'exito', mensaje: '¡Compra confirmada! Ya tenés tus entradas.' })
    navigate(`/compra/confirmacion/${compraConfirmada.id}`)
  }

  function manejarErrorCompra(error) {
    setProcesando(false)
    setPagoBilletera(null)
    // 409 por butaca ocupada: alguien la compró mientras se pagaba. Se vuelve al mapa actualizado.
    if (error.status === 409 && error.message.toLowerCase().includes('butaca')) {
      navigate(`/compra/${compra.funcion.id}/butacas`, {
        state: {
          aviso: {
            tipo: 'error',
            mensaje: `${error.message}. Otra persona la compró mientras pagabas. Elegí otra butaca: el pago simulado se anuló.`,
          },
        },
      })
      return
    }
    setErrorPago(error)
  }

  // Genera el QR de la billetera. El pago queda pendiente hasta que llegue el resultado por polling.
  async function generarQr() {
    setErrorPago(null)
    if (tiempoVencido(compra.vencimiento)) {
      compra.expirarCompra()
      return
    }
    setProcesando(true)
    try {
      setPagoBilletera(await crearPagoBilletera({ monto: total }))
      // El botón que se tocó ya no está: el foco pasa al panel del QR para no perderse.
      requestAnimationFrame(() => document.getElementById('panel-billetera')?.focus())
    } catch (error) {
      setErrorPago(error)
    } finally {
      setProcesando(false)
    }
  }

  function elegirOtroMedio() {
    setPagoBilletera(null)
    cambiarValor('medioPago', 'CREDITO')
    requestAnimationFrame(() => document.querySelector('input[name="medioPago"]:checked')?.focus())
  }

  // Cuando el polling informa que se aprobó, se registra la compra.
  async function alAprobarseBilletera() {
    compra.setPagando(true)
    try {
      await registrarCompra()
    } catch (error) {
      manejarErrorCompra(error)
    } finally {
      compra.setPagando(false)
    }
  }
  const { estado: estadoBilletera, error: errorBilletera } = usePagoBilletera(pagoBilletera?.id ?? null, alAprobarseBilletera)

  async function pagar(evento) {
    evento.preventDefault()
    if (pagoBilletera) return
    setErrorPago(null)
    if (!formulario.validarAlEnviar()) return
    if (!conTarjeta) {
      generarQr()
      return
    }
    // El vencimiento se controla acá, antes de empezar: un pago ya iniciado no se corta.
    if (tiempoVencido(compra.vencimiento)) {
      compra.expirarCompra()
      return
    }

    setProcesando(true)
    compra.setPagando(true)
    try {
      await procesarPago({
        medioPago: valores.medioPago,
        monto: total,
        ultimos4: soloDigitos(valores.numeroTarjeta).slice(-4),
      })
      await registrarCompra()
    } catch (error) {
      manejarErrorCompra(error)
    } finally {
      compra.setPagando(false)
    }
  }

  return (
    <>
      <EncabezadoPagina titulo="Pago" descripcion="Elegí cómo pagar y revisá tu compra antes de confirmar." />

      <div className={estilosCompra.grilla}>
        <form id="form-pago" className={estilosCompra.principal} onSubmit={pagar} noValidate>
          <p className={estilos.nota}>
            <Icon nombre="info" />
            <span>
              <strong>Pago simulado.</strong> Es una demo: los datos de la tarjeta no se envían ni se guardan en ningún lado. Para
              probar, usá la tarjeta 4509 9535 6623 3704 (o una terminada en 0002 para ver un rechazo).
            </span>
          </p>

          <ErrorSummary errores={errores} etiquetas={ETIQUETAS} visible={formulario.intentosEnvio} />

          {errorPago && (
            <div className={estilos.errorPago} role="alert">
              <Icon nombre="alerta" />
              <div>
                <p className={estilos.errorTitulo}>No pudimos completar el pago</p>
                <p>{errorPago.message}</p>
              </div>
            </div>
          )}

          <fieldset className={estilos.fieldset}>
            <legend className={estilos.legend}>Medio de pago</legend>
            <div className={estilos.medios}>
              {Object.entries(MEDIOS_DE_PAGO).map(([valor, texto]) => (
                <label key={valor} className={estilos.medio}>
                  <input
                    type="radio"
                    name="medioPago"
                    value={valor}
                    checked={valores.medioPago === valor}
                    disabled={pagoBilletera !== null}
                    onChange={manejarCambio}
                    className={estilos.radio}
                  />
                  <Icon nombre={ICONOS_MEDIO[valor]} />
                  {texto}
                </label>
              ))}
            </div>
          </fieldset>

          {conTarjeta ? (
            <fieldset className={estilos.fieldset}>
              <legend className={estilos.legend}>Datos de la tarjeta</legend>
              <div className={estilos.campos}>
                <FormField
                  id="numeroTarjeta"
                  etiqueta={ETIQUETAS.numeroTarjeta}
                  obligatorio
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  value={valores.numeroTarjeta}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  error={errores.numeroTarjeta}
                  className={estilos.campoAncho}
                />
                <FormField
                  id="titular"
                  etiqueta={ETIQUETAS.titular}
                  ayuda="Tal como figura en la tarjeta."
                  obligatorio
                  autoComplete="cc-name"
                  value={valores.titular}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  error={errores.titular}
                  className={estilos.campoAncho}
                />
                <FormField
                  id="vencimiento"
                  etiqueta={ETIQUETAS.vencimiento}
                  ayuda="MM/AA"
                  obligatorio
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="08/29"
                  value={valores.vencimiento}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  error={errores.vencimiento}
                />
                <FormField
                  id="cvv"
                  etiqueta={ETIQUETAS.cvv}
                  ayuda="3 o 4 números al dorso."
                  obligatorio
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={valores.cvv}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  error={errores.cvv}
                />
              </div>
            </fieldset>
          ) : pagoBilletera ? (
            <PanelBilletera
              pago={pagoBilletera}
              estado={estadoBilletera}
              error={errorBilletera}
              onReintentar={generarQr}
              onOtroMedio={elegirOtroMedio}
            />
          ) : (
            <p className={estilos.billetera}>
              Vas a ver un código QR para pagar {formatearPrecio(total)} con tu billetera virtual.
            </p>
          )}

          <fieldset className={estilos.fieldset}>
            <legend className={estilos.legend}>Dónde te mandamos las entradas</legend>
            <FormField
              id="mail"
              etiqueta={ETIQUETAS.mail}
              type="email"
              obligatorio
              autoComplete="email"
              value={valores.mail}
              onChange={manejarCambio}
              onBlur={manejarBlur}
              error={errores.mail}
            />
          </fieldset>
        </form>

        <ResumenCompra
          funcion={compra.funcion}
          butacas={compra.butacas}
          candy={compra.candy}
          accion={
            // El botón está fuera del <form>: el atributo form="form-pago" lo conecta igual.
            // Con el QR en pantalla la acción está en el panel: acá no queda ningún botón sin función.
            !pagoBilletera && (
              <Button type="submit" form="form-pago" bloque tamano="lg" cargando={procesando} textoCargando="Procesando...">
                {conTarjeta ? `Pagar ${formatearPrecio(total)}` : 'Generar código QR'}
              </Button>
            )
          }
        />
      </div>
    </>
  )
}
