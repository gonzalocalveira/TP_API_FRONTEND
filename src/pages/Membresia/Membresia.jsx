import { useCallback } from 'react'
import EncabezadoPagina from '../../components/EncabezadoPagina/EncabezadoPagina.jsx'
import Button from '../../components/Button/Button.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { Cargando, Skeleton, ErrorState, EmptyState } from '../../components/Estados/Estados.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { getMembresia } from '../../services/api.js'
import { formatearFechaNumerica } from '../../utils/formato.js'
import estilos from './Membresia.module.css'

// Beneficios de cada tipo de membresía (texto informativo del front; el back-end solo guarda el tipo y los puntos).
const BENEFICIOS = {
  CLASSIC: ['Sumás 1 punto por cada entrada.', 'Martes 2x1 en funciones 2D.'],
  GOLD: ['Sumás 2 puntos por cada entrada.', 'Martes 2x1 en funciones 2D.', 'Pochoclo mediano de regalo en tu cumpleaños.'],
  BLACK: ['Sumás 3 puntos por cada entrada.', '2x1 todos los días en 2D y 3D.', 'Combo Pareja de regalo en tu cumpleaños.', 'Preventa exclusiva de estrenos.'],
}

export default function Membresia() {
  useDocumentTitle('Mi cuenta')
  const { usuario } = useAuth()

  // GET /api/clientes/{id}/membresia responde 404 si el usuario no es socio: no es un error, es "no tiene membresía".
  const cargarMembresia = useCallback(
    () =>
      getMembresia(usuario.id).catch((error) => {
        if (error.status === 404) return null
        throw error
      }),
    [usuario.id],
  )
  const { datos: membresia, error, cargando, reintentar } = useAsync(cargarMembresia)

  return (
    <div className="contenedor">
      <EncabezadoPagina titulo="Mi cuenta">
        <Button to="/mis-compras" variante="secundario">
          Ver mis compras
        </Button>
      </EncabezadoPagina>

      <div className={estilos.grilla}>
        <section className={estilos.tarjeta} aria-labelledby="datos-titulo">
          <h2 id="datos-titulo" className={estilos.titulo}>
            Tus datos
          </h2>
          <dl className={estilos.datos}>
            <div>
              <dt>Nombre y apellido</dt>
              <dd>{usuario.nombreApellido}</dd>
            </div>
            <div>
              <dt>Mail</dt>
              <dd>{usuario.mail}</dd>
            </div>
            <div>
              <dt>DNI</dt>
              <dd>{usuario.dni}</dd>
            </div>
            <div>
              <dt>Fecha de nacimiento</dt>
              <dd>{formatearFechaNumerica(usuario.fechaNacimiento)}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="club-titulo">
          <h2 id="club-titulo" className={estilos.tituloClub}>
            Club Linterna
          </h2>
          {cargando && (
            <Cargando texto="Cargando tu membresía...">
              <Skeleton alto="220px" />
            </Cargando>
          )}
          {error && <ErrorState titulo="No pudimos cargar tu membresía" error={error} onReintentar={reintentar} />}
          {!cargando && !error && membresia === null && (
            <EmptyState
              icono="estrella"
              titulo="Todavía no sos parte del Club Linterna"
              descripcion="Los socios suman puntos con cada entrada y tienen promociones exclusivas. Para asociarte, acercate a la boletería con tu DNI: es gratis."
              nivelTitulo={3}
            >
              <Button to="/promociones" variante="secundario">
                Ver promociones
              </Button>
            </EmptyState>
          )}
          {membresia && (
            <div className={`${estilos.carnet} ${estilos[membresia.tipoMembresia.toLowerCase()]}`}>
              <div className={estilos.carnetCabecera}>
                <p className={estilos.carnetMarca}>
                  <Icon nombre="linterna" tamano={22} /> Club Linterna
                </p>
                <p className={estilos.tipo}>{membresia.tipoMembresia}</p>
              </div>
              <p className={estilos.puntos}>
                <strong>{membresia.puntos}</strong> puntos
              </p>
              <p className={estilos.socio}>
                {usuario.nombreApellido} · N.º de socio {String(membresia.id).padStart(5, '0')}
              </p>
            </div>
          )}
          {membresia && (
            <>
              <h3 className={estilos.subtitulo}>Tus beneficios</h3>
              <ul className={estilos.beneficios}>
                {BENEFICIOS[membresia.tipoMembresia].map((beneficio) => (
                  <li key={beneficio}>
                    <Icon nombre="check" tamano={18} />
                    {beneficio}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
