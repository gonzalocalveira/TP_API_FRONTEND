// Busca las imágenes que existen en src/assets/img sin tener que listarlas a mano.
//
// import.meta.glob es una función de Vite: al compilar, revisa qué archivos coinciden con el patrón
// y arma un objeto { ruta: url } solo con los que existen. Con { eager: true, import: 'default' }
// cada valor ya es la URL final de la imagen (con hash para el caché del navegador).
// Así, para agregar una imagen alcanza con copiar el archivo en la carpeta: no hay que tocar código ni mocks,
// y si el archivo no está, el helper devuelve null y no se pide nada (la consola queda limpia).
const imagenesPeliculas = import.meta.glob('../assets/img/peliculas/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
const imagenesEquipo = import.meta.glob('../assets/img/equipo/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
const imagenesAmbiente = import.meta.glob('../assets/img/ambiente/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })

// "../assets/img/peliculas/pelicula-1.jpg" -> "pelicula-1"
const nombreSinExtension = (ruta) => ruta.split('/').pop().replace(/\.\w+$/, '')

function buscar(imagenes, nombre) {
  const ruta = Object.keys(imagenes).find((r) => nombreSinExtension(r) === nombre)
  return ruta ? imagenes[ruta] : null
}

// Póster 2:3 de una película: assets/img/peliculas/pelicula-{id}.jpg
export const urlPoster = (peliculaId) => buscar(imagenesPeliculas, `pelicula-${peliculaId}`)

// Banner 16:9 para el carrusel: assets/img/peliculas/banner-{id}.jpg
export const urlBanner = (peliculaId) => buscar(imagenesPeliculas, `banner-${peliculaId}`)

// Foto de un integrante del equipo: assets/img/equipo/{archivo}.jpg (por ejemplo "uriel")
export const urlFotoEquipo = (archivo) => buscar(imagenesEquipo, archivo)

// Fotos de ambiente (sala, butacas, pochoclos, candy): assets/img/ambiente/{nombre}.jpg
export const urlAmbiente = (nombre) => buscar(imagenesAmbiente, nombre)
