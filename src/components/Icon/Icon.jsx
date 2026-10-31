// Iconos SVG propios (trazos de 24x24). Son decorativos (aria-hidden) salvo que se pase "titulo".
const trazos = {
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  cerrar: <path d="M6 6l12 12M18 6L6 18" />,
  buscar: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  ticket: <path d="M3 8a2 2 0 0 0 0 4 2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6H3zM14 6v12" />,
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  mas: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  papelera: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  check: <path d="M5 12l5 5 9-10" />,
  alerta: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4M12 17.5v.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.5" />
    </>
  ),
  flechaIzquierda: <path d="M15 5l-7 7 7 7" />,
  flechaDerecha: <path d="M9 5l7 7-7 7" />,
  estrella: <path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z" />,
  pochoclo: <path d="M5 9h14l-2 12H7zM9 9l1 12M15 9l-1 12M7 9a2.5 2.5 0 0 1 2-4 3 3 0 0 1 6 0 2.5 2.5 0 0 1 2 4" />,
  tarjeta: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  billetera: (
    <>
      <path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 7l12-4v4M16 13.5h2" />
    </>
  ),
  salir: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  ojo: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  ojoTachado: (
    <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.7M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.4-1M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  ),
  pausa: <path d="M8 5v14M16 5v14" />,
  reproducir: <path d="M7 4l13 8-13 8z" />,
  claqueta: (
    <>
      <path d="M3 10h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M3 10l1.2-5.2a1 1 0 0 1 1.2-.75l14.6 3.4L19.5 10M8.5 4.9l2 4.1M13.5 6l2 4" />
    </>
  ),
}

export default function Icon({ nombre, tamano = 20, titulo, className }) {
  return (
    <svg
      className={className}
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={titulo ? undefined : true}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      focusable="false"
    >
      {trazos[nombre]}
    </svg>
  )
}
