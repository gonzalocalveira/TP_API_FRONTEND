import { useEffect } from 'react'

// Cambia el título de la pestaña en cada página (lo anuncian los lectores de pantalla).
export function useDocumentTitle(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | Linterna Cines` : 'Linterna Cines'
  }, [titulo])
}
