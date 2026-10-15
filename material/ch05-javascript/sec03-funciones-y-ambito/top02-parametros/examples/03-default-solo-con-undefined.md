---
example_description: "El valor por defecto solo se aplica con undefined: null pasa tal cual. Y el viejo truco x = x || 50 rompe con 0. Solución: ??"
example_tags: "javascript|funciones|parametros|defaults|nullish|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 1. El default se aplica SOLO si el argumento es undefined (o falta).
function welcome(nickname = 'invitado') {
  return `Hola, ${nickname}`;
}
console.log(welcome());          // 'Hola, invitado'
console.log(welcome(undefined)); // 'Hola, invitado'
console.log('🐛', welcome(null)); // 'Hola, null'  ← null es un valor, no «falta»

// Pasa mucho con datos de un servidor, que suele usar null para «sin valor»:
const user = JSON.parse('{"name": "Lucía", "nickname": null}');
console.log('🐛', welcome(user.nickname)); // 'Hola, null'

// ✅ Si null también significa «sin valor», usa ?? (lección «Operadores y coerción»):
function welcomeSafe(nickname) {
  const shown = nickname ?? 'invitado'; // undefined o null → 'invitado'
  return `Hola, ${shown}`;
}
console.log('✅', welcomeSafe(user.nickname)); // 'Hola, invitado'

// 🐛 2. El truco antiguo (anterior a 2015) con || falla con 0 y con ''.
function setVolumeOld(volume) {
  volume = volume || 50;  // 0 es falsy → se cambia por 50
  return `volumen ${volume}`;
}
console.log('🐛 setVolumeOld(0) →', setVolumeOld(0)); // 'volumen 50' ← ¡quería silencio!

// ✅ Un default de verdad (o ??) respeta el 0.
function setVolume(volume = 50) {
  return `volumen ${volume}`;
}
console.log('✅ setVolume(0) →', setVolume(0)); // 'volumen 0'
console.log('✅ setVolume() →', setVolume());   // 'volumen 50'

// > Desde Python: def f(x=50) tampoco cambia None por 50. El patrón de Python
//   «x = 50 if x is None else x» es el ?? de JavaScript.
```
