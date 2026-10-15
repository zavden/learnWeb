---
example_description: "Historial de deshacer de un editor de menús: la copia con spread comparte los platos y el deshacer falla; structuredClone o actualizaciones sin mutar lo arreglan"
example_tags: "javascript|integracion|copias|structuredclone|spread|referencias"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// HISTORIAL DE «DESHACER» del editor de la carta de un restaurante.
// Integra: referencias, copia superficial y structuredClone («JSON y copias»), spread
// y with («Arrays», «Objetos literales»), Set y Date («Map y Set», «Fechas e Intl»).
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
function describe(menu) {
  const dishes = menu.dishes.map((dish) => `${dish.name} ${money.format(dish.priceCents / 100)}`);
  return `${dishes.join(' · ')} (${menu.dishes.length} platos)`;
}
function createMenu() {
  return {
    title: 'Menú del día',
    updatedAt: new Date('2026-10-12T09:00:00Z'),
    dishes: [
      { name: 'Gazpacho', priceCents: 650, allergens: new Set(['ajo']) },
      { name: 'Pisto con huevo', priceCents: 900, allergens: new Set(['huevo']) },
    ],
  };
}

// ── 🐛 Versión 1: instantáneas con spread (copia SUPERFICIAL) ─────────────
let menu = createMenu();
const shallowHistory = [];
shallowHistory.push({ ...menu });              // guardo el estado antes de editar…
menu.dishes.push({ name: 'Flan casero', priceCents: 450, allergens: new Set(['leche', 'huevo']) });
menu.dishes[0].priceCents = 700;               // …y edito el array y un plato por dentro
menu = shallowHistory.pop();                   // «deshacer»
console.log('🐛 tras deshacer →', describe(menu)); // ¡el flan y el nuevo precio siguen ahí!
// La instantánea es un objeto nuevo, pero su array dishes es EL MISMO que se editó.

// ── ✅ Versión 2: instantáneas con structuredClone (copia PROFUNDA) ────────
menu = createMenu();
const history = [];
history.push(structuredClone(menu));
menu.dishes.push({ name: 'Flan casero', priceCents: 450, allergens: new Set(['leche', 'huevo']) });
menu.dishes[0].priceCents = 700;
console.log('editado →', describe(menu));
menu = history.pop();
console.log('✅ tras deshacer →', describe(menu));
// structuredClone conserva los Set y las Date; el truco JSON los habría estropeado:
console.log('alérgenos →', menu.dishes[0].allergens, '| ¿Date? →', menu.updatedAt instanceof Date);
const viaJson = JSON.parse(JSON.stringify(createMenu()));
console.log('🐛 con JSON →', viaJson.dishes[0].allergens, '|', typeof viaJson.updatedAt);

// ── ✅ Versión 3: no mutar nunca; cada cambio crea un estado nuevo ─────────
// Solo se copia lo que cambia; lo demás se comparte sin peligro, porque nadie lo modifica.
const v1 = createMenu();
const v2 = {
  ...v1,
  updatedAt: new Date('2026-10-12T11:15:00Z'),
  dishes: v1.dishes.with(0, { ...v1.dishes[0], priceCents: 700 }), // with: copia con un cambio
};
const v3 = { ...v2, dishes: [...v2.dishes, { name: 'Flan casero', priceCents: 450, allergens: new Set(['leche']) }] };
const versions = [v1, v2, v3];
console.log('versiones →', versions.map((version) => version.dishes.length));
console.log('deshacer dos veces →', describe(versions.at(-3)));   // v1 intacto
console.log('¿pisto compartido en v1 y v3? →', v1.dishes[1] === v3.dishes[1]); // true: no se copió
// Este estilo (inmutabilidad) se estudia a fondo en el módulo «Funciones y ámbito».
```
