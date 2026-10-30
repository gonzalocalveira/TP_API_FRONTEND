// Películas con la misma forma que el DTO del back-end (GET /api/peliculas y /api/clientes/cartelera).
// Los ids 1 a 4 son las mismas películas de database/02_datos.sql.
// Los ids 5 a 10 son ficticios y existen solo en el mock, para que la cartelera luzca completa.
// posterUrl y bannerUrl NO existen en el back-end (habría que agregarlos): acá se completan con las imágenes
// que haya en src/assets/img/peliculas, o null si todavía no se cargó el archivo.
import { aFechaISO, sumarDias } from '../utils/formato.js'
import { urlPoster, urlBanner } from '../utils/imagenes.js'

const hoy = new Date()
// Fechas relativas a hoy: las 3 últimas se estrenan en el futuro y alimentan "Próximamente".
const haceDias = (dias) => aFechaISO(sumarDias(hoy, -dias))
const enDias = (dias) => aFechaISO(sumarDias(hoy, dias))

const datos = [
  {
    id: 1,
    nombre: 'Interstellar',
    director: 'Christopher Nolan',
    duracion: 169,
    fechaEstreno: '2014-11-06',
    idioma: 'Inglés (subtitulada)',
    genero: 'Ciencia ficción',
    clasificacionEdad: '+13',
    sinopsis: 'Un grupo de exploradores viaja a través de un agujero de gusano para buscar un nuevo hogar para la humanidad.',
  },
  {
    id: 2,
    nombre: 'Toy Story 3',
    director: 'Lee Unkrich',
    duracion: 103,
    fechaEstreno: '2010-06-17',
    idioma: 'Español (doblada)',
    genero: 'Animación',
    clasificacionEdad: 'ATP',
    sinopsis: 'Andy se va a la universidad y sus juguetes terminan en una guardería con reglas propias.',
  },
  {
    id: 3,
    nombre: 'El secreto de sus ojos',
    director: 'Juan José Campanella',
    duracion: 129,
    fechaEstreno: '2009-08-13',
    idioma: 'Español',
    genero: 'Drama',
    clasificacionEdad: '+16',
    sinopsis: 'Un empleado judicial retirado escribe una novela sobre un caso de asesinato que nunca pudo cerrar.',
  },
  {
    id: 4,
    nombre: 'Dune: Parte Dos',
    director: 'Denis Villeneuve',
    duracion: 166,
    fechaEstreno: '2024-02-29',
    idioma: 'Inglés (subtitulada)',
    genero: 'Ciencia ficción',
    clasificacionEdad: '+13',
    sinopsis: 'Paul Atreides se une a los Fremen y busca venganza contra quienes destruyeron a su familia.',
  },
  {
    id: 5,
    nombre: 'La última función',
    director: 'Martina Ledesma',
    duracion: 112,
    fechaEstreno: haceDias(4),
    idioma: 'Español',
    genero: 'Drama',
    clasificacionEdad: '+13',
    sinopsis: 'La noche antes de que cierre para siempre, el proyectorista de un cine de barrio decide pasar una película que nadie vio jamás.',
  },
  {
    id: 6,
    nombre: 'Mar de fondo',
    director: 'Valentín Ocampo',
    duracion: 104,
    fechaEstreno: haceDias(11),
    idioma: 'Español',
    genero: 'Suspenso',
    clasificacionEdad: '+16',
    sinopsis: 'Una buzo de Puerto Madryn encuentra en el fondo del golfo un barco que no figura en ningún registro.',
  },
  {
    id: 7,
    nombre: 'Ruta 40',
    director: 'Lucía Benavídez',
    duracion: 98,
    fechaEstreno: haceDias(18),
    idioma: 'Español',
    genero: 'Comedia',
    clasificacionEdad: 'ATP',
    sinopsis: 'Tres hermanos que no se hablan hace años tienen que llevar las cenizas de su abuela desde La Quiaca hasta Ushuaia.',
  },
  {
    id: 8,
    nombre: 'Los guardianes del faro',
    director: 'Tomás Iriarte',
    duracion: 95,
    fechaEstreno: enDias(9),
    idioma: 'Español (doblada)',
    genero: 'Animación',
    clasificacionEdad: 'ATP',
    sinopsis: 'Dos gaviotas y un cangrejo ermitaño tienen que mantener encendido el último faro de la costa atlántica.',
  },
  {
    id: 9,
    nombre: 'Eclipse sobre Tandil',
    director: 'Sofía Arrieta',
    duracion: 131,
    fechaEstreno: enDias(16),
    idioma: 'Español',
    genero: 'Ciencia ficción',
    clasificacionEdad: '+13',
    sinopsis: 'Durante un eclipse total, la piedra movediza vuelve a caer y el pueblo entero queda detenido en el tiempo.',
  },
  {
    id: 10,
    nombre: 'Noche de feria',
    director: 'Diego Saravia',
    duracion: 101,
    fechaEstreno: enDias(23),
    idioma: 'Español',
    genero: 'Terror',
    clasificacionEdad: '+16',
    sinopsis: 'Un grupo de amigos se queda encerrado en un parque de diversiones abandonado de la costa bonaerense.',
  },
]

export const peliculas = datos.map((pelicula) => ({
  ...pelicula,
  posterUrl: urlPoster(pelicula.id),
  bannerUrl: urlBanner(pelicula.id),
}))
