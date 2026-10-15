---
example_description: "throw new TypeError / RangeError para rechazar datos inválidos con un mensaje claro"
example_tags: "javascript|python|errores|throw|validacion"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// throw lanza un error (raise en Python). Elige el tipo que mejor describe el fallo:
// - TypeError  → el valor es del tipo equivocado
// - RangeError → el valor está fuera del rango permitido
// - Error      → cualquier otro caso
function setVolume(level) {
  if (typeof level !== 'number') {
    throw new TypeError(`El volumen debe ser un número, no un ${typeof level}`);
  }
  if (level < 0 || level > 100) {
    throw new RangeError(`El volumen debe estar entre 0 y 100 (recibido: ${level})`);
  }
  return level;
}

for (const value of [50, 150, '80']) {
  try {
    console.log('✅ volumen fijado en', setVolume(value));
  } catch (error) {
    console.log('❌', error.name, '|', error.message);
  }
}

// throw interrumpe la función en el acto, como return, pero hacia el catch más
// cercano. Si no hay ninguno, el error llega a la consola en rojo.

// Python:
// def set_volume(level):
//     if not isinstance(level, (int, float)):
//         raise TypeError(f"El volumen debe ser un número, no {type(level).__name__}")
//     if not 0 <= level <= 100:
//         raise ValueError(f"El volumen debe estar entre 0 y 100 (recibido: {level})")
//     return level
```
