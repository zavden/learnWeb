---
example_description: "< y sort() comparan códigos: Álvaro va después de Zoe. localeCompare e Intl.Collator ordenan como un diccionario"
example_tags: "javascript|python|strings|comparacion|localecompare|intl|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// < y > comparan strings unidad a unidad por su código numérico (igual que Python).
// En ese orden, todas las mayúsculas van antes que las minúsculas, y las letras
// con tilde (y la ñ) van después de la z.
console.log("'Zoe' < 'ana' →", 'Zoe' < 'ana');               // true: 'Z' es 90 y 'a' es 97
console.log("'Álvaro' < 'Beatriz' →", 'Álvaro' < 'Beatriz'); // false: 'Á' es 193
console.log("'ñu' < 'oso' →", 'ñu' < 'oso');                 // false: 'ñ' es 241

// 🐛 Por eso el orden por defecto da una lista que nadie espera.
// (toSorted devuelve una copia ordenada: lección «Arrays».)
const names = ['Zoe', 'álvaro', 'Ana', 'Ñoño', 'nuria', 'Óscar', 'Beatriz'];
console.log('🐛 toSorted() →', names.toSorted());
// ['Ana', 'Beatriz', 'Zoe', 'nuria', 'Ñoño', 'Óscar', 'álvaro']

// ✅ localeCompare compara como el diccionario del idioma que le indiques.
// Devuelve un número: negativo (va antes), 0 (equivalentes) o positivo (va después).
console.log("'álvaro'.localeCompare('Beatriz', 'es') →", 'álvaro'.localeCompare('Beatriz', 'es')); // -1

// Para ordenar, se le pasa a toSorted (o sort) una función de comparación.
// Las funciones flecha se estudian en el módulo 3; aquí basta con leer
// (a, b) => a.localeCompare(b, 'es') como lambda a, b: …
console.log('✅ con localeCompare →', names.toSorted((a, b) => a.localeCompare(b, 'es')));
// ['álvaro', 'Ana', 'Beatriz', 'nuria', 'Ñoño', 'Óscar', 'Zoe']

// sensitivity: 'base' ignora mayúsculas y tildes (búsquedas, comparaciones).
console.log("'Óscar' vs 'oscar' (base) →", 'Óscar'.localeCompare('oscar', 'es', { sensitivity: 'base' })); // 0

// numeric: true compara los números dentro del texto por su valor.
const lessons = ['tema10.md', 'tema2.md', 'tema1.md'];
console.log('🐛 toSorted() →', lessons.toSorted()); // ['tema1.md', 'tema10.md', 'tema2.md']
// Intl.Collator crea el comparador una vez: más rápido para listas largas.
const collator = new Intl.Collator('es', { numeric: true });
console.log('✅ Intl.Collator →', lessons.toSorted(collator.compare)); // ['tema1.md', 'tema2.md', 'tema10.md']

// Python: sorted(names) da el mismo orden por códigos; para un orden «humano»
// hace falta locale.strxfrm (con setlocale) o una librería como PyICU.
```
