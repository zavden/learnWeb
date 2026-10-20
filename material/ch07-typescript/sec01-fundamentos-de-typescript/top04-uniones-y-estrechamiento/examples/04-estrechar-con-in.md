---
example_description: "Estrechamiento con in: para una unión de tipos de objeto, comprobar si existe una propiedad propia de uno de ellos ('artist' in item) le dice a TypeScript cuál es"
example_tags: "typescript|estrechamiento|narrowing|in|uniones|objetos"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
type Song = { title: string; artist: string; durationSeconds: number };
type Podcast = { title: string; host: string; episode: number };

// Una lista de reproducción mezcla canciones y pódcasts.
const queue: (Song | Podcast)[] = [
  { title: 'La Llorona', artist: 'Lila Downs', durationSeconds: 341 },
  { title: 'Historias del metro', host: 'Ana Ruiz', episode: 12 },
];

function describe(item: Song | Podcast): string {
  // title está en los dos tipos: se puede usar sin comprobar nada.
  // artist solo está en Song: comprobarlo con in estrecha a Song.
  if ('artist' in item) {
    const minutes = Math.floor(item.durationSeconds / 60);
    return `🎵 ${item.title} — ${item.artist} (${minutes} min)`;
  }
  // Aquí item es Podcast.
  return `🎙️ ${item.title} · episodio ${item.episode} con ${item.host}`;
}

for (const item of queue) {
  console.log(describe(item));
}
// typeof no sirve aquí: los dos son 'object'. in mira las propiedades.
```
