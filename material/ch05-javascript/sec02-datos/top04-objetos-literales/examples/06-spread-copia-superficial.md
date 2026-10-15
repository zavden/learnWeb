---
example_description: "{ ...a, ...b } combina objetos pero copia solo el primer nivel: los objetos anidados se comparten y se sustituyen enteros"
example_tags: "javascript|python|objetos|spread|copias|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Configuración por defecto de una aplicación y las preferencias de un usuario.
const defaults = {
  theme: 'claro',
  language: 'es',
  notifications: { email: true, push: false },
};
const userPrefs = { language: 'en' };

// El spread de objetos copia las propiedades; si se repite una clave, gana la
// última. Es el {**defaults, **user_prefs} (o defaults | user_prefs) de Python.
const settings = { ...defaults, ...userPrefs };
console.log('settings →', settings); // language: 'en', el resto de defaults

// 🐛 1. La copia es SUPERFICIAL: los objetos anidados se comparten.
settings.notifications.push = true; // creemos cambiar solo «settings»…
console.log('🐛 defaults.notifications.push →', defaults.notifications.push); // true
// …pero hemos cambiado los valores por defecto de TODOS los usuarios.
console.log('¿mismo objeto? →', settings.notifications === defaults.notifications); // true

// ✅ Copia también el nivel anidado que vas a modificar:
defaults.notifications.push = false; // (deshacemos el cambio accidental)
const safeSettings = {
  ...defaults,
  notifications: { ...defaults.notifications, push: true },
};
console.log('✅ safeSettings.notifications →', safeSettings.notifications);
console.log('✅ defaults.notifications →', defaults.notifications); // intacto

// 🐛 2. Por la misma razón, mezclar objetos anidados SUSTITUYE el nivel entero:
const partial = { notifications: { push: true } };
const merged = { ...defaults, ...partial };
console.log('🐛 merged.notifications →', merged.notifications); // { push: true }: se perdió email

// Python se comporta igual: {**a, **b} y dict.copy() también son superficiales.
// Copias profundas (structuredClone): lección «JSON y copias».
```
