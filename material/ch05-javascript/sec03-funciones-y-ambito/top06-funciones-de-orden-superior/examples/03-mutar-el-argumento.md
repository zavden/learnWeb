---
example_description: "Una función de consulta que ordena con sort() desordena el catálogo de quien la llama, y un historial que guarda el mismo objeto mutado no detecta cambios"
example_tags: "javascript|inmutabilidad|sort|mutacion|referencias|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const catalog = [
  { name: 'Auriculares', sales: 120 },
  { name: 'Teclado', sales: 340 },
  { name: 'Ratón', sales: 280 },
  { name: 'Monitor', sales: 95 },
];
const names = (products) => products.map((product) => product.name).join(', ');

// 🐛 1. Una función que solo debía CONSULTAR… modifica su argumento.
function topSellersBug(products, n) {
  return products.sort((a, b) => b.sales - a.sales).slice(0, n); // sort muta
}
console.log('catálogo antes →', names(catalog));
console.log('top 2 →', names(topSellersBug(catalog, 2)));
console.log('🐛 catálogo después →', names(catalog)); // ¡reordenado para todo el programa!

// ✅ toSorted devuelve una copia: el catálogo de quien llama no se toca.
function topSellers(products, n) {
  return products.toSorted((a, b) => b.sales - a.sales).slice(0, n);
}
const before = names(catalog);
console.log('✅ top 2 →', names(topSellers(catalog, 2)));
console.log('✅ ¿catálogo intacto? →', names(catalog) === before); // true

// 🐛 2. Un historial que guarda el MISMO objeto y lo modifica.
const settings = { theme: 'claro', fontSize: 16 };
const settingsHistory = [settings];
settings.theme = 'oscuro';      // mutación
settingsHistory.push(settings);
console.log('🐛 historial →', settingsHistory.map((version) => version.theme)); // ['oscuro', 'oscuro']
console.log('🐛 ¿ha cambiado algo? →', settingsHistory[0] !== settingsHistory[1]);    // false: es el mismo objeto

// ✅ Cada cambio crea una versión NUEVA: el historial conserva el pasado
// y basta comparar referencias (===) para saber si algo cambió.
const versions = [{ theme: 'claro', fontSize: 16 }];
versions.push({ ...versions.at(-1), theme: 'oscuro' });
console.log('✅ historial →', versions.map((version) => version.theme)); // ['claro', 'oscuro']
console.log('✅ ¿ha cambiado algo? →', versions[0] !== versions[1]);    // true
// Las librerías de interfaz (React, por ejemplo) detectan cambios justo así:
// si el objeto es el mismo, suponen que no ha cambiado nada.
```
