# Integración con el back-end

Este documento explica qué endpoint del back-end (`../TP--API-UADE`) usa cada pantalla, qué cosas existen solo en el front y qué va a cambiar cuando se conecte la API real.

## Cómo se pasa de los mocks a la API real

1. Levantar el back-end (Spring Boot, por defecto en `http://localhost:8080`) con la base cargada con `01_schema.sql` y `02_datos.sql`.
2. Crear `.env.local` en la raíz del front con:
   ```
   VITE_USE_MOCKS=false
   VITE_API_URL=http://localhost:8080
   ```
3. Reiniciar `npm run dev`.

No hay que tocar ningún componente: todos importan las funciones de `src/services/api.js`, que elige `mockApi.js` o `httpApi.js` según `VITE_USE_MOCKS`. Las dos implementaciones tienen las mismas funciones, reciben los mismos parámetros, devuelven la misma forma de JSON y tiran el mismo `ApiError` (`{ timestamp, status, error, message, path, detalles }`).

> **Cambio necesario en el back-end para conectar:** el front corre en otro origen (`localhost:5173`), así que el back tiene que habilitar CORS para ese origen (por ejemplo con `@CrossOrigin` o con un `WebMvcConfigurer`). Sin eso, el navegador bloquea los pedidos y la app muestra "No pudimos conectarnos con el servidor".

## Pantalla por pantalla

| Pantalla | Ruta del front | Función de `api.js` | Endpoint del back-end | DTO |
|---|---|---|---|---|
| Cartelera | `/` | `getPeliculas()` | `GET /api/clientes/cartelera` | Película: `id, nombre, director, duracion, fechaEstreno, idioma, genero, clasificacionEdad, sinopsis` |
| | | `getFunciones()` | `GET /api/funciones` | Función: `id, fechaFuncion, horaFuncion, formatoFuncion, precio, peliculaId, peliculaNombre, duracion, salaId, salaNombre` |
| Buscador de funciones | `/` | `getFunciones({ peliculaId, fecha })` | `GET /api/funciones?peliculaId=&fecha=` | Función |
| Ficha de película | `/peliculas/:id` | `getPelicula(id)` y `getFunciones({ peliculaId })` | `GET /api/peliculas/{id}` y `GET /api/funciones?peliculaId=` | Película y función |
| Butacas | `/compra/:funcionId/butacas` | `getFuncion(id)` y `getButacas(id)` | `GET /api/funciones/{id}` y `GET /api/funciones/{id}/butacas` | `[{ id, filaAsiento, numeroAsiento, ocupada }]` |
| Candy | `/compra/candy` y `/candy` | `getProductosCandy()` | **Ninguno (solo front)** | `{ categorias, productos }` |
| Ingresar | `/ingresar` | `login({ mail, password })` | `POST /api/usuarios/login` | Usuario: `id, nombreApellido, dni, fechaNacimiento, mail, isSocio, rol` |
| Registro | `/registro` | `registrar(datos)` | `POST /api/usuarios` | Body: `nombreApellido, dni, fechaNacimiento, mail, password` |
| Pago | `/compra/pago` | `procesarPago(...)` | **Ninguno (solo front)** | `{ aprobado, medioPago, monto, codigoAutorizacion }` |
| | | `comprar({ usuarioId, funcionId, asientoIds })` | `POST /api/clientes/compras` | Compra: `id, fechaCompra, estado, total, usuarioId, funcionId, peliculaNombre, salaNombre, fechaFuncion, horaFuncion, entradas[]` |
| Confirmación | `/compra/confirmacion/:ticketId` | Los datos de la compra recién hecha; si se entra directo, `getHistorial(usuarioId)` | `GET /api/clientes/{usuarioId}/historial` | Compra |
| Mis compras | `/mis-compras` | `getHistorial(usuarioId)` | `GET /api/clientes/{usuarioId}/historial` | Compra |
| Cancelar compra | `/mis-compras` | `cancelarCompra(id)` | `PATCH /api/clientes/compras/{id}/cancelar` | Compra (con `estado: CANCELADA`) |
| Mi cuenta / membresía | `/membresia` | `getMembresia(usuarioId)` | `GET /api/clientes/{usuarioId}/membresia` (404 si no es socio) | `{ id, usuarioId, puntos, tipoMembresia }` |
| Promociones | `/promociones` y la home | `getPromociones()` | **Ninguno (solo front)** | `{ id, titulo, descripcion, condiciones, destacada }` |

### Errores que maneja el front

| Código | Dónde | Qué muestra |
|---|---|---|
| 0 (sin conexión) | Cualquier consulta con la API real | "No pudimos conectarnos con el servidor" y **Reintentar** |
| 400 | Registro, compra | El mensaje del servidor (las validaciones del front evitan casi todos) |
| 401 | Ingresar | "El mail o la contraseña no son correctos" |
| 404 | Película o función inexistente, compra que no es del usuario | Mensaje y link a la cartelera (sin "Reintentar", porque no tendría sentido) |
| 404 | Membresía | No es un error: se muestra el estado vacío "Todavía no sos parte del Club Linterna" |
| 409 | Butaca ocupada al pagar | Vuelve al mapa actualizado con un aviso y saca esa butaca de la selección |
| 409 | Cancelar una compra cancelada o de una función que ya empezó | Toast de error con el mensaje del servidor |
| 409 | Registro con mail o DNI repetido | El mensaje del servidor arriba del formulario |
| 500 | Cualquier consulta | Estado de error con **Reintentar** |

## Qué es solo del front (simulado, sin endpoint en el back)

Están marcados en el código con el comentario `SIMULADO EN EL FRONT, SIN ENDPOINT EN EL BACK`. Aunque se use la API real, `httpApi.js` sigue tomando estas funciones de `mockApi.js`:

- **Candy** (`src/mocks/candy.js`, `getProductosCandy`). Los productos se eligen durante la compra y se muestran en la confirmación, pero no se guardan en el back-end: no aparecen en "Mis compras".
- **Pago** (`procesarPago`). Simula la aprobación. Nunca recibe los datos de la tarjeta: solo el medio de pago, el monto y los últimos 4 dígitos, para simular el rechazo de las terminadas en 0002. Primero se aprueba el pago simulado y después se registra la compra con `POST /api/clientes/compras`.
- **Promociones** (`src/mocks/promociones.js`). Solo informativas: no se aplican al total, igual que en el back-end, que calcula precio × cantidad.
- **Pósters**: se dibujan con CSS a partir del `id` y el `genero` de la película (`PosterArt.jsx`).
- **Beneficios de cada tipo de membresía** (`Membresia.jsx`): texto fijo del front. El back solo guarda el tipo y los puntos.

## Lo que existe solo en el mock (y qué cambia en la cartelera al conectar la API real)

Para que la demo se vea completa, el mock tiene más datos que `02_datos.sql`. **Estos datos no existen en el back-end:**

| Dato del mock | Detalle | Archivo |
|---|---|---|
| **Sala 3** | 60 butacas (filas A a F × 10), ids 71 a 130 | `src/mocks/salas.js` |
| **Funciones con id 101 en adelante** | Se generan para los próximos 7 días, en las Salas 1, 2 y 3, para las películas en cartelera. Las de la Sala 3 son todas del mock. | `src/mocks/funciones.js` |
| **Películas con id 5 a 10** | 3 en cartelera (estrenadas hace pocos días) y 3 en "Próximamente" (estreno en 9, 16 y 23 días) | `src/mocks/peliculas.js` |
| **Ocupación inicial** | Cada función arranca con alrededor del 25% de las butacas ocupadas (siempre las mismas, calculadas a partir de los ids). En la base real no hay compras al empezar. | `estabaOcupada()` en `src/mocks/funciones.js` |

Lo que sí coincide con `02_datos.sql`: las películas 1 a 4, las Salas 1 y 2 con sus butacas (ids 1 a 70), las funciones 1 a 6 (mismos días relativos, horarios, formatos, precios y salas), los tres usuarios y la membresía GOLD de Ana.

**Qué va a cambiar en pantalla al conectar la API real:**

1. **Menos películas:** la cartelera va a mostrar solo las 4 de la base. El estreno destacado pasa a ser *Dune: Parte Dos* (la estrenada más recientemente).
2. **"Próximamente" desaparece**, porque ninguna película de la base tiene fecha de estreno futura. La sección se oculta sola cuando no hay películas (no queda un hueco vacío).
3. **Menos funciones:** solo las 6 del SQL, entre mañana y dentro de 3 días. En los filtros por día, "Hoy" y los días 4 a 6 van a mostrar el estado vacío "No hay películas con esos filtros". En la ficha de película, los días sin funciones aparecen deshabilitados.
4. **Sin Sala 3:** las funciones van a estar solo en las Salas 1 y 2.
5. **Butacas libres al principio:** la base real arranca sin compras, así que todas las butacas van a estar disponibles hasta que alguien compre.
6. **Textos sin tildes:** `02_datos.sql` guarda los datos sin tildes ("Ciencia ficcion", "Espanol") y los mensajes de error del back también vienen sin tildes ("La butaca A2 ya esta ocupada para esta funcion"). El mock usa los textos con tildes. Se recomienda cargar los datos con tildes en la base (UTF-8).
7. **Las compras quedan en la base**, no en el navegador: el botón "Restablecer datos de prueba" desaparece (solo se muestra con mocks). Para volver al estado inicial hay que correr de nuevo `01_schema.sql` y `02_datos.sql`.
8. **Candy, pago y promociones siguen simulados**, hasta que el back-end los implemente.
9. **El modo `?error=` deja de tener efecto**, porque solo afecta a `mockApi.js`.

## Datos que habría que agregar al back-end

Son datos que la interfaz usa y que hoy el back-end no tiene:

| Dato | Para qué | Propuesta |
|---|---|---|
| Productos de candy | Paso de candy y menú `/candy` | Entidad `ProductoCandy { id, nombre, descripcion, categoria, precio }` y `GET /api/candy` |
| Candy de la compra | Que el candy quede guardado en la compra y aparezca en "Mis compras" | `items` en `POST /api/clientes/compras` y en la respuesta |
| Pago | Registrar el medio de pago y la aprobación | Entidad `Pago { compraId, medio, monto, estado, codigoAutorizacion }` (con una pasarela real, el front nunca debería mandar datos de tarjeta al back, sino un token de la pasarela) |
| Promociones | Sección de la home y `/promociones` | `GET /api/promociones`; si se quieren aplicar al total, el cálculo tiene que hacerlo el servidor |
| Imagen o póster de la película | Hoy se dibuja con CSS | Campo `posterUrl` en `Pelicula` |
| Sesión segura | Hoy la sesión del front es el usuario devuelto por el login, guardado en `localStorage` | Con Spring Security: login que devuelva un token (JWT) y endpoints de cliente que lo exijan |
| Beneficios por tipo de membresía | Pantalla "Mi cuenta" | Tabla de beneficios por `tipoMembresia`, o dejarlo como contenido del front |

## Reglas de negocio que el front replica (para validar antes de llamar al servidor)

- Total de entradas = precio de la función × cantidad (`subtotalEntradas` en `utils/compra.js`). Sin cargos ni descuentos.
- Una compra se puede cancelar solo si está `CONFIRMADA` y la función no empezó (`puedeCancelarse`).
- No se compran funciones que ya empezaron (la cartelera y la ficha las ocultan; la pantalla de butacas lo avisa).
- Contraseña de 4 a 100 caracteres, fecha de nacimiento en el pasado, mail con formato válido y DNI mayor a 0 (el front además pide 7 u 8 dígitos).
- Máximo 8 butacas por compra (regla del front; el back-end no tiene límite).

El servidor vuelve a validar todo: las validaciones del front son para dar respuesta rápida y mensajes claros, no reemplazan a las del back.
