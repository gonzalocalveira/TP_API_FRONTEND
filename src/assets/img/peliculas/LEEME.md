# Imágenes de películas

Carpeta: `src/assets/img/peliculas/`

| Archivo | Para qué | Proporción | Tamaño recomendado |
|---|---|---|---|
| `pelicula-{id}.jpg` | Póster (tarjetas, ficha y carrusel) | 2:3 (vertical) | 600 × 900 px |
| `banner-{id}.jpg` | Fondo del carrusel de destacados | 16:9 (horizontal) | 1600 × 900 px |

`{id}` es el `id` de la película, el mismo que devuelve la API (por ejemplo `pelicula-1.jpg` es Interstellar).

- **Formato:** JPG (también se aceptan `.jpeg`, `.png` y `.webp`). Conviene que pese menos de 200 KB el póster y menos de 350 KB el banner.
- **Cómo agregar una imagen:** copiá el archivo con el nombre correcto en esta carpeta. No hay que tocar código ni mocks: `src/utils/imagenes.js` usa `import.meta.glob` de Vite para detectar qué archivos existen.
- **Si falta la imagen** (o falla al cargar), la app muestra automáticamente el póster dibujado con CSS. Si falta el banner, el carrusel usa el póster.
- Anotá la fuente de cada imagen nueva en `../CREDITOS.md`.
