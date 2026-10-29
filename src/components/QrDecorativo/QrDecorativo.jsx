import estilos from './QrDecorativo.module.css'

const TAMANO = 21

// Dibujo con forma de código QR, generado a partir del texto (siempre el mismo dibujo para el mismo código).
// Es DECORATIVO: no se puede escanear. El código de reserva real se muestra como texto al lado.
function generarCeldas(texto) {
  let semilla = [...texto].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261)
  const aleatorio = () => {
    semilla = Math.imul(semilla ^ (semilla >>> 15), 2246822507) >>> 0
    return semilla % 100
  }
  const esEsquina = (f, c) => (f < 7 && c < 7) || (f < 7 && c >= TAMANO - 7) || (f >= TAMANO - 7 && c < 7)
  const celdas = []
  for (let f = 0; f < TAMANO; f++) {
    for (let c = 0; c < TAMANO; c++) {
      if (esEsquina(f, c)) continue // las esquinas se dibujan aparte, como en un QR real
      if (aleatorio() < 45) celdas.push({ f, c })
    }
  }
  return celdas
}

function Esquina({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="7" height="7" className={estilos.oscuro} />
      <rect x={x + 1} y={y + 1} width="5" height="5" className={estilos.claro} />
      <rect x={x + 2} y={y + 2} width="3" height="3" className={estilos.oscuro} />
    </g>
  )
}

export default function QrDecorativo({ texto }) {
  return (
    <svg className={estilos.qr} viewBox={`-1 -1 ${TAMANO + 2} ${TAMANO + 2}`} aria-hidden="true" focusable="false">
      <rect x="-1" y="-1" width={TAMANO + 2} height={TAMANO + 2} className={estilos.claro} />
      {generarCeldas(texto).map(({ f, c }) => (
        <rect key={`${f}-${c}`} x={c} y={f} width="1" height="1" className={estilos.oscuro} />
      ))}
      <Esquina x={0} y={0} />
      <Esquina x={TAMANO - 7} y={0} />
      <Esquina x={0} y={TAMANO - 7} />
    </svg>
  )
}
