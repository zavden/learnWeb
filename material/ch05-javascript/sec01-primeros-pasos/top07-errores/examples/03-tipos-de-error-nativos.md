---
example_description: "Tabla con los errores que lanza el propio motor (ReferenceError, TypeError, RangeError, SyntaxError, URIError) y su equivalente en Python"
example_tags: "javascript|python|errores|typeerror|referenceerror|rangeerror"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Provocamos a propósito cada tipo de error del motor y lo anotamos en una tabla.
// La columna «python» es la excepción de Python más parecida en espíritu
// (no significa que la misma operación falle también en Python).
const results = {};

function record(code, python, error) {
  results[code] = { name: error.name, python: python, message: error.message };
}

try { missingVariable; }
catch (error) { record('missingVariable', 'NameError', error); }

try { null.length; }
catch (error) { record('null.length', 'AttributeError', error); }

try { const total = 5; total(); }
catch (error) { record('total()', 'TypeError', error); }

try { new Array(-1); }
catch (error) { record('new Array(-1)', 'ValueError', error); }

try { (1.5).toFixed(200); }
catch (error) { record('(1.5).toFixed(200)', 'ValueError', error); }

try { JSON.parse('{name: 1}'); }
catch (error) { record("JSON.parse('{name: 1}')", 'JSONDecodeError', error); }

try { decodeURIComponent('%'); }
catch (error) { record("decodeURIComponent('%')", '—', error); }

console.table(results);

// Un SyntaxError de TU código no se puede atrapar con try/catch: el motor lo
// detecta al leer el script, antes de ejecutar nada (lección 1). Los que sí se
// atrapan vienen de leer texto en tiempo de ejecución, como JSON.parse.
```
