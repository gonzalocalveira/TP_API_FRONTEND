// Error con el mismo formato que devuelve el back-end en todos los endpoints:
// { timestamp, status, error, message, path, detalles }
// Tanto mockApi como httpApi tiran este error, así los componentes lo manejan igual en los dos casos.

const NOMBRES_ESTADO = {
  0: 'Network Error',
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
}

export class ApiError extends Error {
  constructor({ status, message, path, detalles = null, timestamp = new Date().toISOString(), error }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.error = error ?? NOMBRES_ESTADO[status] ?? 'Error'
    this.path = path
    this.detalles = detalles
    this.timestamp = timestamp
  }
}
