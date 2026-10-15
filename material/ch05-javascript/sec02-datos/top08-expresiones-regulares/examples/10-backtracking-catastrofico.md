---
example_description: "Backtracking catastrófico: /^([a-z]+ ?)+$/ (por dentro, (a+)+) tarda el doble con cada letra cuando el texto casi encaja; con 22 letras ya se nota y con 40 congelaría la pestaña. La misma regla sin cuantificadores anidados es instantánea"
example_tags: "javascript|regex|backtracking|redos|rendimiento|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Validar etiquetas: «palabras en minúscula separadas por un espacio».
// 🐛 ([a-z]+ ?)+ anida dos cuantificadores (sin el espacio opcional, es (a+)+):
//    hay muchísimas formas de repartir las letras entre las repeticiones.
const slowTags = /^([a-z]+ ?)+$/;
// ✅ La misma regla sin ambigüedad: una palabra y después « palabra», repetido.
const fastTags = /^[a-z]+(?: [a-z]+)*$/;
console.log('válidas →', slowTags.test('cafe de olla'), fastTags.test('cafe de olla'));

// Si el texto CASI encaja (acaba en «!»), el motor prueba TODOS los repartos antes
// de rendirse: cada letra más duplica el trabajo. Tamaños diminutos a propósito.
// (performance.now() da milisegundos con decimales: módulo «Asincronía y event loop».)
const letters = 'cafedeollaconcanelaypi';
slowTags.test('cafe!'); // una primera ejecución aparte, para no medir la preparación
const times = [];
for (const length of [14, 18, 20, 22]) {
  const start = performance.now();
  const result = slowTags.test(letters.slice(0, length) + '!');
  const ms = performance.now() - start;
  times.push(ms);
  console.log(`🐛 ${length} letras + «!» → ${result} · ${ms.toFixed(1)} ms`);
}
console.log('¿22 letras tardan más de 20 veces lo que 14? →', times[3] > times[0] * 20);
// Con 30 letras serían varios segundos; con 40, horas. La pestaña se congela y la
// guarda de bucles de LearnWeb no lo detiene: es UNA sola llamada a test.

// ✅ La versión sin ambigüedad rechaza al momento incluso 104 001 caracteres.
const longInput = 'cafe de olla '.repeat(8000) + '!';
const longStart = performance.now();
const longResult = fastTags.test(longInput);
console.log('✅', longInput.length, 'caracteres →', longResult, '| menos de 5 ms →', performance.now() - longStart < 5);
```
