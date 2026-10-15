---
example_description: "Añadir comportamiento a las notas de una app copiando (mixins) o delegando: los tres bugs de Object.assign (getters congelados, estado compartido, choques de nombres), un mixin correcto y el enlace en vivo de la delegación"
example_tags: "javascript|integracion|mixins|delegacion|descriptores|weakmap"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// NOTAS DE UNA APP que reúnen comportamiento de varias fuentes. Una cadena solo
// admite UN prototipo, así que para combinar varias se COPIAN métodos (mixins).
// Integra: copiar descriptores y getters («Propiedades a fondo»), estado mutable
// en el prototipo («La cadena de prototipos»), delegar frente a copiar
// («Herencia prototípica») y WeakMap («Map, Set y Weak»).

// Estado por objeto guardado FUERA del objeto: no sale en JSON ni se comparte.
const listenersOf = new WeakMap();
const observable = {
  on(type, listener) {
    if (!listenersOf.has(this)) listenersOf.set(this, []);
    listenersOf.get(this).push({ type, listener });
    return this;
  },
  emit(type, detail) {
    for (const entry of listenersOf.get(this) ?? []) if (entry.type === type) entry.listener(detail);
  },
};
const withStats = {
  get wordCount() { return (this.text ?? '').split(' ').filter(Boolean).length; },
  describe() { return `${this.title}: ${this.wordCount} palabras`; },
};
const withTags = {
  tags: [], // 🐛 estado mutable en un mixin: se copia la REFERENCIA al mismo array
  addTag(tag) { this.tags.push(tag); this.emit?.('change', `etiqueta ${tag}`); return this; },
  describe() { return `${this.title} #${this.tags.join(' #')}`; },
};

// ── 🐛 Mezcla ingenua con Object.assign ─────────────────────────────────
function NaiveNote(title, text) { this.title = title; this.text = text; }
Object.assign(NaiveNote.prototype, observable, withStats, withTags);
const shopping = new NaiveNote('Compra', 'pan leche huevos tortillas');
const ideas = new NaiveNote('Ideas', 'blog sobre prototipos');
console.log('🐛 wordCount →', shopping.wordCount, ideas.wordCount); // 0 0: assign EJECUTÓ el getter
shopping.addTag('casa');
console.log('🐛 etiquetas de ideas →', ideas.tags);                  // ['casa']: un solo array
console.log('🐛 describe →', shopping.describe());                   // el de withTags: gana el último, sin aviso

// ── ✅ Un mixin correcto ─────────────────────────────────────────────────
// Comprueba TODOS los nombres antes de copiar (o todo o nada), copia
// DESCRIPTORES (los getters siguen siendo getters) y los deja no enumerables,
// como los métodos nativos.
function mixin(target, ...sources) {
  const taken = new Set(Object.getOwnPropertyNames(target));
  for (const source of sources) {
    for (const key of Object.getOwnPropertyNames(source)) {
      if (taken.has(key)) throw new TypeError(`mixin: «${key}» está repetido; resuélvelo a mano`);
      taken.add(key);
    }
  }
  for (const source of sources) {
    for (const key of Object.getOwnPropertyNames(source)) {
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, { ...descriptor, enumerable: false });
    }
  }
  return target;
}

function Note(title, text) {
  this.title = title;
  this.text = text;
  this.tags = []; // el estado, propio de cada nota (los mixins solo llevan métodos)
}
const tagMethods = { addTag: withTags.addTag, describe: withTags.describe };
try {
  mixin(Note.prototype, observable, withStats, tagMethods); // dos describe: no copia nada
} catch (error) {
  console.warn('⚠️', error.message);
}
// Resolverlo a mano: sin el describe de las etiquetas, y uno propio que combina
// los dos nombrando de dónde sale cada parte.
mixin(Note.prototype, observable, withStats, { addTag: withTags.addTag });
Note.prototype.describe = function () {
  return `${withStats.describe.call(this)} · #${this.tags.join(' #')}`;
};

const recipe = new Note('Receta de mole', 'chiles chocolate ajonjolí especias');
const travel = new Note('Viaje a Oaxaca', 'reservar hotel');
recipe.on('change', (what) => console.log(`  🔔 «${recipe.title}» → ${what}`));
recipe.addTag('cocina').addTag('méxico');
console.log('✅ wordCount →', recipe.wordCount, travel.wordCount);
console.log('✅ etiquetas →', recipe.tags, travel.tags);
console.log('✅', recipe.describe());
console.log('JSON →', JSON.stringify(recipe)); // ni oyentes ni métodos: solo datos

// ── Copiar frente a delegar ─────────────────────────────────────────────
// Delegar ve los cambios de la fuente EN VIVO; la copia se queda con la foto.
const delegating = Object.assign(Object.create(observable), { title: 'Nota que delega' });
observable.emit = function (type, detail) { // la «librería» publica una versión nueva
  for (const entry of listenersOf.get(this) ?? []) if (entry.type === type) entry.listener(`v2 · ${detail}`);
};
delegating.on('change', (what) => console.log('  delegando →', what)).emit('change', 'hola');
recipe.emit('change', 'hola'); // la copia sigue con la versión 1
// Pero un objeto solo tiene UN prototipo: para combinar observable, withStats y
// tagMethods delegando habría que encadenarlos entre sí, y entonces todos los que
// usan withStats pasarían a ser también observables.
```
