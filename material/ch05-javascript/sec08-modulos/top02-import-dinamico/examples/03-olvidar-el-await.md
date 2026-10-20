---
example_description: "Olvidar el await de import(): la variable guarda una promesa, no el módulo, y llamar a sus funciones lanza TypeError: tax.vatFor is not a function"
example_tags: "javascript|modulos|import-dinamico|promesas|await|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivo que usa: assets/03-impuestos/tax.js (exporta vatFor(país)).

// 🐛 Sin await, tax es la PROMESA del módulo: todavía no hay módulo.
const tax = import('./03-impuestos/tax.js');
console.log('🐛 tax →', tax);
console.log('🐛 tax.vatFor →', tax.vatFor);
try {
  tax.vatFor('MX');
} catch (error) {
  console.log('🐛', error.name, '|', error.message);
}

// ✅ Con await (aquí, de nivel superior: este script es un módulo).
const taxModule = await import('./03-impuestos/tax.js');
console.log('✅ IVA en México →', taxModule.vatFor('MX'));

// ✅ Con then, que funciona también en scripts clásicos.
import('./03-impuestos/tax.js').then(({ vatFor }) => {
  console.log('✅ con then → IVA en Colombia:', vatFor('CO'));
});

// Es el mismo error que olvidar el await de cualquier función async
// (lección «async/await»): import() parece una función que devuelve el
// módulo, pero devuelve una promesa.
```
