# Preguntas probables para la defensa (front-end)

Respuestas pensadas sobre **este** código. Al lado de cada respuesta está el archivo para mostrar.

---

## Conceptos de React

### ¿Qué es un componente funcional?
Es una función de JavaScript que recibe props y devuelve JSX (lo que se ve en pantalla). Por ejemplo, `Contador` (`components/Contador/Contador.jsx`) recibe `nombre`, `cantidad`, `onSumar` y `onRestar`, y devuelve los botones − y +. React la vuelve a ejecutar cada vez que cambian sus props o su estado.

### ¿Qué diferencia hay entre props y estado?
- **Props:** datos que un componente recibe de su padre. Son de solo lectura. `PosterCard` recibe `pelicula` y `formatos` desde `Cartelera`.
- **Estado:** datos que el componente guarda y puede cambiar con `useState`. Cuando cambian, el componente se vuelve a dibujar. En `Cartelera.jsx`, `formatos` y `dia` son estado: cambian cuando el usuario toca un filtro, y la grilla se recalcula.

Regla práctica: si el dato viene de afuera es una prop; si cambia por una acción del usuario dentro del componente, es estado.

### ¿Para qué sirve cada hook que usamos?

| Hook | Para qué | Ejemplo real |
|---|---|---|
| `useState` | Guardar un valor que cambia y redibujar | `const [menuAbierto, setMenuAbierto] = useState(false)` en `Header.jsx` |
| `useEffect` | Ejecutar algo después de dibujar (efecto secundario): pedidos, títulos, foco | `useDocumentTitle` cambia `document.title`; `useAsync` hace el pedido a la API |
| `useContext` | Leer un valor global sin pasarlo por props | `useAuth()` devuelve `useContext(AuthContext)` |
| `useCallback` | Mantener la misma función entre renders | En `Pelicula.jsx`, `cargarPelicula` solo cambia si cambia el `id`, así `useAsync` no repite el pedido en cada render |
| `useRef` | Guardar algo que no provoca un nuevo render, o referenciar un elemento del DOM | `mainRef` en `ClienteLayout` para enfocar el `<main>`; `ref` del `<dialog>` para llamar a `showModal()` |
| `useId` | Generar ids únicos para conectar etiquetas y elementos | `Dialog` usa `useId()` para el `aria-labelledby` del título |
| Hooks propios | Reutilizar lógica con estado | `useAsync`, `useFormulario`, `useDocumentTitle`, `useAuth`, `useCompra`, `useToast` |

### ¿Cómo se relaciona `useEffect` con el ciclo de vida?
- **Montaje:** el efecto corre después del primer render. `useEffect(() => {...}, [])` corre una sola vez.
- **Actualización:** con dependencias (`[funcion, intento]` en `useAsync`) vuelve a correr cuando alguna cambia.
- **Desmontaje:** la función que devuelve el efecto es la "limpieza". En `useAsync` pone `vigente = false` para no guardar la respuesta de un pedido viejo si el usuario ya se fue de la página. En `Dialog`, la limpieza cierra el diálogo y devuelve el foco.

### ¿Qué es el renderizado condicional? ¿Dónde lo usan?
Mostrar una cosa u otra según una condición, con `&&`, el operador ternario o un `if` con `return`. En todas las páginas con datos:
```jsx
{cargando && <Cargando ... />}
{error && <ErrorState ... onReintentar={reintentar} />}
{datos && <CarteleraContenido ... />}
```
En `Header.jsx`: si hay `usuario` se muestra "Hola, Ana" y "Salir"; si no, "Ingresar".

### ¿Qué es un formulario controlado?
Uno donde el valor de cada campo vive en el estado de React y el input lo muestra (`value={valores.mail}`). Cada tecla llama a `onChange`, que actualiza el estado. Así podemos validar y formatear mientras se escribe: en `Pago.jsx`, el número de tarjeta pasa por `formatearNumeroTarjeta` antes de guardarse, y por eso aparece con espacios cada 4 dígitos. El hook `useFormulario` concentra esa lógica.

### ¿Cuándo usar Context y cuándo pasar props?
- **Props**, cuando el dato va de un padre a un hijo cercano: `ResumenCompra` recibe `funcion`, `butacas` y `candy`.
- **Context**, cuando muchas pantallas que no están conectadas entre sí necesitan el mismo dato. La sesión se usa en el header, en los guards, en el pago y en Mis compras; la compra en curso, en butacas, candy, pago, confirmación y el stepper. Pasarlas por props obligaría a atravesar layouts y rutas que no las usan ("prop drilling").

### ¿Cómo funciona React Router en el proyecto?
- `App.jsx` crea el router con `createBrowserRouter(clienteRoutes)`.
- `clienteRoutes.jsx` es una lista de objetos `{ path, element, children }`. Las rutas hijas se dibujan dentro del `<Outlet />` del padre (`ClienteLayout` → `CompraLayout` → `Butacas`).
- `useParams()` lee los parámetros: `const { id } = useParams()` en `Pelicula.jsx`.
- `<Link>` y `<NavLink>` navegan sin recargar la página; `NavLink` marca la página actual con `aria-current="page"`.
- `useNavigate()` navega desde código (después de pagar va a la confirmación).
- `<Navigate>` redirige: los guards (`RequireAuth`, `RequireCompra`) lo usan para proteger rutas.

### ¿Por qué CSS Modules?
Cada componente tiene su `*.module.css` y Vite convierte las clases en nombres únicos (`.boton` pasa a ser `_boton_x1y2z`). Así dos componentes pueden tener una clase `.titulo` sin pisarse. No requiere dependencias. Los valores compartidos (colores, espaciados) están en `tokens.css` como variables CSS, así todo el sitio es consistente y cambiar un color es tocar una sola línea.

### ¿Por qué existe la capa `services/`?
Para separar la presentación del acceso a datos. Los componentes llaman a `getPeliculas()` sin saber si los datos vienen del mock o del servidor. `api.js` elige `mockApi.js` o `httpApi.js` según `VITE_USE_MOCKS`. Ventajas: se puede trabajar sin back-end, conectar la API real es cambiar una variable, y los errores llegan siempre con el mismo formato (`ApiError`).

### ¿Cómo manejan la carga y los errores?
Con el hook `useAsync` (`hooks/useAsync.js`):
1. La página le pasa la función que pide los datos (envuelta en `useCallback`).
2. El hook ejecuta el pedido en un `useEffect` y guarda el resultado o el error.
3. Devuelve `cargando`, `datos`, `error` y `reintentar`.
4. La página muestra un skeleton, el `ErrorState` con "Reintentar" o el contenido. Si la lista viene vacía, un `EmptyState`.

Para las acciones (pagar, cancelar, login) se usa un estado `procesando` que deshabilita el botón y muestra "Procesando...", y el resultado se informa con un toast o un mensaje en la página.

### ¿Cómo harían accesible un componente nuevo?
1. Usar el elemento HTML correcto (`button` para acciones, `a`/`Link` para navegar, `label` para campos).
2. Darle un nombre accesible (texto visible o `aria-label`).
3. Comunicar el estado con atributos (`aria-pressed`, `aria-expanded`, `aria-selected`, `disabled`) y no solo con color.
4. Que funcione con teclado y tenga el foco visible (ya está en `global.css`).
5. Si cambia algo sin mover el foco, anunciarlo con `aria-live`.
6. Usar los tokens de color, que ya cumplen los contrastes AA.

---

## Preguntas sobre decisiones del proyecto

### ¿Por qué el foco va al `<main>` y no al `<h1>` al cambiar de página?
Lo probamos con el `<h1>` y, en las páginas que cargan datos, el `<h1>` del estado "cargando" se reemplaza por otro cuando llegan los datos, así que el foco se perdía. `<main>` es siempre el mismo elemento. Junto con el cambio de `document.title`, el lector de pantalla anuncia la página nueva.

### ¿Por qué el "cargando" de `useAsync` no es un estado aparte?
Porque se puede calcular: si el último resultado guardado corresponde a otro pedido, todavía estamos cargando. Así no hace falta llamar a `setState` adentro del efecto antes del pedido, y no hay forma de que `cargando` y `datos` queden desincronizados.

### ¿Por qué en "Salir" y "Restablecer datos" se usa `startTransition`?
React Router hace la navegación como una transición. Si cerrábamos la sesión de forma inmediata estando en "Mis compras", React dibujaba primero la página protegida sin usuario y `RequireAuth` mandaba a `/ingresar`. Con `startTransition`, la navegación y el cierre de sesión se aplican juntos.

### ¿Cómo se evita mandar datos de la tarjeta?
Los datos viven solo en el estado del formulario de `Pago.jsx`. A `procesarPago` le llegan el medio, el monto y los últimos 4 dígitos. No se guardan en `localStorage` ni en el context, y desaparecen cuando se desmonta la página.

---

## 10 preguntas de "¿cómo modificarías o extenderías X?"

1. **¿Cómo conectarías la API real?** Creás `.env.local` con `VITE_USE_MOCKS=false` y `VITE_API_URL=http://localhost:8080`, y habilitás CORS en el back. No se toca ningún componente (ver `INTEGRACION_BACKEND.md`).

2. **¿Cómo agregarías la vista de administrador?** Creo `routes/adminRoutes.jsx` con un `AdminLayout` y un guard `RequireRol` que verifique `usuario.rol === 'ADMINISTRADOR'` (como `RequireAuth`, pero comparando el rol). Lo sumo en `App.jsx`: `createBrowserRouter([...clienteRoutes, ...adminRoutes])`. Las funciones CRUD (`crearPelicula`, `crearFuncion`...) van en `mockApi.js` y `httpApi.js`.

3. **¿Cómo cambiarías el máximo de butacas de 8 a 10?** Cambio `MAX_BUTACAS` en `utils/compra.js`. La usan el context, el mensaje, el resumen y las instrucciones.

4. **¿Cómo agregarías un formato nuevo, por ejemplo IMAX?** Agrego `IMAX: 'IMAX'` en `ETIQUETAS_FORMATO` (`utils/formato.js`) y en el orden de `formatosDePelicula` (`utils/cartelera.js`). Los filtros y las agrupaciones se arman solos a partir de esa lista. En el back hay que sumar el valor al enum `FormatoFuncion`.

5. **¿Cómo harías que las promociones se apliquen al total?** El descuento lo tiene que calcular el servidor (si no, el front podría mandar cualquier total). Agregaría `promocionId` al body de la compra; el back devuelve el `total` con el descuento y el front ya lo muestra, porque usa `compra.total`. En el resumen previo mostraría el descuento como estimado.

6. **¿Cómo agregarías un filtro por género en la cartelera?** Un estado `generos` en `CarteleraContenido`, otro `FiltroChips` con los géneros sacados de las películas (`new Set(peliculas.map(p => p.genero))`), y una condición más en `filtrarPeliculas` (`utils/cartelera.js`).

7. **¿Cómo guardarías el candy en la compra real?** El back necesita una entidad de productos y un campo `items` en `POST /api/clientes/compras`. En el front, `Pago.jsx` agrega `items: compra.candy.map(({ id, cantidad }) => ({ productoId: id, cantidad }))` al llamar a `comprar`, y `CompraItem` muestra los items del historial.

8. **¿Cómo agregarías "editar mis datos" en Mi cuenta?** Una función `actualizarUsuario(id, datos)` en los servicios (`PUT /api/usuarios/{id}`), un formulario con `useFormulario` y `validarRegistro`, y al guardar actualizar el usuario en `AuthProvider` (una función nueva, `actualizarSesion`).

9. **¿Cómo agregarías un tema claro?** Como los colores son variables en `tokens.css`, alcanza con redefinirlas dentro de `@media (prefers-color-scheme: light)` o de una clase `.tema-claro` en `<html>`, y recalcular los contrastes. Los componentes no cambian.

10. **¿Cómo agregarías tests de componentes?** Con Vitest y Testing Library (habría que pedir permiso para sumar esas dependencias). Por ejemplo, para `SeatMap`: renderizarlo con un mapa, hacer click en una butaca y verificar que se llama `onAlternar` con esa butaca; y que una butaca ocupada está `disabled`. La lógica pura ya se prueba con `npm test`.
