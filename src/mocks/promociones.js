// SIMULADO EN EL FRONT, SIN ENDPOINT EN EL BACK.
// Las promociones son solo informativas: el back-end calcula el total como precio x cantidad
// y no aplica descuentos, así que el front tampoco los aplica.

export const promociones = [
  {
    id: 1,
    titulo: 'Martes 2x1',
    descripcion: 'Todos los martes, dos entradas 2D al precio de una para socios del Club CineManagerPro.',
    condiciones: 'Válido solo en boletería presentando DNI. No acumulable con otras promociones.',
    destacada: true,
  },
  {
    id: 2,
    titulo: 'Miércoles de combos',
    descripcion: 'Los miércoles, el Combo Pareja con 25% de descuento.',
    condiciones: 'Se aplica en el mostrador del candy. Hasta agotar stock.',
    destacada: true,
  },
  {
    id: 3,
    titulo: 'Matiné',
    descripcion: 'Las funciones 2D que empiezan antes de las 16 h tienen precio reducido todos los días.',
    condiciones: 'El precio ya figura en cada función.',
    destacada: true,
  },
  {
    id: 4,
    titulo: 'Club CineManagerPro GOLD',
    descripcion: 'Los socios GOLD y BLACK suman el doble de puntos con cada entrada.',
    condiciones: 'Los puntos se acreditan dentro de las 48 h posteriores a la función.',
    destacada: false,
  },
  {
    id: 5,
    titulo: 'Cumpleaños en el cine',
    descripcion: 'En la semana de tu cumpleaños, el pochoclo mediano te lo regalamos.',
    condiciones: 'Presentando DNI en el mostrador del candy.',
    destacada: false,
  },
]
