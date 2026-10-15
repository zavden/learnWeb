---
example_description: "Un mixin como objeto de métodos copiado en Clase.prototype con Object.assign: funciona, pero los métodos copiados son enumerables y los getters se ejecutan; un helper que copia descriptores lo arregla"
example_tags: "javascript|python|clases|mixins|object-assign|descriptores"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Mixins: objetos con métodos que varias clases sin relación quieren tener.
const describable = {
  describe() {
    return `${this.constructor.name} «${this.title}»`;
  },
};
const sluggable = {
  slug() {
    // NFD separa cada tilde de su letra (lección «Strings»); después se quitan las tildes.
    const plain = [...this.title.toLowerCase().normalize('NFD')]
      .filter((ch) => ch.charCodeAt(0) < 0x300 || ch.charCodeAt(0) > 0x36f)
      .join('');
    return plain.split(' ').join('-');
  },
  get words() {
    return this.title ? this.title.split(' ').length : 0; // un getter: ojo con Object.assign
  },
};

class Recipe {
  constructor(title) {
    this.title = title;
  }
}
class Article {
  constructor(title) {
    this.title = title;
  }
}

// Copiar los métodos en el PROTOTIPO: todas las instancias los heredan.
Object.assign(Recipe.prototype, describable, sluggable);

const mole = new Recipe('Mole poblano de la abuela');
console.log(mole.describe(), '|', mole.slug());

// 🐛 Dos efectos de Object.assign (lección «Herencia prototípica»):
const keys = [];
for (const key in mole) keys.push(key);
console.log('🐛 for…in →', keys);             // los métodos copiados son enumerables
console.log('🐛 words →', mole.words);         // 0: assign ejecutó el getter UNA vez
//    (sobre sluggable, que no tiene title) y copió el resultado como dato fijo.

// ✅ Un helper que copia DESCRIPTORES, no enumerables, como los métodos de class.
function mixin(Target, ...sources) {
  for (const source of sources) {
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(source))) {
      if (key in Target.prototype) throw new Error(`mixin: «${key}» ya existe en ${Target.name}`);
      Object.defineProperty(Target.prototype, key, { ...descriptor, enumerable: false });
    }
  }
  return Target;
}
mixin(Article, describable, sluggable);

const guide = new Article('Guía de cafés de Veracruz');
const articleKeys = [];
for (const key in guide) articleKeys.push(key);
console.log('✅ for…in →', articleKeys);
console.log('✅ words →', guide.words, '|', guide.describe(), '|', guide.slug());

// > Desde Python: una clase mixin (class SlugMixin: def slug(self): …) que se
//   añade a la lista de bases. JavaScript no tiene herencia múltiple, así que el
//   mixin más simple COPIA los métodos en el prototipo.
```
