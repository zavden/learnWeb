// EL CATÁLOGO (ejemplo 09): 200 000 productos guardados por COLUMNAS, cada una en
// un typed array (lección «ArrayBuffer y vistas»), más las funciones para filtrar,
// ordenar y sacar un tramo de filas. Funciones puras: las usa el worker.
export const CATEGORIES = ['Despensa', 'Bebidas', 'Artesanía', 'Cocina', 'Ropa'];
const PRODUCTS = [
  ['Café de olla', 1, 120], ['Mole negro', 0, 180], ['Salsa macha', 0, 95], ['Cajeta', 0, 110], ['Miel de abeja', 0, 150],
  ['Vainilla', 0, 210], ['Chile pasilla', 0, 60], ['Chocolate de mesa', 1, 85], ['Tortillas de maíz azul', 0, 40], ['Mezcal joven', 1, 650],
  ['Plato de Talavera', 2, 450], ['Alebrije', 2, 380], ['Sombrero de palma', 4, 320], ['Huaraches', 4, 690], ['Rebozo de algodón', 4, 540],
  ['Molcajete', 3, 420], ['Comal de barro', 3, 260], ['Jarra de vidrio soplado', 3, 360], ['Agua de jamaica', 1, 45], ['Pan de muerto', 0, 70],
]; // [nombre, categoría, precio base en pesos]
const VARIANTS = ['chico', 'mediano', 'grande', 'familiar', 'de regalo', 'de temporada', 'artesanal', 'clásico'];

function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function generateCatalog(count, seed) {
  const random = mulberry32(seed);
  const columns = {
    count,
    product: new Uint8Array(count),  // índice en PRODUCTS
    variant: new Uint8Array(count),  // índice en VARIANTS
    price: new Uint32Array(count),   // en centavos: los enteros no tienen errores de redondeo
    stock: new Uint16Array(count),
  };
  for (let i = 0; i < count; i++) {
    const product = Math.floor(random() * PRODUCTS.length);
    const variant = Math.floor(random() * VARIANTS.length);
    columns.product[i] = product;
    columns.variant[i] = variant;
    columns.price[i] = Math.round(PRODUCTS[product][2] * (0.6 + random() * 1.2) * 100);
    columns.stock[i] = random() < 0.15 ? 0 : Math.floor(random() * 400);
  }
  // Solo hay 20 × 8 nombres distintos: se preparan una vez (texto, versión para buscar y orden alfabético).
  const names = PRODUCTS.flatMap(([name]) => VARIANTS.map((variant) => `${name} ${variant}`));
  const collator = new Intl.Collator('es');
  const rank = new Uint16Array(names.length);
  names.map((name, index) => ({ name, index })).sort((a, b) => collator.compare(a.name, b.name)).forEach(({ index }, position) => { rank[index] = position; });
  columns.names = names;
  columns.searchable = names.map(normalize);
  columns.rank = rank;
  return columns;
}

const nameKey = (catalog, i) => catalog.product[i] * VARIANTS.length + catalog.variant[i];

// Filtrar y ordenar: el resultado es una permutación (los índices de las filas visibles).
export function applyView(catalog, { sortKey = 'price', direction = -1, category = -1, text = '', inStock = false }) {
  const terms = normalize(text).split(/\s+/).filter(Boolean);
  const matchesName = catalog.searchable.map((name) => terms.every((term) => name.includes(term)));
  const order = new Uint32Array(catalog.count);
  let total = 0;
  for (let i = 0; i < catalog.count; i++) {
    if (category >= 0 && PRODUCTS[catalog.product[i]][1] !== category) continue;
    if (inStock && catalog.stock[i] === 0) continue;
    if (!matchesName[nameKey(catalog, i)]) continue;
    order[total++] = i;
  }
  const view = order.subarray(0, total);
  const value = {
    price: (i) => catalog.price[i],
    stock: (i) => catalog.stock[i],
    name: (i) => catalog.rank[nameKey(catalog, i)],
    id: (i) => i,
  }[sortKey];
  view.sort((a, b) => (value(a) - value(b)) * direction || a - b); // empate: por número de producto
  return view;
}

export function getRows(catalog, order, start, count) {
  const rows = [];
  for (let position = start; position < Math.min(order.length, start + count); position++) {
    const i = order[position];
    rows.push({
      position,
      id: i + 1,
      name: catalog.names[nameKey(catalog, i)],
      category: CATEGORIES[PRODUCTS[catalog.product[i]][1]],
      price: catalog.price[i] / 100,
      stock: catalog.stock[i],
    });
  }
  return rows;
}
