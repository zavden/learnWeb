---
example_description: "Leer recorre la cadena, pero asignar crea una propiedad propia que sombrea a la heredada; delete solo borra propias y la heredada vuelve a verse"
example_tags: "javascript|python|prototipos|sombreado|asignacion"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const defaults = { theme: 'light', fontSize: 16, language: 'es' };
const userPrefs = Object.create(defaults);

console.log('userPrefs.theme →', userPrefs.theme); // 'light': heredada

// ASIGNAR no recorre la cadena: crea (o cambia) una propiedad PROPIA.
// La de defaults sigue ahí, pero queda tapada («sombreada»).
userPrefs.theme = 'dark';
console.log('userPrefs.theme →', userPrefs.theme); // 'dark': la propia
console.log('defaults.theme →', defaults.theme);   // 'light': intacta
console.log('propias de userPrefs →', Object.keys(userPrefs)); // ['theme']

//   userPrefs { theme: 'dark' } ──[[Prototype]]──► defaults { theme: 'light', fontSize, language }
//               ▲ se encuentra primero                        ▲ tapada

// La cadena es un enlace EN VIVO: si el prototipo cambia, lo heredado cambia.
defaults.fontSize = 18;
console.log('userPrefs.fontSize →', userPrefs.fontSize); // 18

// delete solo actúa sobre propiedades propias. Al borrar la propia,
// la heredada vuelve a verse.
delete userPrefs.theme;
console.log('tras delete, theme →', userPrefs.theme); // 'light'

// Borrar una heredada desde el hijo no hace nada (y devuelve true).
console.log('delete userPrefs.language →', delete userPrefs.language); // true
console.log('userPrefs.language →', userPrefs.language); // 'es': sigue en defaults

// > Desde Python: igual que un atributo de instancia que tapa uno de clase.
//   p.theme = 'dark' crea p.__dict__['theme'] sin tocar Prefs.theme, y
//   del p.theme lo destapa. (del de algo que no está en la instancia lanza
//   AttributeError; delete en JavaScript devuelve true y no hace nada.)
```
