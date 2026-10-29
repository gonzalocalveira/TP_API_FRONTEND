// Componentes para los tres estados de cualquier pantalla que carga datos: carga, error y vacío.
import Icon from '../Icon/Icon.jsx'
import Button from '../Button/Button.jsx'
import estilos from './Estados.module.css'

// Bloque gris animado que ocupa el lugar del contenido mientras carga.
export function Skeleton({ alto = '1rem', ancho = '100%', redondo = false, className = '' }) {
  return (
    <span
      className={`${estilos.skeleton} ${redondo ? estilos.redondo : ''} ${className}`}
      style={{ height: alto, width: ancho }}
      aria-hidden="true"
    />
  )
}

// Envuelve los skeletons y avisa a los lectores de pantalla que se está cargando.
export function Cargando({ texto = 'Cargando...', children }) {
  return (
    <div role="status" aria-busy="true">
      <span className="visually-hidden">{texto}</span>
      {children}
    </div>
  )
}

// Error con mensaje y acción para reintentar (o un link, si reintentar no tiene sentido, como en un 404).
export function ErrorState({ titulo = 'No pudimos cargar la información', error, onReintentar, accion }) {
  return (
    <div className={estilos.caja} role="alert">
      <Icon nombre="alerta" tamano={32} className={estilos.iconoError} />
      <h2 className={estilos.titulo}>{titulo}</h2>
      {error && <p className={estilos.texto}>{error.message}</p>}
      <div className={estilos.acciones}>
        {onReintentar && (
          <Button variante="secundario" onClick={onReintentar}>
            Reintentar
          </Button>
        )}
        {accion}
      </div>
    </div>
  )
}

// Estado vacío: explica por qué no hay nada y ofrece qué hacer.
export function EmptyState({ icono = 'info', titulo, descripcion, children, nivelTitulo = 2 }) {
  const Encabezado = `h${nivelTitulo}`
  return (
    <div className={estilos.caja}>
      <Icon nombre={icono} tamano={32} className={estilos.iconoVacio} />
      <Encabezado className={estilos.titulo}>{titulo}</Encabezado>
      {descripcion && <p className={estilos.texto}>{descripcion}</p>}
      {children && <div className={estilos.acciones}>{children}</div>}
    </div>
  )
}
