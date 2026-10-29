import { useState } from 'react'

// Maneja un formulario controlado: valores, campos tocados y errores.
// Los errores de un campo se muestran después de salir del campo (blur) o al intentar enviar.
// validar(valores) devuelve { campo: 'mensaje' } con los campos inválidos.
export function useFormulario(valoresIniciales, validar) {
  const [valores, setValores] = useState(valoresIniciales)
  const [tocados, setTocados] = useState({})
  const [intentosEnvio, setIntentosEnvio] = useState(0)

  const todosLosErrores = validar(valores)
  const errores = Object.fromEntries(
    Object.entries(todosLosErrores).filter(([campo]) => tocados[campo] || intentosEnvio > 0),
  )

  function cambiarValor(campo, valor) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }))
  }

  function manejarCambio(evento) {
    cambiarValor(evento.target.name, evento.target.value)
  }

  function manejarBlur(evento) {
    const campo = evento.target.name
    setTocados((anteriores) => ({ ...anteriores, [campo]: true }))
  }

  // Devuelve true si el formulario es válido. Si no, deja visibles todos los errores.
  function validarAlEnviar() {
    setIntentosEnvio((n) => n + 1)
    return Object.keys(todosLosErrores).length === 0
  }

  // intentosEnvio sirve para mostrar (y volver a enfocar) el resumen de errores en cada intento.
  return { valores, errores, intentosEnvio, cambiarValor, manejarCambio, manejarBlur, validarAlEnviar, setValores }
}
