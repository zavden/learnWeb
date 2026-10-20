---
example_description: "Ajustes de un editor en tres capas (fábrica congelada, empresa y usuario) que delegan una en otra: el bug de las secciones anidadas, capas por sección, origen de cada valor y guardar solo lo propio"
example_tags: "javascript|integracion|delegacion|sombreado|freeze|configuracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// AJUSTES POR CAPAS de un editor de código en línea: los valores de fábrica, los
// de la empresa y los del usuario. Cada capa delega en la anterior y solo guarda
// lo que cambia.
// Integra: Object.create, sombreado, for…in y hasOwn («La cadena de prototipos»),
// delegar frente a copiar («Herencia prototípica»), deepFreeze y escrituras que
// fallan en silencio («Propiedades a fondo»).

function deepFreeze(value) {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const key of Object.getOwnPropertyNames(value)) deepFreeze(value[key]);
  return value;
}
const isSection = (value) => typeof value === 'object' && value !== null;

const FACTORY = {
  theme: 'claro',
  fontSize: 14,
  editor: { tabSize: 2, wordWrap: false, minimap: true },
  notifications: { email: true, push: false },
};

// 🐛 Primer intento: una capa PLANA sobre la fábrica.
const flatUser = Object.create(FACTORY);
flatUser.theme = 'oscuro';       // ✅ crea una propia que sombrea
flatUser.editor.tabSize = 4;     // 🐛 LEE editor (heredado) y escribe DENTRO: es el de la fábrica
const otherUser = Object.create(FACTORY);
console.log('🐛 tabSize de otro usuario →', otherUser.editor.tabSize); // 4: se ha colado a todos
FACTORY.editor.tabSize = 2;      // deshacemos el daño…
deepFreeze(FACTORY);             // …y congelamos la fábrica en profundidad
flatUser.editor.tabSize = 4;     // ahora falla EN SILENCIO (script clásico)
console.log('🐛 con la fábrica congelada →', flatUser.editor.tabSize); // 2: tampoco funciona

// ✅ Una capa por SECCIÓN: cada objeto anidado también delega en el de debajo.
// Y otra trampa: las propiedades heredadas de la fábrica congelada son de solo
// lectura, así que una ASIGNACIÓN no puede sombrearlas (falla en silencio).
// defineProperty no consulta la cadena: crea la propia sin problema.
function setOwn(obj, key, value) {
  Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
}
function createLayer(parent, name, overrides = {}) {
  const layer = Object.create(parent);
  Object.defineProperty(layer, 'layerName', { value: name }); // no enumerable: for…in no la ve
  for (const key in parent) {
    if (isSection(parent[key])) setOwn(layer, key, createLayer(parent[key], name));
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (isSection(value)) {
      for (const [innerKey, innerValue] of Object.entries(value)) setOwn(layer[key], innerKey, innerValue);
    } else {
      setOwn(layer, key, value);
    }
  }
  return layer;
}

const company = createLayer(FACTORY, 'empresa', { fontSize: 15, editor: { tabSize: 4, wordWrap: true } });
const user = createLayer(company, 'usuario', { theme: 'oscuro', notifications: { push: true } });

user.editor.minimap = false; // 🐛 minimap se hereda de la fábrica congelada: no hace nada
console.log('🐛 minimap con una asignación →', user.editor.minimap); // true
setOwn(user.editor, 'minimap', false);
console.log('✅ minimap con setOwn →', user.editor.minimap);

// Valor efectivo (for…in: propio + heredado) y capa de origen (hasOwn) de cada ajuste.
function report(layer, prefix = '', rows = {}) {
  for (const key in layer) {
    const path = prefix + key;
    if (isSection(layer[key])) {
      report(layer[key], `${path}.`, rows);
      continue;
    }
    let owner = layer;
    while (!Object.hasOwn(owner, key)) owner = Object.getPrototypeOf(owner);
    rows[path] = { valor: layer[key], capa: owner.layerName ?? 'fábrica' };
  }
  return rows;
}
console.table(report(user));

// Lo que se guarda: solo lo PROPIO de la capa del usuario (secciones vacías fuera).
function ownChanges(layer) {
  const result = {};
  for (const [key, value] of Object.entries(layer)) {
    const changes = isSection(value) ? ownChanges(value) : value;
    if (!isSection(changes) || Object.keys(changes).length > 0) result[key] = changes;
  }
  return result;
}
console.log('guardar →', JSON.stringify(ownChanges(user)));

// El enlace está vivo: la empresa cambia el tamaño de letra y el usuario lo ve.
company.fontSize = 16; // aquí basta con asignar: la empresa ya tiene su fontSize PROPIO
console.log('fontSize del usuario →', user.fontSize, '(de la', report(user).fontSize.capa + ')');
// Restablecer un ajuste es borrarlo: vuelve a verse el de debajo.
delete user.theme;
console.log('theme tras restablecer →', user.theme);
console.log('¿la fábrica sigue intacta? →', JSON.stringify(FACTORY.editor));
```
