# Linterna Cines: front-end (vista de cliente)

Front-end del TPO de **Aplicaciones Interactivas (UADE, 2.º cuatrimestre 2026)**. Es el sitio de un cine ficticio con cartelera, compra de entradas con selección de butacas, candy, pago simulado y gestión de la cuenta del cliente (historial de compras, cancelación y membresía).

En esta etapa **no se conecta al back-end**: todo funciona con datos simulados que tienen exactamente la misma forma JSON que la API real (`../TP--API-UADE`). Conectarla después es cambiar una variable de entorno (ver [Integración con el back-end](docs/INTEGRACION_BACKEND.md)).

## Requisitos

- Node.js 20 o más nuevo (se probó con Node 22).
- npm.

## Cómo levantarlo

```bash
npm install
npm run dev
```

Abrí la URL que muestra la consola (por defecto `http://localhost:5173`).

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve la versión de producción |
| `npm run lint` | Revisa el código con ESLint |
| `npm test` | Autoverificación de la lógica (validaciones, Luhn, totales, formateo) sin dependencias extra |

## Usuario de prueba

| Mail | Contraseña | Qué tiene |
|---|---|---|
| `ana@mail.com` | `ana1234` | Clienta, socia **GOLD** con 150 puntos |
| `bruno@mail.com` | `bruno1234` | Cliente, no socio |

Son los mismos usuarios de `database/02_datos.sql`. La pantalla de login tiene un botón para completar los datos de Ana. También podés registrarte con un usuario nuevo.

**Tarjeta de prueba para el pago:** `4509 9535 6623 3704`, con cualquier vencimiento futuro y CVV de 3 dígitos. Una tarjeta válida terminada en `0002` (por ejemplo `4000 0000 0000 0002`) se rechaza siempre, para mostrar el error de pago. El pago es simulado: los datos de la tarjeta no se envían ni se guardan.

## Variables de entorno

Copiá `.env.example` como `.env.local` si querés cambiar algo. Si no, se usan los valores por defecto.

| Variable | Por defecto | Para qué sirve |
|---|---|---|
| `VITE_USE_MOCKS` | `true` | `true` usa los datos simulados (`src/services/mockApi.js`); `false` usa la API real (`src/services/httpApi.js`) |
| `VITE_API_URL` | `http://localhost:8080` | URL del back-end. Solo se usa con `VITE_USE_MOCKS=false` |
| `VITE_SIMULAR_ERRORES` | `false` | `true` hace fallar todas las consultas simuladas con un error 500 |

### Simular errores en la demo, sin tocar código

| URL | Qué pasa |
|---|---|
| `?error=1` (por ejemplo `http://localhost:5173/?error=1`) | Todas las consultas fallan con 500: se ve el estado de error con el botón **Reintentar** |
| `?error=409` en cualquier página antes de pagar | Al pagar, "otra persona" se queda con una de tus butacas: se ve el error 409 y la vuelta al mapa actualizado |
| `?error=0` o el botón **Desactivar** del aviso amarillo | Apaga el modo de errores |

Mientras el modo está activo, arriba de todo aparece un aviso con un botón para desactivarlo.

## Resetear los datos de prueba

Las compras, las cancelaciones y los usuarios registrados se guardan en el `localStorage` del navegador, así sobreviven a un recargar. Para volver al estado inicial, usá el botón **Restablecer datos de prueba** del footer: borra todo y cierra la sesión.

## Estructura de carpetas

```
src/
  main.jsx, App.jsx    Punto de entrada; App arma el router y los providers
  routes/              Rutas de la vista de cliente y guards (rutas protegidas)
  layouts/             ClienteLayout (header, main, footer) y CompraLayout (stepper)
  pages/               Una carpeta por pantalla
  components/          Componentes reutilizables (cada uno con su .module.css)
  context/             AuthProvider, CompraProvider y ToastProvider
  hooks/               useAsync, useFormulario, useDocumentTitle, useAuth, useCompra, useToast
  services/            api.js (interfaz pública), mockApi.js, httpApi.js, mockDb.js, simulacion.js
  mocks/               Datos de prueba (películas, salas, funciones, usuarios, candy, promociones)
  utils/               Formateo, validaciones, cálculos de la compra y de la cartelera
  styles/              tokens.css (variables de diseño) y global.css
```

## Documentación

- [Rúbrica y evidencia](docs/RUBRICA_FRONT.md)
- [Arquitectura](docs/ARQUITECTURA_FRONT.md)
- [Integración con el back-end](docs/INTEGRACION_BACKEND.md)
- [Accesibilidad](docs/ACCESIBILIDAD.md)
- [Preguntas para la defensa](docs/PREGUNTAS_DEFENSA_FRONT.md)

## Stack

React 19 + Vite, React Router 7, CSS Modules y JavaScript. No usa librerías de componentes, de estilos, de formularios ni de iconos: los iconos son SVG propios y los pósters se dibujan con CSS.
