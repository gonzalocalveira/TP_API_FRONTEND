import Button from '../../components/Button/Button.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import estilos from './NotFound.module.css'

export default function NotFound() {
  useDocumentTitle('Página no encontrada')
  return (
    <div className={`contenedor ${estilos.pagina}`}>
      <p className={estilos.codigo} aria-hidden="true">
        404
      </p>
      <h1 className={estilos.titulo}>Esta función no está en cartelera</h1>
      <p className={estilos.texto}>La página que buscás no existe o cambió de lugar. Volvé a la cartelera para ver qué se proyecta hoy.</p>
      <Button to="/" tamano="lg">
        Ir a la cartelera
      </Button>
    </div>
  )
}
