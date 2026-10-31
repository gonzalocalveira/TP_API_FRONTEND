import { useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { login, registrar } from '../services/api.js'
import { leerJSON, guardarJSON, borrarClave } from '../utils/almacenamiento.js'

const CLAVE = 'cmp-sesion'

// Sesión simulada: se guarda el usuario que devolvió el login (sin password) en localStorage.
// Con un back-end con seguridad real acá se guardaría un token.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => leerJSON(CLAVE, null))

  function guardarSesion(nuevoUsuario) {
    setUsuario(nuevoUsuario)
    if (nuevoUsuario) guardarJSON(CLAVE, nuevoUsuario)
    else borrarClave(CLAVE)
  }

  async function iniciarSesion(credenciales) {
    const usuarioLogueado = await login(credenciales)
    guardarSesion(usuarioLogueado)
    return usuarioLogueado
  }

  // Después de registrarse, el usuario queda logueado.
  async function registrarse(datos) {
    const usuarioNuevo = await registrar(datos)
    guardarSesion(usuarioNuevo)
    return usuarioNuevo
  }

  function cerrarSesion() {
    guardarSesion(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, registrarse, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}
