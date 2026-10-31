# Accesibilidad

Objetivo: **WCAG 2.1 nivel AA**. Este documento resume las decisiones, los patrones ARIA, los contrastes y el recorrido con teclado. Al final está lo que se verificó automáticamente y lo que queda por revisar a mano.

## Estructura y semántica

- `<html lang="es">` en `index.html`.
- Landmarks en `ClienteLayout`: `<header>`, `<nav aria-label="Principal">`, `<main id="contenido">` y `<footer>`. Hay otros `nav` con nombre propio: "Pasos de la compra" (stepper), "Ruta de navegación" (ficha de película) y "Explorá" (footer). El resumen de compra es un `<aside>`.
- **Un solo `<h1>` por página.** Está en `EncabezadoPagina`, salvo en la cartelera, donde es visualmente oculto ("CineManagerPro: cartelera y venta de entradas") porque la primera pieza visual es el estreno destacado. Los encabezados no saltan niveles (verificado en las 10 rutas públicas).
- Las listas de películas, funciones, productos, compras y promociones son `<ul>`. Cada tarjeta de película o compra es un `<article>`. Los datos clave-valor (función, sala, butacas) son `<dl>`. El detalle de entradas es una `<table>` con `<caption>` y `<th scope="col">`.
- `document.title` distinto en cada página (`useDocumentTitle`), por ejemplo "Interstellar | CineManagerPro".

## Navegación con teclado y foco

- **Skip link** "Saltar al contenido": es el primer elemento enfocable (verificado) y lleva al `<main>`.
- **Foco al cambiar de página:** `ClienteLayout` mueve el foco al `<main>` y sube el scroll. Se eligió `<main>` y no el `<h1>` porque varias páginas reemplazan el `<h1>` del estado "cargando" por el definitivo cuando llegan los datos, y el foco se perdía (se probó y pasaba). `<main>` es siempre el mismo elemento. Junto con el cambio de `document.title`, el lector de pantalla anuncia la página nueva.
- **Foco visible:** `:focus-visible` con un contorno amarillo de 3 px (`--color-foco`, 12.2:1 sobre el fondo). Nunca se quita el contorno; en las tarjetas de película el foco se dibuja en toda la tarjeta (`:has(.enlace:focus-visible)`).
- Todo lo clickeable es `<button>` o `<a>`/`<Link>`; no hay `div` con `onClick` (verificado con grep).
- Área táctil mínima de 44 px (`--area-tactil`) en botones, links de menú, contadores y pestañas. Las butacas miden 40 px en celular y 44 px desde 768 px.

### Recorrido con Tab (registrado con Chrome headless)

**Cartelera (`/`)**, desde que carga la página: Saltar al contenido → logo → Cartelera → Candy → Promociones → Ingresar → "Comprá tus entradas" del slide visible → pausa del carrusel → película anterior → puntos → película siguiente → Película (select) → Día → Horario → Buscar funciones → 2D → 3D → 4DX → Todos → cada uno de los 7 días → cada película de la grilla → "Ver todas las promociones" → películas de "Próximamente" → links del footer → "Restablecer datos de prueba".

**Ficha de película (`/peliculas/1`)**, desde el `<main>`: link "Cartelera" (ruta de navegación) → los días con funciones (los días sin funciones están deshabilitados y se saltean) → cada horario (aria-label: "18:00 h, Sala 1, 2D, $ 4.500,00. Elegir butacas") → footer.

**Butacas:** link del paso "Función (completado)" → "Cambiar de función" → cada butaca libre en orden de fila y número (las ocupadas están `disabled` y no reciben foco). Adentro del mapa, las **flechas** mueven el foco a la butaca libre más cercana en esa dirección. Enter o Espacio la eligen. Después: "Ver detalle" (en celular) → Continuar.

**Candy:** "Saltear candy e ir al pago" → pestaña activa (con ← → Inicio Fin se cambia de categoría) → panel → "Agregar" o − / + de cada producto → carrito (− / + / quitar / Vaciar carrito) → "Continuar al pago".

**Pago:** resumen de errores (si hay) → radios de medio de pago (con flechas, porque son un grupo nativo) → número → titular → vencimiento → CVV → mail → "Pagar $ ...".

**Ingresar:** "Completar con el usuario de prueba" → Mail → Contraseña → "Mostrar contraseña" → Ingresar → Registrate.

## Patrones ARIA usados

| Componente | Patrón | Detalle |
|---|---|---|
| `SeatMap` | Botones de alternar en un `role="group"` | `aria-label="Fila B, butaca 4, disponible"`, `aria-pressed` cuando está en tu selección, `disabled` si está ocupada. El estado no depende solo del color: tu selección lleva un tilde y la ocupada una cruz con borde punteado. Navegación con flechas. |
| Total y subtotales | `aria-live="polite"` + `aria-atomic` | `ResumenCompra` y `Carrito` anuncian el total cuando cambia |
| Aviso de máximo de butacas | Región `aria-live="polite"` | "Llegaste al máximo de 8 butacas por compra..." |
| `Tabs` (categorías de candy) | Tabs de WAI-ARIA | `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`, `tabIndex` móvil, flechas, Inicio y Fin |
| `FiltroChips` (formato y día) | Botones de alternar con `aria-pressed` en un `role="group"` con nombre | Ver la justificación abajo |
| `Dialog` / `ConfirmDialog` | `<dialog>` nativo con `showModal()` | Foco atrapado y cierre con Esc los da el navegador. `aria-modal="true"`, `aria-labelledby` al título. Al cerrar, el foco vuelve al botón que lo abrió; si ese botón ya no existe (después de cancelar una compra), va al título de la compra. |
| `ToastRegion` | `aria-live="polite"` | Cada notificación se anuncia sin mover el foco; tiene un botón de cerrar con nombre |
| Header en celular | Botón de menú | `aria-expanded` y `aria-controls="menu-principal"`; Esc cierra y devuelve el foco al botón |
| "Ver detalle" (resumen y compras) | Disclosure | `aria-expanded` y `aria-controls` |
| `NavLink` y stepper | `aria-current` | `page` en el link actual, `step` en el paso actual. Los pasos completos dicen "(completado)" para el lector de pantalla |
| `FormField` | Campo con descripción | `<label for>`, `aria-invalid`, `aria-describedby` apuntando a la ayuda y al error, `aria-required` |
| `ErrorSummary` | Resumen de errores | `role="alert"`, recibe el foco al enviar y cada error es un link que enfoca el campo |
| `CampoPassword` | Botón de alternar | `aria-pressed` y "Mostrar contraseña" |
| Estados de carga | `role="status"` + `aria-busy` | Texto oculto "Cargando..." mientras se ven los skeletons |
| Errores | `role="alert"` | `ErrorState`, el error del pago y el del login |
| Pósters CSS y QR | Decorativos | `aria-hidden="true"`; el título y el código de reserva están como texto real |
| Iconos | Decorativos por defecto | `aria-hidden`; los botones que tienen solo un ícono llevan `aria-label` |

### ¿Por qué tabs en el candy y botones con `aria-pressed` en los filtros?

- **Candy → tabs:** cada categoría reemplaza un panel entero de productos, y solo puede haber una activa. Es exactamente lo que define el patrón de pestañas.
- **Formato y día → `aria-pressed`:** no cambian de panel, filtran una lista que se queda en el mismo lugar. En formato se pueden elegir varios a la vez (2D y 3D), cosa que el patrón de tabs no permite. Además, como botones comunes se recorren todos con Tab, que es lo que espera quien filtra.

## Formularios

- Todos tienen `noValidate`: la validación es propia, con mensajes en español que dicen qué está mal y cómo arreglarlo ("Usá el formato MM/AA. Ejemplo: 08/29").
- Se valida al salir del campo (blur) y al enviar. Al enviar con errores aparece el resumen enfocado.
- `autocomplete` correcto: `email`, `current-password`, `new-password`, `name`, `bday`, `cc-number`, `cc-name`, `cc-exp`, `cc-csc`. `inputMode="numeric"` en la tarjeta, el CVV y el DNI.
- Los campos obligatorios llevan un asterisco visual y `aria-required`.
- Los medios de pago son radios nativos en un `<fieldset>` con `<legend>`.

## Contraste (calculado con la fórmula de WCAG)

| Texto o elemento | Fondo | Ratio | Mínimo | Resultado |
|---|---|---|---|---|
| Texto `#F5F5F7` | Fondo `#0B0B10` | 18.03 | 4.5 | Cumple |
| Texto `#F5F5F7` | Superficie `#17171F` | 16.36 | 4.5 | Cumple |
| Texto `#F5F5F7` | Superficie 2 `#22222C` | 14.47 | 4.5 | Cumple |
| Texto `#F5F5F7` | Superficie 3 `#2C2C38` | 12.65 | 4.5 | Cumple |
| Texto suave `#B4B4BE` | Fondo | 9.55 | 4.5 | Cumple |
| Texto suave `#B4B4BE` | Superficie | 8.66 | 4.5 | Cumple |
| Texto suave `#B4B4BE` | Superficie 2 | 7.66 | 4.5 | Cumple |
| Texto suave `#B4B4BE` | Superficie 3 | 6.70 | 4.5 | Cumple |
| Blanco `#FFFFFF` | Rojo primario `#D11A2A` | 5.40 | 4.5 | Cumple |
| Blanco | Rojo hover `#B5121F` | 6.84 | 4.5 | Cumple |
| Blanco | Rojo activo `#9A0F1A` | 8.55 | 4.5 | Cumple |
| Texto oscuro `#0B0B10` | Amarillo `#FFC233` | 12.17 | 4.5 | Cumple |
| Texto oscuro | Amarillo hover `#FFD166` | 13.62 | 4.5 | Cumple |
| Amarillo `#FFC233` (links, precios) | Fondo / superficie / superficie 2 | 12.17 / 11.04 / 9.76 | 4.5 | Cumple |
| Error `#FF5C66` | Fondo / superficie / superficie 2 | 6.52 / 5.92 / 5.23 | 4.5 | Cumple |
| Éxito `#4ADE80` | Fondo / superficie | 11.27 / 10.22 | 4.5 | Cumple |
| Info `#7CC4FF` | Superficie | 9.50 | 4.5 | Cumple |
| Borde de controles `#6B6B78` | Fondo / superficie / superficie 2 | 3.74 / 3.39 / 3.00 | 3 (componentes de UI) | Cumple |
| Contorno de foco `#FFC233` | Fondo | 12.17 | 3 | Cumple |

El rojo primario como texto sobre el fondo da 3.64: solo se usa en el número decorativo "404" (texto grande, mínimo 3:1) y en iconos decorativos, nunca para texto chico.

## Movimiento

`global.css` respeta `prefers-reduced-motion: reduce`: anula animaciones y transiciones (skeleton, toasts, spinner, hover de las tarjetas).

## Qué se verificó y qué falta

Verificado con Chrome headless (scripts de prueba con el protocolo DevTools):

- Un `<h1>` por página y sin saltos de encabezados en 10 rutas, en 360, 768, 1024 y 1440 px.
- Sin scroll horizontal de página en esos 4 anchos.
- Todos los botones, links y campos tienen nombre accesible; no hay `href="#"`.
- Recorrido con Tab de cartelera, ficha, butacas e ingresar; selección de butacas con Enter, Espacio y flechas; pestañas con flechas; diálogo con Esc y devolución del foco; menú móvil con `aria-expanded`.
- Consola del navegador sin errores ni warnings durante el flujo completo.

**No verificado (queda para revisar a mano):**

- No se probó con un lector de pantalla real (NVDA, VoiceOver). Se recomienda recorrer el flujo de compra con NVDA + Chrome.
- No se pasó una herramienta automática como axe o Lighthouse (no se agregaron dependencias).
- El zoom al 200% y el modo de alto contraste de Windows no se probaron.

## Carrusel de destacados

- Patrón de carrusel de WAI-ARIA: `aria-roledescription="carrusel"` en la sección, y `role="group"` con `aria-roledescription="diapositiva"` y `aria-label="1 de 5: La última función"` en cada slide.
- Los slides que no se ven quedan `inert`: sus links no reciben foco ni los lee el lector de pantalla.
- Controles con nombre: pausar (botón de alternar con `aria-pressed`), película anterior, película siguiente y un punto por slide (`aria-label="Ir a la película 2: ..."`, `aria-current` en el actual). El punto actual se distingue por color y por forma.
- Teclado: flechas izquierda y derecha con el foco dentro del carrusel.
- El avance automático se detiene con el mouse encima, con el foco adentro o con el botón de pausa, y no arranca si el usuario pidió `prefers-reduced-motion` (verificado).
- `aria-live` vale `off` mientras avanza solo y `polite` cuando está detenido, para no interrumpir al lector de pantalla.

## Temporizador de la compra

- WCAG 2.2.1 (tiempo ajustable): con 1 minuto o menos aparece "Necesito más tiempo", que suma 5 minutos una sola vez por compra.
- El contador no está en una región viva, así que no se anuncia cada segundo. Una región `aria-live="polite"` aparte solo cambia a los 5 minutos y a 1 minuto. Al vencer, el aviso lo da el diálogo, que recibe el foco.
- La advertencia no depende solo del color: cambia el ícono y se agrega texto. El rojo `#FF5C66` sobre las superficies de la barra da 5.92 y 5.23.
- Al usar el botón, que desaparece, el foco pasa a la barra del temporizador.

## Pago con QR

- El QR es decorativo (`aria-hidden`): el código de operación y el monto están como texto.
- El estado ("Esperando confirmación del pago...") está en una región `aria-live="polite"`, y el spinner es decorativo.
- Al generar el QR el botón desaparece, así que el foco pasa al panel. Al elegir otro medio, el foco pasa al radio seleccionado.
- Los controles de demo están en un grupo con nombre ("Solo para la demo").

## Imágenes

- Pósters con `alt="Póster de X"`, `width`/`height` y `aspect-ratio`, así no salta el diseño.
- Los banners y las fotos de ambiente son decorativos (`alt=""`): el título de la película y el contenido están como texto. Sobre el banner hay un velo oscuro para mantener el contraste del texto.
- Avatares: `alt` con el nombre o, sin foto, un círculo de iniciales con `role="img"` y el nombre como etiqueta. Texto oscuro sobre amarillo: 12.17.

El contraste del texto sobre los banners se resolvió con el velo, pero no se midió foto por foto: conviene revisarlo a ojo al cargar banners nuevos.
