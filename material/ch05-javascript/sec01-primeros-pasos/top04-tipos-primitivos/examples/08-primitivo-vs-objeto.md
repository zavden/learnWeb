---
example_description: "Los primitivos se comparan por valor y los objetos por identidad: [1, 2] === [1, 2] es false"
example_tags: "javascript|python|tipos|objetos|referencias|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Los primitivos se comparan por VALOR.
console.log("'hola' === 'hola' →", 'hola' === 'hola'); // true
console.log('42 === 42 →', 42 === 42);                 // true

// 🐛 Los objetos (y los arrays) se comparan por IDENTIDAD: ¿es el MISMO objeto?
console.log('[1, 2] === [1, 2] →', [1, 2] === [1, 2]); // false: dos arrays distintos
console.log('{} === {} →', {} === {});                 // false
// En Python, [1, 2] == [1, 2] es True porque == compara el contenido.
// El === de JavaScript con objetos se parece al «is» de Python.

const a = [1, 2];
const b = a;                         // b apunta al MISMO array que a
console.log('a === b →', a === b);   // true

// Copiar un primitivo copia el valor: cambiar la copia no afecta al original.
let original = 'hola';
let copy = original;
copy = copy + '!';
console.log('original →', original, '| copy →', copy);

// Copiar un objeto copia la REFERENCIA: los dos nombres ven el mismo objeto.
const team = ['Ada'];
const sameTeam = team;
sameTeam.push('Grace');
console.log('team →', team); // ['Ada', 'Grace']

// ✅ Para comparar contenido hay que recorrerlo (o convertirlo a texto);
// lo verás en «JSON y copias».
console.log('mismo contenido →', JSON.stringify([1, 2]) === JSON.stringify([1, 2]));
```
