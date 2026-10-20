---
example_description: "Asignar a una propiedad de solo lectura no hace nada y no avisa en un script clásico; en modo estricto lanza TypeError en esa línea"
example_tags: "javascript|objetos|writable|modo-estricto|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const invoice = { number: 'F-2026-0187', totalCents: 125000 };
// writable: false → el número de factura ya no se puede cambiar.
Object.defineProperty(invoice, 'number', { writable: false });

// 🐛 En un script clásico (modo NO estricto, como los ejemplos de LearnWeb)
// la asignación falla EN SILENCIO: ni error ni aviso.
invoice.number = 'F-2026-9999';
console.log('🐛 invoice.number →', invoice.number); // 'F-2026-0187': no cambió
// El programa sigue como si nada; el fallo se notará mucho después
// («¡el número no se guardó!»), lejos de esta línea.

// Lo mismo con las propiedades de solo lectura del lenguaje:
Math.PI = 3;
console.log('🐛 Math.PI →', Math.PI); // 3.141592653589793

// ✅ En modo estricto, la misma asignación lanza un TypeError en la línea exacta.
function renumber(target, value) {
  'use strict';
  target.number = value;
}
try {
  renumber(invoice, 'F-2026-9999');
} catch (error) {
  console.log('✅ estricto →', error.name, '|', error.message);
}

// Pasa con todas las escrituras prohibidas que verás en esta lección:
// propiedades writable: false, getters sin setter, objetos congelados…
// Los módulos y las clases son SIEMPRE estrictos, así que en código moderno
// el error aparece solo. En un script clásico, añade 'use strict'.
```
