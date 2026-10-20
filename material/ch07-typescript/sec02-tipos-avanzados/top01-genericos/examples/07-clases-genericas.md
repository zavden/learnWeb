---
example_description: "Una clase genérica Repository<T extends { id: number }>: guarda cualquier cosa con id, y cada instancia fija su T (explícito con new Repository<Song>() o deducido del argumento del constructor)"
example_tags: "typescript|python|genericos|clases|restricciones|map"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
// Un almacén en memoria para cualquier tipo con id numérico.
class Repository<T extends { id: number }> {
  #items = new Map<number, T>(); // campo privado de JavaScript (#), de tipo Map<number, T>

  constructor(initial: T[] = []) {
    for (const item of initial) this.add(item);
  }

  add(item: T): void {
    this.#items.set(item.id, item);
  }

  get(id: number): T | undefined {
    return this.#items.get(id);
  }

  all(): T[] {
    return [...this.#items.values()];
  }
}

type Song = { id: number; title: string; artist: string };
type Ticket = { id: number; museum: string; price: number };

// Sin argumentos no hay de dónde deducir T: se escribe entre < >.
const songs = new Repository<Song>();
songs.add({ id: 7, title: 'Cucurrucucú paloma', artist: 'Lola Beltrán' });
// songs.add({ id: 8, museum: 'MUNAL', price: 90 }) sería un error: no es un Song.

// Con argumentos, T se deduce del array: Repository<Ticket>.
const sold: Ticket[] = [
  { id: 1, museum: 'MUNAL', price: 90 },
  { id: 2, museum: 'Museo Amparo', price: 85 },
];
const tickets = new Repository(sold);

console.log('canción 7 →', songs.get(7)?.title);
console.log('total entradas →', tickets.all().reduce((sum, ticket) => sum + ticket.price, 0));
console.log('¿instancia de Repository? →', tickets instanceof Repository); // la clase sí existe
```
