---
example_description: "Object.freeze solo congela el primer nivel: los objetos y arrays anidados siguen siendo mutables. Una función recursiva deepFreeze congela todo"
example_tags: "javascript|python|objetos|freeze|inmutabilidad|recursion|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const settings = Object.freeze({
  theme: 'dark',
  notifications: { email: true, push: false },
  languages: ['es', 'en'],
});

settings.theme = 'light';           // ✅ bloqueado (en silencio)
settings.notifications.push = true; // 🐛 permitido: el objeto interior no está congelado
settings.languages.push('pt');      // 🐛 permitido: el array interior tampoco

console.log('settings.theme →', settings.theme);                 // 'dark'
console.log('🐛 settings.notifications →', settings.notifications); // {email: true, push: true}
console.log('🐛 settings.languages →', settings.languages);         // ['es', 'en', 'pt']
console.log('isFrozen(settings) →', Object.isFrozen(settings));                           // true
console.log('isFrozen(settings.notifications) →', Object.isFrozen(settings.notifications)); // false

// Por qué: freeze pone writable: false en las propiedades de settings. La
// propiedad notifications no puede apuntar a OTRO objeto, pero el objeto al que
// apunta es independiente y sigue abierto (igual que const y la variable).
//
//   settings (congelado) ─ notifications ──► { email, push }   (abierto)
//                        └ languages ──────► ['es', 'en']      (abierto)

// ✅ deepFreeze: congela el objeto y, recursivamente, todo lo que contiene.
function deepFreeze(value) {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return value; // primitivos y objetos ya congelados: nada que hacer
  }
  Object.freeze(value); // primero el objeto, así un ciclo no da vueltas sin fin
  for (const key of Object.getOwnPropertyNames(value)) {
    deepFreeze(value[key]);
  }
  return value;
}

const defaults = deepFreeze({
  theme: 'dark',
  notifications: { email: true, push: false },
  languages: ['es', 'en'],
});
defaults.notifications.push = true; // ignorado
console.log('✅ defaults.notifications.push →', defaults.notifications.push); // false
try {
  defaults.languages.push('pt');
} catch (error) {
  console.log('✅ defaults.languages.push →', error.name, '|', error.message);
}

// > Desde Python: pasa lo mismo con una tupla que contiene una lista, o con un
//   @dataclass(frozen=True) que tiene un campo list: el contenedor no cambia,
//   pero la lista de dentro sí.
```
