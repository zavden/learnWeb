---
example_description: "El __getitem__ de Python con índices negativos, con un Proxy: las claves llegan a la trampa como strings (o como símbolos, y Number(símbolo) lanza), así que hay que comprobar el tipo antes de convertir"
example_tags: "javascript|python|proxy|getitem|indices-negativos|symbol"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const temperatures = [14, 17, 21, 24, 22];

// 🤔 Primer intento: convertir la clave a número y, si es negativa, contar desde el final.
const naive = new Proxy(temperatures, {
  get(target, key) {
    const index = Number(key);
    return index < 0 ? target[target.length + index] : target[key];
  },
});
console.log('naive[-1] →', naive[-1]); // funciona…
try {
  console.log([...naive]); // …hasta que alguien recorre el array
} catch (error) {
  console.log('🤔 spread →', error.name, '|', error.message);
}
// El spread lee naive[Symbol.iterator]: la clave es un SÍMBOLO, y Number(símbolo)
// lanza (lección «Symbol»).

// ✅ Las claves llegan como strings ('-1', '0', 'length') o como símbolos:
//    comprueba el tipo antes de convertir.
function withNegativeIndexes(array) {
  return new Proxy(array, {
    get(target, key, receiver) {
      if (typeof key === 'string' && key.startsWith('-')) {
        const index = Number(key);
        if (Number.isInteger(index)) return target[target.length + index];
      }
      return Reflect.get(target, key, receiver); // todo lo demás, como siempre
    },
  });
}

const temps = withNegativeIndexes(temperatures);
console.log('temps[-1] →', temps[-1], '| temps[-2] →', temps[-2]);
console.log('temps[0] →', temps[0], '| length →', temps.length);
console.log('spread →', [...temps]);
console.log('métodos →', temps.map((t) => `${t} °C`).join(', '));
console.log('¿es un array? →', Array.isArray(temps));

// (Reflect.get hace la lectura normal: lo verás en el ejemplo de Reflect. Y para
//  leer desde el final, los arrays ya tienen at(-1): esto es para entender el
//  mecanismo, no para sustituirlo.)

// > Desde Python: lista[-1] funciona gracias a __getitem__, que recibe el
//   número. Aquí la clave siempre es string o símbolo: obj[-1] es obj['-1'].
```
