---
example_description: "|| como valor por defecto pisa 0, '' y false; ?? solo actúa con null y undefined"
example_tags: "javascript|python|operadores|nullish|valores-por-defecto|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 || para valores por defecto falla con 0, '' y false: también son falsy.
// (Los strings van entre « » para que se vea el string vacío.)
const settings = { volume: 0, nickname: '', darkMode: false };

console.log('volume || 50 →', settings.volume || 50);                     // 50 🐛 (era 0)
console.log("nickname || 'Invitado' →", `«${settings.nickname || 'Invitado'}»`); // «Invitado» 🐛
console.log('darkMode || true →', settings.darkMode || true);             // true 🐛

// ✅ ?? (nullish coalescing) usa el valor por defecto SOLO con null o undefined.
console.log('volume ?? 50 →', settings.volume ?? 50);                     // 0
console.log("nickname ?? 'Invitado' →", `«${settings.nickname ?? 'Invitado'}»`); // «» (string vacío)
console.log('darkMode ?? true →', settings.darkMode ?? true);             // false
console.log('missing ?? 50 →', settings.missing ?? 50);                   // 50 (undefined)

// Python no tiene ??: «x or 50» tiene el mismo problema que ||.
// Allí lo correcto es «50 if x is None else x».

// Mezclar ?? con || o && sin paréntesis es un SyntaxError: pon paréntesis.
console.log('(0 || null) ?? 7 →', (0 || null) ?? 7); // 7
```
