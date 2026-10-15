---
example_description: "Métodos de prototipo (array.map) frente a métodos estáticos de la constructora (Array.from, Object.keys): por qué Object.keys no es obj.keys()"
example_tags: "javascript|python|prototipos|estaticos|object-keys|array-from"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Métodos de PROTOTIPO: se llaman sobre un valor (array.map). Están en Array.prototype.
// Métodos ESTÁTICOS: se llaman sobre la constructora (Array.from). Están en Array.
console.log("Object.hasOwn(Array.prototype, 'map') →", Object.hasOwn(Array.prototype, 'map'));  // true
console.log("Object.hasOwn(Array, 'from') →", Object.hasOwn(Array, 'from'));                  // true
console.log('[].from →', [].from);   // undefined: los arrays no heredan de Array
console.log('Array.map →', Array.map); // undefined: la función no hereda de Array.prototype

// Los estáticos trabajan con valores que todavía no son del tipo, o con varios:
const letters = Array.from('café');            // de un string a un array
const fromSet = Array.from(new Set([3, 1, 3])); // de un Set a un array
console.log('Array.from →', letters, fromSet);
console.log('Array.isArray →', Array.isArray(letters), Array.isArray('café'));

// ¿Por qué Object.keys(obj) y no obj.keys()? Si keys estuviera en
// Object.prototype, cualquier objeto con un dato llamado keys lo taparía:
const piano = { brand: 'Yamaha', keys: 88 }; // un dato real de un piano
console.log('piano.keys →', piano.keys);       // 88: el dato, no un método
console.log('Object.keys(piano) →', Object.keys(piano)); // funciona siempre

// Lo mismo pasa con Object.hasOwn frente a obj.hasOwnProperty (lección
// «La cadena de prototipos»): una función estática no depende de la cadena del
// objeto, así que ni una clave con el mismo nombre ni un objeto sin prototipo
// pueden romperla. Por eso las funciones nuevas para objetos se añaden a
// Object y no a Object.prototype.
const dictionary = Object.create(null);
dictionary.hola = 'hello';
console.log('Object.keys(dictionary) →', Object.keys(dictionary)); // ['hola']
console.log("Object.hasOwn(dictionary, 'hola') →", Object.hasOwn(dictionary, 'hola')); // true

// > Desde Python: los métodos de prototipo son métodos normales (lst.append);
//   los estáticos son como @staticmethod o @classmethod (dict.fromkeys(…),
//   int.from_bytes(…)).
```
