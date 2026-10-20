---
example_description: "flags & MASK === MASK se lee como flags & (MASK === MASK): en JavaScript & | ^ tienen MENOS prioridad que === y !==, al revés que en Python; y 1 << 2 + 1 desplaza 3 posiciones"
example_tags: "javascript|python|bits|precedencia|mascaras|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const VIEW = 1, COMMENT = 2, UPLOAD = 4;
const EDITOR = VIEW | COMMENT | UPLOAD; // 7 = 0111
const visitor = VIEW;                  // 1 = 0001: solo puede ver

// 🐛 === se evalúa ANTES que & : esto es visitor & (EDITOR === EDITOR),
//    es decir, visitor & true → 1 & 1 → 1, que es truthy.
console.log('visitor & EDITOR === EDITOR →', visitor & EDITOR === EDITOR); // 1
if (visitor & EDITOR === EDITOR) {
  console.log('🐛 el visitante entra en el panel de edición');
}
// ✅ Con paréntesis, primero la máscara y luego la comparación:
console.log('(visitor & EDITOR) === EDITOR →', (visitor & EDITOR) === EDITOR); // false

// 🐛 Lo mismo con !== 0, y ahora al revés: niega un permiso que SÍ existe.
const commenter = COMMENT; // 2 = 0010
// commenter & (COMMENT !== 0) → 2 & true → 2 & 1 → 0
console.log('commenter & COMMENT !== 0 →', commenter & COMMENT !== 0);       // 0
console.log('(commenter & COMMENT) !== 0 →', (commenter & COMMENT) !== 0);   // true

// 🐛 Los desplazamientos van DESPUÉS de + y - : 1 << 2 + 1 es 1 << 3.
console.log('1 << 2 + 1 →', 1 << 2 + 1);       // 8
console.log('(1 << 2) + 1 →', (1 << 2) + 1);   // 5

// Orden en JavaScript (de más a menos prioridad):
//   + -   →   << >> >>>   →   < > <= >=   →   === !==   →   &   →   ^   →   |   →   &&   →   ||
// En Python, & | ^ van ANTES que las comparaciones: flags & MASK == MASK sí funciona allí.
// Al pasar ese código a JavaScript, falla sin avisar. Regla: paréntesis siempre.
```
