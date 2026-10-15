---
example_description: "Tuplas: arrays de longitud fija con un tipo por posición, posiciones con nombre, destructuring, devolver dos valores desde una función y elementos opcionales; sin anotación, un array mixto se infiere como array, no como tupla"
example_tags: "typescript|python|tuplas|destructuring|inferencia"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
// Una tupla: longitud fija y un tipo para cada posición.
const special: [string, number] = ['Café de olla', 35];
const [drink, price] = special; // drink: string, price: number
console.log(`${drink} → $${price}`);

// Sin la anotación, ['Café de olla', 35] sería (string | number)[]: un array
// de cualquier longitud donde cada posición puede ser cualquiera de los dos.

// Las posiciones pueden llevar nombre (solo documentan; no cambian nada):
type Coordinates = [lat: number, lng: number];
const museum: Coordinates = [19.4352, -99.1412];
console.log('Museo Nacional de Arte →', museum.join(', '));

// Uso típico: devolver dos valores. El retorno se anota para que sea tupla.
function priceRange(values: number[]): [number, number] {
  return [Math.min(...values), Math.max(...values)];
}
const [lowest, highest] = priceRange([35, 52, 28, 40]);
console.log(`de $${lowest} a $${highest}`);

// Un elemento opcional, al final, con «?»:
type Rgba = [red: number, green: number, blue: number, alpha?: number];
const brand: Rgba = [214, 40, 57];
const overlay: Rgba = [0, 0, 0, 0.6];
console.log('brand →', brand.length, '| overlay →', overlay.length);

// > Desde Python: tuple[str, int] y «return lowest, highest». Ojo: una tupla
//   de TypeScript es un array normal en ejecución (no es inmutable).
```
