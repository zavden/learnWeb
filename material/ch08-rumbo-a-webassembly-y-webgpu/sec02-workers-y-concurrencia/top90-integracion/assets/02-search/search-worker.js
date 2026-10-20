// WORKER DEL EJEMPLO 02 (de módulo): el catálogo y su índice viven AQUÍ. La
// página solo envía consultas { id, query } y recibe { id, query, total, first }.
const PRODUCTS = ['Mole negro', 'Café de altura', 'Chocolate de mesa', 'Salsa macha', 'Cajeta', 'Miel de abeja', 'Vainilla', 'Chile pasilla', 'Mezcal joven', 'Queso de bola', 'Pan de muerto', 'Tortillas de maíz azul'];
const ORIGINS = ['Oaxaca', 'Puebla', 'Chiapas', 'Veracruz', 'Yucatán', 'Michoacán', 'Jalisco', 'Guerrero', 'Sonora', 'Tlaxcala'];
const SIZES = ['250 g', '500 g', '1 kg', 'frasco', 'bolsa', 'caja de regalo', 'paquete familiar', 'muestra', 'edición de temporada', 'reserva'];

// Sin tildes y en minúsculas: «cafe» encuentra «Café».
const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const catalog = PRODUCTS.flatMap((product) => ORIGINS.flatMap((origin) => SIZES.map((size) => `${product} de ${origin} · ${size}`)));
const index = catalog.map((name) => ({ name, key: normalize(name) }));
self.postMessage({ type: 'ready', size: catalog.length });

self.onmessage = (event) => {
  const { id, query } = event.data;
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const matches = terms.length === 0 ? [] : index.filter(({ key }) => terms.every((term) => key.includes(term)));
  self.postMessage({ type: 'results', id, query, total: matches.length, first: matches.slice(0, 6).map((item) => item.name) });
};
