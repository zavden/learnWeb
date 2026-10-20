// PLUGIN «top-products» (ejemplo 02): los productos más vendidos.
console.log('(evaluando el plugin top-products)');

export default {
  id: 'top-products',
  apiVersion: 2,
  run(orders, host) {
    const units = new Map();
    for (const order of orders) {
      for (const item of order.items) units.set(item, (units.get(item) ?? 0) + 1);
    }
    // toSorted: los datos llegan congelados, y sort() (que ordena en el
    // sitio) lanzaría un TypeError.
    return [...units].toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], host.locale))
      .slice(0, 3)
      .map(([item, count]) => `${item} (${count})`);
  },
};
