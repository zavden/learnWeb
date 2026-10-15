---
example_description: "Una restricción T extends { id: number } deja usar item.id dentro de la función genérica y sigue devolviendo el tipo completo (canción o museo); un tipo sin id no encaja (TS2345)"
example_tags: "typescript|python|genericos|restricciones|extends|ts2345"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Song = { id: number; title: string; seconds: number };
type Museum = { id: number; name: string; city: string };

// «T extends { id: number }»: T puede ser cualquier tipo… que tenga un id numérico.
function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id); // item.id existe gracias a la restricción
}

const songs: Song[] = [
  { id: 1, title: 'La Llorona', seconds: 296 },
  { id: 2, title: 'Cielito lindo', seconds: 182 },
];
const museums: Museum[] = [
  { id: 10, name: 'Museo Frida Kahlo', city: 'Ciudad de México' },
  { id: 11, name: 'Museo Textil de Oaxaca', city: 'Oaxaca' },
];

// La salida conserva el tipo completo: title y seconds, name y city.
const song = findById(songs, 2); // Song | undefined
const museum = findById(museums, 11); // Museum | undefined
console.log(song?.title, '·', song?.seconds, 's');
console.log(museum?.name, '·', museum?.city);

// Sin <T>, con items: { id: number }[], el retorno sería { id: number }
// y song.title daría error: la restricción pide un mínimo, no recorta el tipo.

// Un tipo sin id no cumple la restricción:
const tags = [{ label: 'bolero' }, { label: 'son jarocho' }];
console.log(findById(tags, 1)); // ❌ Error TS2345 a propósito: a las etiquetas les falta id
```
