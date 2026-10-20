---
example_description: "Estrechamiento con instanceof: distingue un Date de un string y, en un catch, una clase de error propia (con sus propiedades) de un Error cualquiera"
example_tags: "typescript|estrechamiento|narrowing|instanceof|clases|errores"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
// Una fecha que puede llegar como Date o como texto ya formateado.
function formatDelivery(value: Date | string): string {
  if (value instanceof Date) {
    // Aquí value es Date.
    return value.toLocaleDateString('es-MX', { timeZone: 'UTC', day: 'numeric', month: 'long' });
  }
  return value; // string
}
console.log('entrega →', formatDelivery(new Date('2026-11-02T00:00:00Z')));
console.log('entrega →', formatDelivery('pendiente de confirmar'));

// instanceof también estrecha las clases propias, por ejemplo errores:
class OutOfStockError extends Error {
  sku: string;
  constructor(sku: string) {
    super(`Sin existencias: ${sku}`);
    this.name = 'OutOfStockError';
    this.sku = sku;
  }
}

function reserve(sku: string, units: number): void {
  if (units > 3) throw new OutOfStockError(sku);
  if (units < 1) throw new RangeError('Hay que reservar al menos 1 unidad');
}

for (const units of [5, 0]) {
  try {
    reserve('MOL-02', units);
  } catch (error) {
    if (error instanceof OutOfStockError) {
      console.log('⚠️ avisar al proveedor de', error.sku); // sku solo existe aquí
    } else if (error instanceof Error) {
      console.log('⛔', error.name, '|', error.message);
    }
  }
}
```
