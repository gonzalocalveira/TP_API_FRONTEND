import EncabezadoPagina from '../../components/EncabezadoPagina/EncabezadoPagina.jsx'
import ImagenAmbiente from '../../components/ImagenAmbiente/ImagenAmbiente.jsx'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Button from '../../components/Button/Button.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import estilos from './AcercaDe.module.css'

// Las fotos van en src/assets/img/equipo/{archivo}.jpg; mientras no estén se muestran las iniciales.
const EQUIPO = [
  { nombre: 'Uriel Garmendia', carrera: 'Licenciatura en Gestión de la Información', archivo: 'uriel' },
  { nombre: 'Gonzalo Calveira', carrera: 'Ingeniería en Informática', archivo: 'gonzalo' },
  { nombre: 'Alejandra Gonzalez', carrera: 'Ingeniería en Informática', archivo: 'alejandra' },
]

export default function AcercaDe() {
  useDocumentTitle('Acerca de')
  return (
    <div className="contenedor">
      <EncabezadoPagina
        antetitulo="Acerca de"
        titulo="Quiénes hicimos CineManagerPro"
        descripcion="Un proyecto académico para gestionar un cine: cartelera, funciones, venta de entradas y cuenta del cliente."
      >
        <Button to="/">Ver la cartelera</Button>
      </EncabezadoPagina>

      <ImagenAmbiente nombre="sala" className={estilos.ambiente} />

      <div className={estilos.bloques}>
        <section aria-labelledby="que-es" className={estilos.bloque}>
          <h2 id="que-es" className={estilos.subtitulo}>
            Qué es CineManagerPro
          </h2>
          <p>
            CineManagerPro es la aplicación web de un cine ficticio. Desde la vista de cliente se puede consultar la cartelera, elegir
            una función y las butacas, sumar candy, pagar (en forma simulada) y gestionar las compras y la membresía del club.
          </p>
          <p>
            El front-end está hecho con React y se comunica por HTTP con una API REST en Spring Boot, que guarda los datos en una base
            MySQL. En esta etapa, el front funciona con datos simulados que tienen la misma forma que la API.
          </p>
        </section>

        <section aria-labelledby="materia" className={estilos.bloque}>
          <h2 id="materia" className={estilos.subtitulo}>
            La materia
          </h2>
          <dl className={estilos.datos}>
            <div>
              <dt>Materia</dt>
              <dd>Aplicaciones Interactivas</dd>
            </div>
            <div>
              <dt>Universidad</dt>
              <dd>UADE (Universidad Argentina de la Empresa)</dd>
            </div>
            <div>
              <dt>Cursada</dt>
              <dd>2.º cuatrimestre de 2026</dd>
            </div>
          </dl>
        </section>
      </div>

      <section aria-labelledby="equipo" className={estilos.equipo}>
        <h2 id="equipo" className={estilos.subtitulo}>
          El equipo
        </h2>
        <ul className={estilos.grilla}>
          {EQUIPO.map((integrante) => (
            <li key={integrante.archivo}>
              <article className={estilos.tarjeta}>
                <Avatar nombre={integrante.nombre} archivo={integrante.archivo} />
                <h3 className={estilos.nombre}>{integrante.nombre}</h3>
                <p className={estilos.carrera}>{integrante.carrera}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
