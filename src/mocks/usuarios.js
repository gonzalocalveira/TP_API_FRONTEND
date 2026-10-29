// Usuarios y membresías de database/02_datos.sql.
// La password solo existe acá para simular el login: la API real nunca la devuelve.

export const usuarios = [
  { id: 1, nombreApellido: 'Ana Gomez', dni: 30111222, fechaNacimiento: '1990-04-12', mail: 'ana@mail.com', password: 'ana1234', isSocio: true, rol: 'CLIENTE' },
  { id: 2, nombreApellido: 'Bruno Diaz', dni: 35222333, fechaNacimiento: '1995-09-30', mail: 'bruno@mail.com', password: 'bruno1234', isSocio: false, rol: 'CLIENTE' },
  { id: 3, nombreApellido: 'Admin del Cine', dni: 20333444, fechaNacimiento: '1985-01-01', mail: 'admin@cine.com', password: 'admin1234', isSocio: false, rol: 'ADMINISTRADOR' },
]

// Misma forma que GET /api/clientes/{usuarioId}/membresia
export const membresias = [{ id: 1, usuarioId: 1, puntos: 150, tipoMembresia: 'GOLD' }]

// Usuario que se muestra en la pantalla de login para la demo.
export const USUARIO_DEMO = { mail: 'ana@mail.com', password: 'ana1234' }
