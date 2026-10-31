import { useState } from 'react'
import QrDecorativo from '../../components/QrDecorativo/QrDecorativo.jsx'
import Button from '../../components/Button/Button.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { simularResultadoPago } from '../../services/api.js'
import { formatearPrecio } from '../../utils/formato.js'
import estilos from './Pago.module.css'

// Panel del pago con billetera virtual: QR con el código de operación, monto, estado y controles de demo.
// Es una pantalla genérica de CineManagerPro: no usa logos, colores ni pantallas de ninguna billetera.
export default function PanelBilletera({ pago, estado, error, onReintentar, onOtroMedio }) {
  const [simulando, setSimulando] = useState(false)

  async function simular(resultado) {
    setSimulando(true)
    await simularResultadoPago(pago.id, resultado)
    setSimulando(false)
  }

  const textoEstado = {
    PENDIENTE: 'Esperando confirmación del pago...',
    APROBADO: 'Pago aprobado. Estamos confirmando tu compra...',
    RECHAZADO: 'La billetera rechazó el pago. No se te cobró nada.',
    ERROR: error?.message ?? 'No pudimos consultar el estado del pago.',
  }[estado]

  return (
    <div id="panel-billetera" tabIndex={-1} className={estilos.billetera}>
      <div className={estilos.qrBloque}>
        <QrDecorativo texto={pago.codigoOperacion} />
        <div className={estilos.qrDatos}>
          <p>
            Escaneá el código con tu billetera virtual (por ejemplo Mercado Pago, Ualá o MODO) para pagar{' '}
            <strong>{formatearPrecio(pago.monto)}</strong>.
          </p>
          <p className={estilos.operacion}>
            Código de operación <strong>{pago.codigoOperacion}</strong>
          </p>
        </div>
      </div>

      {/* Estado del pago: se anuncia cada vez que cambia */}
      <div className={`${estilos.estadoPago} ${estado === 'RECHAZADO' || estado === 'ERROR' ? estilos.estadoError : ''}`} aria-live="polite">
        {estado === 'PENDIENTE' || estado === 'APROBADO' ? (
          <span className={estilos.spinner} aria-hidden="true" />
        ) : (
          <Icon nombre="alerta" />
        )}
        <p>{textoEstado}</p>
      </div>

      {(estado === 'RECHAZADO' || estado === 'ERROR') && (
        <div className={estilos.accionesBilletera}>
          <Button onClick={onReintentar}>Generar un QR nuevo</Button>
          <Button variante="secundario" onClick={onOtroMedio}>
            Elegir otro medio de pago
          </Button>
        </div>
      )}

      {estado === 'PENDIENTE' && (
        <div className={estilos.demo} role="group" aria-labelledby="demo-billetera-titulo">
          <p id="demo-billetera-titulo" className={estilos.demoTitulo}>
            Solo para la demo
          </p>
          <p className={estilos.demoTexto}>
            En la vida real, el resultado llega cuando la persona paga desde su celular. Como es una simulación, estos botones lo
            reemplazan. La app consulta el estado cada 2 segundos.
          </p>
          <div className={estilos.accionesBilletera}>
            <Button variante="secundario" tamano="sm" disabled={simulando} onClick={() => simular('APROBADO')}>
              Simular pago aprobado
            </Button>
            <Button variante="secundario" tamano="sm" disabled={simulando} onClick={() => simular('RECHAZADO')}>
              Simular pago rechazado
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
