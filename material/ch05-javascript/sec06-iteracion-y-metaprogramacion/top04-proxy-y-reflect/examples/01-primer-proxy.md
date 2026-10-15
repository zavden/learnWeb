---
example_description: "Un Proxy envuelve un objeto e intercepta sus operaciones: una trampa get da valores por defecto a las claves que faltan y ve TODAS las lecturas (también la de toJSON); sin trampa set, las escrituras llegan al objetivo"
example_tags: "javascript|python|proxy|trampas|get|getattr"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const defaults = { theme: 'claro', fontSize: 16, language: 'es-MX' };
const userPrefs = { theme: 'oscuro' }; // lo que el usuario cambió

const reads = []; // las trampas apuntan aquí lo que ven (luego se imprime)

// new Proxy(objetivo, manejador): las operaciones sobre el proxy pasan por las
// TRAMPAS del manejador; las que no tienen trampa van directas al objetivo.
const prefs = new Proxy(userPrefs, {
  get(target, key) {
    reads.push(String(key)); // la clave puede ser un string o un símbolo
    return key in target ? target[key] : defaults[key];
  },
});

console.log('theme →', prefs.theme);       // del objetivo
console.log('fontSize →', prefs.fontSize); // valor por defecto
console.log('language →', prefs.language);
console.log('lecturas →', reads.join(', '));

// No hay trampa set: la escritura llega al objetivo tal cual.
prefs.fontSize = 20;
console.log('objetivo tras escribir →', userPrefs);
console.log('fontSize →', prefs.fontSize);

// La trampa get ve TODAS las lecturas, también las que hace el propio lenguaje:
reads.length = 0;
console.log('JSON →', JSON.stringify(prefs));
console.log('JSON.stringify leyó →', reads.join(', '));
// Primero busca un método toJSON; después lee las claves PROPIAS del objetivo.
// Por eso language (que solo «existe» gracias a la trampa) no sale en el JSON.

// > Desde Python: la trampa get se parece a __getattr__, con una diferencia
//   clave: __getattr__ solo se llama cuando el atributo NO existe; la trampa
//   get se llama SIEMPRE, como __getattribute__. Y como obj.x y obj['x'] son
//   lo mismo en JavaScript, también hace de __getitem__.
```
