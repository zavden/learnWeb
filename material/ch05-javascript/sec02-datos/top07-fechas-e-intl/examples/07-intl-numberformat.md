---
example_description: "Intl.NumberFormat formatea números, monedas, porcentajes y unidades según el idioma; es-ES no agrupa los números de 4 cifras"
example_tags: "javascript|intl|numeros|moneda|locale"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const price = 1234.5;

const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
console.log('es-ES →', euros.format(price));       // 1234,50 € (sin punto: es-ES no agrupa 4 cifras)
console.log('es-ES 5 cifras →', euros.format(12345.5));   // 12.345,50 €
console.log('en-US →', new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price));
console.log('de-DE →', new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price));

// Porcentajes: el valor es una fracción (0.256 = 25,6 %).
console.log('porcentaje →', new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1 }).format(0.256));

// Notación compacta y unidades.
console.log('compacto →', new Intl.NumberFormat('es-ES', { notation: 'compact' }).format(2_450_000));
console.log('unidad →', new Intl.NumberFormat('es-ES', { style: 'unit', unit: 'kilometer-per-hour' }).format(90));

// ⚠️ El resultado contiene espacios de no separación (U+00A0, U+202F) para que «€» o «%»
// no queden solos al final de una línea. Por eso no conviene comparar con un string escrito a mano:
console.log("¿igual a '1234,50 €'? →", euros.format(price) === '1234,50 €');   // false
console.log('código del espacio →', euros.format(price).charCodeAt(7).toString(16));   // a0
```
