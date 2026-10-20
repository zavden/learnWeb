---
example_description: "Una fecha pasa por JSON como string ISO y vuelve como string, no como Date: hay que reconstruirla"
example_tags: "javascript|json|fechas|date|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const event = { title: 'Taller de CSS', startsAt: new Date(Date.UTC(2026, 10, 3, 17, 0)) };

const text = JSON.stringify(event);
console.log(text);   // {"title":"Taller de CSS","startsAt":"2026-11-03T17:00:00.000Z"}

// 🐛 Al leerlo, startsAt es un STRING. Los métodos de Date no existen.
const parsed = JSON.parse(text);
console.log('typeof parsed.startsAt →', typeof parsed.startsAt);   // 'string'
try {
  parsed.startsAt.getUTCHours();
} catch (error) {
  console.log('getUTCHours →', error.name, '|', error.message);
}

// ✅ Reconstruye la fecha a mano…
console.log('a mano →', new Date(parsed.startsAt).getUTCHours());   // 17

// …o con un «reviver» (lo verás en el siguiente ejemplo).
// Date.prototype.toJSON es lo que produce el string ISO: stringify llama a toJSON si existe.
console.log('toJSON →', event.startsAt.toJSON());
```
