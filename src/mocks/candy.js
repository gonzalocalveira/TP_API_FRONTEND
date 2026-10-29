// SIMULADO EN EL FRONT, SIN ENDPOINT EN EL BACK.
// El back-end no modela productos de candy. Si se agrega, este sería el DTO sugerido.

export const categoriasCandy = [
  { id: 'COMBOS', nombre: 'Combos' },
  { id: 'POCHOCLOS', nombre: 'Pochoclos' },
  { id: 'BEBIDAS', nombre: 'Bebidas' },
  { id: 'SNACKS', nombre: 'Snacks' },
  { id: 'GOLOSINAS', nombre: 'Golosinas' },
]

export const productosCandy = [
  { id: 1, categoria: 'COMBOS', nombre: 'Combo Clásico', descripcion: 'Pochoclo mediano + gaseosa mediana.', precio: 6800 },
  { id: 2, categoria: 'COMBOS', nombre: 'Combo Pareja', descripcion: 'Pochoclo grande + 2 gaseosas medianas.', precio: 10500 },
  { id: 3, categoria: 'COMBOS', nombre: 'Combo Linterna', descripcion: 'Pochoclo grande, 2 gaseosas grandes y nachos con cheddar.', precio: 15900 },
  { id: 4, categoria: 'POCHOCLOS', nombre: 'Pochoclo chico', descripcion: 'Dulce o salado.', precio: 3200 },
  { id: 5, categoria: 'POCHOCLOS', nombre: 'Pochoclo mediano', descripcion: 'Dulce o salado.', precio: 4300 },
  { id: 6, categoria: 'POCHOCLOS', nombre: 'Pochoclo grande', descripcion: 'Dulce, salado o mixto.', precio: 5400 },
  { id: 7, categoria: 'BEBIDAS', nombre: 'Gaseosa mediana', descripcion: 'Cola, lima-limón o naranja. 500 ml.', precio: 2900 },
  { id: 8, categoria: 'BEBIDAS', nombre: 'Gaseosa grande', descripcion: 'Cola, lima-limón o naranja. 750 ml.', precio: 3500 },
  { id: 9, categoria: 'BEBIDAS', nombre: 'Agua mineral', descripcion: 'Con o sin gas. 500 ml.', precio: 2200 },
  { id: 10, categoria: 'SNACKS', nombre: 'Nachos con cheddar', descripcion: 'Porción individual con salsa de queso.', precio: 4800 },
  { id: 11, categoria: 'SNACKS', nombre: 'Pancho clásico', descripcion: 'Con mostaza o ketchup.', precio: 3900 },
  { id: 12, categoria: 'GOLOSINAS', nombre: 'Chocolate con maní', descripcion: 'Bolsita de 100 g.', precio: 2400 },
  { id: 13, categoria: 'GOLOSINAS', nombre: 'Gomitas frutales', descripcion: 'Bolsita de 120 g.', precio: 2100 },
  { id: 14, categoria: 'GOLOSINAS', nombre: 'Alfajor triple', descripcion: 'De chocolate negro.', precio: 1800 },
]
