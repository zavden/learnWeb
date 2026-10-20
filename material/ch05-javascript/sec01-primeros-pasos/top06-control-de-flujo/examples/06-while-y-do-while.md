---
example_description: "while comprueba antes de cada vuelta; do…while comprueba al final y se ejecuta al menos una vez"
example_tags: "javascript|python|control-de-flujo|while|do-while"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// while: repite mientras la condición sea truthy (igual que en Python).
let balance = 100;
let months = 0;
while (balance < 150) {
  balance *= 1.1; // +10 % cada mes
  months++;
}
console.log(`while → ${months} meses para superar 150 (saldo: ${balance.toFixed(2)})`);

// do…while: comprueba la condición AL FINAL de cada vuelta,
// así que el cuerpo se ejecuta al menos una vez. Python no lo tiene.
let attempts = 0;
do {
  attempts++;
  console.log('do…while → intento', attempts);
} while (attempts < 0); // la condición es falsa desde el principio…
// …y aun así el cuerpo se ejecutó una vez.

// El mismo bucle con while no se ejecuta ni una vez:
let tries = 0;
while (tries < 0) {
  tries++;
  console.log('esto nunca se imprime');
}
console.log('while → intentos:', tries); // 0

// Uso típico de do…while: pedir algo y repetir mientras no sea válido
// (pedir primero, comprobar después).
```
