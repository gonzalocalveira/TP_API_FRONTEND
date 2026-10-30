# Fotos del equipo

Carpeta: `src/assets/img/equipo/`

| Integrante | Archivo |
|---|---|
| Uriel Garmendia | `uriel.jpg` |
| Gonzalo Calveira | `gonzalo.jpg` |
| Alejandra Gonzalez | `alejandra.jpg` |

- **Formato:** foto cuadrada, por ejemplo 400 × 400 px, en JPG (también `.jpeg`, `.png` o `.webp`), idealmente de menos de 100 KB.
- Se muestra recortada en círculo en la página "Acerca de" (`/acerca-de`).
- **Cómo agregarla:** copiá el archivo con ese nombre en esta carpeta. No hay que tocar código: `src/utils/imagenes.js` detecta qué fotos existen con `import.meta.glob`.
- Mientras no esté la foto (o si falla al cargar), se muestra un círculo con las iniciales.
