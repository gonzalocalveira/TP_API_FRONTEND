# Arquitectura del front-end

## Visión general

```
Navegador ──> Front-end (React) ──HTTP/JSON──> Back-end (Spring Boot) ──> Base de datos (MySQL)
```

Adentro del front, los datos siempre pasan por las mismas capas:

```
Página (pages/) ──> hook (useAsync) ──> services/api.js ──┬──> mockApi.js (hoy: datos simulados)
     │                                                     └──> httpApi.js (después: fetch al back-end)
     └── componentes de presentación (components/)
```

- **Las páginas** deciden qué datos pedir y qué mostrar en cada estado (cargando, error, vacío o con datos).
- **Los componentes** solo muestran lo que reciben por props y avisan las acciones con callbacks (`onAlternar`, `onCancelar`...). No piden datos.
- **Los servicios** son la única puerta hacia el servidor. Ningún componente importa `mocks/` ni hace `fetch`.
- **La lógica sin React** (cálculos, validaciones, formateo) está en `utils/`, así se puede probar con `npm test` y reutilizar.

## Carpetas y responsabilidades

| Carpeta | Responsabilidad |
|---|---|
| `main.jsx` | Monta la app y carga los estilos globales |
| `App.jsx` | Crea el router (`createBrowserRouter`) y envuelve todo con los providers |
| `routes/clienteRoutes.jsx` | Tabla de rutas de la vista de cliente |
| `routes/guards.jsx` | `RequireAuth` (pide sesión) y `RequireCompra` (pide función y butacas) |
| `layouts/ClienteLayout.jsx` | Skip link, header, `<main>`, footer, foco al cambiar de página y avisos de redirección |
| `layouts/CompraLayout.jsx` | Stepper de la compra arriba de cada paso; `CompraLayout.module.css` tiene la grilla compartida (contenido + resumen) |
| `pages/` | Una carpeta por pantalla, con sus subcomponentes y su CSS |
| `components/` | Componentes reutilizables, cada uno en su carpeta con `.jsx` y `.module.css` |
| `context/` | Estado global: sesión, compra en curso y notificaciones |
| `hooks/` | Hooks propios |
| `services/` | Capa de datos |
| `mocks/` | Datos de prueba con la forma de los DTO del back-end |
| `utils/` | Funciones puras: formato, validaciones, compra, cartelera, almacenamiento |
| `styles/` | `tokens.css` (todas las variables de diseño) y `global.css` (reset, tipografía, foco, utilidades) |

## Rutas

| Ruta | Página | Protección |
|---|---|---|
| `/` | `Cartelera` | Pública |
| `/peliculas/:id` | `Pelicula` | Pública |
| `/promociones` | `Promociones` | Pública |
| `/candy` | `CandyMenu` (menú de precios) | Pública |
| `/acerca-de` | `AcercaDe` (qué es, la materia y el equipo) | Pública |
| `/ingresar`, `/registro` | `Ingresar`, `Registro` | Pública |
| `/compra/:funcionId/butacas` | `Butacas` | Pública: se pueden elegir butacas sin sesión |
| `/compra/candy` | `Candy` | `RequireCompra` |
| `/compra/pago` | `Pago` | `RequireCompra` + `RequireAuth` |
| `/compra/confirmacion/:ticketId` | `Confirmacion` | `RequireAuth` |
| `/mis-compras`, `/membresia` | `MisCompras`, `Membresia` | `RequireAuth` |
| `*` | `NotFound` | Pública |

Las rutas de compra están anidadas dentro de `CompraLayout` (comparten el stepper), y todo está dentro de `ClienteLayout`.

**Preparado para empleado y administrador:** se agregan `routes/empleadoRoutes.jsx` y `routes/adminRoutes.jsx`, cada una con su layout (`EmpleadoLayout`, `AdminLayout`) y un guard que verifique `usuario.rol`. Después se suman en `App.jsx`: `createBrowserRouter([...clienteRoutes, ...empleadoRoutes, ...adminRoutes])`. Por ahora no hay accesos visibles a esas vistas.

**Redirecciones con aviso:** cuando un guard redirige, manda en el `state` de la navegación un `aviso` (`{ tipo, mensaje }`). `ClienteLayout` lo muestra como toast y lo borra del historial. Además, `RequireAuth` manda `from` para que, después del login, el usuario vuelva a la pantalla donde estaba (por ejemplo, al pago).

## Contexts

| Context | Provider | Hook | Qué guarda | Persistencia |
|---|---|---|---|---|
| `AuthContext` | `AuthProvider.jsx` | `useAuth()` | `usuario` y las funciones `iniciarSesion`, `registrarse`, `cerrarSesion` | `localStorage` (`cmp-sesion`) |
| `CompraContext` | `CompraProvider.jsx` | `useCompra()` | `funcion`, `butacas`, `candy`, `ultimaCompra` y las acciones para cambiarlos | `sessionStorage` (`cmp-compra`) |
| `ToastContext` | `ToastProvider.jsx` | `useToast()` | Lista de notificaciones y `mostrarToast` | Ninguna |

Cada context está separado en tres archivos (el objeto del context, el provider y el hook) porque ESLint, para que funcione la recarga en caliente de Vite, pide que un archivo `.jsx` exporte solo componentes.

**¿Por qué Context y no props?** La sesión y la compra en curso se usan en muchas pantallas que no son padre e hijo (el header, los guards, el pago, la confirmación). Pasarlas por props obligaría a atravesar layouts y rutas que no las usan.

## Hooks propios

| Hook | Qué hace | Dónde se usa |
|---|---|---|
| `useAsync(funcion)` | Ejecuta un pedido a la API y devuelve `{ datos, error, cargando, reintentar, actualizarDatos }`. La función va envuelta en `useCallback` y el pedido se repite cuando cambia. Ignora respuestas viejas si el componente cambió. | Todas las páginas que cargan datos |
| `useFormulario(valoresIniciales, validar)` | Formulario controlado: valores, errores visibles (después de salir del campo o de intentar enviar) y `validarAlEnviar()` | Ingresar, Registro, Pago, Buscador |
| `useDocumentTitle(titulo)` | Cambia el título de la pestaña | Todas las páginas |
| `useCarrusel(cantidad)` | Slide actual, navegación y avance automático con su pausa | `Carrusel` |
| `useCuentaRegresiva(vencimiento)` | Segundos que faltan, calculados como `vencimiento - ahora`, con un intervalo que se limpia | `TemporizadorCompra` |
| `usePagoBilletera(idPago, onAprobado)` | Polling del estado del pago cada 2 segundos, con limpieza del intervalo | `Pago` |
| `useAuth`, `useCompra`, `useToast` | Leen el context correspondiente | Varias |

## Capa de datos (`services/`)

| Archivo | Rol |
|---|---|
| `api.js` | Interfaz pública. Exporta las funciones de `mockApi` o de `httpApi` según `VITE_USE_MOCKS` |
| `mockApi.js` | Implementación simulada: demora de 300 a 800 ms, reglas de negocio copiadas del back y errores `ApiError` con los mismos códigos |
| `httpApi.js` | Implementación real con `fetch` (lista para usar) |
| `mockDb.js` | "Base" simulada: compras, usuarios registrados y butacas ocupadas por otros. Se lee y se escribe en `localStorage` en cada operación |
| `simulacion.js` | Modo de errores para la demo (`?error=1`, `?error=409`) |
| `ApiError.js` | Error con el formato del back-end: `{ timestamp, status, error, message, path, detalles }` |

## Flujo de una compra

1. **Ficha de película:** el horario es un link a `/compra/:funcionId/butacas`.
2. **Butacas:** carga la función y el mapa (`getFuncion` + `getButacas`) y llama a `sincronizarFuncion` del `CompraContext`, que guarda la función y descarta las butacas elegidas que ahora figuran ocupadas. Cada click llama a `alternarButaca`, con un tope de 8.
3. **Candy (opcional):** `agregarCandy`, `quitarUnCandy`, `eliminarCandy` y `vaciarCandy`. Se puede saltear.
4. **Pago:** `RequireAuth` pide login si hace falta y después vuelve. Al enviar: se valida, se controla el tiempo, se aprueba el pago simulado (`procesarPago` con tarjeta, o `crearPagoBilletera` y polling con billetera), se llama a `comprar(...)` y se guarda el resultado con `finalizarCompra`.
5. **Confirmación:** muestra la compra (la del context o, si se entra directo por URL, la del historial) y llama a `limpiarSeleccion()`.
6. **Mis compras:** `getHistorial` y `cancelarCompra`. Al cancelar, el mock deja de contar esas butacas como ocupadas.

Si al pagar el servidor responde 409 porque una butaca ya está ocupada, se vuelve al paso 2 con un aviso y el mapa recargado.

## Estilos

- `tokens.css` define colores, tipografías, tamaños fluidos con `clamp()`, espaciado, radios, sombras, z-index y las paletas de los pósters. Los componentes solo usan `var(--...)`.
- Cada componente tiene su `*.module.css`: las clases quedan con nombres únicos y no chocan entre componentes.
- El diseño es mobile-first: los estilos base son para celular y las `@media (min-width: ...)` agregan columnas en 768, 1024 y 1440 px.
- Un solo estilo de botón (`Button` con variantes `primario`, `secundario`, `texto` y `peligro`), un solo campo (`FormField`) y un solo estilo de tarjeta por tipo de contenido.

## Cómo agregar una pantalla nueva

1. Crear `src/pages/MiPantalla/MiPantalla.jsx` y su `.module.css`.
2. Si necesita datos, agregar la función en `mockApi.js` y en `httpApi.js`, exportarla en `api.js` y usarla con `useAsync`.
3. Mostrar los tres estados con `Cargando`/`Skeleton`, `ErrorState` y `EmptyState`.
4. Usar `EncabezadoPagina` (un solo `<h1>`) y `useDocumentTitle`.
5. Registrar la ruta en `routes/clienteRoutes.jsx` (dentro de `RequireAuth` si necesita sesión) y, si corresponde, el link en `Header.jsx`.

## Tiempo de la compra y retención de butacas

- `CompraContext` guarda `vencimiento` (timestamp), `extensionUsada` e `idReserva`, y los persiste en `sessionStorage`. Por eso recargar no reinicia el tiempo.
- `alternarButaca` fija el vencimiento con la primera butaca y lo cancela si se sacan todas.
- `TemporizadorCompra` está en `ClienteLayout`, así se ve en todos los pasos, incluido el login. Al vencer llama a `expirarCompra`, salvo que haya un pago en curso (`pagando`).
- Cuando cambia `idReserva`, un efecto de `CompraProvider` libera la reserva anterior.
- La retención vive en `mockDb` (`retenciones`). `getButacas` marca como ocupadas las butacas retenidas por otra reserva vigente. Las vencidas se ignoran solas.

## Imágenes

`utils/imagenes.js` usa `import.meta.glob` para saber qué archivos hay en `src/assets/img`. `PosterImagen`, `Avatar` e `ImagenAmbiente` usan la URL si existe y, si no existe o falla (`onError`), muestran su alternativa. El carrusel, con banner o sin él, siempre tiene un fondo propio.
