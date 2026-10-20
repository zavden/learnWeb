---
example_description: "Desestructurar arrays como el unpacking de Python: saltar, ...resto, valores por defecto, intercambio y enumerate con entries()"
example_tags: "javascript|python|arrays|desestructuracion|entries"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Desestructurar = sacar los elementos de un array a variables en una línea
// (el unpacking de Python: lat, lng = coords).
const coords = [40.4168, -3.7038];
const [lat, lng] = coords;
console.log('lat →', lat, '| lng →', lng);

// Saltar posiciones dejando un hueco, y recoger el resto con ... (el *rest de Python).
const podium = ['Lucía', 'Bruno', 'Carmen', 'Diego', 'Elena'];
const [gold, , bronze, ...others] = podium;
console.log('oro →', gold, '| bronce →', bronze, '| resto →', others);

// Valores por defecto si falta el elemento (o vale undefined):
const [host, port = 8080] = ['localhost'];
console.log('host →', host, '| port →', port); // 'localhost' 8080

// Si faltan o sobran elementos NO hay error (Python lanzaría ValueError):
const [r, g, b] = [255, 128];
console.log('b →', b); // undefined

// Intercambiar dos variables (a, b = b, a en Python):
let home = 'Madrid';
let away = 'Sevilla';
[home, away] = [away, home];
console.log('intercambio →', home, away); // 'Sevilla' 'Madrid'
// Ojo: una línea que empieza por [ se pega a la anterior si a esta le falta el ;
// (lo viste en «Sintaxis frente a Python»).

// El enumerate() de Python: entries() da pares [índice, valor] y se desestructuran.
for (const [index, name] of podium.entries()) {
  if (index < 3) console.log(`${index + 1}.º →`, name);
}
```
