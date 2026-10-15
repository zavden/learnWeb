// Catálogo de la tienda (datos de ejemplo). En una aplicación real llegaría
// del servidor con fetch (módulo «Red y almacenamiento»); aquí es un módulo.
// Precios en pesos mexicanos, existencias en unidades.
export const products = Object.freeze([
  { sku: 'CAF-CHI-500', name: 'Café de Chiapas 500 g', category: 'Café', origin: 'Chiapas', price: 210, stock: 12 },
  { sku: 'CAF-CHI-1K', name: 'Café de Chiapas 1 kg', category: 'Café', origin: 'Chiapas', price: 395, stock: 3 },
  { sku: 'CAF-CHI-DES', name: 'Café de Chiapas descafeinado 500 g', category: 'Café', origin: 'Chiapas', price: 230, stock: 4 },
  { sku: 'CAF-VER-500', name: 'Café de Veracruz 500 g', category: 'Café', origin: 'Veracruz', price: 185, stock: 0 },
  { sku: 'CAF-OAX-500', name: 'Café de Oaxaca Pluma 500 g', category: 'Café', origin: 'Oaxaca', price: 240, stock: 8 },
  { sku: 'CAF-NAY-250', name: 'Café de Nayarit 250 g', category: 'Café', origin: 'Nayarit', price: 120, stock: 15 },
  { sku: 'CAF-PUE-500', name: 'Café de Cuetzalan 500 g', category: 'Café', origin: 'Puebla', price: 225, stock: 0 },
  { sku: 'MOL-MAN', name: 'Molinillo manual de acero', category: 'Accesorios', origin: 'Jalisco', price: 549, stock: 4 },
  { sku: 'MOL-ELE', name: 'Molino eléctrico de muelas', category: 'Accesorios', origin: 'Nuevo León', price: 1890, stock: 2 },
  { sku: 'PRE-1L', name: 'Prensa francesa 1 L', category: 'Accesorios', origin: 'Jalisco', price: 420, stock: 7 },
  { sku: 'FIL-100', name: 'Filtros de papel ×100', category: 'Accesorios', origin: 'Estado de México', price: 65, stock: 30 },
  { sku: 'JAR-BAR', name: 'Jarro de barro para café de olla', category: 'Accesorios', origin: 'Oaxaca', price: 150, stock: 0 },
  { sku: 'TAZ-TAL', name: 'Taza de talavera', category: 'Accesorios', origin: 'Puebla', price: 260, stock: 5 },
  { sku: 'CHO-OAX', name: 'Chocolate de mesa oaxaqueño', category: 'Despensa', origin: 'Oaxaca', price: 95, stock: 20 },
  { sku: 'PIL-500', name: 'Piloncillo 500 g', category: 'Despensa', origin: 'Veracruz', price: 40, stock: 25 },
  { sku: 'CAN-050', name: 'Canela en raja 50 g', category: 'Despensa', origin: 'Veracruz', price: 55, stock: 9 },
]);
