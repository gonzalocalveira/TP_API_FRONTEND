import Icon from '../Icon/Icon.jsx'
import estilos from './PromoCard.module.css'

// Tarjeta de promoción. Es solo informativa: el total de la compra no aplica descuentos (igual que el back-end).
export default function PromoCard({ promocion, nivelTitulo = 3 }) {
  const Titulo = `h${nivelTitulo}`
  return (
    <article className={estilos.tarjeta}>
      <Icon nombre="estrella" tamano={24} className={estilos.icono} />
      <Titulo className={estilos.titulo}>{promocion.titulo}</Titulo>
      <p>{promocion.descripcion}</p>
      <p className={estilos.condiciones}>{promocion.condiciones}</p>
    </article>
  )
}
