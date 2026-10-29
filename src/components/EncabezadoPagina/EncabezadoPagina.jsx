import estilos from './EncabezadoPagina.module.css'

// Encabezado de cada página: el único <h1>, una bajada opcional y acciones a la derecha.
export default function EncabezadoPagina({ titulo, descripcion, antetitulo, children }) {
  return (
    <div className={estilos.encabezado}>
      <div className={estilos.textos}>
        {antetitulo && <p className={estilos.antetitulo}>{antetitulo}</p>}
        <h1 className={estilos.titulo}>{titulo}</h1>
        {descripcion && <p className={estilos.descripcion}>{descripcion}</p>}
      </div>
      {children && <div className={estilos.acciones}>{children}</div>}
    </div>
  )
}
