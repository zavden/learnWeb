---
example_description: "Sin break, switch sigue ejecutando los case siguientes (fallthrough); el uso legítimo es agrupar casos"
example_tags: "javascript|control-de-flujo|switch|fallthrough|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 Sin break, la ejecución «se cae» al case siguiente y ejecuta su código
// SIN volver a comprobar si coincide (fallthrough).
const level = 'plata';

console.group('Sin break');
switch (level) {
  case 'oro':
    console.log('Descuento del 20 %');
  case 'plata':
    console.log('Descuento del 10 %');   // coincide aquí…
  case 'bronce':
    console.log('Envío gratis');         // 🐛 …y también se ejecuta esto
  default:
    console.log('Puntos de bienvenida'); // 🐛 …y esto
}
console.groupEnd();

console.group('Con break');
switch (level) {
  case 'oro':
    console.log('Descuento del 20 %');
    break;
  case 'plata':
    console.log('Descuento del 10 %');
    break;
  case 'bronce':
    console.log('Envío gratis');
    break;
  default:
    console.log('Puntos de bienvenida');
}
console.groupEnd();

// ✅ Fallthrough legítimo: varios case VACÍOS seguidos comparten el mismo código.
const day = 'domingo';
switch (day) {
  case 'sábado':
  case 'domingo':
    console.log(day, '→ fin de semana');
    break;
  default:
    console.log(day, '→ entre semana');
}
```
