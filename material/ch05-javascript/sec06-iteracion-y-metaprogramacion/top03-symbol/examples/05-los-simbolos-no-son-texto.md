---
example_description: "Un símbolo no se convierte solo en texto: concatenarlo o meterlo en una plantilla lanza TypeError, y JSON.stringify descarta las claves symbol y los valores symbol; String(), description y un toJSON explícito"
example_tags: "javascript|symbol|coercion|json|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const priority = Symbol('urgente');
const ticket = { id: 'T-381', subject: 'La impresora no imprime', priority, [Symbol('internalNote')]: 'reiniciar' };

// 🐛 La conversión IMPLÍCITA a texto lanza un error (con cualquier otro
//    primitivo, + y las plantillas convierten sin quejarse).
try {
  console.log('Prioridad: ' + priority);
} catch (error) {
  console.log('🐛 concatenar →', error.name, '|', error.message);
}
try {
  console.log(`Prioridad: ${priority}`);
} catch (error) {
  console.log('🐛 plantilla →', error.name, '|', error.message);
}
try {
  console.log(priority * 2);
} catch (error) {
  console.log('🐛 aritmética →', error.name, '|', error.message);
}

// ✅ La conversión EXPLÍCITA sí funciona:
console.log('✅ String() →', String(priority));
console.log('✅ toString() →', priority.toString());
console.log('✅ description →', `Prioridad: ${priority.description}`);

// 🐛 JSON.stringify ignora los símbolos: las claves symbol desaparecen y un
//    valor symbol se omite (o se vuelve null dentro de un array).
console.log('🐛 JSON →', JSON.stringify(ticket));
console.log('🐛 en un array →', JSON.stringify([priority]));

// ✅ Si un símbolo es un DATO que hay que guardar, conviértelo tú: un toJSON
//    que lo traduce a su descripción (y otro paso que lo reconstruya al leer).
const ticketJson = {
  ...ticket,
  toJSON() {
    return { id: this.id, subject: this.subject, priority: this.priority.description };
  },
};
console.log('✅ JSON →', JSON.stringify(ticketJson));

// > Desde Python: no hay equivalente; lo más parecido sería un objeto sin
//   __str__ que además se negara a f-strings. Es a propósito: un símbolo es un
//   identificador, y convertirlo sin querer en texto suele ser un bug.
```
