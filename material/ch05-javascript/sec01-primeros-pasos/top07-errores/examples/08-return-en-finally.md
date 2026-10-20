---
example_description: "Un return dentro de finally pisa el return del try y se traga las excepciones"
example_tags: "javascript|python|errores|finally|return|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// finally se ejecuta SIEMPRE, también después de un return.
function withCleanup() {
  try {
    console.log('  try: return "del try"');
    return 'del try';
  } finally {
    console.log('  finally: se ejecuta antes de salir de verdad');
  }
}
console.log('withCleanup() →', withCleanup()); // 'del try'

// 🐛 Un return DENTRO de finally pisa el return del try…
function overrideReturn() {
  try {
    return 'del try';
  } finally {
    return 'del finally';
  }
}
console.log('overrideReturn() →', overrideReturn()); // 'del finally'

// 🐛 …y se traga las excepciones: el error desaparece sin dejar rastro.
function swallowError() {
  try {
    throw new Error('¡error importante!');
  } finally {
    return 'todo bien'; // el error se pierde aquí
  }
}
try {
  console.log('swallowError() →', swallowError()); // 'todo bien'
} catch (error) {
  console.log('Este catch nunca se ejecuta');
}

// ✅ Usa finally solo para limpiar (cerrar, liberar, ocultar un «Cargando…»).
// Nada de return, break, continue ni throw dentro de finally.
// Python hace exactamente lo mismo, y desde la 3.14 avisa con un SyntaxWarning.
```
