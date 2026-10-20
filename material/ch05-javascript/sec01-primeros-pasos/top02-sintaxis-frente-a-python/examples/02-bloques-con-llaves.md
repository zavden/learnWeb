---
example_description: "Los bloques los marcan las llaves, no la indentación; y un if sin llaves solo controla una sentencia"
example_tags: "javascript|python|sintaxis|bloques"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// En Python la indentación DEFINE los bloques.
// En JavaScript los definen las llaves { }; la indentación es solo para leer.
// La condición del if va siempre entre paréntesis.
const temperature = 31;

if (temperature > 30) {
  console.log('Hace calor');
  console.log('Bebe agua');
} else {
  console.log('Temperatura agradable');
}

// Mal indentado a propósito… y funciona igual: el motor solo mira las llaves.
if (temperature > 30) {
console.log('Indentación rara, mismo resultado');
        console.log('Sigue dentro del if');
}

// ⚠️ Sin llaves, el if controla SOLO la sentencia siguiente.
if (temperature < 0)
  console.log('Hiela');
  console.log('Parece parte del if, pero se ejecuta siempre');

// ✅ Escribe siempre las llaves, aunque el bloque tenga una sola línea.
if (temperature < 0) {
  console.log('Hiela');
}

// Python:
// if temperature > 30:
//     print("Hace calor")
//     print("Bebe agua")
// else:
//     print("Temperatura agradable")
```
